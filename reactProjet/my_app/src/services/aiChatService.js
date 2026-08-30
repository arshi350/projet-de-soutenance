// services/aiChatService.js
import axios from 'axios';

const AI_API_URL = import.meta.env.VITE_AI_API_URL || 'http://localhost:5000/api/chat';

/**
 * Service client pour le microservice Chatbot IA & Retouche Visuelle Gemini
 */
export const aiChatService = {
  /**
   * Envoie un message avec optionnellement une image de template à analyser et retoucher
   * @param {string} sessionId - Identifiant de session
   * @param {string} message - Message utilisateur (ex: "supprime le texte sur cette image")
   * @param {string|null} image - Image URL ou Base64 du template
   * @param {object|null} templateData - Données actuelles du billet
   * @returns {Promise<{ reply: string, modifications: object, detectedTexts: Array, generatedImage: string }>}
   */
  sendMessage: async (sessionId, message, image = null, templateData = null) => {
    try {
      const payload = { 
        sessionId, 
        message,
        image: image || null,
        templateData: templateData || null
      };

      const response = await axios.post(
        AI_API_URL,
        payload,
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 45000 // 45s pour l'analyse d'image multimodale
        }
      );
      return response.data;
    } catch (error) {
      console.error('Erreur aiChatService.sendMessage:', error);
      if (error.response?.data?.error) {
        throw new Error(error.response.data.error);
      }
      if (error.code === 'ECONNABORTED' || error.message?.includes('timeout')) {
        throw new Error('Le délai d\'attente de réponse de l\'IA a expiré.');
      }
      if (error.message?.includes('Network Error')) {
        throw new Error('Impossible de joindre le serveur IA (port 5000). Vérifiez que le service est lancé.');
      }
      throw new Error('Une erreur est survenue lors de la communication avec l\'IA.');
    }
  },

  /**
   * Réinitialise une session de conversation
   * @param {string} sessionId - Identifiant de session
   * @returns {Promise<{ message: string }>}
   */
  resetSession: async (sessionId) => {
    try {
      const response = await axios.post(
        `${AI_API_URL}/reset`,
        { sessionId },
        {
          headers: { 'Content-Type': 'application/json' },
          timeout: 10000
        }
      );
      return response.data;
    } catch (error) {
      console.warn('Avertissement aiChatService.resetSession:', error);
      return { message: 'Session réinitialisée localement' };
    }
  },

  /**
   * Vérifie la disponibilité du service IA
   * @returns {Promise<{ status: string, model: string }>}
   */
  checkHealth: async () => {
    try {
      const response = await axios.get(`${AI_API_URL}/health`, { timeout: 5000 });
      return response.data;
    } catch (error) {
      console.warn('Service IA hors ligne ou inaccessible:', error.message);
      return { status: 'offline' };
    }
  }
};

export default aiChatService;
