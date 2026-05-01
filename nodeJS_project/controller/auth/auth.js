  
  const {userModel} = require('../../models/user');
  const bcrypt = require('bcrypt');
  const jwt = require('jsonwebtoken');
  require('dotenv').config();

const userLogin = async (req, res) => {
    try {
        const { email, password } = req.body;

        // Vérifier si tous les champs sont remplis
        if (!email || !password) {
            return res.status(400).json({ message: "tous les champs sont obligatoires" });
        }

        // Récupérer un utilisateur
        const user = await userModel.findOne({ email });
        if (!user) {
            return res.status(401).json({ message: "email ou mot de passe incorrect" });
        }

        // Vérification du mot de passe
        const isPasswordValid = await bcrypt.compare(password, user.password);
        if (!isPasswordValid) {
            return res.status(401).json({ message: "email ou mot de passe incorrect" });
        }

        // Création du payload de jwt
        const payload = {
            id: user._id
        };

        // Générer l'access token (court)
        const accessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );

        // Générer le refresh token (long)
        const refreshToken = jwt.sign(
            payload,
            process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_REFRESH_EXPIRE || '7d' }
        );

        // Stocker le refresh token dans un cookie sécurisé HTTP Only
        res.cookie('refreshToken', refreshToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 7 * 24 * 60 * 60 * 1000 // 7 jours
        });

        // Stocker l'access token dans un cookie (optionnel, sinon côté client)
        res.cookie('accessToken', accessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });

        // Réponse après connexion
        const userInfo = {
            id: user._id,
            first_name: user.first_name,
            last_name: user.last_name,
            phone: user.phone,
            city: user.city,
            email: user.email,
        };

        res.status(201).json({
            message: "connexion reussite !",
            accessToken: accessToken,
            user: userInfo
        });

    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "erreur serveur" });
    }
};

// Contrôleur pour rafraîchir l'access token
const refreshAccessToken = (req, res) => {
    try {
        const refreshToken = req.cookies.refreshToken;
        if (!refreshToken) {
            return res.status(401).json({ message: 'Refresh token manquant' });
        }
        // Vérifier le refresh token
        const decoded = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET || process.env.JWT_SECRET);
        const payload = { id: decoded.id };
        // Générer un nouvel access token
        const newAccessToken = jwt.sign(
            payload,
            process.env.JWT_SECRET,
            { expiresIn: process.env.JWT_EXPIRE || '15m' }
        );
        // Mettre à jour le cookie accessToken
        res.cookie('accessToken', newAccessToken, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict',
            maxAge: 15 * 60 * 1000 // 15 minutes
        });
        res.status(200).json({ accessToken: newAccessToken });
    } catch (error) {
        console.log(error);
        res.status(401).json({ message: 'Refresh token invalide' });
    }
};


// Déconnexion de l'utilisateur : suppression des cookies d'authentification
const userLogout = async (req, res) => {
    try {
        res.clearCookie('accessToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.clearCookie('refreshToken', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: 'strict'
        });
        res.status(200).json({ message: 'Déconnexion réussie !' });
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "erreur serveur" });
    }
};


module.exports = { userLogin, refreshAccessToken, userLogout };