// moduleIA/server.js
import express from 'express';
import cors from 'cors';
import env from './config/env.js';
import chatRouter from './routes/chat.routes.js';
import errorHandler from './middlewares/errorHandler.js';
import logger from './utils/logger.js';

const app = express();

// Middlewares globaux de sécurité et parsing
app.use(cors({
  origin: '*', // À restreindre aux domaines autorisés en production
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json({ limit: '1mb' }));
app.use(express.urlencoded({ extended: true }));

// Journalisation basique des requêtes
app.use((req, res, next) => {
  logger.info(`${req.method} ${req.originalUrl}`);
  next();
});

// Montage des routes du chatbot IA
app.use('/api/chat', chatRouter);

// Route fallback 404 pour les routes inconnues
app.use('*', (req, res) => {
  res.status(404).json({
    error: 'Point de terminaison introuvable'
  });
});

// Middleware centralisé de gestion des erreurs (toujours en dernier)
app.use(errorHandler);

// Démarrage du serveur
const server = app.listen(env.PORT, () => {
  logger.success(`🚀 Serveur Chatbot IA démarré avec succès sur le port ${env.PORT}`);
  logger.info(`🤖 Modèle Gemini configuré : ${env.GEMINI_MODEL}`);
  logger.info(`📡 Endpoint Chat : POST http://localhost:${env.PORT}/api/chat`);
  logger.info(`🔄 Endpoint Reset : POST http://localhost:${env.PORT}/api/chat/reset`);
  logger.info(`🩺 Endpoint Santé : GET http://localhost:${env.PORT}/api/chat/health`);
});

// Gestion gracieuse de l'arrêt
const shutdown = () => {
  logger.info('Arrêt du serveur en cours...');
  server.close(() => {
    logger.info('Serveur arrêté proprement.');
    process.exit(0);
  });
};

process.on('SIGTERM', shutdown);
process.on('SIGINT', shutdown);

export default app;
