const mongoose = require('mongoose');

const agentSchema = new mongoose.Schema({
    userId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur',
        required: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evenement',
        required: true
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur',
        required: true
    },
    email: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    nom: {
        type: String,
        trim: true,
        default: ''
    },
    prenom: {
        type: String,
        trim: true,
        default: ''
    },
    defaultPassword: {
        type: String,
        required: true
    },
    isPasswordChanged: {
        type: Boolean,
        default: false
    },
    credentialsSentAt: {
        type: Date,
        default: null
    },
    eventCodeSentAt: {
        type: Date,
        default: null
    },
    status: {
        type: String,
        enum: ['actif', 'inactif'],
        default: 'actif'
    }
}, {
    timestamps: true
});

const AgentModel = mongoose.model('agent_scan', agentSchema);

module.exports = AgentModel;
