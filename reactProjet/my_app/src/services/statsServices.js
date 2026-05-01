
// Service pour récupérer les statistiques d'un utilisateur
import axios from 'axios';

const API_URL = 'http://localhost:3000/api';

export const getUserStats = async (userId, token) => {
	try {
		const response = await axios.get(`${API_URL}/user/${userId}/stats`, {
			headers: {
				Authorization: `Bearer ${token}`,
			},
		});

		return response.data;
        
	} catch (error) {
		throw error;
	}
};

