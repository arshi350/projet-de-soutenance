// src/hooks/useUserHooks.js
// Tous les hooks personnalisés pour la gestion des utilisateurs

import { useState, useEffect } from 'react';
import {
  addUserService,
  getAllUsersService,
  getOneUserService,
  updateUserService,
  deleteUserService,
} from '../services/registerService';

// ============================================
// 1. HOOK POUR L'INSCRIPTION (AJOUT UTILISATEUR)
// ============================================
export const useAddUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const addUser = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await addUserService(userData);
      setData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'inscription';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
  };

  return { addUser, loading, error, success, data, reset };
};

// ============================================
// 2. HOOK POUR RÉCUPÉRER TOUS LES UTILISATEURS
// ============================================
export const useGetAllUsers = (token, autoFetch = true) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchUsers = async () => {
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getAllUsersService(token);
      // Gestion des différents formats de réponse
      const usersData = response.data || response || [];
      setUsers(usersData);
      setTotal(response.total || usersData.length);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement des utilisateurs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && token) {
      fetchUsers();
    }
  }, [token, autoFetch]);

  return { users, loading, error, total, refetch: fetchUsers };
};

// ============================================
// 3. HOOK POUR RÉCUPÉRER UN UTILISATEUR PAR ID
// ============================================
export const useGetOneUser = (id, token, autoFetch = true) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = async () => {
    if (!id) {
      setError('ID utilisateur manquant');
      return;
    }
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getOneUserService(id, token);
      const userData = response.data || response;
      setUser(userData);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors du chargement de l\'utilisateur';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (autoFetch && id && token) {
      fetchUser();
    }
  }, [id, token, autoFetch]);

  return { user, loading, error, refetch: fetchUser };
};

// ============================================
// 4. HOOK POUR METTRE À JOUR UN UTILISATEUR
// ============================================
export const useUpdateUser = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const updateUser = async (id, userData) => {
    if (!id) {
      setError('ID utilisateur manquant');
      return;
    }
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await updateUserService(id, userData, token);
      setData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
  };

  return { updateUser, loading, error, success, data, reset };
};

// ============================================
// 5. HOOK POUR SUPPRIMER UN UTILISATEUR
// ============================================
export const useDeleteUser = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deletedId, setDeletedId] = useState(null);

  const deleteUser = async (id) => {
    if (!id) {
      setError('ID utilisateur manquant');
      return;
    }
    if (!token) {
      setError('Token d\'authentification manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await deleteUserService(id, token);
      setDeletedId(id);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setDeletedId(null);
  };

  return { deleteUser, loading, error, success, deletedId, reset };
};


