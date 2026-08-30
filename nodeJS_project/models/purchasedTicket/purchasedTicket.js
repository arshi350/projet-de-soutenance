const mongoose = require('mongoose');

const purchasedTicketSchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        required: true,
        index: true
    },
    ticketCategoryId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'TicketCategory',
        required: true,
        index: true
    },
    ticketNumber: {
        type: String,
        unique: true,
        required: true
    },
    buyerName: {
        type: String,
        required: true,
        trim: true
    },
    buyerEmail: {
        type: String,
        required: true,
        trim: true,
        lowercase: true
    },
    buyerPhone: {
        type: String,
        trim: true
    },
    qrCodeToken: {
        type: String,
        unique: true,
        required: true,
        index: true
    },
    qrCodeImage: {
        type: String
    },
    pdfUrl: {
        type: String
    },
    unitPrice: {
        type: Number,
        required: true,
        default: 0
    },
    feeAmount: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    paymentReference: {
        type: String
    },
    status: {
        type: String,
        enum: ['valid', 'scanned', 'cancelled'],
        default: 'valid',
        index: true
    },
    scannedAt: {
        type: Date
    },
    scannedBy: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'user'
    }
}, {
    timestamps: true
});

const PurchasedTicket = mongoose.model('PurchasedTicket', purchasedTicketSchema);
module.exports = PurchasedTicket;
