const express = require('express');
const {
  addTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
} = require('../controller/templates/templatesController');

const templatesRouter = express.Router();

/**
 * @swagger
 * /api/templates/addTemplate:
 *   post:
 *     summary: Ajouter un nouveau template
 *     tags: [Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *                 description: URL ou chemin de l'image du template
 *               titre:
 *                 type: string
 *                 description: Titre du template
 *               description:
 *                 type: string
 *                 description: Description du template
 *             required:
 *               - image
 *               - titre
 *               - description
 *     responses:
 *       201:
 *         description: Template créé avec succès
 *       400:
 *         description: Données manquantes ou invalides
 */
templatesRouter.route('/addTemplate').post(addTemplate);

/**
 * @swagger
 * /api/templates/getAllTemplates:
 *   get:
 *     summary: Récupérer tous les templates
 *     tags: [Templates]
 *     responses:
 *       200:
 *         description: Liste des templates
 *       500:
 *         description: Erreur serveur
 */
templatesRouter.route('/getAllTemplates').get(getAllTemplates);

/**
 * @swagger
 * /api/templates/getTemplate/{id}:
 *   get:
 *     summary: Récupérer un template par ID
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du template
 *     responses:
 *       200:
 *         description: Template trouvé
 *       404:
 *         description: Template non trouvé
 */
templatesRouter.route('/getTemplate/:id').get(getTemplateById);

/**
 * @swagger
 * /api/templates/updateTemplate/{id}:
 *   put:
 *     summary: Mettre à jour un template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du template à mettre à jour
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               image:
 *                 type: string
 *               titre:
 *                 type: string
 *               description:
 *                 type: string
 *     responses:
 *       200:
 *         description: Template mis à jour
 *       404:
 *         description: Template non trouvé
 */
templatesRouter.route('/updateTemplate/:id').put(updateTemplate);

/**
 * @swagger
 * /api/templates/deleteTemplate/{id}:
 *   delete:
 *     summary: Supprimer un template
 *     tags: [Templates]
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: string
 *         description: ID du template à supprimer
 *     responses:
 *       200:
 *         description: Template supprimé
 *       404:
 *         description: Template non trouvé
 */
templatesRouter.route('/deleteTemplate/:id').delete(deleteTemplate);

module.exports = templatesRouter;
