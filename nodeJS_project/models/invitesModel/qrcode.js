const mongoose = require('mongoose');


const qrCodeSchema = new mongoose.Schema({
  inviteId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Invites',
    required: true
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: true
  },
  qrCodeData: {
    type: Buffer,    // Contiendra l'image binaire PNG
    required: true
  },
  qrCodeDataUrl: {
    type: String,    // Optionnel : pour affichage rapide (data:image/png;base64,...)
  },
  content: {
    type: String,    // Le texte/URL encodé dans le QR
    required: true
  },
  format: {
    type: String,
    default: 'png'
  },
  createdAt: {
    type: Date,
    default: Date.now
  }
});

const QRCodeModel = mongoose.model('QRCode', qrCodeSchema);

module.exports = QRCodeModel;