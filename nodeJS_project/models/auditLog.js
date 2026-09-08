const mongoose = require('mongoose');

const auditLogSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur',
        required: false
    },
    type: {
        type: String,
        enum: ['Utilisateur', 'Billetterie', 'Signalement', 'Paiement', 'Système', 'Événement'],
        default: 'Système'
    },
    action: {
        type: String,
        required: true
    },
    description: {
        type: String,
        required: true
    },
    status: {
        type: String,
        default: 'Validé'
    },
    statusDot: {
        type: String,
        default: 'bg-emerald-500'
    },
    createdAt: {
        type: Date,
        default: Date.now
    }
});

const AuditLog = mongoose.model('journalAudit', auditLogSchema);
module.exports = AuditLog;
