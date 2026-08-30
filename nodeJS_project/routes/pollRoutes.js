const express = require('express');
const router = express.Router();
const pollController = require('../controller/poll/pollController');
const authenticateToken = require('../middleware/authmiddlewre');

// Routes protégées Organisateur
router.post('/', authenticateToken, pollController.createPoll);
router.post('/ai/generate', authenticateToken, pollController.generatePollWithAi);
router.get('/event/:eventId', authenticateToken, pollController.getPollsByEvent);
router.get('/:pollId', authenticateToken, pollController.getPollDetails);
router.patch('/:pollId/status', authenticateToken, pollController.updatePollStatus);
router.delete('/:pollId', authenticateToken, pollController.deletePoll);

// Routes publiques participants
router.get('/public/:pollId', pollController.getPublicPoll);
router.post('/public/:pollId/vote', pollController.submitVote);
router.get('/public/:pollId/live-results', pollController.getPublicLiveResults);

module.exports = router;
