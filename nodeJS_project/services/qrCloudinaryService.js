const QRCode = require('qrcode');
const cloudinary = require('cloudinary').v2;
const QRCodeModel = require('../models/invitesModel/qrcode');
const { invitationModel } = require('../models/invitation/invitation');
const dotenv = require('dotenv');
dotenv.config();

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

/**
 * Génère le QR Code d'un invité et l'héberge automatiquement sur Cloudinary
 * Enregistre l'URL CDN publique dans QRCodeModel et invitationModel
 *
 * @param {Object} invite - Objet invité (avec _id, idEvent/eventId, nom, prenom)
 * @param {string} eventId - ID de l'événement
 * @returns {Promise<Object>} { secureUrl, content, buffer, dataUri }
 */
async function generateAndUploadQRCode(invite, eventId) {
  const invId = invite._id ? invite._id.toString() : (invite.id ? invite.id.toString() : String(invite));
  const evId = eventId || (invite.idEvent ? invite.idEvent.toString() : (invite.eventId ? invite.eventId.toString() : ''));

  const content = JSON.stringify({
    _id: invId,
    idEvent: evId,
    nom: invite.nom || '',
    prenom: invite.prenom || ''
  });

  try {
    // 1. Génération du buffer et DataURI haute définition
    const qrBuffer = await QRCode.toBuffer(content, {
      type: 'png',
      width: 360,
      margin: 2,
      errorCorrectionLevel: 'M',
      color: {
        dark: '#000000',
        light: '#FFFFFF'
      }
    });

    const dataUri = `data:image/png;base64,${qrBuffer.toString('base64')}`;

    // 2. Upload automatique vers Cloudinary
    let secureUrl = null;
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY) {
      try {
        const uploadRes = await cloudinary.uploader.upload(dataUri, {
          folder: 'event_qrcodes',
          public_id: `qr_${invId}`,
          overwrite: true,
          resource_type: 'image',
          format: 'png'
        });
        secureUrl = uploadRes.secure_url;
      } catch (cloudErr) {
        console.warn(`Upload Cloudinary QR (${invId}) en échec:`, cloudErr.message);
      }
    }

    // Fallback CDN si Cloudinary n'est pas joignable
    if (!secureUrl) {
      secureUrl = `https://quickchart.io/qr?text=${encodeURIComponent(content)}&size=300&margin=2&ecLevel=M`;
    }

    // 3. Sauvegarder ou mettre à jour dans QRCodeModel
    try {
      let qrDoc = await QRCodeModel.findOne({ inviteId: invId });
      if (qrDoc) {
        qrDoc.qrCodeData = qrBuffer;
        qrDoc.qrCodeDataUrl = secureUrl;
        qrDoc.content = content;
        await qrDoc.save();
      } else {
        qrDoc = new QRCodeModel({
          inviteId: invId,
          eventId: evId,
          qrCodeData: qrBuffer,
          qrCodeDataUrl: secureUrl,
          content: content,
          createdAt: new Date()
        });
        await qrDoc.save();
      }
    } catch (saveQrErr) {
      console.warn(`Erreur sauvegarde QRCodeModel (${invId}):`, saveQrErr.message);
    }

    // 4. Mettre à jour dans invitationModel si l'invitation existe
    try {
      const invDoc = await invitationModel.findOne({ inviteId: invId, eventId: evId });
      if (invDoc) {
        invDoc.qrCodeImage = secureUrl;
        await invDoc.save();
      }
    } catch (invSaveErr) {
      // Ignorer si pas encore d'invitation
    }

    return {
      secureUrl,
      dataUri,
      buffer: qrBuffer,
      content
    };
  } catch (err) {
    console.error(`Erreur génération & upload QR code pour invité ${invId}:`, err);
    throw err;
  }
}

module.exports = {
  generateAndUploadQRCode,
  cloudinary
};
