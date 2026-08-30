// moduleIA/controllers/chat.controller.js
import geminiService from '../services/gemini.service.js';
import env from '../config/env.js';

/**
 * Contrôleur HTTP pour les interactions de chat et d'édition d'image avec l'IA
 */
export const handleSendMessage = async (req, res, next) => {
  try {
    const { sessionId, message, image, templateData } = req.body;

    const result = await geminiService.sendMessage(sessionId, message, image, templateData);

    return res.status(200).json({
      reply: result.reply,
      modifications: result.modifications || null,
      detectedTexts: result.detectedTexts || [],
      generatedImage: result.generatedImage || null,
      visualTheme: result.visualTheme || null
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Contrôleur HTTP pour réinitialiser l'historique d'une session
 */
export const handleResetSession = async (req, res, next) => {
  try {
    const { sessionId } = req.body;

    geminiService.resetSession(sessionId);

    return res.status(200).json({
      message: 'Session réinitialisée'
    });
  } catch (error) {
    next(error);
  }
};

/**
 * Endpoint de santé pour vérifier la disponibilité du service
 */
export const handleHealthCheck = (req, res) => {
  return res.status(200).json({
    status: 'ok',
    service: 'Gemini Chatbot & Vision Retouch API',
    model: env.GEMINI_MODEL,
    environment: env.NODE_ENV,
    timestamp: new Date().toISOString()
  });
};

export default {
  handleSendMessage,
  handleResetSession,
  handleHealthCheck
};
