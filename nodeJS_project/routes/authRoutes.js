const express = require("express")
const Authrouter = express.Router()
const authLimiter = require("../middleware/authlimite")
const {userLogin, refreshAccessToken, userLogout} = require("../controller/auth/auth")
const { forgotPassword, verifyOtp, resetPassword } = require("../controller/auth/forgotPassword")
const rateLimit = require("express-rate-limit")

// Limiteur spécifique pour forgot-password (3 tentatives / 15 min par IP)
const forgotPasswordLimiter = rateLimit({
    windowMs: 15 * 60 * 1000,
    limit: 3,
    message: "Trop de demandes de réinitialisation. Réessayez dans 15 minutes.",
    standardHeaders: true,
    legacyHeaders: false,
})

/**
 * @swagger
 * /api/auth/refresh:
 *   post:
 *     summary: Rafraîchir l'access token
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               refreshToken:
 *                 type: string
 *                 description: Refresh token (optionnel si envoyé via Cookie HttpOnly)
 *     responses:
 *       200:
 *         description: Nouveau access token généré avec succès
 *       401:
 *         description: Refresh token manquant ou invalide
 *       403:
 *         description: Compte suspendu
 */
Authrouter.route("/refresh").post(refreshAccessToken)

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Connexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *                 description: Adresse email de l'utilisateur
 *               password:
 *                 type: string
 *                 description: Mot de passe de l'utilisateur
 *     responses:
 *       200:
 *         description: Connexion réussie
 *       400:
 *         description: Paramètres manquants ou invalides
 */
Authrouter.route("/login").post(authLimiter, userLogin)

/**
 * @swagger
 * /api/auth/logout:
 *   post:
 *     summary: Déconnexion utilisateur
 *     tags: [Auth]
 *     requestBody:
 *       required: false
 *     responses:
 *       200:
 *         description: Déconnexion réussie
 */
Authrouter.route("/logout").post(userLogout)

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Demander un code OTP de réinitialisation
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *     responses:
 *       200:
 *         description: Code OTP envoyé par email (ou email inexistant - anti-énumération)
 */
Authrouter.route("/forgot-password").post(forgotPasswordLimiter, forgotPassword)

/**
 * @swagger
 * /api/auth/verify-otp:
 *   post:
 *     summary: Vérifier le code OTP et obtenir un resetSessionToken
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               email:
 *                 type: string
 *               otp:
 *                 type: string
 *     responses:
 *       200:
 *         description: OTP valide, resetSessionToken retourné
 *       400:
 *         description: Code invalide ou expiré
 */
Authrouter.route("/verify-otp").post(verifyOtp)

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Réinitialiser le mot de passe avec le resetSessionToken
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               resetSessionToken:
 *                 type: string
 *               newPassword:
 *                 type: string
 *     responses:
 *       200:
 *         description: Mot de passe réinitialisé avec succès
 *       400:
 *         description: Token invalide ou expiré
 */
Authrouter.route("/reset-password").post(resetPassword)

const { googleLogin } = require("../controller/auth/OAuth")

/**
 * @swagger
 * /api/auth/google:
 *   post:
 *     summary: Connexion / Inscription via Google OAuth 2.0
 *     tags: [Auth]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               token:
 *                 type: string
 *                 description: Jeton ID envoyé par Google Identity Services
 *     responses:
 *       200:
 *         description: Connexion Google réussie
 *       401:
 *         description: Jeton Google invalide
 */
Authrouter.route("/google").post(googleLogin)

module.exports = Authrouter