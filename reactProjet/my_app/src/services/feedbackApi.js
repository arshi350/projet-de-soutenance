import api from './api';

export const feedbackApi = {
  // Public : Récupérer les infos de l'événement pour la page feedback
  getPublicEvent: async (eventId) => {
    const response = await api.get(`/feedback/public/${eventId}`);
    return response.data;
  },

  // Public : Soumettre un avis
  submitFeedback: async (eventId, feedbackData) => {
    const response = await api.post(`/feedback/public/${eventId}/submit`, feedbackData);
    return response.data;
  },

  // Organisateur : Obtenir les statistiques et avis
  getStats: async (eventId) => {
    const response = await api.get(`/feedback/${eventId}/stats`);
    return response.data;
  },

  // Organisateur : Déclencher ou actualiser le rapport IA
  generateAiReport: async (eventId) => {
    const response = await api.post(`/feedback/${eventId}/generate-ai-report`);
    return response.data;
  },

  // Organisateur : Obtenir le dernier rapport IA sauvegardé
  getSavedAiReport: async (eventId) => {
    const response = await api.get(`/feedback/${eventId}/ai-report`);
    return response.data;
  },
};

export default feedbackApi;
