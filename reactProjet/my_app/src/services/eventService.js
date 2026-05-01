import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

//service pour ajouter un événement
export const addEvent = async (eventData, token) => {
    try {
        
        const response = await axios.post(`${API_URL}/event/addEvent`, eventData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',
            },
        })
        return response.data;

    } catch (error) {
        console.error('erreur lors de l\'ajout de l\'événement:', error);
        throw error;
    }
}

//service pour récupérer les événements d'un utilisateur
export const getUserEvents = async (userId, token) => {
    try {
        const response = await axios.get(`${API_URL}/event/getAllEventByUser/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            },
        })
        return response.data;

    } catch (error) {
        console.error('erreur lors de la récupération des événements:', error);
        throw error;
    }
}

//service pour recuperer les evenement recent d'un utilisateur
export const getRecentEvents = async (userId, token) => {
    try {

        const response = await axios.get(`${API_URL}/event/getRecentEventsByUser/${userId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })

        return response.data;

    } catch (error) {
        console.error('erreur lors de la récupération des événements récents:', error);
        throw error;
    }
}

//service pour supprimer un événement
export const deleteEvent = async (eventId, token) => {
    try {
        const response = await axios.delete(`${API_URL}/event/deleteEvent/${eventId}`, {
            headers: {
                Authorization: `Bearer ${token}`,
            }
        })
        
        return response.data;

    } catch (error) {
        console.error('erreur lors de la suppression de l\'événement:', error);
        throw error;
    }
}

//service pour mettre à jour un événement
export const updateEvent = async (eventId, eventData, token) => {
    try {

        const response = await axios.put(`${API_URL}/event/updateEvent/${eventId}`, eventData, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'multipart/form-data',  
            }
        })

        return response.data;

    } catch (error) {
        console.error('erreur lors de la mise à jour de l\'événement:', error);
        throw error;
    }
}