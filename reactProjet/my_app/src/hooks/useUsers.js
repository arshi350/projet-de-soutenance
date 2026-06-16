import { useState, useCallback, useEffect } from 'react';
import { 
  addUser,
  addAdmin,
  getAllUsers,
  getOneUser,
  updateUser,
  deleteUser,
  suspendUser,
  unsuspendUser
} from '../services/userService';

// Hook pour créer un nouvel utilisateur
export const useAddUser = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const createUser = async (userData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await addUser(userData);
      setData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de l\'utilisateur';
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

  return { createUser, loading, error, success, data, reset };
};

// Hook pour créer un nouvel administrateur
export const useAddAdmin = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const createAdmin = async (adminData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await addAdmin(adminData);
      setData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la création de l\'administrateur';
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

  return { createAdmin, loading, error, success, data, reset };
};

// Hook pour récupérer tous les utilisateurs (route protégée)
export const useGetAllUsers = (token, autoFetch = true) => {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchUsers = useCallback(async () => {
    if (!token) {
      setError('Token manquant ou utilisateur non authentifié');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAllUsers(token);
      const usersData = response.users || response.data || response;
      setUsers(Array.isArray(usersData) ? usersData : []);
      setTotal(usersData?.length || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de récupération des utilisateurs';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchUsers();
    }
  }, [autoFetch, token, fetchUsers]);

  return { users, loading, error, total, refetch: fetchUsers };
};

// Hook pour récupérer un utilisateur par ID
export const useGetOneUser = (userId, token, autoFetch = true) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchUser = useCallback(async () => {
    if (!userId || !token) {
      setError('ID utilisateur ou token manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getOneUser(userId, token);
      setUser(response);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de récupération de l\'utilisateur';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (autoFetch && userId && token) {
      fetchUser();
    }
  }, [autoFetch, userId, token, fetchUser]);

  return { user, loading, error, refetch: fetchUser };
};

// Hook pour mettre à jour un utilisateur
export const useUpdateUser = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const updateUserById = async (userId, userData) => {
    if (!userId) {
      setError('ID utilisateur manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateUser(userId, userData, token);
      setData(response);
      setSuccess(true);
      if (onSuccess) onSuccess(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'utilisateur';
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

  return { updateUserById, loading, error, success, data, reset };
};

// Hook pour supprimer un utilisateur
export const useDeleteUser = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deletedId, setDeletedId] = useState(null);

  const deleteUserById = async (userId) => {
    if (!userId) {
      setError('ID utilisateur manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteUser(userId, token);
      setDeletedId(userId);
      setSuccess(true);
      if (onSuccess) onSuccess(userId, response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression de l\'utilisateur';
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

  return { deleteUserById, loading, error, success, deletedId, reset };
};

// Hook pour suspendre un utilisateur
export const useSuspendUser = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const suspendUserById = async (userId, reason = '') => {
    if (!userId) {
      setError('ID utilisateur manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await suspendUser(userId, token, reason);
      setData(response);
      setSuccess(true);
      if (onSuccess) onSuccess(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suspension de l\'utilisateur';
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

  return { suspendUserById, loading, error, success, data, reset };
};

// Hook pour réactiver un utilisateur suspendu
export const useUnsuspendUser = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const unsuspendUserById = async (userId) => {
    if (!userId) {
      setError('ID utilisateur manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await unsuspendUser(userId, token);
      setData(response);
      setSuccess(true);
      if (onSuccess) onSuccess(response);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la réactivation de l\'utilisateur';
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

  return { unsuspendUserById, loading, error, success, data, reset };
};