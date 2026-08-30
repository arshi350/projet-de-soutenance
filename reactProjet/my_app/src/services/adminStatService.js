// adminStatService.js
// Service pour récupérer les statistiques globales de l'administration
import api from './api';

export const getAdminStats = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/admin/stats', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stats admin:", error);
    throw error.response?.data || error;
  }
};
