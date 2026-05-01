
// authservice.js
// Service complet pour la gestion de l'authentification utilisateur (connexion, déconnexion, refresh token, gestion du localStorage)
// Utilise les routes backend définies dans authRoutes.js et la logique de token du contrôleur auth.js

import axios from 'axios';

// URL de base de l'API (adapter selon votre environnement)
const API_URL = 'http://localhost:3000/api/auth';

// =============================
// Connexion utilisateur
// =============================
// Envoie les identifiants à /api/auth/login
// Stocke l'accessToken et l'utilisateur dans le localStorage si succès
export const loginService = async (credentials) => {
	try {
		const response = await axios.post(`${API_URL}/login`, credentials, { withCredentials: true });
		// Le backend renvoie accessToken et user
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken);
			localStorage.setItem('user', JSON.stringify(response.data.user));
		}
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

// =============================
// Déconnexion utilisateur
// =============================
// Appelle /api/auth/logout pour supprimer les cookies côté serveur
// Nettoie le localStorage côté client
export const logoutService = async () => {
	try {
		await axios.post(`${API_URL}/logout`, {}, { withCredentials: true });
	} catch (error) {
		// Même en cas d'erreur, on nettoie le localStorage
	} finally {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('user');
	}
};

// =============================
// Rafraîchir l'access token
// =============================
// Appelle /api/auth/refresh pour obtenir un nouveau accessToken
export const refreshTokenService = async () => {
	try {
		const response = await axios.post(`${API_URL}/refresh`, {}, { withCredentials: true });
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken);
			return response.data.accessToken;
		}
		throw new Error('Impossible de rafraîchir le token');
	} catch (error) {
		throw error.response?.data || error;
	}
};

// =============================
// Utilitaires de gestion du token et de l'utilisateur
// =============================
export const getAccessToken = () => localStorage.getItem('accessToken');

export const getCurrentUser = () => {
	const user = localStorage.getItem('user');
	return user ? JSON.parse(user) : null;
};

// Vérifie si le token est présent et non expiré (simple, à améliorer selon vos besoins)
export const isTokenValid = () => {
	const token = getAccessToken();
	if (!token) return false;
	// Décoder le JWT pour vérifier l'expiration (optionnel, ici on suppose qu'il existe)
	// Pour une vraie vérification, utiliser jwt-decode côté client
	return true;
};



