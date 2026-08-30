const express = require('express');
const InviteRouter = express.Router();
const { addInvite, deleteInvite, updateInvite, getInvitesByEvent, getRecentScannedByEvent, importInvites, bulkDeleteInvites } = require('../controller/invites/invites');
const { verifyScanController } = require('../controller/scann/scann');
const excelUpload = require('../middleware/excelUpload');

// Suppression groupée d'invités
InviteRouter.post('/bulk-delete', bulkDeleteInvites);
InviteRouter.delete('/bulk-delete', bulkDeleteInvites);

// Importer des invités via Excel/CSV
InviteRouter.post('/importInvites/:idEvent', excelUpload.single('file'), importInvites);

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

// Récupérer les invités récemment scannés pour un événement
InviteRouter.get('/getRecentScanned/:idEvent', getRecentScannedByEvent);

// Scanne un invité et marque comme scanné
InviteRouter.post('/scanInvite', verifyScanController);
/**
 * @swagger
 * /api/invite/scanInvite:
 *   post:
 *     summary: Scanner un invité et obtenir le nombre d'invités déjà scannés
 *     tags: [Invite]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - inviteId
 *             properties:
 *               inviteId:
 *                 type: string
 *                 description: ID de l'invité scanné
 *                 example: "643a1ab2c1234d56789ef012"
 *               idEvent:
 *                 type: string
 *                 description: ID de l'événement associé
 *                 example: "643a1ab2c1234d56789ef099"
 *     responses:
 *       200:
 *         description: Invité scanné et compteur retourné
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 scannedInvite:
 *                   type: object
 *                   description: Données de l'invité scanné
 *                 scannedCount:
 *                   type: integer
 *                   description: Nombre d'invités déjà scannés pour cet événement
 *                   example: 12
 *       400:
 *         description: Paramètres invalides
 *       404:
 *         description: Invité non trouvé
 *       500:
 *         description: Erreur serveur
 */

module.exports = InviteRouter;
