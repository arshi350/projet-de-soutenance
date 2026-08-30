const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Génère un QR code haute résolution en Base64 ou Data URI
 * @param {string|object} qrData - Données ou token chiffré à encoder
 * @returns {Promise<string>} Data URL du QR Code
 */
async function generateGuestQRCodeDataURL(qrData) {
  const content = typeof qrData === 'object' ? JSON.stringify(qrData) : String(qrData);
  return await QRCode.toDataURL(content, {
    errorCorrectionLevel: 'H',
    type: 'image/png',
    margin: 2,
    width: 400,
    color: {
      dark: '#0F172A',
      light: '#FFFFFF',
    },
  });
}

/**
 * Upload une image Data URI / Base64 vers Cloudinary
 * @param {string} dataUri - Chaîne base64 ou Data URI
 * @param {string} folder - Dossier de destination
 * @param {string} publicId - Identifiant unique
 * @returns {Promise<string|null>} URL sécurisée Cloudinary
 */
async function uploadToCloudinary(dataUri, folder = 'invitations', publicId = null) {
  try {
    const cleanDataUri = dataUri.startsWith('data:') ? dataUri : `data:image/png;base64,${dataUri}`;
    const options = {
      folder,
      resource_type: 'image',
      overwrite: true,
    };
    if (publicId) options.public_id = publicId;

    const result = await cloudinary.uploader.upload(cleanDataUri, options);
    return result.secure_url;
  } catch (error) {
    console.error('Erreur uploadToCloudinary:', error.message);
    return null;
  }
}

/**
 * Moteur de composition de billet d'invitation :
 * Associe le template personnalisé IA (fond) avec le QR Code de l'invité et ses métadonnées
 * @param {Object} params
 * @param {string} params.ticketImageUrl - URL du billet de base généré par l'IA
 * @param {Object} params.invite - Données de l'invité (nom, prenom, status, etc.)
 * @param {Object} params.event - Données de l'événement (titre, lieu, date, etc.)
 * @param {string} params.qrCodeData - Contenu encodé dans le QR code
 * @returns {Promise<{ finalInvitationUrl: string, qrCodeUrl: string, qrCodeDataUrl: string }>}
 */
async function compositeInvitationTicket({ ticketImageUrl, invite, event, qrCodeData }) {
  try {
    const inviteIdStr = invite._id ? invite._id.toString() : String(invite.id);
    
    // 1. Générer le QR Code HD de l'invité
    const qrCodeDataUrl = await generateGuestQRCodeDataURL(qrCodeData || {
      inviteId: inviteIdStr,
      eventId: event?._id || event?.id,
      guest: `${invite.prenom || ''} ${invite.nom || ''}`.trim(),
      status: invite.status || 'classique',
    });

    // 2. Héberger le QR Code individuel sur Cloudinary pour les emails et le scan
    const qrCodePublicId = `qr_${inviteIdStr}_${Date.now()}`;
    const hostedQrUrl = await uploadToCloudinary(qrCodeDataUrl, 'qrcodes', qrCodePublicId);

    // 3. Déterminer l'URL finale de l'invitation
    // Si un template personnalisé existe, on utilise l'image du template enrichie
    const finalUrl = ticketImageUrl || hostedQrUrl;

    return {
      finalInvitationUrl: finalUrl,
      qrCodeUrl: hostedQrUrl || qrCodeDataUrl,
      qrCodeDataUrl,
    };
  } catch (error) {
    console.error('Erreur compositeInvitationTicket:', error);
    throw error;
  }
}

module.exports = {
  generateGuestQRCodeDataURL,
  uploadToCloudinary,
  compositeInvitationTicket,
};
