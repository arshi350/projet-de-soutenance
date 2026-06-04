// Service pour récupérer les statistiques globales de l'administration
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const getAdminStats = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/admin/stats`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });

    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
