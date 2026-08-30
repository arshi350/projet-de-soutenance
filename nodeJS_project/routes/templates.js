const express = require('express');
const upload = require('../middleware/upload');
const authenticateToken = require('../middleware/authmiddlewre');
const {
  addTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
  uploadImage,
} = require('../controller/templates/templatesController');
const {
  saveFavoriteTemplate,
  getUserFavoriteTemplates,
  deleteFavoriteTemplate,
} = require('../controller/templates/favoriteTemplatesController');

const templatesRouter = express.Router();

// Middleware helper pour extraire userId de req.userId si présent
const ensureUserContext = (req, res, next) => {
  if (req.userId && !req.user) {
    req.user = { id: req.userId, _id: req.userId };
  }
  next();
};

/**
 * --- ROUTES TEMPLATES FAVORIS (IA) ---
 */
templatesRouter.post('/favorites', authenticateToken, ensureUserContext, saveFavoriteTemplate);
templatesRouter.get('/favorites', authenticateToken, ensureUserContext, getUserFavoriteTemplates);
templatesRouter.delete('/favorites/:id', authenticateToken, ensureUserContext, deleteFavoriteTemplate);

// Version non bloquante si appelé sans auth explicite (avec userId dans le body/query)
templatesRouter.post('/save-favorite', saveFavoriteTemplate);
templatesRouter.get('/get-favorites', getUserFavoriteTemplates);

/**
 * --- ROUTES CRUD TEMPLATES STANDARDS ---
 */
templatesRouter.route('/addTemplate').post(addTemplate);
templatesRouter.route('/uploadImage').post(upload.single('image'), uploadImage);
templatesRouter.route('/getAllTemplates').get(getAllTemplates);
templatesRouter.route('/getTemplate/:id').get(getTemplateById);
templatesRouter.route('/updateTemplate/:id').put(updateTemplate);
templatesRouter.route('/deleteTemplate/:id').delete(deleteTemplate);

module.exports = templatesRouter;
