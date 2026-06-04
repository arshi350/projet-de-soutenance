// routes/geminiRoutes.js
const express = require('express');
const geminiRouter = express.Router();
const templateController = require('../controller/IAController/geminiController');

/**
 * @swagger
 * /api/gemini/modify:
 *   post:
 *     summary: Modifier un template avec l'IA Gemini
 *     tags: [Gemini - Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: ID du template à modifier
 *               prompt:
 *                 type: string
 *                 description: Instructions pour modifier le template
 *             required:
 *               - templateId
 *               - prompt
 *     responses:
 *       200:
 *         description: Template modifié avec succès
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Template non trouvé
 *       500:
 *         description: Erreur serveur
 */
geminiRouter.post('/modify', templateController.modifyTemplate);

/**
 * @swagger
 * /api/gemini/suggestions:
 *   post:
 *     summary: Générer des suggestions de modification pour un template
 *     tags: [Gemini - Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: ID du template
 *               eventType:
 *                 type: string
 *                 description: Type d''événement (mariage, anniversaire, etc.)
 *             required:
 *               - templateId
 *               - eventType
 *     responses:
 *       200:
 *         description: Suggestions générées avec succès
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Template non trouvé
 *       500:
 *         description: Erreur serveur
 */
geminiRouter.post('/suggestions', templateController.getSuggestions);

/**
 * @swagger
 * /api/gemini/modify-text:
 *   post:
 *     summary: Modifier le contenu textuel d''un template avec l''IA
 *     tags: [Gemini - Contenu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               content:
 *                 type: object
 *                 description: Contenu textuel actuel (titre, message, footer, bouton)
 *               prompt:
 *                 type: string
 *                 description: Instructions de modification
 *             required:
 *               - content
 *               - prompt
 *     responses:
 *       200:
 *         description: Contenu modifié avec succès
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
geminiRouter.post('/modify-text', templateController.modifyText);

/**
 * @swagger
 * /api/gemini/modify-colors:
 *   post:
 *     summary: Modifier la palette de couleurs d''un template avec l''IA
 *     tags: [Gemini - Design]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               colors:
 *                 type: object
 *                 description: Palette de couleurs actuelle (primary, secondary, accent, background, text)
 *               prompt:
 *                 type: string
 *                 description: Instructions de modification
 *             required:
 *               - colors
 *               - prompt
 *     responses:
 *       200:
 *         description: Palette modifiée avec succès
 *       400:
 *         description: Paramètres manquants
 *       500:
 *         description: Erreur serveur
 */
geminiRouter.post('/modify-colors', templateController.modifyColors);

module.exports = geminiRouter;
