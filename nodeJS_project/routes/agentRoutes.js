const express = require('express');
const agentRouter = express.Router();
const authenticateToken = require('../middleware/authmiddlewre');
const {
  createAgentController,
  getAgentsByEventController,
  sendAgentCredentialsController,
  sendEventCodeController,
  changeAgentPasswordController,
  deleteAgentController,
  getMyAgentEventController
} = require('../controller/agent/agentController');

// All agent management routes require authentication
agentRouter.get('/my-event', authenticateToken, getMyAgentEventController);
agentRouter.post('/create', authenticateToken, createAgentController);
agentRouter.get('/event/:eventId', authenticateToken, getAgentsByEventController);
agentRouter.post('/send-credentials', authenticateToken, sendAgentCredentialsController);
agentRouter.post('/send-event-code', authenticateToken, sendEventCodeController);
agentRouter.post('/change-password', authenticateToken, changeAgentPasswordController);
agentRouter.delete('/:agentId', authenticateToken, deleteAgentController);

module.exports = agentRouter;
