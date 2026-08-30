const rateLimit = require('express-rate-limit');

// Limiteur de requêtes spécifique pour l'API de génération d'images (Optimisation Free Tier)
// Évite les blocages 429 de Google en limitant les utilisateurs en amont.
 const aiRateLimiter = rateLimit({
  windowMs: 1 * 60 * 1000, // Fenêtre de 1 minute
  max: 5, // Limite chaque IP à 5 requêtes de génération par minute
  message: {
    success: false,
    error: "Trop de requêtes de génération d'images. Veuillez patienter une minute avant de réessayer."
  },
  standardHeaders: true,
  legacyHeaders: false,
});

module.exports = { aiRateLimiter };