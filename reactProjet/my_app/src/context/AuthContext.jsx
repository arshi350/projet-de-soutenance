// AuthContext.jsx
// Fournit un contexte global pour l'authentification dans l'application React
import { createContext, useContext, useState, useEffect, useCallback } from 'react';
import {
  loginService,
  googleLoginService,
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

  // Rafraîchissement explicite du token
  const handleRefreshToken = useCallback(async () => {
    try {
      const newToken = await refreshTokenService();
      setToken(newToken);
      setIsAuthenticated(true);
      return newToken;
    } catch (err) {
      setIsAuthenticated(false);
      setUser(null);
      setToken(null);
      throw err;
    }
  }, []);

  // Écoute des événements de synchronisation déclenchés par l'intercepteur Axios (api.js)
  useEffect(() => {
    const handleTokenRefreshed = (event) => {
      if (event.detail?.token) {
        setToken(event.detail.token);
        setIsAuthenticated(true);
      }
      if (event.detail?.user) {
        setUser(event.detail.user);
      }
    };

    const handleSessionExpired = () => {
      setUser(null);
      setToken(null);
      setIsAuthenticated(false);
    };

    window.addEventListener('auth:token-refreshed', handleTokenRefreshed);
    window.addEventListener('auth:session-expired', handleSessionExpired);

    return () => {
      window.removeEventListener('auth:token-refreshed', handleTokenRefreshed);
      window.removeEventListener('auth:session-expired', handleSessionExpired);
    };
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

  // Connexion Google OAuth
  const googleLogin = useCallback(async (credentialToken) => {
    setLoading(true);
    setError(null);
    try {
      const data = await googleLoginService(credentialToken);
      setUser(data.user);
      setToken(data.accessToken);
      setIsAuthenticated(true);
      return { success: true, user: data.user };
    } catch (err) {
      setError(err.message || 'Erreur lors de la connexion Google');
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

  // Mettre à jour l'utilisateur dans le contexte et le localStorage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Vérification initiale du token au montage
  useEffect(() => {
    const checkToken = async () => {
      if (token && !isTokenValid()) {
        try {
          await handleRefreshToken();
        } catch (err) {
          console.warn('Refresh initial automatique non effectué:', err);
        }
      }
    };
    
    checkToken();
  }, [handleRefreshToken, token]);

  return (
    <AuthContext.Provider value={{
      user,
      token,
      isAuthenticated,
      loading,
      error,
      login,
      googleLogin,
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