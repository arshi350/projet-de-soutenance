import api from './api';

/**
 * Générer un texte d'invitation avec Google Gemini
 */
export const apiGenerateInvitationAI = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/ai/invitations/generate', payload, config);
  return response.data;
};

/**
 * Générer une campagne marketing avec Google Gemini
 */
export const apiGenerateMarketingAI = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/ai/marketing/generate', payload, config);
  return response.data;
};

/**
 * Optimiser le plan de table avec Google Gemini
 */
export const apiOptimizeSeatingAI = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/ai/seating/optimize', payload, config);
  return response.data;
};

/**
 * Traiter ou rédiger un email avec le Concierge Email IA
 */
export const apiProcessEmailConciergeAI = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/ai/concierge/email', payload, config);
  return response.data;
};
