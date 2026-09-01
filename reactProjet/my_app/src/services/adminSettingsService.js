import api from './api';

export const getPlatformSettingsApi = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/admin/settings', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des paramètres:", error);
    throw error.response?.data || error;
  }
};

export const updatePlatformSettingsApi = async (settingsData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put('/admin/settings', settingsData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour des paramètres:", error);
    throw error.response?.data || error;
  }
};

export const getReportsApi = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/admin/reports', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des signalements:", error);
    throw error.response?.data || error;
  }
};

export const resolveReportApi = async (reportId, status, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/admin/reports/${reportId}/resolve`, { status }, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors du traitement du signalement:", error);
    throw error.response?.data || error;
  }
};
