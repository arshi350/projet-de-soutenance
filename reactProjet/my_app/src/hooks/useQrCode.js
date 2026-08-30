import { useState, useEffect, useCallback } from 'react';
import { getQrCodesForEvent, generateQrCodesForEvent } from '../services/qrCodeService';

export const useQrCodes = (eventId, token) => {
  const [qrCodes, setQrCodes] = useState([]);
  const [loading, setLoading] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [error, setError] = useState(null);
  const [generating, setGenerating] = useState(false);
  const [generateError, setGenerateError] = useState(null);
  const [generateSuccess, setGenerateSuccess] = useState(false);

  const fetchQrCodes = useCallback(async () => {
    if (!eventId) {
      setQrCodes([]);
      setLoaded(false);
      return;
    }

    setLoading(true);
    setError(null);
    setLoaded(false);

    try {
      const response = await getQrCodesForEvent(eventId, token);
      setQrCodes(response.qrCodes || response.data?.qrCodes || []);
    } catch (err) {
      if (err?.response?.status === 404) {
        setQrCodes([]);
      } else {
        const errorMessage = err?.message || 'Erreur lors de la récupération des QR codes';
        setError(errorMessage);
      }
    } finally {
      setLoading(false);
      setLoaded(true);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (eventId) {
      fetchQrCodes();
    }
  }, [eventId, fetchQrCodes]);

  const generateQrCodes = async () => {
    if (!eventId) {
      const errorMessage = 'ID d événement manquant';
      setGenerateError(errorMessage);
      throw new Error(errorMessage);
    }

    setGenerating(true);
    setGenerateError(null);
    setGenerateSuccess(false);

    try {
      const response = await generateQrCodesForEvent(eventId, token);
      setGenerateSuccess(true);
      await fetchQrCodes();
      return response;
    } catch (err) {
      const errorMessage = err?.response?.data?.message || err?.message || 'Erreur lors de la génération des QR codes';
      setGenerateError(errorMessage);
      throw err;
    } finally {
      setGenerating(false);
    }
  };

  return {
    qrCodes,
    hasQrCodes: qrCodes.length > 0,
    loading,
    loaded,
    error,
    fetchQrCodes,
    generating,
    generateError,
    generateSuccess,
    generateQrCodes,
  };
};
