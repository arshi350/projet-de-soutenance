// registerService.js
// Services pour la gestion des utilisateurs
import api from './api';

// Ajouter un nouvel utilisateur
export const addUserService = async (userData) => {
  try {
    const response = await api.post('/addUser', userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer tous les utilisateurs
export const getAllUsersService = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/getAllUsers', config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer un utilisateur par ID
export const getOneUserService = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/getOneUser/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mettre à jour un utilisateur
export const updateUserService = async (id, userData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/updateUser/${id}`, userData, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Supprimer un utilisateur
export const deleteUserService = async (id, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.delete(`/deleteUser/${id}`, config);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
