const express = require('express');
const InviteRouter = express.Router();
const { addInvite, deleteInvite, updateInvite, getInvitesByEvent } = require('../controller/invites/invites');

// Ajouter un invite
InviteRouter.post('/addInvite', addInvite);
/**
 * @swagger
 * /api/invite/addInvite:
 *   post:
 *     summary: Ajouter un invité
 *     tags: [Invite]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *     responses:
 *       201:
 *         description: Invité ajouté
 */

// Supprimer un invite par ID
InviteRouter.delete('/deleteInvite/:id', deleteInvite);
/**
 * @swagger
 * /api/invite/deleteInvite/{id}:
 *   delete:
 *     summary: Supprimer un invité
 *     tags: [Invite]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Invité supprimé
 */

// Mettre à jour un invite par ID
InviteRouter.put('/updateInvite/:id', updateInvite);
/**
 * @swagger
 * /api/invite/updateInvite/{id}:
 *   put:
 *     summary: Mettre à jour un invité
 *     tags: [Invite]
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
 *         description: Invité mis à jour
 */

// Récupérer tous les invités d'un événement spécifique
InviteRouter.get('/getInvites/:idEvent', getInvitesByEvent);
/**
 * @swagger
 * /api/invite/getInvites/{idEvent}:
 *   get:
 *     summary: Récupérer les invités d'un événement
 *     tags: [Invite]
 *     parameters:
 *       - in: path
 *         name: idEvent
 *         required: true
 *         schema:
 *           type: string
 *     responses:
 *       200:
 *         description: Liste des invités
 */

module.exports = InviteRouter;
