const express = require('express');
const authenticateToken = require('../middleware/authmiddlewre');
const { getAdminStats } = require('../controller/stats/adminStats');

const adminStatsRouter = express.Router();

/**
 * @swagger
 * /api/admin/stats:
 *   get:
 *     summary: Récupère les statistiques globales de l'administration
 *     tags: [Admin Stats]
 *     security:
 *       - bearerAuth: []
 *     responses:
 *       200:
 *         description: Statistiques admin récupérées avec succès
 *       401:
 *         description: Non autorisé
 *       500:
 *         description: Erreur serveur
 */
adminStatsRouter.route('/admin/stats').get(authenticateToken, getAdminStats);

module.exports = adminStatsRouter;
