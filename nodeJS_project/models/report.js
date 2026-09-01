const mongoose = require('mongoose');

const reportSchema = new mongoose.Schema({
    reporterId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user',
        required: false
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        required: false
    },
    targetType: {
        type: String,
        enum: ['Événement', 'Utilisateur', 'Contenu'],
        default: 'Événement'
    },
    reason: {
        type: String,
        required: true
    },
    details: {
        type: String,
        default: ''
    },
    badge: {
        type: String,
        default: 'Urgent'
    },
    status: {
        type: String,
        enum: ['actif', 'examen', 'resolu', 'rejete'],
        default: 'actif'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const Report = mongoose.model('Report', reportSchema);
module.exports = Report;
