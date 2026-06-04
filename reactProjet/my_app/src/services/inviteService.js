import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const addInvite = async (inviteData, token) => {
  try {
    const response = await axios.post(`${API_URL}/invite/addInvite`, inviteData, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'invité:", error);
    throw error.response?.data || error;
  }
};

export const deleteInvite = async (inviteId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/invite/deleteInvite/${inviteId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'invité:", error);
    throw error.response?.data || error;
  }
};

export const updateInvite = async (inviteId, inviteData, token) => {
  try {
    const response = await axios.put(`${API_URL}/invite/updateInvite/${inviteId}`, inviteData, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'invité:", error);
    throw error.response?.data || error;
  }
};

export const getInvitesByEvent = async (eventId, token) => {
  try {
    const response = await axios.get(`${API_URL}/invite/getInvites/${eventId}`, {
      headers: token
        ? {
            Authorization: `Bearer ${token}`,
          }
        : {},
    });
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des invités:", error);
    throw error.response?.data || error;
  }
}; 