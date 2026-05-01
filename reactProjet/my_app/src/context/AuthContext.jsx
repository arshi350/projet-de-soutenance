// AuthContext.js
// Fournit un contexte global pour l'authentification dans l'application React
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginService,
  logoutService,
  refreshTokenService,
  getCurrentUser,
  getAccessToken,
  isTokenValid
} from '../services/authservice';

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(getCurrentUser());
  const [token, setToken] = useState(getAccessToken());
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [isAuthenticated, setIsAuthenticated] = useState(!!getAccessToken());

  // Vérifie le token au montage
  useEffect(() => {
    if (token && !isTokenValid()) {
      handleRefreshToken();
    }
    // eslint-disable-next-line
  }, []);

  // Connexion utilisateur
  const login = useCallback(async (credentials) => {
    setLoading(true);
    setError(null);
    try {
      const data = await loginService(credentials);
      setUser(data.user);
      setToken(data.accessToken);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion');
      setIsAuthenticated(false);
      return { success: false, error: err.message };
    } finally {
      setLoading(false);
    }
  }, []);

  // Déconnexion utilisateur
  const logout = useCallback(async () => {
    setLoading(true);
    setError(null);
    try {
      await logoutService();
    } finally {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
      setLoading(false);
    }
  }, []);

  // Rafraîchir le token
  const handleRefreshToken = useCallback(async () => {
    setLoading(true);
    try {
      const newToken = await refreshTokenService();
      setToken(newToken);
      setIsAuthenticated(true);
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
    } finally {
      setLoading(false);
    }
  }, []);

  // Mettre à jour l'utilisateur dans le contexte et le localStorage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      error,
      login,
      logout,
      updateUser,
      refreshToken: handleRefreshToken
    }}>
      {children}
    </AuthContext.Provider>
  );
};

// Hook personnalisé pour accéder facilement au contexte
export const useAuthContext = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuthContext doit être utilisé dans AuthProvider');
  }
  return context;
};