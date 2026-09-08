const mongoose = require('mongoose');

const favoriteTemplateSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'utilisateur',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'evenement',
      default: null,
      index: true,
    },
    titre: {
      type: String,
      default: 'Billet Personnalisé IA',
      trim: true,
    },
    imageUrl: {
      type: String,
      required: true,
      trim: true,
    },
    cloudinaryPublicId: {
      type: String,
      default: '',
    },
    promptHistorique: [
      {
        prompt: { type: String },
        aspectRatio: { type: String, default: '16:9' },
        createdAt: { type: Date, default: Date.now },
      },
    ],
    metadata: {
      theme: { type: String, default: 'modern-luxury' },
      palette: [{ type: String }],
      aspectRatio: { type: String, default: '16:9' },
      sourceModel: { type: String, default: 'FLUX_IMAGEN' },
    },
  },
  {
    timestamps: true,
  }
);

const FavoriteTemplate = mongoose.model('FavoriteTemplate', favoriteTemplateSchema, 'modeleFavori');

module.exports = FavoriteTemplate;
