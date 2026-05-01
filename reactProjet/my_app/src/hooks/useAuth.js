// useAuth.js
// Hooks personnalisés pour l'authentification, basés sur le AuthContext

import { useContext, useState, useCallback } from 'react';
import { useAuthContext } from '../context/AuthContext';

// Hook principal pour accéder à tout le contexte d'authentification
export const useAuth = () => {
	return useAuthContext();
};

// Hook pour obtenir l'utilisateur connecté
export const useCurrentUser = () => {
	const { user, isAuthenticated, loading } = useAuthContext();
	return { user, isAuthenticated, loading };
};

// Hook complet pour la connexion avec gestion d'état
export const useLogin = () => {
	const { login } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);
	const [data, setData] = useState(null);

	const loginUser = useCallback(async (credentials) => {
		setLoading(true);
		setError(null);
		setSuccess(false);
		setData(null);
		try {
			const res = await login(credentials);
			if (res.success) {
				setSuccess(true);
				setData(res.user);
				return res.user;
			} else {
				setError(res.error || 'Erreur de connexion');
				setSuccess(false);
				return null;
			}
		} catch (err) {
			setError(err.message || 'Erreur de connexion');
			setSuccess(false);
			return null;
		} finally {
			setLoading(false);
		}
	}, [login]);

	const reset = useCallback(() => {
		setLoading(false);
		setError(null);
		setSuccess(false);
		setData(null);
	}, []);

	return { login: loginUser, loading, error, success, data, reset };
};

// Hook complet pour la déconnexion
export const useLogout = () => {
	const { logout } = useAuthContext();
	const [loading, setLoading] = useState(false);
	const [error, setError] = useState(null);
	const [success, setSuccess] = useState(false);

	const logoutUser = useCallback(async () => {
		setLoading(true);
		setError(null);
		setSuccess(false);
		try {
			await logout();
			setSuccess(true);
		} catch (err) {
			setError(err.message || 'Erreur de déconnexion');
			setSuccess(false);
		} finally {
			setLoading(false);
		}
	}, [logout]);

	const reset = useCallback(() => {
		setLoading(false);
		setError(null);
		setSuccess(false);
	}, []);

	return { logout: logoutUser, loading, error, success, reset };
};

// Hook pour mettre à jour l'utilisateur
export const useUpdateUser = () => {
	const { updateUser } = useAuthContext();
	return updateUser;
};

// Hook pour rafraîchir le token
export const useRefreshToken = () => {
	const { refreshToken } = useAuthContext();
	return refreshToken;
};
