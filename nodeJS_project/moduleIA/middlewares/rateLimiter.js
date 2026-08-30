// moduleIA/middlewares/rateLimiter.js
import rateLimit from 'express-rate-limit';

/**
 * Rate Limiter pour protéger le quota Gemini et prévenir les abus
 * 30 requêtes par fenêtre de 5 minutes par IP
 */
export const chatRateLimiter = rateLimit({
  windowMs: 5 * 60 * 1000, // 5 minutes
  max: 30, // 30 requêtes
  standardHeaders: true,
  legacyHeaders: false,
  message: {
    error: 'Trop de requêtes envoyées à l\'IA. Veuillez patienter quelques instants avant de réessayer.'
  }
});

export default chatRateLimiter;
