import api from './api';

/**
 * Récupérer la liste des comptes réseaux sociaux connectés
 */
export const apiGetSocialAccounts = async (token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.get('/social/accounts', config);
  return response.data;
};

/**
 * 1. Audit IA de l'existence réelle du compte et envoi du code OTP
 * @param {Object} payload - { provider, identifier, contactEmail }
 */
export const apiAiVerifySocialAccount = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/ai-verify', payload, config);
  return response.data;
};

/**
 * 2. Validation du code de sécurité OTP et confirmation de la synchronisation
 * @param {Object} payload - { sessionId, otpCode }
 */
export const apiValidateSocialOtp = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/validate-otp', payload, config);
  return response.data;
};

/**
 * 3. Renvoyer un nouveau code OTP de vérification
 * @param {Object} payload - { sessionId }
 */
export const apiResendSocialOtp = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/resend-otp', payload, config);
  return response.data;
};

/**
 * Vérifier les identifiants (Email + Mot de passe) et récupérer l'aperçu du compte (Nom, Avatar)
 */
export const apiVerifySocialCredentials = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/verify-credentials', payload, config);
  return response.data;
};

/**
 * Confirmer et enregistrer la synchronisation du compte vérifié
 */
export const apiConfirmSocialSync = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/confirm-sync', payload, config);
  return response.data;
};

/**
 * Synchroniser ou connecter des comptes Meta (Facebook & Instagram)
 */
export const apiConnectMetaAccounts = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/connect-meta', payload, config);
  return response.data;
};

/**
 * Déconnecter un compte réseau social
 */
export const apiDisconnectSocialAccount = async (accountId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.delete(`/social/accounts/${accountId}`, config);
  return response.data;
};

/**
 * Publier un post généré par l'IA directement sur Facebook ou Instagram
 */
export const apiPublishSocialPost = async (payload, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.post('/social/publish', payload, config);
  return response.data;
};

/**
 * Récupérer l'historique des publications d'un événement
 */
export const apiGetSocialHistory = async (eventId, token) => {
  const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
  const response = await api.get(`/social/history/${eventId}`, config);
  return response.data;
};
