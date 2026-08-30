const mongoose = require('mongoose');

const ticketCategorySchema = new mongoose.Schema({
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'event',
        required: true
    },
    name: {
        type: String,
        required: true,
        trim: true // ex: 'VIP', 'Standard', 'Early Bird'
    },
    description: {
        type: String,
        default: ''
    },
    price: {
        type: Number,
        required: true,
        min: 0
    },
    capacity: {
        type: Number,
        required: true,
        min: 1
    },
    soldCount: {
        type: Number,
        default: 0
    },
    reservedCount: {
        type: Number,
        default: 0
    },
    aiBackgroundUrl: {
        type: String,
        default: ''
    },
    aiPrompt: {
        type: String,
        default: ''
    },
    benefits: [{
        type: String
    }],
    isActive: {
        type: Boolean,
        default: true
    }
}, {
    timestamps: true
});

const TicketCategory = mongoose.model('TicketCategory', ticketCategorySchema);
module.exports = TicketCategory;
