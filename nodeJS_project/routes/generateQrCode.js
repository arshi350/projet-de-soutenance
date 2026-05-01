
const express = require('express');
const QrRouter = express.Router();
const { generateQrCode, getQrcode, getQrcodeImage, getAllQrcodeImages  } = require('../controller/invites/generateQrCode');

// Route : Générer les QR codes pour tous les invités d'un événement
/**
 * @swagger
 * /api/qrcode/CreateQrCode/{eventId}:
 *   post:
 *     summary: Générer les QR codes pour tous les invités d'un événement
 *     tags: [QrCode]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     responses:
 *       201:
 *         description: QR codes générés
 *       404:
 *         description: Aucun invité trouvé pour cet événement
 */
QrRouter.route('/CreateQrCode/:eventId').post(generateQrCode);
/**
 * @swagger
 * /api/qrcode/getQrcode/{eventId}:
 *   get:
 *     summary: Récupérer les QR codes d'un événement
 *     tags: [QrCode]
 *     parameters:
 *       - in: path
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'événement
 *     responses:
 *       200:
 *         description: QR codes récupérés
 *       404:
 *         description: Aucun invité trouvé pour cet événement
 */
QrRouter.route('/getQrcode/:eventId').get(getQrcode);
/**
 * @swagger
 * /api/qrcode/getQrcodeImage/{inviteId}:
 *   get:
 *     summary: Récupérer l'image QR code d'un invité
 *     tags: [QrCode]
 *     parameters:
 *       - in: path
 *         name: inviteId
 *         required: true
 *         schema:
 *           type: string
 *         description: ID de l'invité
 *     responses:
 *       200:
 *         description: Image QR code récupérée
 *       404:
 *         description: QR code non trouvé pour cet invité
 */
QrRouter.route('/getQrcodeImage/:inviteId').get(getQrcodeImage);

/**
 * @swagger
 * /api/qrcode/getAllQrcodes:
 *   get:
 *     summary: Récupérer les images QR codes de tous les invités d'un événement
 *     tags: [QrCode]
 *     parameters:
 *       - in: query
 *         name: eventId
 *         required: true
 *         schema:
 *           type: string
 *         description: L'identifiant de l'événement
 *     responses:
 *       200:
 *         description: Images QR codes récupérées
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 eventId:
 *                   type: string
 *                 total:
 *                   type: integer
 *                 images:
 *                   type: array
 *                   items:
 *                     type: object
 *                     properties:
 *                       inviteId:
 *                         type: string
 *                       nom:
 *                         type: string
 *                       prenom:
 *                         type: string
 *                       image:
 *                         type: string
 *                         description: Image du QR code encodée en base64
 *       400:
 *         description: L'ID de l'événement est requis
 *       404:
 *         description: Aucun invité trouvé pour cet événement
 *       500:
 *         description: Erreur lors de la récupération des images des QR codes
 */

QrRouter.route('/getAllQrcodes/:eventId').get(getAllQrcodeImages);

module.exports = QrRouter;

