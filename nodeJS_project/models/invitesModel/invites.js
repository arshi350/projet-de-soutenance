const mongoose = require('mongoose');

const inviteSchema = new mongoose.Schema({
    nom: {
        type: String,
        required: [true, 'Le nom est obligatoire'],
        trim: true,
        minlength: [2, 'Le nom doit contenir au moins 2 caractères'],
        maxlength: [50, 'Le nom ne peut pas dépasser 50 caractères']
    },
    prenom: {
        type: String,
        required: [true, 'Le prénom est obligatoire'],
        trim: true,
        minlength: [2, 'Le prénom doit contenir au moins 2 caractères'],
        maxlength: [50, 'Le prénom ne peut pas dépasser 50 caractères']
    },
    telephone: {
        type: String,
        unique: true,
        trim: true,
        validate: {
            validator: function(v) {
                // Si ni téléphone ni email n'est fourni, la validation échouera plus bas
                if (!v) return true;
                return /^6[25789]\d{7}$/.test(v);
            },
            message: 'Veuillez entrer un numéro de téléphone valide'
        }
    },
    email: {
        type: String,
        unique: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
                // Si ni email ni téléphone n'est fourni, la validation échouera plus bas
                if (!v) return true;
                return /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/.test(v);
            },
            message: 'Veuillez entrer une adresse email valide'
        }
    },
    status: {
        type: String,
        enum: {
            values: ['vip', 'classique'],
            message: 'Le status doit être soit "vip" soit "classique"'
        },
        default: 'classique',
        required: [true, 'Le status est obligatoire']
    },
    idEvent: {
        type:mongoose.Schema.Types.ObjectId,
        ref:'event',
        required: true
    },
    isScanned: {
        type: Boolean,
        default: false
    },
    isPresent: {
        type: Boolean,
        default: false
    }
}, 
{
    timestamps: true, // Ajoute automatiquement createdAt et updatedAt
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});


// Version alternative du middleware
inviteSchema.pre('validate', function() {
    if (!this.telephone && !this.email) {
        const error = new Error('Veuillez fournir au moins un numéro de téléphone ou une adresse email');
        this.invalidate('telephone', error.message);
        this.invalidate('email', error.message);
    }
});

const Invites = mongoose.model('Invites', inviteSchema);

module.exports = Invites;