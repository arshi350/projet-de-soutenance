import api from './api';

// Crée un nouvel utilisateur via la route POST /api/addUser
export const addUser = async (userData) => {
  try {
    const response = await api.post('/addUser', userData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'utilisateur :", error);
    throw error.response?.data || error;
  }
};

// Crée un nouvel administrateur via la route POST /api/addAdmin
export const addAdmin = async (adminData) => {
  try {
    const response = await api.post('/addAdmin', adminData);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de l'ajout de l'administrateur :", error);
    throw error.response?.data || error;
  }
};

// Récupère tous les utilisateurs via la route GET /api/getAllUsers
export const getAllUsers = async (token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get('/getAllUsers', config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération des utilisateurs :", error);
    throw error.response?.data || error;
  }
};

// Récupère les informations d'un utilisateur par ID via GET /api/getOneUser/:id
export const getOneUser = async (userId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/getOneUser/${userId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la récupération de l'utilisateur :", error);
    throw error.response?.data || error;
  }
};

// Met à jour un utilisateur via PUT /api/updateUser/:id
export const updateUser = async (userId, userData, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/updateUser/${userId}`, userData, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour de l'utilisateur :", error);
    throw error.response?.data || error;
  }
};

// Supprime un utilisateur via DELETE /api/deleteUser/:id
export const deleteUser = async (userId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.delete(`/deleteUser/${userId}`, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suppression de l'utilisateur :", error);
    throw error.response?.data || error;
  }
};

// Suspend un utilisateur via PUT /api/suspendUser/:id avec une raison optionnelle
export const suspendUser = async (userId, token, reason = '') => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/suspendUser/${userId}`, { reason }, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la suspension de l'utilisateur :", error);
    throw error.response?.data || error;
  }
};

// Rétablit un utilisateur suspendu via PUT /api/unsuspendUser/:id
export const unsuspendUser = async (userId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/unsuspendUser/${userId}`, null, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la réactivation de l'utilisateur :", error);
    throw error.response?.data || error;
  }
};

// Change le rôle d'un utilisateur (ex: admin) via PUT /api/updateRole/:id
export const updateUserRoleApi = async (userId, role, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/updateRole/${userId}`, { role }, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du rôle :", error);
    throw error.response?.data || error;
  }
};

// Change le plan d'abonnement d'un utilisateur (ex: PREMIUM, VIP) via PUT /api/updatePlan/:id
export const updateUserPlanApi = async (userId, plan, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.put(`/updatePlan/${userId}`, { plan }, config);
    return response.data;
  } catch (error) {
    console.error("Erreur lors de la mise à jour du plan :", error);
    throw error.response?.data || error;
  }
};

