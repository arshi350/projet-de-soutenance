// statsServices.js
// Service pour récupérer les statistiques d'un utilisateur
import api from './api';

export const getUserStats = async (userId, token) => {
	try {
		const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
		const response = await api.get(`/user/${userId}/stats`, config);
		return response.data;
	} catch (error) {
		console.error("Erreur lors de la récupération des stats utilisateur:", error);
		throw error.response?.data || error;
	}
};
