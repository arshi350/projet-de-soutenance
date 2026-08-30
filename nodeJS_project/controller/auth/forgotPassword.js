const { userModel } = require('../../models/user');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { sendOtpEmail, sendPasswordResetConfirmation } = require('../../services/passwordResetEmailService');

require('dotenv').config();

// ─────────────────────────────────────────────────────────────
// 1. FORGOT PASSWORD — Génère et envoie un OTP par email
// POST /api/auth/forgot-password { email }
// ─────────────────────────────────────────────────────────────
const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(400).json({ message: 'L\'email est obligatoire.' });
        }

        // Recherche de l'utilisateur (silencieuse : anti-énumération)
        const user = await userModel.findOne({ email: email.toLowerCase().trim() });

        // On répond toujours 200 même si l'email n'existe pas (sécurité anti-énumération)
        if (!user) {
            return res.status(200).json({
                message: 'Si cet email est enregistré, vous recevrez un code de vérification.'
            });
        }

        // Vérifier que le compte n'est pas suspendu
        if (user.suspended) {
            return res.status(403).json({ message: 'Ce compte est suspendu.' });
        }

        // Générer un OTP à 6 chiffres via crypto (cryptographiquement sûr)
        const otpCode = crypto.randomInt(100000, 999999).toString();

        // Hasher l'OTP avant de le stocker en BDD
        const salt = await bcrypt.genSalt(10);
        const hashedOtp = await bcrypt.hash(otpCode, salt);

        // Expiration dans 1 heure
        const expiration = new Date(Date.now() + 60 * 60 * 1000);

        // Sauvegarder le token hashé et l'expiration
        await userModel.findByIdAndUpdate(user._id, {
            resetToken: hashedOtp,
            resetTokenExp: expiration
        });

        // Envoyer l'email avec le code OTP en clair
        const userName = `${user.first_name} ${user.last_name}`;
        const emailResult = await sendOtpEmail(email, userName, otpCode);

        if (!emailResult.success) {
            console.error('Erreur envoi OTP email:', emailResult.error);
            return res.status(500).json({ message: 'Erreur lors de l\'envoi du code. Veuillez réessayer.' });
        }

        return res.status(200).json({
            message: 'Si cet email est enregistré, vous recevrez un code de vérification.'
        });

    } catch (error) {
        console.error('forgotPassword error:', error);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ─────────────────────────────────────────────────────────────
// 2. VERIFY OTP — Valide le code OTP et retourne un resetSessionToken
// POST /api/auth/verify-otp { email, otp }
// ─────────────────────────────────────────────────────────────
const verifyOtp = async (req, res) => {
    try {
        const { email, otp } = req.body;

        if (!email || !otp) {
            return res.status(400).json({ message: 'Email et code OTP sont obligatoires.' });
        }

        const user = await userModel.findOne({ email: email.toLowerCase().trim() });

        if (!user || !user.resetToken || !user.resetTokenExp) {
            return res.status(400).json({ message: 'Code invalide ou expiré.' });
        }

        // Vérifier l'expiration
        if (new Date() > new Date(user.resetTokenExp)) {
            // Nettoyer le token expiré
            await userModel.findByIdAndUpdate(user._id, {
                resetToken: null,
                resetTokenExp: null
            });
            return res.status(400).json({ message: 'Le code a expiré. Veuillez recommencer.' });
        }

        // Vérifier le code OTP avec bcrypt
        const isOtpValid = await bcrypt.compare(otp.toString(), user.resetToken);
        if (!isOtpValid) {
            return res.status(400).json({ message: 'Code invalide.' });
        }

        // OTP valide — effacer l'OTP de la BDD (à usage unique)
        await userModel.findByIdAndUpdate(user._id, {
            resetToken: null,
            resetTokenExp: null
        });

        // Générer un resetSessionToken JWT temporaire (10 min) pour autoriser le reset
        const resetSessionToken = jwt.sign(
            { userId: user._id, purpose: 'password_reset' },
            process.env.JWT_SECRET,
            { expiresIn: '10m' }
        );

        return res.status(200).json({
            message: 'Code vérifié avec succès.',
            resetSessionToken
        });

    } catch (error) {
        console.error('verifyOtp error:', error);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
};

// ─────────────────────────────────────────────────────────────
// 3. RESET PASSWORD — Met à jour le mot de passe avec le resetSessionToken
// POST /api/auth/reset-password { resetSessionToken, newPassword }
// ─────────────────────────────────────────────────────────────
const resetPassword = async (req, res) => {
    try {
        const { resetSessionToken, newPassword } = req.body;

        if (!resetSessionToken || !newPassword) {
            return res.status(400).json({ message: 'Token de session et nouveau mot de passe sont obligatoires.' });
        }

        if (newPassword.length < 8) {
            return res.status(400).json({ message: 'Le mot de passe doit contenir au moins 8 caractères.' });
        }

        // Vérifier et décoder le resetSessionToken
        let decoded;
        try {
            decoded = jwt.verify(resetSessionToken, process.env.JWT_SECRET);
        } catch (err) {
            return res.status(400).json({ message: 'Session expirée ou invalide. Veuillez recommencer.' });
        }

        // Vérifier que le token a bien la finalité "password_reset"
        if (decoded.purpose !== 'password_reset') {
            return res.status(400).json({ message: 'Token invalide.' });
        }

        const user = await userModel.findById(decoded.userId);
        if (!user) {
            return res.status(404).json({ message: 'Utilisateur non trouvé.' });
        }

        // Hasher le nouveau mot de passe
        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(newPassword, salt);

        // Mettre à jour le mot de passe
        await userModel.findByIdAndUpdate(user._id, {
            password: hashedPassword,
            resetToken: null,
            resetTokenExp: null
        });

        // Envoyer l'email de confirmation
        const userName = `${user.first_name} ${user.last_name}`;
        sendPasswordResetConfirmation(user.email, userName).catch(err => {
            console.error('Erreur envoi email confirmation reset:', err);
        });

        return res.status(200).json({ message: 'Mot de passe réinitialisé avec succès !' });

    } catch (error) {
        console.error('resetPassword error:', error);
        return res.status(500).json({ message: 'Erreur serveur.' });
    }
};

module.exports = { forgotPassword, verifyOtp, resetPassword };
