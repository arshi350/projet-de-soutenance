import api from './api';

export const addInvite = async (inviteData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post('/invite/addInvite', inviteData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'invité:", error);
    throw error.response?.data || error;
  }
};

export const deleteInvite = async (inviteId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.delete(`/invite/deleteInvite/${inviteId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'invité:", error);
    throw error.response?.data || error;
  }
};

export const bulkDeleteInvites = async (ids, idEvent, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post('/invite/bulk-delete', { ids, idEvent }, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression groupée des invités:", error);
    throw error.response?.data || error;
  }
};

export const updateInvite = async (inviteId, inviteData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/invite/updateInvite/${inviteId}`, inviteData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'invité:", error);
    throw error.response?.data || error;
  }
};

export const getInvitesByEvent = async (eventId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/invite/getInvites/${eventId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des invités:", error);
    throw error.response?.data || error;
  }
}; 

export const sendInvitations = async (eventId, guestIds, channels = ['email','whatsapp'], token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post(`/invitations/${eventId}/send`, { guestIds, channels }, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'envoi des invitations:", error);
    throw error.response?.data || error;
  }
};

export const importInvites = async (eventId, file, token) => {
  try {
    const formData = new FormData();
    formData.append('file', file);

    const config = {
      headers: {
        'Content-Type': 'multipart/form-data',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
      },
    };

    const response = await api.post(`/invite/importInvites/${eventId}`, formData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'importation des invités:", error);
    throw error.response?.data || error;
  }
};