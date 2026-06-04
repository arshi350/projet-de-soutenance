const mongoose = require('mongoose');

const templateSchema = new mongoose.Schema({
  image: {
    type: String,
    required: true,
    trim: true,
  },
  titre: {
    type: String,
    required: true,
    trim: true,
  },
  description: {
    type: String,
    required: true,
    trim: true,
  },
  // Structure avancée pour les modifications Gemini
  structure: {
    type: Object,
    default: {
      couleurs: {
        primary: '#1a1a1a',
        secondary: '#ffffff',
        accent: '#FF6B6B',
        background: '#f5f5f5',
        text: '#333333'
      },
      miseEnPage: 'standard',
      titre: 'Titre du modèle',
      message: 'Contenu du message',
      footer: 'Footer',
      bouton: 'Cliquez ici'
    }
  },
  version: {
    type: Number,
    default: 1
  },
  derniereModification: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true,
});

const Template = mongoose.model('Template', templateSchema);

module.exports = Template;
