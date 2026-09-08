const mongoose = require('mongoose');

const platformSettingsSchema = new mongoose.Schema({
    siteName: {
        type: String,
        default: 'ARSHI EVENT'
    },
    supportEmail: {
        type: String,
        default: 'support@arshievent.com'
    },
    commissionRate: {
        type: Number,
        default: 5.0 // Taux de commission par défaut (%)
    },
    currency: {
        type: String,
        default: 'FCFA'
    },
    maintenanceMode: {
        type: Boolean,
        default: false
    },
    autoApproveEvents: {
        type: Boolean,
        default: true
    },
    whatsappNotifications: {
        type: Boolean,
        default: true
    },
    updatedAt: {
        type: Date,
        default: Date.now
    }
});

const PlatformSettings = mongoose.model('parametresPlateforme', platformSettingsSchema);
module.exports = PlatformSettings;
