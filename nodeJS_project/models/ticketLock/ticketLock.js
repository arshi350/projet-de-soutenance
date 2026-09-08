const mongoose = require('mongoose');

const ticketLockSchema = new mongoose.Schema({
    lockToken: {
        type: String,
        required: true,
        unique: true,
        index: true
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evenement',
        required: true,
        index: true
    },
    items: [{
        ticketCategoryId: {
            type: mongoose.Schema.Types.ObjectId,
            ref: 'categorieBillet',
            required: true
        },
        quantity: {
            type: Number,
            required: true,
            min: 1
        },
        unitPrice: {
            type: Number,
            required: true
        }
    }],
    buyerInfo: {
        name: String,
        email: String,
        phone: String
    },
    totalAmount: {
        type: Number,
        required: true
    },
    feeAmount: {
        type: Number,
        default: 0
    },
    status: {
        type: String,
        enum: ['pending', 'completed', 'expired'],
        default: 'pending'
    },
    expiresAt: {
        type: Date,
        required: true,
        index: { expires: '10m' } // TTL index MongoDB: suppression auto après expiration
    }
}, {
    timestamps: true
});

const TicketLock = mongoose.model('verrouBillet', ticketLockSchema);
module.exports = TicketLock;
