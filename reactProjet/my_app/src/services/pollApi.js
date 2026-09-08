import api from './api';

export const pollApi = {
  // Créer un sondage
  createPoll: async (pollData) => {
    const response = await api.post('/polls', pollData);
    return response.data;
  },

  // Générer intelligemment les questions de sondage pré-événement par IA
  generateAiPoll: async (params) => {
    const response = await api.post('/polls/ai/generate', params);
    return response.data;
  },

  // Récupérer les sondages d'un événement (avec option eventType)
  getPollsByEvent: async (eventId, eventType) => {
    const url = eventType ? `/polls/event/${eventId}?eventType=${eventType}` : `/polls/event/${eventId}`;
    const response = await api.get(url);
    return response.data;
  },

  // Récupérer les détails et statistiques d'un sondage
  getPollDetails: async (pollId) => {
    const response = await api.get(`/polls/${pollId}`);
    return response.data;
  },

  // Changer le statut (active, closed)
  updateStatus: async (pollId, status) => {
    const response = await api.patch(`/polls/${pollId}/status`, { status });
    return response.data;
  },

  // Supprimer un sondage
  deletePoll: async (pollId) => {
    const response = await api.delete(`/polls/${pollId}`);
    return response.data;
  },

  // Public : Récupérer un sondage pour vote
  getPublicPoll: async (pollId) => {
    const response = await api.get(`/polls/public/${pollId}`);
    return response.data;
  },

  // Public : Soumettre un vote
  submitVote: async (pollId, voteData) => {
    const response = await api.post(`/polls/public/${pollId}/vote`, voteData);
    return response.data;
  },

  // Public : Obtenir les résultats en direct
  getPublicLiveResults: async (pollId) => {
    const response = await api.get(`/polls/public/${pollId}/live-results`);
    return response.data;
  },
};

export default pollApi;
