// registerService.js
// Services pour la gestion des utilisateurs (inscription, récupération, mise à jour, suppression)

import axios from 'axios';

const API_URL = 'http://localhost:3000/api'; // À adapter selon votre backend

// Ajouter un nouvel utilisateur
export const addUserService = async (userData) => {
  try {
    const response = await axios.post(`${API_URL}/addUser`, userData);
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer tous les utilisateurs
export const getAllUsersService = async (token) => {
  try {
    const response = await axios.get(`${API_URL}/getAllUsers`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Récupérer un utilisateur par ID
export const getOneUserService = async (id, token) => {
  try {
    const response = await axios.get(`${API_URL}/getOneUser/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Mettre à jour un utilisateur
export const updateUserService = async (id, userData, token) => {
  try {
    const response = await axios.put(`${API_URL}/updateUser/${id}`, userData, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};

// Supprimer un utilisateur
export const deleteUserService = async (id, token) => {
  try {
    const response = await axios.delete(`${API_URL}/deleteUser/${id}`, {
      headers: { Authorization: `Bearer ${token}` },
    });
    return response.data;
  } catch (error) {
    throw error.response?.data || error;
  }
};
