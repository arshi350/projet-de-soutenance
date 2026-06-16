const express = require('express');
const geminiRouter = express.Router();
const geminiController = require('../controller/IAController/geminiController');

// Middleware d'authentification optionnel
const optionalAuth = (req, res, next) => {
  // Récupérer le token depuis l'en-tête Authorization
  const authHeader = req.headers.authorization;
  if (authHeader && authHeader.startsWith('Bearer ')) {
    const token = authHeader.substring(7);
    req.token = token;
    // Ici vous pouvez décoder le token et définir req.user si nécessaire
    // req.user = verifyToken(token);
  }
  next();
};

// Middleware de validation pour les requêtes POST
const validateRequestBody = (requiredFields) => {
  return (req, res, next) => {
    const missingFields = requiredFields.filter(field => !req.body[field]);
    if (missingFields.length > 0) {
      return res.status(400).json({
        success: false,
        message: `Champs requis manquants: ${missingFields.join(', ')}`,
        timestamp: new Date().toISOString()
      });
    }
    next();
  };
};

/**
 * @swagger
 * /api/gemini/modify:
 *   post:
 *     summary: Modifier un template avec génération d'image IA
 *     description: Génère une nouvelle image de template basée sur les modifications demandées par l'utilisateur
 *     tags: [Gemini - Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - prompt
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: ID du template à modifier
 *                 example: "65f1a2b3c4d5e6f7g8h9i0j1"
 *               prompt:
 *                 type: string
 *                 description: Description des modifications souhaitées
 *                 example: "Change le titre pour Soirée de Gala et mets le nom en bleu"
 *     responses:
 *       200:
 *         description: Image générée avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                   example: true
 *                 message:
 *                   type: string
 *                   example: "Template modifié avec succès"
 *                 data:
 *                   type: object
 *                   properties:
 *                     templateId:
 *                       type: string
 *                     generatedImage:
 *                       type: string
 *                       description: Image modifiée en base64
 *                     description:
 *                       type: string
 *                     modifications:
 *                       type: object
 *       400:
 *         description: Paramètres manquants ou invalides
 *       401:
 *         description: Authentification requise
 *       429:
 *         description: Quota de l'API dépassé
 *       500:
 *         description: Erreur serveur
 */
geminiRouter.post(
  '/modify', 
  optionalAuth, 
  validateRequestBody(['templateId', 'prompt']), 
  geminiController.modifyTemplate
);

/**
 * @swagger
 * /api/gemini/suggestions:
 *   post:
 *     summary: Générer des suggestions pour un template
 *     description: Propose des suggestions de modification basées sur le type d'événement
 *     tags: [Gemini - Templates]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - templateId
 *               - eventType
 *             properties:
 *               templateId:
 *                 type: string
 *                 description: ID du template
 *               eventType:
 *                 type: string
 *                 description: Type d'événement (mariage, anniversaire, entreprise, gala)
 *                 enum: [mariage, anniversaire, entreprise, gala, personnalisé]
 *     responses:
 *       200:
 *         description: Suggestions générées avec succès
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     suggestions:
 *                       type: array
 *                       items:
 *                         type: string
 *                     count:
 *                       type: integer
 *                     source:
 *                       type: string
 *                       enum: [ai, fallback, emergency_fallback]
 *       400:
 *         description: Paramètres manquants
 *       404:
 *         description: Template non trouvé
 */
geminiRouter.post(
  '/suggestions', 
  optionalAuth, 
  validateRequestBody(['templateId', 'eventType']), 
  geminiController.getSuggestions
);

/**
 * @swagger
 * /api/gemini/modify-text:
 *   post:
 *     summary: Modifier le contenu textuel
 *     description: Modifie les textes d'une invitation (titre, message, date, lieu)
 *     tags: [Gemini - Contenu]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - content
 *               - prompt
 *             properties:
 *               content:
 *                 type: object
 *                 properties:
 *                   titre:
 *                     type: string
 *                   title:
 *                     type: string
 *                   message:
 *                     type: string
 *                   date:
 *                     type: string
 *                   location:
 *                     type: string
 *                 description: Contenu textuel actuel
 *               prompt:
 *                 type: string
 *                 description: Instructions de modification
 *     responses:
 *       200:
 *         description: Contenu modifié avec succès
 *       400:
 *         description: Paramètres manquants
 */
geminiRouter.post(
  '/modify-text', 
  optionalAuth, 
  validateRequestBody(['content', 'prompt']), 
  geminiController.modifyText
);

/**
 * @swagger
 * /api/gemini/modify-colors:
 *   post:
 *     summary: Modifier la palette de couleurs
 *     description: Modifie les couleurs d'une invitation selon les instructions
 *     tags: [Gemini - Design]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - colors
 *               - prompt
 *             properties:
 *               colors:
 *                 type: object
 *                 properties:
 *                   primary:
 *                     type: string
 *                     example: "#1a1a1a"
 *                   secondary:
 *                     type: string
 *                   accent:
 *                     type: string
 *                   background:
 *                     type: string
 *                   text:
 *                     type: string
 *               prompt:
 *                 type: string
 *                 description: Instructions de modification des couleurs
 *                 example: "mets une ambiance plus festive et colorée"
 *     responses:
 *       200:
 *         description: Palette modifiée avec succès
 *       400:
 *         description: Paramètres manquants
 */
geminiRouter.post(
  '/modify-colors', 
  optionalAuth, 
  validateRequestBody(['colors', 'prompt']), 
  geminiController.modifyColors
);

/**
 * @swagger
 * /api/gemini/greeting:
 *   post:
 *     summary: Message de bienvenue de l'assistant
 *     description: Répond aux salutations et présente les fonctionnalités de l'assistant IA
 *     tags: [Gemini - Chat]
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - message
 *             properties:
 *               message:
 *                 type: string
 *                 description: Message de l'utilisateur (salutation ou question)
 *                 example: "Bonjour, peux-tu m'aider à créer une invitation ?"
 *     responses:
 *       200:
 *         description: Réponse de salutation générée
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     response:
 *                       type: string
 *                     isGreeting:
 *                       type: boolean
 *                     source:
 *                       type: string
 *                       enum: [ai, fallback, emergency_fallback]
 *       400:
 *         description: Message manquant
 */
geminiRouter.post(
  '/greeting', 
  optionalAuth, 
  validateRequestBody(['message']), 
  geminiController.greeting
);

/**
 * @swagger
 * /api/gemini/status:
 *   get:
 *     summary: Vérifier le statut du service et du quota
 *     description: Retourne l'état du service Gemini, le mode dégradé et les informations de quota
 *     tags: [Gemini - Monitoring]
 *     responses:
 *       200:
 *         description: Statut du service
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 success:
 *                   type: boolean
 *                 data:
 *                   type: object
 *                   properties:
 *                     status:
 *                       type: string
 *                       enum: [operational, degraded, unknown]
 *                     degradedMode:
 *                       type: boolean
 *                     model:
 *                       type: object
 *                     limits:
 *                       type: object
 *                     cacheSize:
 *                       type: integer
 */
geminiRouter.get('/status', geminiController.checkQuotaStatus);

/**
 * @swagger
 * /api/gemini/health:
 *   get:
 *     summary: Vérification de santé du service
 *     description: Endpoint simple pour vérifier que le service Gemini est accessible
 *     tags: [Gemini - Monitoring]
 *     responses:
 *       200:
 *         description: Service en bonne santé
 */
geminiRouter.get('/health', (req, res) => {
  res.status(200).json({
    success: true,
    status: 'healthy',
    service: 'Gemini API',
    timestamp: new Date().toISOString()
  });
});

module.exports = geminiRouter;