import api from './api';

// Ajouter un template
export const addTemplate = async (templateData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post('/templates/addTemplate', templateData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du template :", error);
    throw error.response?.data || error;
  }
};

// Récupérer tous les templates
export const getAllTemplates = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/templates/getAllTemplates', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des templates :", error);
    throw error.response?.data || error;
  }
};

// Récupérer un template par ID
export const getTemplateById = async (templateId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/templates/getTemplate/${templateId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du template :", error);
    throw error.response?.data || error;
  }
};

// Mettre à jour un template
export const updateTemplate = async (templateId, templateData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/templates/updateTemplate/${templateId}`, templateData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du template :", error);
    throw error.response?.data || error;
  }
};

// Supprimer un template
export const deleteTemplate = async (templateId, token) => {
  try {    
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.delete(`/templates/deleteTemplate/${templateId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du template :", error);
    throw error.response?.data || error;
  }
};