import api from './api';

export const getQrCodesForEvent = async (eventId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.get(`/qrcode/getQrcode/${eventId}`, config);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la récupération des QR codes :', error);
    throw error.response?.data || error;
  }
};

export const generateQrCodesForEvent = async (eventId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post(`/qrcode/CreateQrCode/${eventId}`, {}, config);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la génération des QR codes :', error);
    throw error.response?.data || error;
  }
};

export const generateSingleQrCodeApi = async (inviteId, token) => {
  try {
    const config = token ? { headers: { Authorization: `Bearer ${token}` } } : {};
    const response = await api.post(`/qrcode/create-single/${inviteId}`, {}, config);
    return response.data;
  } catch (error) {
    console.error('Erreur lors de la génération du QR code invité :', error);
    throw error.response?.data || error;
  }
};
