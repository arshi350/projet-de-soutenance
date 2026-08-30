// moduleIA/routes/chat.routes.js
import { Router } from 'express';
import { handleSendMessage, handleResetSession, handleHealthCheck } from '../controllers/chat.controller.js';
import { validateChatInput, validateResetInput } from '../middlewares/validateChatInput.js';
import { chatRateLimiter } from '../middlewares/rateLimiter.js';

const chatRouter = Router();

// Route de santé
chatRouter.get('/health', handleHealthCheck);

// Route principale d'envoi de message avec validation et limitation de débit
chatRouter.post('/', chatRateLimiter, validateChatInput, handleSendMessage);

// Route de réinitialisation de session
chatRouter.post('/reset', validateResetInput, handleResetSession);

export default chatRouter;
