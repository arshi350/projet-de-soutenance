
const express = require('express');
const { addUser, getAllUsers, getOneUser, updateUser, deleteUser } = require('../controller/user');
const { refreshAccessToken } = require('../controller/auth/auth');
const authenticateToken = require('../middleware/authmiddlewre');
const userRouter = express.Router();

/**
 * @swagger
 * /api/addUser:
 *   post:
 *     summary: Ajouter un nouvel utilisateur
 *     tags: [User]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               nom:
 *                 type: string
 *               prenom:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: Utilisateur ajouté
 *       400:
 *         description: Paramètres manquants ou invalides
 */
userRouter.route("/addUser").post(addUser);

/**
 * @swagger
 * /api/getAllUsers:
 *   get:
 *     summary: Récupérer tous les utilisateurs
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Liste des utilisateurs
 */
userRouter.route("/getAllUsers").get(authenticateToken, refreshAccessToken, getAllUsers);

/**
 * @swagger
 * /api/getOneUser/{id}:
 *   get:
 *     summary: Récupérer un utilisateur par ID
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Utilisateur trouvé
 *       404:
 *         description: Utilisateur non trouvé
 */
userRouter.route("/getOneUser/:id").get(authenticateToken, refreshAccessToken, getOneUser);

/**
 * @swagger
 * /api/updateUser/{id}:
 *   put:
 *     summary: Mettre à jour un utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       200:
 *         description: Utilisateur mis à jour
 */
userRouter.route("/updateUser/:id").put(authenticateToken, refreshAccessToken, updateUser);

/**
 * @swagger
 * /api/deleteUser/{id}:
 *   delete:
 *     summary: Supprimer un utilisateur
 *     tags: [User]
 *     security:
 *       - bearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Utilisateur supprimé
 */
userRouter.route("/deleteUser/:id").delete(authenticateToken, refreshAccessToken, deleteUser);

module.exports = userRouter;