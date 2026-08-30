// moduleIA/config/env.js
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

// Chargement des variables d'environnement
dotenv.config();

// Validation obligatoire de la clé API Gemini
if (!process.env.GEMINI_API_KEY || process.env.GEMINI_API_KEY.trim() === '') {
  logger.error('❌ ERREUR CRITIQUE : La variable GEMINI_API_KEY est manquante dans le fichier .env.');
  logger.error('Le serveur ne peut pas démarrer sans clé d\'API valide.');
  process.exit(1);
}

export const env = {
  PORT: parseInt(process.env.PORT || '5000', 10),
  NODE_ENV: process.env.NODE_ENV || 'development',
  GEMINI_API_KEY: process.env.GEMINI_API_KEY.trim(),
  GEMINI_MODEL: process.env.GEMINI_MODEL || 'gemini-2.5-flash',
};

export default env;
