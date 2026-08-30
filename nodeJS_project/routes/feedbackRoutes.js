const express = require('express');
const router = express.Router();
const feedbackController = require('../controller/feedback/feedbackController');
const authenticateToken = require('../middleware/authmiddlewre');

// Routes publiques participants
router.get('/public/:eventId', feedbackController.getPublicFeedbackEvent);
router.post('/public/:eventId/submit', feedbackController.submitFeedback);

// Routes protégées Organisateur
router.get('/:eventId/stats', authenticateToken, feedbackController.getFeedbackStats);
router.post('/:eventId/generate-ai-report', authenticateToken, feedbackController.generateAiReport);
router.get('/:eventId/ai-report', authenticateToken, feedbackController.getSavedAiReport);

module.exports = router;
