import axios from 'axios';

const API_BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000/api';

// Instance Axios centralisée pour toute l'application
const api = axios.create({
  baseURL: API_BASE_URL,
  withCredentials: true, // Envoie automatiquement les cookies HttpOnly (refreshToken)
  headers: {
    'Content-Type': 'application/json',
  },
});

let isRefreshing = false;
let failedQueue = [];

const processQueue = (error, token = null) => {
  failedQueue.forEach((prom) => {
    if (error) {
      prom.reject(error);
    } else {
      prom.resolve(token);
    }
  });
  failedQueue = [];
};

// ==========================================
// Intercepteur de requête
// ==========================================
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('accessToken');
    if (token && !config.headers.Authorization) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

// ==========================================
// Intercepteur de réponse (Silent Refresh Token)
// ==========================================
api.interceptors.response.use(
  (response) => {
    // Si le serveur a exposé un nouveau token dans les en-têtes
    const newToken = response.headers['x-new-access-token'];
    if (newToken) {
      localStorage.setItem('accessToken', newToken);
      window.dispatchEvent(
        new CustomEvent('auth:token-refreshed', { detail: { token: newToken } })
      );
    }
    return response;
  },
  async (error) => {
    const originalRequest = error.config;

    // Si pas de réponse serveur ou config manquante
    if (!error.response || !originalRequest) {
      return Promise.reject(error);
    }

    const requestUrl = originalRequest.url || '';
    const isAuthEndpoint =
      requestUrl.includes('/auth/login') ||
      requestUrl.includes('/auth/refresh') ||
      requestUrl.includes('/auth/google') ||
      requestUrl.includes('/auth/forgot-password') ||
      requestUrl.includes('/auth/verify-otp') ||
      requestUrl.includes('/auth/reset-password');

    // Interception de l'erreur 401 Unauthorized (hors endpoints d'authentification initiaux)
    if (error.response.status === 401 && !originalRequest._retry && !isAuthEndpoint) {
      if (isRefreshing) {
        // Mettre la requête en file d'attente pendant que le refresh s'exécute
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers.Authorization = `Bearer ${token}`;
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      try {
        // Tentative de rafraîchissement auprès de /api/auth/refresh
        const response = await axios.post(
          `${API_BASE_URL}/auth/refresh`,
          {},
          { withCredentials: true }
        );

        const { accessToken, user } = response.data;

        if (accessToken) {
          localStorage.setItem('accessToken', accessToken);
          if (user) {
            localStorage.setItem('user', JSON.stringify(user));
          }

          // Notifier l'application / AuthContext
          window.dispatchEvent(
            new CustomEvent('auth:token-refreshed', {
              detail: { token: accessToken, user },
            })
          );

          api.defaults.headers.common.Authorization = `Bearer ${accessToken}`;
          originalRequest.headers.Authorization = `Bearer ${accessToken}`;

          processQueue(null, accessToken);
          return api(originalRequest);
        } else {
          throw new Error('Réponse de rafraîchissement invalide');
        }
      } catch (refreshError) {
        processQueue(refreshError, null);
        localStorage.removeItem('accessToken');
        localStorage.removeItem('user');
        window.dispatchEvent(new Event('auth:session-expired'));
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    return Promise.reject(error);
  }
);

export { API_BASE_URL };
export default api;
