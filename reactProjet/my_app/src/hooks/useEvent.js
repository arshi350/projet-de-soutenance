import { useState, useCallback, useEffect } from "react";
import { addEvent, getUserEvents, getRecentEvents, getRecentEvent, getEventById, getRecentScannedInvites, deleteEvent, updateEvent, getAllEventsAdmin } from '../services/eventService';

//hook ajouter un événement
export const useAddEvent = () => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const addNewEvent = async (eventData, token) => {
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await addEvent(eventData, token);
      setData(response);
      setSuccess(true);
      return response;
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de l\'ajout';
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

  return { addNewEvent, loading, error, success, data, reset };
};


//hook pour recupérer les événements d'un utilisateur
export const useGetUserEvents = (userId, token, autoFetch = true) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchEvents = useCallback(async () => {
    if (!userId || !token) {
      setError('Utilisateur non authentifié');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getUserEvents(userId, token);
      // Adapter selon la structure de votre API
      const eventsData = response.events || response.data || response;
      setEvents(eventsData);
      setTotal(eventsData.length || response.total || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, token]);

  useEffect(() => {
    if (autoFetch && userId && token) {
      fetchEvents();
    }
  }, [autoFetch, userId, token, fetchEvents]);

  return { events, loading, error, total, refetch: fetchEvents };
};

//HOOK POUR RÉCUPÉRER TOUS LES ÉVÉNEMENTS (ADMIN)
export const useGetAllEventsAdmin = (token, autoFetch = true) => {
  const [events, setEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchAllEvents = useCallback(async () => {
    if (!token) {
      setError('Utilisateur non authentifié');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getAllEventsAdmin(token);
      const eventsData = response.events || response.data || response;
      setEvents(Array.isArray(eventsData) ? eventsData : []);
      setTotal(eventsData?.length || response.count || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (autoFetch && token) {
      fetchAllEvents();
    }
  }, [autoFetch, token, fetchAllEvents]);

  return { events, loading, error, total, refetch: fetchAllEvents };
};


//HOOK POUR RÉCUPÉRER LES ÉVÉNEMENTS RÉCENTS d'UN UTILISATEUR
export const useGetRecentEvents = (userId, token, limit = 5, autoFetch = true) => {
  const [recentEvents, setRecentEvents] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecentEvents = useCallback(async () => {
    if (!userId || !token) {
      setError('Utilisateur non authentifié');
      return;
    }
    
    setLoading(true);
    setError(null);
    
    try {
      const response = await getRecentEvents(userId, token);
      // Adapter selon la structure de votre API
      const eventsData = response.events || response.data || response;
      // Limiter côté frontend si besoin
      setRecentEvents(Array.isArray(eventsData) ? eventsData.slice(0, limit) : []);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [userId, token, limit]);

  useEffect(() => {
    if (autoFetch && userId && token) {
      fetchRecentEvents();
    }
  }, [autoFetch, userId, token, fetchRecentEvents]);

  return { recentEvents, loading, error, refetch: fetchRecentEvents };
};

//HOOK POUR RÉCUPÉRER LES ÉVÉNEMENTS RÉCENTS de la bd (public / vitrine)
export const useGetRecentEvent = (token = null, autoFetch = true) => {
  const [recentEvent, setRecentEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchRecentEvent = useCallback(async () => {
    setLoading(true);
    setError(null);

    try {
      const response = await getRecentEvent(token);
      setRecentEvent(response);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur de chargement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (autoFetch) {
      fetchRecentEvent();
    }
  }, [autoFetch, fetchRecentEvent]);

  return { recentEvent, loading, error, refetch: fetchRecentEvent };
};

export const useGetEventById = (eventId, token, autoFetch = true) => {
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchEvent = useCallback(async () => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getEventById(eventId, token);
      setEvent(response.event || response.data || response);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la récupération de l\'événement';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    if (autoFetch && eventId) {
      fetchEvent();
    }
  }, [autoFetch, eventId, fetchEvent]);

  return { event, loading, error, refetch: fetchEvent };
};

export const useGetRecentScannedInvites = (eventId, token, limit = 4, autoFetch = true) => {
  const [scannedInvites, setScannedInvites] = useState([]);
  const [scannedCount, setScannedCount] = useState(0);
  const [presentCount, setPresentCount] = useState(0);
  const [totalInvites, setTotalInvites] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchScannedInvites = useCallback(async () => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      return;
    }

    setLoading(true);
    setError(null);

    try {
      const response = await getRecentScannedInvites(eventId, token, limit);
      setScannedInvites(response.scannedInvites || response.data || []);
      setScannedCount(response.scannedCount || 0);
      setPresentCount(response.presentCount || 0);
      setTotalInvites(response.totalInvites || 0);
    } catch (err) {
      const errorMessage = err.response?.data?.message || err.message || 'Erreur lors de la récupération des invités scannés';
      setError(errorMessage);
    } finally {
      setLoading(false);
    }
  }, [eventId, token, limit]);

  useEffect(() => {
    if (autoFetch && eventId) {
      fetchScannedInvites();
    }
  }, [autoFetch, eventId, fetchScannedInvites]);

  return { scannedInvites, scannedCount, presentCount, totalInvites, loading, error, refetch: fetchScannedInvites };
};

//HOOK POUR SUPPRIMER UN ÉVÉNEMENT
export const useDeleteEvent = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [deletedId, setDeletedId] = useState(null);

  const deleteEventById = async (eventId) => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await deleteEvent(eventId, token);
      setDeletedId(eventId);
      setSuccess(true);
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(eventId, response);
      }
      
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

  return { deleteEventById, loading, error, success, deletedId, reset };
};


//HOOK POUR METTRE À JOUR UN ÉVÉNEMENT
export const useUpdateEvent = (token, onSuccess) => {
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(false);
  const [data, setData] = useState(null);

  const updateEventById = async (eventId, eventData) => {
    if (!eventId) {
      setError('ID d\'événement manquant');
      return;
    }
    
    setLoading(true);
    setError(null);
    setSuccess(false);
    
    try {
      const response = await updateEvent(eventId, eventData, token);
      setData(response);
      setSuccess(true);
      
      // Appeler le callback de succès si fourni
      if (onSuccess) {
        onSuccess(eventId, response);
      }
      
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

  return { updateEventById, loading, error, success, data, reset };
};