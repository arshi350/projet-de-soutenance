import api from './api';

// Service pour ajouter un événement
export const addEvent = async (eventData, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.post('/event/addEvent', eventData, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de l\'ajout de l\'événement:', error);
        throw error.response?.data || error;
    }
};

// Service pour récupérer les événements d'un utilisateur
export const getUserEvents = async (userId, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/event/getAllEventByUser/${userId}`, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des événements:', error);
        throw error.response?.data || error;
    }
};

// Service pour récupérer les événements récents d'un utilisateur
export const getRecentEvents = async (userId, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/event/getRecentEventsByUser/${userId}`, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des événements récents:', error);
        throw error.response?.data || error;
    }
};

// Service pour récupérer les événements récents
export const getRecentEvent = async (token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get('/event/getRecentvents', config);
        const data = response.data;
        return data?.events || data?.data || data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement récent:', error);
        throw error.response?.data || error;
    }
};

// Service pour supprimer un événement
export const deleteEvent = async (eventId, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.delete(`/event/deleteEvent/${eventId}`, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la suppression de l\'événement:', error);
        throw error.response?.data || error;
    }
};

export const getEventById = async (eventId, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/event/${eventId}`, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération de l\'événement :', error);
        throw error.response?.data || error;
    }
};

export const getRecentScannedInvites = async (eventId, token, limit = 10) => {
    try {
        const query = limit > 0 ? `?limit=${limit}` : '?limit=0';
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get(`/invite/getRecentScanned/${eventId}${query}`, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la récupération des invités scannés :', error);
        throw error.response?.data || error;
    }
};

// Service pour mettre à jour un événement
export const updateEvent = async (eventId, eventData, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.put(`/event/updateEvent/${eventId}`, eventData, config);
        return response.data;
    } catch (error) {
        console.error('Erreur lors de la mise à jour de l\'événement:', error);
        throw error.response?.data || error;
    }
};

// Service pour récupérer tous les événements (admin)
export const getAllEventsAdmin = async (token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.get('/event/admin/getAllEvents', config);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la récupération de tous les événements:", error);
        throw error.response?.data || error;
    }
};

// Modérer le statut d'un événement par l'admin
export const updateEventStatusAdminApi = async (eventId, status, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.put(`/event/admin/updateStatus/${eventId}`, { status }, config);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la modification du statut d'événement:", error);
        throw error.response?.data || error;
    }
};

// Mettre en avant un événement par l'admin
export const toggleFeaturedEventAdminApi = async (eventId, token) => {
    try {
        const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
        const response = await api.put(`/event/admin/toggleFeatured/${eventId}`, null, config);
        return response.data;
    } catch (error) {
        console.error("Erreur lors de la mise en avant de l'événement:", error);
        throw error.response?.data || error;
    }
};

