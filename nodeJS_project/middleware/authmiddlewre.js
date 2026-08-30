const jwt = require('jsonwebtoken');
const { getCookieOptions } = require('../controller/auth/auth');
require('dotenv').config();

/**
 * Middleware d'authentification robuste
 * Vérifie l'accessToken (via cookies ou Bearer Authorization Header)
 * En cas d'expiration, tente un rafraîchissement transparent si le refreshToken est présent
 */
const authenticateToken = async (req, res, next) => {
    try {
        let token = null;

        // 1. Cherche dans les cookies ou dans l'en-tête Authorization Bearer
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Token d\'accès manquant', code: 'TOKEN_MISSING' });
        }

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            const userId = decodedToken.id || decodedToken._id || decodedToken.userId;

            req.userId = userId;
            req.user = {
                id: userId,
                _id: userId,
                role: decodedToken.role,
                email: decodedToken.email,
                ...(typeof decodedToken === 'object' ? decodedToken : {})
            };
            return next();
        } catch (err) {
            // 2. Si accessToken expiré, vérifier s'il existe un refreshToken pour un renouvellement transparent
            const refreshToken =
                req.cookies?.refreshToken ||
                req.headers['x-refresh-token'] ||
                req.body?.refreshToken;

            if (err.name === 'TokenExpiredError' && refreshToken) {
                try {
                    const decodedRefresh = jwt.verify(
                        refreshToken,
                        process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET
                    );
                    const refreshUserId = decodedRefresh.id || decodedRefresh._id || decodedRefresh.userId;

                    const payload = {
                        id: refreshUserId,
                        role: decodedRefresh.role,
                        email: decodedRefresh.email
                    };

                    // Générer un nouvel access token
                    const newAccessToken = jwt.sign(
                        payload,
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRE || '15m' }
                    );

                    // Mettre à jour le cookie accessToken
                    res.cookie('accessToken', newAccessToken, getCookieOptions(15 * 60 * 1000));

                    // Exposer le nouveau token dans l'en-tête de réponse pour les clients SPA
                    res.setHeader('X-New-Access-Token', newAccessToken);

                    req.userId = refreshUserId;
                    req.user = {
                        id: refreshUserId,
                        _id: refreshUserId,
                        role: decodedRefresh.role,
                        email: decodedRefresh.email,
                        ...(typeof decodedRefresh === 'object' ? decodedRefresh : {})
                    };

                    return next();
                } catch (refreshErr) {
                    console.error("Échec du rafraîchissement transparent dans le middleware:", refreshErr.message);
                    return res.status(401).json({
                        message: 'Refresh token invalide ou expiré',
                        code: 'REFRESH_TOKEN_EXPIRED'
                    });
                }
            } else {
                return res.status(401).json({
                    message: err.name === 'TokenExpiredError' ? 'Token expiré' : 'Token invalide',
                    code: err.name === 'TokenExpiredError' ? 'TOKEN_EXPIRED' : 'TOKEN_INVALID'
                });
            }
        }
    } catch (error) {
        console.error("Erreur générale dans authenticateToken:", error);
        return res.status(401).json({ message: 'Erreur d\'authentification' });
    }
};

module.exports = authenticateToken;