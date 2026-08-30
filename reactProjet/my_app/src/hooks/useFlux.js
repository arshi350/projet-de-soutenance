// hooks/useFlux.js
import { useState, useCallback } from 'react';
import { fluxService, generateTicketPrompt } from '../services/fluxService';

export const useFlux = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [progress, setProgress] = useState(0);
  const [savedImage, setSavedImage] = useState(null);

  const generateImage = useCallback(async (prompt, options = {}, token) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await fluxService.generateImage(prompt, options, token);

      clearInterval(progressInterval);
      setProgress(100);
      
      // ✅ Stocker l'URL de l'image correctement
      const imageUrl = typeof result === 'string' ? result : result?.image_url || result?.image?.url;
      setGeneratedImage(imageUrl);

      return imageUrl;
    } catch (err) {
      setError(err.message || 'Erreur lors de la génération');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const editImage = useCallback(async (imageUrl, prompt, options = {}, token) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const result = await fluxService.editImage(imageUrl, prompt, options, token);

      clearInterval(progressInterval);
      setProgress(100);
      
      // ✅ Stocker l'URL de l'image correctement
      const imageUrlResult = typeof result === 'string' ? result : result?.image_url || result?.image?.url;
      setGeneratedImage(imageUrlResult);

      return imageUrlResult;
    } catch (err) {
      setError(err.message || 'Erreur lors de la modification');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  // ✅ NOUVEAU : Sauvegarder l'image
  const saveImage = useCallback(async (templateId, imageUrl, modifications = {}, prompt = '', token) => {
    setLoading(true);
    setError(null);

    try {
      const result = await fluxService.saveGeneratedImage(templateId, imageUrl, modifications, prompt, token);
      setSavedImage(result);
      return result;
    } catch (err) {
      setError(err.message || 'Erreur lors de la sauvegarde');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const enhanceTicket = useCallback(async (imageUrl, prompt, ticketData, token) => {
    setLoading(true);
    setError(null);
    setProgress(0);

    try {
      const progressInterval = setInterval(() => {
        setProgress(prev => Math.min(prev + 10, 90));
      }, 500);

      const enhancedPrompt = generateTicketPrompt(prompt, ticketData);

      const result = await fluxService.enhanceTicketTemplate(
        imageUrl,
        enhancedPrompt,
        ticketData.title || 'Invitation',
        ticketData.guestName || 'Invité',
        token
      );

      clearInterval(progressInterval);
      setProgress(100);
      
      // ✅ Stocker l'URL de l'image correctement
      const imageUrlResult = typeof result === 'string' ? result : result?.image_url || result?.image?.url;
      setGeneratedImage(imageUrlResult);

      return imageUrlResult;
    } catch (err) {
      setError(err.message || 'Erreur lors de l\'amélioration du template');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneratedImage(null);
    setError(null);
    setLoading(false);
    setProgress(0);
    setSavedImage(null);
  }, []);

  return {
    generateImage,
    editImage,
    enhanceTicket,
    saveImage, // ✅ Nouveau
    loading,
    error,
    generatedImage,
    progress,
    savedImage, // ✅ Nouveau
    reset,
  };
};