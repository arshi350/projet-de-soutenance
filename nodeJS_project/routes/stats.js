const express = require('express');
const authenticateToken = require('../middleware/authmiddlewre');
const { getUserstats } = require('../controller/stats/stats');

const statsRouter = express.Router();

/**
 * @swagger
 * /api/user/:userId/stats:
 *   get:
 *     summary: Récupère les statistiques d'un utilisateur (événements et invités)
 *     tags: [Stats]
 *     parameters:
 *       - in: path
 *         name: userId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'utilisateur
 *     responses:
 *       200:
 *         description: Statistiques récupérées avec succès
 *       404:
 *         description: Utilisateur ou événements non trouvés
 *       500:
 *         description: Erreur serveur
 */
statsRouter.route("/:userId/stats").get(authenticateToken, getUserstats);

module.exports = statsRouter;
