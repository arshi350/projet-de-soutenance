import { useState, useEffect, useCallback } from 'react';
import { addInvite, deleteInvite, updateInvite, getInvitesByEvent } from '../services/inviteService';

export const useAddInvite = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const addNewInvite = async (inviteData) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await addInvite(inviteData, token);
      setData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage =
        err.response?.data?.message ||
        err.response?.data ||
        err.message ||
        'Erreur lors de l\'ajout de l\'invité';
      setError(errorMessage);
      console.error('useAddInvite erreur:', err.response?.data || err);
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

  return { addNewInvite, loading, error, success, data, reset };
};

export const useGetInvitesByEvent = (eventId, token, autoFetch = true) => {
  const [invites, setInvites] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvites = useCallback(async () => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getInvitesByEvent(eventId, token);
      setInvites(response.invites || response.data || []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la récupération des invités';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (autoFetch && eventId) {
      fetchInvites();
    }
  }, [autoFetch, eventId, fetchInvites]);

  return { invites, loading, error, refetch: fetchInvites };
};

export const useUpdateInvite = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const updateInviteById = async (inviteId, inviteData) => {
    if (!inviteId) {
      setError('ID d\'invité manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await updateInvite(inviteId, inviteData, token);
      setData(response);
      setSuccess(true);
      if (onSuccess) {
        onSuccess(inviteId, response);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la mise à jour de l\'invité';
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

  return { updateInviteById, loading, error, success, data, reset };
};

export const useDeleteInvite = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deletedId, setDeletedId] = useState(null);

  const deleteInviteById = async (inviteId) => {
    if (!inviteId) {
      setError('ID d\'invité manquant');
      return;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await deleteInvite(inviteId, token);
      setDeletedId(inviteId);
      setSuccess(true);
      if (onSuccess) {
        onSuccess(inviteId, response);
      }
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la suppression de l\'invité';
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

  return { deleteInviteById, loading, error, success, deletedId, reset };
};