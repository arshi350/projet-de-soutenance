import api, { API_BASE_URL } from './api';

/**
 * Récupère les métriques complètes de vente et revenus pour un événement public
 * @param {string} eventId 
 * @param {string} [token] 
 * @returns {Promise<Object>}
 */
export const getEventSalesStats = async (eventId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/public/event/${eventId}/sales-stats`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des stats de vente :", error);
    throw error.response?.data || error;
  }
};

/**
 * Télécharge le fichier CSV des ventes de l'événement
 * @param {string} eventId 
 * @param {string} [token] 
 * @param {string} [eventTitle] 
 */
export const downloadSalesCSV = async (eventId, token, eventTitle = 'evenement') => {
  try {
    const config = {
      responseType: 'blob',
      ...(token ? { headers: { Authorization: `Bearer ${token}` } } : {})
    };
    const response = await api.get(`/public/event/${eventId}/sales-export`, config);
    
    // Création du lien de téléchargement temporaire
    const blob = new Blob([response.data], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    const cleanTitle = (eventTitle || 'evenement').replace(/[^a-zA-Z0-9_-]/g, '_');
    link.setAttribute('download', `ventes_billetterie_${cleanTitle}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    return true;
  } catch (error) {
    console.error("Erreur lors du téléchargement du CSV des ventes :", error);
    throw error.response?.data || error;
  }
};
