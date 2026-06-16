import { useState, useCallback } from 'react';
import * as geminiService from '../services/geminiService';

export const useModifyTemplate = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);
  const [generatedImage, setGeneratedImage] = useState(null);
  const [warnings, setWarnings] = useState([]);

  const modifyTemplate = useCallback(async (templateId, prompt, token, templateImage = null) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    setGeneratedImage(null);
    setWarnings([]);

    try {
      const response = await geminiService.modifyTemplate(templateId, prompt, token, templateImage);
      
      if (response.success && response.data) {
        // Extraire l'image générée
        if (response.data.generatedImage) {
          setGeneratedImage(response.data.generatedImage);
        }
        
        setData(response.data);
        setSuccess(true);
        
        if (response.warnings && response.warnings.length > 0) {
          setWarnings(response.warnings);
        }
        
        return response.data;
      } else {
        throw new Error(response.message || 'Erreur inconnue');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la modification du template';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
    setGeneratedImage(null);
    setWarnings([]);
  };

  return { modifyTemplate, loading, error, success, data, generatedImage, warnings, reset };
};

export const useGetSuggestions = () => {
  const [suggestions, setSuggestions] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [source, setSource] = useState(null);

  const getSuggestions = useCallback(async (templateId, eventType, token) => {
    setLoading(true);
    setError(null);

    try {
      const response = await geminiService.getSuggestions(templateId, eventType, token);
      
      if (response.success && response.data) {
        const suggestionsData = response.data.suggestions || [];
        setSuggestions(suggestionsData);
        setSource(response.data.source || 'ai');
        return suggestionsData;
      } else {
        throw new Error(response.message || 'Erreur de récupération');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la récupération des suggestions';
      setError(errorMessage);
      // Retourner des suggestions par défaut en cas d'erreur
      const defaultSuggestions = [
        "Rendre les couleurs plus dynamiques",
        "Ajouter une image de fond personnalisée",
        "Mettre en avant la date et le lieu",
        "Personnaliser la police d'écriture"
      ];
      setSuggestions(defaultSuggestions);
      setSource('emergency_fallback');
      return defaultSuggestions;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuggestions(null);
    setSource(null);
  };

  return { getSuggestions, suggestions, loading, error, source, reset };
};

export const useGreeting = () => {
  const [message, setMessage] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [source, setSource] = useState(null);

  const greeting = useCallback(async (userMessage, token) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await geminiService.greeting(userMessage, token);
      
      if (response.success && response.data) {
        const responseText = response.data.response || response.message;
        setMessage(responseText);
        setSource(response.data.source || 'ai');
        setSuccess(true);
        return responseText;
      } else {
        throw new Error(response.message || 'Erreur de réponse');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la salutation';
      setError(errorMessage);
      // Fallback message
      const fallbackMessage = "Bonjour ! Je suis votre assistant design IA. Je peux modifier les couleurs, le texte et le QR code de votre invitation. Décrivez-moi ce que vous souhaitez changer !";
      setMessage(fallbackMessage);
      setSource('emergency_fallback');
      return fallbackMessage;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setMessage(null);
    setSource(null);
  };

  return { greeting, message, loading, error, success, source, reset };
};

export const useModifyTextContent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);
  const [source, setSource] = useState(null);

  const modifyTextContent = useCallback(async (content, prompt, token) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await geminiService.modifyTextContent(content, prompt, token);
      
      if (response.success && response.data) {
        const modifiedData = response.data.modified || response.data;
        setData(modifiedData);
        setSource(response.data.source || 'ai');
        setSuccess(true);
        return modifiedData;
      } else {
        throw new Error(response.message || 'Erreur de modification');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la modification du contenu texte';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
    setSource(null);
  };

  return { modifyTextContent, loading, error, success, data, source, reset };
};

export const useModifyColors = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);
  const [source, setSource] = useState(null);

  const modifyColors = useCallback(async (colors, prompt, token) => {
    setLoading(true);
    setError(null);
    setSuccess(false);

    try {
      const response = await geminiService.modifyColors(colors, prompt, token);
      
      if (response.success && response.data) {
        const newColors = response.data.modified || response.data;
        setData(newColors);
        setSource(response.data.source || 'ai');
        setSuccess(true);
        return newColors;
      } else {
        throw new Error(response.message || 'Erreur de modification');
      }
    } catch (err) {
      const errorMessage = err.message || 'Erreur lors de la modification des couleurs';
      setError(errorMessage);
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const reset = () => {
    setLoading(false);
    setError(null);
    setSuccess(false);
    setData(null);
    setSource(null);
  };

  return { modifyColors, loading, error, success, data, source, reset };
};