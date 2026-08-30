import api from './api';

/**
 * Récupère les détails de l'invitation et de l'événement via le token public RSVP
 */
export const getRsvpDetails = async (token) => {
  const response = await api.get(`/rsvp/${token}`);
  return response.data;
};

/**
 * Confirme la présence de l'invité
 */
export const confirmRsvp = async (token) => {
  const response = await api.post(`/rsvp/${token}/confirm`);
  return response.data;
};

/**
 * Signale l'absence de l'invité et révoque le QR Code
 */
export const declineRsvp = async (token) => {
  const response = await api.post(`/rsvp/${token}/decline`);
  return response.data;
};

/**
 * Sauvegarder un template généré par IA dans les favoris
 */
export const saveFavoriteTemplate = async (favoriteData, authToken) => {
  const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
  const response = await api.post('/templates/favorites', favoriteData, config);
  return response.data;
};

/**
 * Récupérer les templates favoris de l'utilisateur
 */
export const getFavoriteTemplates = async (authToken, eventId = null) => {
  const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
  const params = eventId ? { eventId } : {};
  const response = await api.get('/templates/favorites', { ...config, params });
  return response.data;
};

/**
 * Programmer un envoi différé d'invitations
 */
export const scheduleSendInvitations = async (eventId, guestIds, scheduledAt, authToken) => {
  const config = authToken ? { headers: { Authorization: `Bearer ${authToken}` } } : {};
  const response = await api.post('/invitations/schedule-send', {
    eventId,
    guestIds,
    scheduledAt,
    channels: ['email'],
  }, config);
  return response.data;
};
