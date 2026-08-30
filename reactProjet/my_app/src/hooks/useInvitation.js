import { useState } from 'react';
import { createInvitations as createInvitationsApi } from '../services/invitationService';

export const useCreateInvitations = (token) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [invitations, setInvitations] = useState(null);

  const createInvitations = async (eventId, message, templateId = null, templateImage = null) => {
    if (!eventId) {
      const err = new Error('ID d événement manquant');
      setError(err.message);
      throw err;
    }

    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await createInvitationsApi(eventId, message, token, templateId, templateImage);
      setInvitations(response.invitations || response.data || []);
      setSuccess(true);
      return response;
    } catch (err) {
      const errMsg = err.message || 'Erreur lors de la création des invitations';
      setError(err.response?.message || err.response?.data?.message || errMsg);
      throw err;
    } finally {
      setLoading(false);
    }
  };

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setInvitations(null);
  };

  return { createInvitations, loading, error, success, invitations, reset };
};
