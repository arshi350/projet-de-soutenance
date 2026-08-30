const express = require('express');
const router = express.Router();
const {
    getPublicEventDetails,
    createTicketCategory,
    getEventTicketCategories,
    getAITicketBackgrounds,
    uploadTicketBackground,
    deleteTicketCategory,
    lockTickets,
    checkoutTickets,
    getTicketDownload,
    getEventSalesAnalytics,
    getEventSalesExport
} = require('../controller/publicTickets/publicTicketController');
const authenticateToken = require('../middleware/authmiddlewre');
const upload = require('../middleware/upload');

// Routes Publiques B2C
router.get('/event/:eventId', getPublicEventDetails);
router.post('/tickets/lock', lockTickets);
router.post('/tickets/checkout', checkoutTickets);
router.get('/tickets/download/:token', getTicketDownload);

// Routes Suggestions d'Arrière-Plans IA en Temps Réel
router.post('/event/:eventId/suggest-backgrounds', getAITicketBackgrounds);
router.post('/suggest-backgrounds', getAITicketBackgrounds);

// Route Upload d'Image d'Arrière-Plan Personnalisée
router.post('/tickets/upload-background', authenticateToken, upload.single('image'), uploadTicketBackground);

// Routes Organisateur (Création et gestion des catégories de billets)
router.get('/event/:eventId/categories', getEventTicketCategories);
router.post('/event/:eventId/categories', authenticateToken, createTicketCategory);
router.delete('/categories/:categoryId', authenticateToken, deleteTicketCategory);

// Routes Organisateur : Statistiques de vente et Export des Revenus
router.get('/event/:eventId/sales-stats', authenticateToken, getEventSalesAnalytics);
router.get('/event/:eventId/sales-export', authenticateToken, getEventSalesExport);

module.exports = router;
