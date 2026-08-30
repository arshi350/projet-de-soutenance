const express = require('express');
const router = express.Router();
const reminderController = require('../controller/reminder/reminderController');
const authenticateToken = require('../middleware/authmiddlewre');

// Gestion des règles de relance
router.post('/rules', authenticateToken, reminderController.createReminderRule);
router.get('/rules/:eventId', authenticateToken, reminderController.getReminderRules);
router.put('/rules/:ruleId', authenticateToken, reminderController.updateReminderRule);
router.delete('/rules/:ruleId', authenticateToken, reminderController.deleteReminderRule);
router.post('/rules/:ruleId/trigger', authenticateToken, reminderController.triggerReminderRule);

// Copilote IA et analyse de réponses
router.post('/ai/generate-copy', authenticateToken, reminderController.generateReminderWithAi);
router.post('/ai/analyze-reply', authenticateToken, reminderController.analyzeGuestReply);

// Historique des logs
router.get('/logs/:eventId', authenticateToken, reminderController.getReminderLogs);

module.exports = router;
