const mongoose = require('mongoose');
const { totp } = require('speakeasy');

// const imageSchema = new mongoose.Schema({
//   nom: String,
//   chemin: String,       
//   taille: Number,        
//   typeMime: String,      
//   dateUpload: Date
// });

const eventSchema = new mongoose.Schema({
    titre:{
        type:String,
        required:true,
        uppercase:true,
        trim:true
    },
    description:{
        type:String,
        required:true
    },
    DateDebut:{
        type: Date,
        required: true
    },
    DateFin:{
        type: Date,
        required: true 
    },
    heureDebut:{
        type: String,
        required: true
    },
    heureFin:{
        type: String,
        required: true
    },
    lieu:{
        type: String,
        required: true
    },
    categorie:{
        type: String,
        required: true,
        uppercase: true
    },
    image:{
        type: String,
    },
    userId:{
        type: mongoose.Schema.Types.ObjectId,
        ref:"utilisateur",
        required:true
    },
    date:{
        type: Date,
        default: Date.now()
    },
    EventCode:{
        type: String,
    },
    status:{
        type: String,
        enum: ['en attente', 'en cours', 'terminer'],
        default: 'en attente'
    },
    confirmedInvites: {
        type: Number,
        default: 0
    },
    totalInvites: {
        type: Number,
        default: 0
    },
    eventType: {
        type: String,
        enum: ['private', 'public'],
        default: 'private'
    },
    pricing: {
        maxCapacity: {
            type: Number,
            default: 50
        },
        channel: {
            type: String,
            enum: ['email', 'whatsapp', 'both'],
            default: 'email'
        },
        totalPaid: {
            type: Number,
            default: 0
        },
        isActivated: {
            type: Boolean,
            default: false
        },
        feeStructure: {
            durationDays: { type: Number, default: 1 },
            baseFee: { type: Number, default: 0 },
            channelCost: { type: Number, default: 0 },
            calculatedTotal: { type: Number, default: 0 }
        },
        publicFeeBearer: {
            type: String,
            enum: ['buyer', 'organizer'],
            default: 'buyer'
        },
        paidAt: {
            type: Date
        }
    }
})

const eventModel = mongoose.model("evenement", eventSchema)
module.exports = {eventModel}