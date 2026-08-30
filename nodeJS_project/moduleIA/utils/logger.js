// moduleIA/utils/logger.js
/**
 * Utilitaire de journalisation structuré et sécurisé
 */
const formatTime = () => new Date().toISOString();

export const logger = {
  info: (msg, meta = '') => {
    console.log(`[\x1b[34mINFO\x1b[0m] [${formatTime()}] ${msg}`, meta ? meta : '');
  },
  success: (msg, meta = '') => {
    console.log(`[\x1b[32mSUCCESS\x1b[0m] [${formatTime()}] ${msg}`, meta ? meta : '');
  },
  warn: (msg, meta = '') => {
    console.warn(`[\x1b[33mWARN\x1b[0m] [${formatTime()}] ${msg}`, meta ? meta : '');
  },
  error: (msg, meta = '') => {
    console.error(`[\x1b[31mERROR\x1b[0m] [${formatTime()}] ${msg}`, meta ? meta : '');
  },
  debug: (msg, meta = '') => {
    if (process.env.NODE_ENV === 'development') {
      console.log(`[\x1b[35mDEBUG\x1b[0m] [${formatTime()}] ${msg}`, meta ? meta : '');
    }
  }
};

export default logger;
