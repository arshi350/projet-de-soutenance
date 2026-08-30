const mongoose = require('mongoose');

const favoriteTemplateSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    index: true,
  },
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Event',
    required: false,
  },
  titre: {
    type: String,
    required: true,
    trim: true,
    default: 'Billet Personnalisé IA',
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
  promptHistorique: [{
    prompt: { type: String, required: true },
    generatedAt: { type: Date, default: Date.now },
    aspectRatio: { type: String, default: '16:9' },
  }],
  metadata: {
    theme: { type: String, default: 'modern-luxury' },
    palette: [{ type: String }],
    aspectRatio: { type: String, default: '16:9' },
    sourceModel: { type: String, default: 'FLUX_IMAGEN' },
  },
  createdAt: {
    type: Date,
    default: Date.now,
  },
  updatedAt: {
    type: Date,
    default: Date.now,
  },
}, {
  timestamps: true,
});

const FavoriteTemplate = mongoose.model('FavoriteTemplate', favoriteTemplateSchema);

module.exports = FavoriteTemplate;
