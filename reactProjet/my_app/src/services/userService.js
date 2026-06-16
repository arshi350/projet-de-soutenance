import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; 

// Prépare les en-têtes d'authentification pour les requêtes protégées
const getAuthHeaders = (token) => ({
  headers: {
    Authorization: `Bearer ${token}`,
  },
});

// Crée un nouvel utilisateur via la route POST /api/addUser
export const addUser = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/addUser`, userData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", error);
    throw error;
  }
};

// Crée un nouvel administrateur via la route POST /api/addAdmin
export const addAdmin = async (adminData) => {
  try {
    const response = await axios.post(`${API_URL}/addAdmin`, adminData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'administrateur :", error);
    throw error;
  }
};

// Récupère tous les utilisateurs via la route GET /api/getAllUsers
export const getAllUsers = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/getAllUsers`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    throw error;
  }
};

// Récupère les informations d'un utilisateur par ID via GET /api/getOneUser/:id
export const getOneUser = async (userId, token) => {
  try {
    const response = await axios.get(`${API_URL}/getOneUser/${userId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    throw error;
  }
};

// Met à jour un utilisateur via PUT /api/updateUser/:id
export const updateUser = async (userId, userData, token) => {
  try {
    const response = await axios.put(`${API_URL}/updateUser/${userId}`, userData, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    throw error;
  }
};

// Supprime un utilisateur via DELETE /api/deleteUser/:id
export const deleteUser = async (userId, token) => {
  try {
    const response = await axios.delete(`${API_URL}/deleteUser/${userId}`, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    throw error;
  }
};

// Suspend un utilisateur via PUT /api/suspendUser/:id avec une raison optionnelle
export const suspendUser = async (userId, token, reason = '') => {
  try {
    const response = await axios.put(
      `${API_URL}/suspendUser/${userId}`,
      { reason },
      getAuthHeaders(token)
    );
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suspension de l'utilisateur :", error);
    throw error;
  }
};

// Rétablit un utilisateur suspendu via PUT /api/unsuspendUser/:id
export const unsuspendUser = async (userId, token) => {
  try {
    const response = await axios.put(`${API_URL}/unsuspendUser/${userId}`, null, getAuthHeaders(token));
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la réactivation de l'utilisateur :", error);
    throw error;
  }
};
