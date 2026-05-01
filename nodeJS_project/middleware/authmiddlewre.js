const jwt = require('jsonwebtoken');
require('dotenv').config();

const authenticateToken = async (req, res, next) => {
    try {
        let token = null;
        // Cherche d'abord dans les cookies
        if (req.cookies && req.cookies.accessToken) {
            token = req.cookies.accessToken;
        } else if (req.headers.authorization && req.headers.authorization.startsWith('Bearer ')) {
            token = req.headers.authorization.split(' ')[1];
        }

        if (!token) {
            return res.status(401).json({ message: 'Token manquant' });
        }

        try {
            const decodedToken = jwt.verify(token, process.env.JWT_SECRET);
            req.userId = decodedToken.id;
            return next();
        } catch (err) {
            // Si accessToken expiré, tente de rafraîchir avec refreshToken
            if (err.name === 'TokenExpiredError' && req.cookies && req.cookies.refreshToken) {
                try {
                    const decodedRefresh = jwt.verify(req.cookies.refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
                    const payload = { id: decodedRefresh.id };
                    // Génère un nouveau accessToken
                    const newAccessToken = jwt.sign(
                        payload,
                        process.env.JWT_SECRET,
                        { expiresIn: process.env.JWT_EXPIRE || '15m' }
                    );
                    // Met à jour le cookie
                    res.cookie('accessToken', newAccessToken, {
                        httpOnly: true,
                        secure: process.env.NODE_ENV === 'production',
                        sameSite: 'strict',
                        maxAge: 15 * 60 * 1000
                    });
                    req.userId = decodedRefresh.id;
                    return next();
                } catch (refreshErr) {
                    console.log(refreshErr);
                    return res.status(401).json({ message: 'Refresh token invalide ou expiré' });
                }
            } else {
                console.log(err);
                return res.status(401).json({ message: 'Token invalide ou expiré' });
            }
        }
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Erreur d\'authentification' });
    }
};

module.exports = authenticateToken;