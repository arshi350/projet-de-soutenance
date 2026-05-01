const mongoose = require('mongoose');

const invitationSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Event',
    },
    inviteId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Invites',
    },
    inviteeEmail: {
        type: String,
        required: true,
    },
    invitePhone: {
        type: Number,
        required: true,
    },
    status: {
        type: String,
        enum: ['en attente', 'confirmé', 'refusé'],
        default: 'en attente',
    },
    message: {
        type: String,
        required: true
    },
    qrCodeImage: {
        type: String, // image PNG encodée en base64
        required: true
    }
})

const invitationModel = mongoose.model('Invitations', invitationSchema);

module.exports = { invitationModel };