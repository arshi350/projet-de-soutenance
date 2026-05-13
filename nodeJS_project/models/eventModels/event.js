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
        ref:"user",
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
    }
})

const eventModel = mongoose.model("event", eventSchema)
module.exports = {eventModel}