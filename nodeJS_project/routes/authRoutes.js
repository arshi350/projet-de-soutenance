const express = require("express")
const Authrouter = express.Router()
const authLimiter = require("../middleware/authlimite")
const {userLogin, refreshAccessToken, userLogout} = require("../controller/auth/auth")

/**
 * @swagger
 * /api/auth/refresh-token:
 *   post:
 *     summary: Rafraîchir l'access token
 *     tags: [Auth]
 *     responses:
 *       200:
 *         description: Nouveau access token généré
 *       401:
 *         description: Refresh token manquant ou invalide
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

module.exports = Authrouter