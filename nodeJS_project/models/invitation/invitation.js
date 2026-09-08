const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evenement',
        required: true,
        index: true,
    },
    inviteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'invites',
        required: true,
        index: true,
    },
    nom: {
        type: String,
        required: true,
        trim: true,
    },
    prenom: {
        type: String,
        required: true,
        trim: true,
    },
    inviteeEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true,
    },
    invitePhone: {
        type: String,
        required: false,
        trim: true,
    },
    status: {
        type: String,
        enum: ['en attente', 'confirmé', 'refusé'],
        default: 'en attente',
    },
    guestStatus: {
        type: String,
        enum: ['vip', 'classique'],
        default: 'classique',
    },
    message: {
        type: String,
        required: true,
    },
    qrCodeImage: {
        type: String,
        required: true,
    },
    finalInvitationUrl: {
        type: String,
        default: null,
    },
    qrDataToken: {
        type: String,
        index: true,
    },
    templateId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Template',
        required: false,
    },
    templateImage: {
        type: String,
        required: false,
    },
    templateFavoriteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'FavoriteTemplate',
        required: false,
    },
    // RSVP & Sécurité
    rsvpStatus: {
        type: String,
        enum: ['en attente', 'confirmé', 'refusé'],
        default: 'en attente',
        index: true,
    },
    rsvpToken: {
        type: String,
        index: true,
        unique: true,
        sparse: true,
    },
    rsvpUpdatedAt: {
        type: Date,
        default: null,
    },
    isRevoked: {
        type: Boolean,
        default: false,
        index: true,
    },
    revokedAt: {
        type: Date,
        default: null,
    },
    revocationReason: {
        type: String,
        default: null,
    },
    // Envois & Planification
    emailSent: {
        type: Boolean,
        default: false,
        index: true,
    },
    emailSentAt: {
        type: Date,
        required: false,
    },
    scheduledAt: {
        type: Date,
        required: false,
        index: true,
    },
    whatsappSent: {
        type: Boolean,
        default: false,
    },
    whatsappSentAt: {
        type: Date,
        required: false,
    },
    // Scan & Présence
    isScanned: {
        type: Boolean,
        default: false,
    },
    scannedAt: {
        type: Date,
        required: false,
    },
    isPresent: {
        type: Boolean,
        default: false,
    },
    // Historique des rappels automatiques (pour éviter tout doublon)
    reminderLogs: [{
        type: { type: String, enum: ['J-7', 'J-3', 'J-1', 'JOUR_J', 'CUSTOM'] },
        sentAt: { type: Date, default: Date.now },
        success: { type: Boolean, default: true },
    }],
    createdAt: {
        type: Date,
        default: Date.now,
    },
});

// Empêcher la création d'invitations en double pour le même invité et le même événement
invitationSchema.index({ inviteId: 1, eventId: 1 }, { unique: true });

const invitationModel = mongoose.model('invitations', invitationSchema);

module.exports = { invitationModel };