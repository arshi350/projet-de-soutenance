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

export const getAdminSubscriptions = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/admin/subscriptions', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des abonnements admin:", error);
    throw error.response?.data || error;
  }
};

export const getAuditLogsApi = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/admin/audit-logs', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des journaux d'audit:", error);
    throw error.response?.data || error;
  }
};

export const getAdminAnalyticsApi = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/admin/analytics', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des données analytiques:", error);
    throw error.response?.data || error;
  }
};
