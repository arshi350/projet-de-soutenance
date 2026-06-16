import axios from 'axios';

const API_URI = 'http://localhost:3000/api/gemini';

const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
    'Content-Type': 'application/json',
  },
});

// Service pour modifier un template et générer une image modifiée
export const modifyTemplate = async (templateId, prompt, token, templateImage = null) => {
  try {
    const payload = { templateId, prompt };
    
    if (templateImage) {
      payload.templateImage = templateImage;
    }
    
    const response = await axios.post(
      `${API_URI}/modify`,
      payload,
      getAuthHeaders(token)
    );
    
    // Normaliser la réponse
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message,
      warnings: response.data.warnings || []
    };
  } catch (error) {
    console.error('Erreur Gemini modifyTemplate:', error);
    // Normaliser l'erreur pour le hook
    throw {
      message: error.response?.data?.message || error.message || 'Erreur lors de la modification',
      status: error.response?.status,
      data: error.response?.data
    };
  }
};

// Service pour obtenir des suggestions
export const getSuggestions = async (templateId, eventType, token) => {
  try {
    const response = await axios.post(
      `${API_URI}/suggestions`,
      { templateId, eventType },
      getAuthHeaders(token)
    );
    
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Erreur Gemini getSuggestions:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Erreur lors de la récupération des suggestions',
      status: error.response?.status
    };
  }
};

// Service pour modifier le contenu textuel
export const modifyTextContent = async (content, prompt, token) => {
  try {
    const response = await axios.post(
      `${API_URI}/modify-text`,
      { content, prompt },
      getAuthHeaders(token)
    );
    
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Erreur Gemini modifyTextContent:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Erreur lors de la modification du texte',
      status: error.response?.status
    };
  }
};

// Service pour modifier les couleurs
export const modifyColors = async (colors, prompt, token) => {
  try {
    const response = await axios.post(
      `${API_URI}/modify-colors`,
      { colors, prompt },
      getAuthHeaders(token)
    );
    
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Erreur Gemini modifyColors:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Erreur lors de la modification des couleurs',
      status: error.response?.status
    };
  }
};

// Service pour la salutation
export const greeting = async (message, token) => {
  try {
    const response = await axios.post(
      `${API_URI}/greeting`,
      { message },
      getAuthHeaders(token)
    );
    
    return {
      success: response.data.success,
      data: response.data.data,
      message: response.data.message
    };
  } catch (error) {
    console.error('Erreur Gemini greeting:', error);
    throw {
      message: error.response?.data?.message || error.message || 'Erreur lors de la salutation',
      status: error.response?.status
    };
  }
};

export default {
  modifyTemplate,
  getSuggestions,
  modifyTextContent,
  modifyColors,
  greeting,
};