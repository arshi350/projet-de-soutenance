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
        sparse: true,
        trim: true,
        validate: {
            validator: function(v) {
                if (!v) return true;
                return /^6[25789]\d{7}$/.test(v);
            },
            message: 'Veuillez entrer un numéro de téléphone valide (ex: 690123456)'
        }
    },
    email: {
        type: String,
        sparse: true,
        trim: true,
        lowercase: true,
        validate: {
            validator: function(v) {
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
        type: mongoose.Schema.Types.ObjectId,
        ref: 'evenement',
        required: true,
        index: true
    },
    isScanned: {
        type: Boolean,
        default: false
    },
    isPresent: {
        type: Boolean,
        default: false
    },
    scannedAt: {
        type: Date,
        default: null
    }
}, 
{
    timestamps: true,
    toJSON: { virtuals: true },
    toObject: { virtuals: true }
});

// Empêcher l'enregistrement d'un invité sans email ET sans téléphone
inviteSchema.pre('validate', function() {
    if (!this.telephone && !this.email) {
        const error = new Error('Veuillez fournir au moins un numéro de téléphone ou une adresse email');
        this.invalidate('telephone', error.message);
        this.invalidate('email', error.message);
    }
});

const Invites = mongoose.model('invites', inviteSchema);

// Fonction auto-exécutée pour nettoyer les anciens index non-sparse conflictuels dans MongoDB
async function ensureSparseIndexes() {
    try {
        const collection = Invites.collection;
        const indexes = await collection.indexes();
        for (const idx of indexes) {
            if ((idx.name === 'telephone_1' || idx.name === 'email_1') && !idx.sparse) {
                console.log(`🔄 Suppression de l'ancien index non-sparse: ${idx.name}`);
                await collection.dropIndex(idx.name);
            }
        }
        await Invites.syncIndexes();
        console.log('✅ Index sparse synchronisés avec succès pour Invites.');
    } catch (err) {
        // Ignorer si la collection n'existe pas encore ou si l'index est déjà sparse
        console.log('ℹ️ Note synchronisation index Invites:', err.message);
    }
}

// Lancer la synchronisation dès que la connexion est prête
if (mongoose.connection.readyState === 1) {
    ensureSparseIndexes();
} else {
    mongoose.connection.once('open', ensureSparseIndexes);
}

module.exports = Invites;