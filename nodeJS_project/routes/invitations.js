const express = require('express');
const InvitationRouter = express.Router()
const { createInvitations } = require('../controller/invitations/invitations')

/**
 * @swagger
 * /api/invitations/createInvitations/{eventId}:
 *   post:
 *     summary: Créer des invitations pour tous les invités d'un événement
 *     tags: [Invitations]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     requestBody:
 *       required: false
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message personnalisé pour l'invitation
 *     responses:
 *       201:
 *         description: Invitations créées avec succès
 *       404:
 *         description: Aucun invité trouvé pour cet événement
 *       500:
 *         description: Erreur lors de la création des invitations
 */

InvitationRouter.route('/createInvitations/:eventId').post(createInvitations)

module.exports = InvitationRouter;