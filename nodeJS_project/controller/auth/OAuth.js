const { OAuth2Client } = require('google-auth-library');
const { userModel } = require('../../models/user');
const { getCookieOptions } = require('./auth');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');
const crypto = require('crypto');
require('dotenv').config();

const client = new OAuth2Client(process.env.GOOGLE_CLIENT_ID);

/**
 * Connexion / Inscription via Google OAuth 2.0
 * POST /api/auth/google
 * Body: { token } (ID Token renvoyé par le frontend Google Identity Services)
 */
const googleLogin = async (req, res) => {
    try {
        const { token } = req.body;

        if (!token) {
            return res.status(400).json({ message: "Le jeton Google est obligatoire." });
        }

        let payload;
        try {
            // Vérification de la validité du jeton auprès des serveurs Google
            const ticket = await client.verifyIdToken({
                idToken: token,
                audience: process.env.GOOGLE_CLIENT_ID,
            });
            payload = ticket.getPayload();
        } catch (verifyError) {
            console.error("Erreur de vérification du jeton Google:", verifyError.message);
            return res.status(401).json({ message: "Jeton Google invalide ou expiré." });
        }

        const { email, given_name, family_name } = payload;

        if (!email) {
            return res.status(400).json({ message: "Impossible de récupérer l'adresse email depuis Google." });
        }

        // Recherche de l'utilisateur par son email
        let user = await userModel.findOne({ email: email.toLowerCase().trim() });

        // S'il n'existe pas encore, on crée un nouveau compte utilisateur
        if (!user) {
            // Mot de passe aléatoire hautement sécurisé (l'utilisateur se connectera via Google)
            const randomPass = crypto.randomBytes(16).toString('hex');
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(randomPass, salt);

            // Génération d'un numéro de téléphone unique (ex: 69XXXXXXX)
            let uniquePhone;
            let phoneExists = true;
            while (phoneExists) {
                uniquePhone = Number('6' + Math.floor(10000000 + Math.random() * 90000000));
                const existing = await userModel.findOne({ phone: uniquePhone });
                if (!existing) phoneExists = false;
            }

            user = new userModel({
                first_name: given_name || 'Utilisateur',
                last_name: family_name || 'Google',
                email: email.toLowerCase().trim(),
                phone: uniquePhone,
                city: 'NON RENSEIGNÉ',
                password: hashedPassword,
                role: 'user'
            });

            await user.save();
        }

        // Vérifier si le compte est suspendu
        if (user.suspended) {
            return res.status(403).json({ message: "Compte suspendu. Veuillez contacter un administrateur." });
        }

        // Création des tokens JWT de l'application
        const jwtPayload = {
            id: user._id,
            role: user.role,
            email: user.email
        };

        const accessToken = jwt.sign(
            jwtPayload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        const refreshToken = jwt.sign(
            jwtPayload,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        // Stocker les jetons dans des cookies sécurisés HttpOnly
        res.cookie('refreshToken', refreshToken, getCookieOptions(7 * 24 * 60 * 60 * 1000));
        res.cookie('accessToken', accessToken, getCookieOptions(15 * 60 * 1000));

        const userInfo = {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            city: user.city,
            email: user.email,
            role: user.role
        };

        return res.status(200).json({
            message: "Connexion Google réussie !",
            accessToken: accessToken,
            user: userInfo
        });

    } catch (error) {
        console.error("Erreur serveur lors du Google Login:", error);
        return res.status(500).json({ message: "Erreur serveur lors de la connexion avec Google." });
    }
};

module.exports = { googleLogin };
