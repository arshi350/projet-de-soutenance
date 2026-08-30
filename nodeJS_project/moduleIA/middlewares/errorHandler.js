// moduleIA/middlewares/errorHandler.js
import logger from '../utils/logger.js';

/**
 * Middleware centralisé de gestion des erreurs
 */
export const errorHandler = (err, req, res, next) => {
  // Journalisation complète côté serveur uniquement
  logger.error(`Erreur interceptée sur ${req.method} ${req.originalUrl}:`, err.message || err);

  if (process.env.NODE_ENV === 'development' && err.stack) {
    logger.debug(err.stack);
  }

  // Catégorisation des erreurs courantes de l'API Gemini / SDK
  const errorMessage = (err.message || '').toLowerCase();

  // 1. Clé API invalide ou refus d'autorisation
  if (errorMessage.includes('api key not valid') || errorMessage.includes('permission_denied') || errorMessage.includes('unauthenticated') || err.status === 401 || err.status === 403) {
    return res.status(401).json({
      error: 'Clé d\'API Gemini invalide ou droits insuffisants.'
    });
  }

  // 2. Quota dépassé / Rate limit atteint côté Google
  if (errorMessage.includes('quota') || errorMessage.includes('resource_exhausted') || errorMessage.includes('rate limit') || err.status === 429) {
    return res.status(429).json({
      error: 'Le quota de requêtes IA a été temporairement atteint. Veuillez réessayer dans quelques instants.'
    });
  }

  // 3. Timeout réseau
  if (errorMessage.includes('timeout') || errorMessage.includes('econnreset') || errorMessage.includes('etimedout')) {
    return res.status(504).json({
      error: 'Délai d\'attente dépassé lors de la communication avec le service IA.'
    });
  }

  // 4. Modèle introuvable ou non supporté
  if (errorMessage.includes('not found') || errorMessage.includes('model')) {
    return res.status(404).json({
      error: 'Le modèle IA spécifié est actuellement indisponible.'
    });
  }

  // 5. Erreur générique serveur sans détails techniques sensibles
  const statusCode = err.statusCode || err.status || 500;
  return res.status(statusCode).json({
    error: 'Une erreur interne est survenue lors du traitement de votre message.'
  });
};

export default errorHandler;
