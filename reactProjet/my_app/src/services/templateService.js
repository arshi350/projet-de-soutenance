import axios from 'axios';

const API_URI = 'http://localhost:3000/api/templates';


// Prépare les en-têtes d'authentification pour les requêtes protégées
const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});


//ajouter un template
export const addTemplate = async (templateData, token) => {
  try {
    const response = await axios.post(`${API_URI}/addTemplate`, templateData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout du template :", error);
    throw error;
  }
};

//récupérer tous les templates
export const getAllTemplates = async (token) => {
  try {
    const response = await axios.get(`${API_URI}/getAllTemplates`, getAuthHeaders(token));
    return response.data;
    } catch (error) {
    console.error("Erreur lors de la récupération des templates :", error);
    throw error;
  }
};

//récupérer un template par ID
export const getTemplateById = async (templateId, token) => {
  try {
    const response = await axios.get(`${API_URI}/getTemplate/${templateId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération du template :", error);
    throw error;
  }
};

// Mettre à jour un template
export const updateTemplate = async (templateId, templateData, token) => {
  try {
    const response = await axios.put(`${API_URI}/updateTemplate/${templateId}`, templateData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du template :", error);
    throw error;
  }
};

// Supprimer un template
export const deleteTemplate = async (templateId, token) => {
  try {    
    const response = await axios.delete(`${API_URI}/deleteTemplate/${templateId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression du template :", error);
    throw error;
  }
};