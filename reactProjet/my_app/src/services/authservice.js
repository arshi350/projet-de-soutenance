// authservice.js
// Service complet pour la gestion de l'authentification utilisateur
import api, { API_BASE_URL } from './api';

const AUTH_URL = `${API_BASE_URL}/auth`;

// =============================
// Connexion utilisateur
// =============================
export const loginService = async (credentials) => {
	try {
		const response = await api.post('/auth/login', credentials);
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
export const logoutService = async () => {
	try {
		await api.post('/auth/logout', {});
	} catch (error) {
		console.warn("Erreur lors de l'appel logout:", error);
	} finally {
		localStorage.removeItem('accessToken');
		localStorage.removeItem('user');
	}
};

// =============================
// Rafraîchir l'access token
// =============================
export const refreshTokenService = async () => {
	try {
		const response = await api.post('/auth/refresh', {});
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken);
			if (response.data.user) {
				localStorage.setItem('user', JSON.stringify(response.data.user));
			}
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

// Vérifie si le token est présent et valide
export const isTokenValid = () => {
	const token = getAccessToken();
	if (!token) return false;
	try {
		// Vérification simple du format JWT et de la date d'expiration si disponible
		const parts = token.split('.');
		if (parts.length !== 3) return false;
		const payload = JSON.parse(atob(parts[1]));
		if (payload.exp && payload.exp * 1000 < Date.now()) {
			return false;
		}
		return true;
	} catch {
		return true;
	}
};

// =============================
// Mot de passe oublié & OTP
// =============================
export const forgotPasswordService = async (email) => {
	try {
		const response = await api.post('/auth/forgot-password', { email });
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const verifyOtpService = async (email, otp) => {
	try {
		const response = await api.post('/auth/verify-otp', { email, otp });
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

export const resetPasswordService = async (resetSessionToken, newPassword) => {
	try {
		const response = await api.post('/auth/reset-password', { resetSessionToken, newPassword });
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};

// =============================
// Connexion Google OAuth
// =============================
export const googleLoginService = async (credentialToken) => {
	try {
		const response = await api.post('/auth/google', { token: credentialToken });
		if (response.data.accessToken) {
			localStorage.setItem('accessToken', response.data.accessToken);
			localStorage.setItem('user', JSON.stringify(response.data.user));
		}
		return response.data;
	} catch (error) {
		throw error.response?.data || error;
	}
};
