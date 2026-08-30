// hooks/useAIChat.js
import { useState, useEffect, useCallback, useRef } from 'react';
import aiChatService from '../services/aiChatService';

const getStoredSessionId = (customPrefix = 'default') => {
  const key = `arshievent_ai_session_${customPrefix}`;
  let id = sessionStorage.getItem(key);
  if (!id) {
    id = typeof crypto?.randomUUID === 'function' 
      ? crypto.randomUUID() 
      : `session-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;
    sessionStorage.setItem(key, id);
  }
  return id;
};

export const useAIChat = (sessionScope = 'studio_design') => {
  const [sessionId] = useState(() => getStoredSessionId(sessionScope));
  const [messages, setMessages] = useState(() => {
    try {
      const saved = sessionStorage.getItem(`arshievent_chat_history_${sessionId}`);
      if (saved) {
        return JSON.parse(saved);
      }
    } catch (e) {
      console.warn('Erreur lecture historique session:', e);
    }
    return [
      {
        id: 'welcome-init',
        type: 'assistant',
        content: `Bonjour ! Je suis votre assistant IA expert en retouche et design d'invitations. Je peux analyser votre modèle, supprimer les textes pour créer un template épuré, modifier les couleurs ou repenser la mise en page selon vos souhaits.`,
        timestamp: new Date().toISOString()
      }
    ];
  });

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isOnline, setIsOnline] = useState(true);
  const isMountedRef = useRef(true);

  // Synchronisation de l'historique en sessionStorage
  useEffect(() => {
    try {
      sessionStorage.setItem(`arshievent_chat_history_${sessionId}`, JSON.stringify(messages));
    } catch (e) {
      console.warn('Erreur sauvegarde historique session:', e);
    }
  }, [messages, sessionId]);

  // Vérification de l'état de santé du backend
  useEffect(() => {
    isMountedRef.current = true;
    const checkServer = async () => {
      try {
        const health = await aiChatService.checkHealth();
        if (isMountedRef.current) {
          setIsOnline(health?.status === 'ok');
        }
      } catch (err) {
        if (isMountedRef.current) {
          setIsOnline(false);
        }
      }
    };

    checkServer();
    const interval = setInterval(checkServer, 60000); // Check toutes les 60s
    return () => {
      isMountedRef.current = false;
      clearInterval(interval);
    };
  }, []);

  /**
   * Envoie un message utilisateur avec image de template optionnelle pour analyse et retouche
   */
  const sendMessage = useCallback(async (userText, image = null, templateData = null) => {
    if (!userText || !userText.trim() || isLoading) return null;

    const cleanText = userText.trim();
    const userMsg = {
      id: `user-${Date.now()}`,
      type: 'user',
      content: cleanText,
      timestamp: new Date().toISOString()
    };

    setMessages((prev) => [...prev, userMsg]);
    setIsLoading(true);
    setError(null);

    try {
      const data = await aiChatService.sendMessage(sessionId, cleanText, image, templateData);
      const replyContent = data?.reply || "J'ai bien analysé votre template et appliqué les modifications demandées.";

      const assistantMsg = {
        id: `ai-${Date.now()}`,
        type: 'assistant',
        content: replyContent,
        detectedTexts: data?.detectedTexts || [],
        modifications: data?.modifications || null,
        generatedImage: data?.generatedImage || null,
        visualTheme: data?.visualTheme || null,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantMsg]);
      setIsOnline(true);
      return data;
    } catch (err) {
      console.error('Erreur sendMessage useAIChat:', err);
      const errMsg = err.message || 'Impossible de joindre le serveur IA.';
      setError(errMsg);

      const assistantErrorMsg = {
        id: `ai-err-${Date.now()}`,
        type: 'assistant',
        content: `⚠️ ${errMsg}`,
        isError: true,
        timestamp: new Date().toISOString()
      };

      setMessages((prev) => [...prev, assistantErrorMsg]);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [sessionId, isLoading]);

  /**
   * Réinitialise la session de conversation
   */
  const resetSession = useCallback(async () => {
    setIsLoading(true);
    try {
      await aiChatService.resetSession(sessionId);
      const freshWelcome = [
        {
          id: `welcome-${Date.now()}`,
          type: 'assistant',
          content: `Session réinitialisée. Quel nouveau modèle ou modification d'image souhaitez-vous réaliser ?`,
          timestamp: new Date().toISOString()
        }
      ];
      setMessages(freshWelcome);
      sessionStorage.removeItem(`arshievent_chat_history_${sessionId}`);
      setError(null);
    } catch (err) {
      console.error('Erreur resetSession:', err);
    } finally {
      setIsLoading(false);
    }
  }, [sessionId]);

  return {
    messages,
    sendMessage,
    resetSession,
    isLoading,
    error,
    isOnline,
    sessionId
  };
};

export default useAIChat;
