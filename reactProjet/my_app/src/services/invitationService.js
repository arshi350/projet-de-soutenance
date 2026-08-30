import api from './api';

export const createInvitations = async (eventId, message, token, templateId = null, templateImage = null) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post(
      `/invitations/createInvitations/${eventId}`,
      { message, templateId, templateImage },
      config
    );
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la création des invitations :', error);
    throw error.response?.data || error;
  }
};

export const getInvitationsByEvent = async (eventId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/invitations/${eventId}`, config);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des invitations :', error);
    throw error.response?.data || error;
  }
};

export const sendInvitations = async (eventId, guestIds, channels = ['email', 'whatsapp'], token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post(
      `/invitations/${eventId}/send`,
      { guestIds, channels },
      config
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'envoi des invitations :", error);
    throw error.response?.data || error;
  }
};

export const deleteInvitation = async (invitationId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.delete(`/invitations/delete/${invitationId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'invitation :", error);
    throw error.response?.data || error;
  }
};

export const bulkDeleteInvitations = async (ids, eventId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post(
      `/invitations/bulk-delete`,
      { ids, eventId },
      config
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression groupée d'invitations :", error);
    throw error.response?.data || error;
  }
};
