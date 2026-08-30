import api from './api';

export const reminderApi = {
  // Créer une règle de relance
  createRule: async (ruleData) => {
    const response = await api.post('/reminders/rules', ruleData);
    return response.data;
  },

  // Obtenir les règles d'un événement
  getRulesByEvent: async (eventId) => {
    const response = await api.get(`/reminders/rules/${eventId}`);
    return response.data;
  },

  // Mettre à jour une règle
  updateRule: async (ruleId, ruleData) => {
    const response = await api.put(`/reminders/rules/${ruleId}`, ruleData);
    return response.data;
  },

  // Supprimer une règle
  deleteRule: async (ruleId) => {
    const response = await api.delete(`/reminders/rules/${ruleId}`);
    return response.data;
  },

  // Déclencher manuellement l'envoi
  triggerRule: async (ruleId) => {
    const response = await api.post(`/reminders/rules/${ruleId}/trigger`);
    return response.data;
  },

  // Copilote IA pour rédiger le message
  generateAiCopy: async (params) => {
    const response = await api.post('/reminders/ai/generate-copy', params);
    return response.data;
  },

  // Analyse NLP d'une réponse d'invité
  analyzeGuestReply: async (params) => {
    const response = await api.post('/reminders/ai/analyze-reply', params);
    return response.data;
  },

  // Obtenir les logs d'envoi
  getLogsByEvent: async (eventId) => {
    const response = await api.get(`/reminders/logs/${eventId}`);
    return response.data;
  },
};

export default reminderApi;
