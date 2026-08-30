const express = require('express');
const router = express.Router();
const aiController = require('../controller/ai/aiController');
const authenticateToken = require('../middleware/authmiddlewre');

// Générer le message d'invitation avec Gemini IA
router.post('/invitations/generate', authenticateToken, aiController.generateInvitationText);

// Générer une campagne marketing avec Gemini IA
router.post('/marketing/generate', authenticateToken, aiController.generateMarketingCampaign);

// Optimiser le plan de table avec Gemini IA
router.post('/seating/optimize', authenticateToken, aiController.optimizeSeatingPlan);

// Traiter un message concierge RSVP (WhatsApp/SMS)
router.post('/concierge/reply', aiController.handleConciergeMessage);

// Concierge IA pour les Emails (Réponses, Relances, Consignes, Remerciements)
router.post('/concierge/email', authenticateToken, aiController.handleEmailConcierge);

module.exports = router;
