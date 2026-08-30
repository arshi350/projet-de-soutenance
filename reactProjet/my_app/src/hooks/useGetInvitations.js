import { useState, useEffect, useCallback } from 'react';
import { getInvitationsByEvent } from '../services/invitationService';

export const useGetInvitations = (eventId, token, autoFetch = true) => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchInvitations = useCallback(async () => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getInvitationsByEvent(eventId, token);
      setInvitations(response.invitations || response.data || []);
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la récupération des invitations';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (autoFetch && eventId) {
      fetchInvitations();
    }
  }, [autoFetch, eventId, fetchInvitations]);

  return { invitations, loading, error, refetch: fetchInvitations };
};
