const { userModel } = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
require('dotenv').config();

/**
 * Options standardisées pour les cookies d'authentification
 * En environnement de développement (cross-port localhost), sameSite: 'lax' assure
 * la transmission correcte des cookies avec credentials: true.
 */
const getCookieOptions = (maxAge = undefined) => {
    const isProd = process.env.NODE_ENV === 'production';
    const options = {
        httpOnly: true,
        secure: isProd,
        sameSite: isProd ? 'strict' : 'lax',
        path: '/'
    };
    if (maxAge !== undefined) {
        options.maxAge = maxAge;
    }
    return options;
};

/**
 * Connexion utilisateur
 */
const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si tous les champs sont remplis
        if (!email || !password) {
            return res.status(400).json({ message: "tous les champs sont obligatoires" });
        }

        // Récupérer l'utilisateur
        const user = await userModel.findOne({ email: email.toLowerCase().trim() });
        if (!user) {
            return res.status(401).json({ message: "email ou mot de passe incorrect" });
        }

        if (user.suspended) {
            return res.status(403).json({ message: "Compte suspendu. Veuillez contacter un administrateur." });
        }

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "email ou mot de passe incorrect" });
        }

        // Payload JWT complet et homogène
        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        };

        // Générer l'access token (durée courte, ex: 15m)
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        // Générer le refresh token (durée longue, ex: 7d)
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        // Stocker les tokens dans des cookies sécurisés HttpOnly
        res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));

        // Données utilisateur renvoyées
        let agentEventId = user.eventId || null;
        let agentOrganizerId = user.organizerId || null;

        if (user.role === 'agent' && !agentEventId) {
            try {
                const AgentModel = require('../../models/agent/agent');
                const agentRecord = await AgentModel.findOne({ userId: user._id });
                if (agentRecord) {
                    agentEventId = agentRecord.eventId;
                    agentOrganizerId = agentRecord.organizerId;
                }
            } catch (agentLookupErr) {
                console.warn('Erreur recherche agentRecord login:', agentLookupErr.message);
            }
        }

        const userInfo = {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            city: user.city,
            email: user.email,
            role: user.role,
            eventId: agentEventId,
            organizerId: agentOrganizerId
        };

        return res.status(201).json({
            message: "connexion reussite !",
            accessToken: accessToken,
            user: userInfo
        });

    } catch (error) {
        console.error("Erreur lors de userLogin:", error);
        return res.status(500).json({ message: "erreur serveur" });
    }
};

/**
 * Contrôleur pour rafraîchir l'access token (POST /api/auth/refresh)
 * Accepte le refresh token depuis les cookies, le body ou les en-têtes HTTP.
 */
const refreshAccessToken = async (req, res) => {
    try {
        const refreshToken =
            req.cookies?.refreshToken ||
            req.body?.refreshToken ||
            req.headers['x-refresh-token'] ||
            (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')
                ? req.headers.authorization.split(' ')[1]
                : null);

        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token manquant' });
        }

        // Vérification cryptographique du refresh token
        let decoded;
        try {
            decoded = jwt.verify(
                refreshToken,
                process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
            );
        } catch (jwtErr) {
            console.error("JWT verify error on refresh:", jwtErr.message);
            const isExpired = jwtErr.name === 'TokenExpiredError';
            return res.status(401).json({
                message: isExpired ? 'Refresh token expiré' : 'Refresh token invalide'
            });
        }

        const userId = decoded.id || decoded._id;
        if (!userId) {
            return res.status(401).json({ message: 'Payload de token invalide' });
        }

        // Vérification en base de données : existence et non-suspension
        const user = await userModel.findById(userId);
        if (!user) {
            return res.status(401).json({ message: 'Utilisateur non trouvé' });
        }

        if (user.suspended) {
            return res.status(403).json({ message: 'Compte suspendu. Veuillez contacter un administrateur.' });
        }

        // Nouveau payload JWT synchronisé avec l'état actuel de l'utilisateur
        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        };

        // Générer un nouvel access token
        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        // Mettre à jour le cookie accessToken
        res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));

        // Renvoyer le nouvel access token et les informations utilisateur à jour
        return res.status(200).json({
            accessToken: newAccessToken,
            user: {
                id: user._id,
                first_name: user.first_name,
                last_name: user.last_name,
                phone: user.phone,
                city: user.city,
                email: user.email,
                role: user.role
            }
        });
    } catch (error) {
        console.error("Erreur inattendue dans refreshAccessToken:", error);
        return res.status(500).json({ message: "Erreur serveur lors du rafraîchissement du token" });
    }
};

/**
 * Middleware optionnel pour rafraîchir le token sur les routes protégées
 */
const optionalRefreshAccessToken = async (req, res, next) => {
    try {
        const refreshToken = req.cookies?.refreshToken || req.body?.refreshToken;
        if (!refreshToken) {
            return next();
        }

        const decoded = jwt.verify(
            refreshToken,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
        );
        const userId = decoded.id || decoded._id;

        const user = await userModel.findById(userId);
        if (!user || user.suspended) {
            return next();
        }

        const payload = {
            id: user._id,
            role: user.role,
            email: user.email
        };

        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));
        next();
    } catch (error) {
        // En cas d'erreur de refresh optionnel, continuer sans bloquer
        next();
    }
};

/**
 * Déconnexion de l'utilisateur : suppression des cookies d'authentification
 */
const userLogout = async (req, res) => {
    try {
        const clearOptions = getCookieOptions();
        res.clearCookie('accessToken', clearOptions);
        res.clearCookie('refreshToken', clearOptions);
        return res.status(200).json({ message: 'Déconnexion réussie !' });
    } catch (error) {
        console.error("Erreur dans userLogout:", error);
        return res.status(500).json({ message: "erreur serveur" });
    }
};

module.exports = {
    userLogin,
    refreshAccessToken,
    userLogout,
    optionalRefreshAccessToken,
    getCookieOptions
};