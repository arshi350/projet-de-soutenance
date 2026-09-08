const mongoose = require("mongoose")

const userSchema = new mongoose.Schema({
    first_name:{
        type: String,
        required: true,
        trim: true
    },
    last_name:{
        type: String,
        required: true,
        trim: true
    },
    email:{
        type: String,
        required: true,
        unique: true,
        trim: true
    },
    phone:{
        type: Number,
        required: false,
        unique: false,
        sparse: true,
        trim: true
    },
    city:{
        type: String,
        required: false,
        trim: true,
        uppercase: true
    },
    password:{
        type: String,
        required: true,
        minlength: 6
    },
    role: {
        type: String,
        enum: ['user', 'admin', 'agent'],
        default: 'user'
    },
    eventId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evenement',
        default: null
    },
    organizerId: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'utilisateur',
        default: null
    },
    suspended: {
        type: Boolean,
        default: false
    },
    suspensionReason: {
        type: String,
        trim: true,
        default: ''
    },
    date:{
        type: Date,
        default: Date.now
    },
    resetToken: {
        type: String,
        default: null
    },
    resetTokenExp: {
        type: Date,
        default: null
    }
})

const userModel = mongoose.model("utilisateur", userSchema)

// Fonction pour purger l'ancien index unique problématique `phone_1` et synchroniser les index
async function ensureUserIndexes() {
    try {
        if (!mongoose.connection.db) return;
        const collections = await mongoose.connection.db.listCollections({ name: 'utilisateurs' }).toArray();
        if (collections.length > 0) {
            try {
                await userModel.collection.dropIndex('phone_1');
                console.log('✅ Ancien index unique phone_1 purgé avec succès.');
            } catch (dropErr) {
                // Code 27 = IndexNotFound (ignorer si déjà supprimé)
                if (dropErr.code !== 27 && !dropErr.message.includes('index not found')) {
                    // ignore non-critical info
                }
            }
        }
        await userModel.syncIndexes();
    } catch (err) {
        // Safe fallback
    }
}

if (mongoose.connection.readyState === 1) {
    ensureUserIndexes();
} else {
    mongoose.connection.once('open', ensureUserIndexes);
}

module.exports = {userModel}
