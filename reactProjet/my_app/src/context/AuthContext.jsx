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

  // Définir handleRefreshToken AVANT les useEffect qui l'utilisent
  const handleRefreshToken = useCallback(async () => {
    setLoading(true);
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
    } finally {
      setLoading(false);
    }
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

  // Mettre à jour l'utilisateur dans le contexte et le localStorage
  const updateUser = (updatedUser) => {
    setUser(updatedUser);
    localStorage.setItem('user', JSON.stringify(updatedUser));
  };

  // Vérification initiale du token (après la définition des fonctions)
  useEffect(() => {
    const checkToken = async () => {
      if (token && !isTokenValid()) {
        try {
          await handleRefreshToken();
        } catch (err) {
          console.error('Erreur lors du rafraîchissement initial du token:', err);
        }
      }
    };
    
    checkToken();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // Ne dépend que du token initial

  // Rafraîchit automatiquement le token toutes les 14 minutes si connecté
  useEffect(() => {
    if (!isAuthenticated) return;
    
    const interval = setInterval(() => {
      handleRefreshToken().catch(err => {
        console.error('Erreur lors du rafraîchissement automatique du token:', err);
      });
    }, 14 * 60 * 1000); // 14 minutes
    
    return () => clearInterval(interval);
  }, [isAuthenticated, handleRefreshToken]);

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