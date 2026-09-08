const mongoose = require('mongoose');

const SocialPostSchema = new mongoose.Schema({
  eventId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'evenement',
    required: true,
    index: true
  },
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'utilisateur',
    required: true
  },
  socialAccountId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'compteSocial',
    required: false
  },
  platform: {
    type: String,
    enum: ['facebook', 'instagram', 'tiktok', 'linkedin'],
    required: true
  },
  content: {
    type: String,
    required: true
  },
  mediaUrl: {
    type: String,
    default: ''
  },
  status: {
    type: String,
    enum: ['published', 'failed', 'scheduled'],
    default: 'published'
  },
  externalPostId: {
    type: String,
    default: ''
  },
  externalPostUrl: {
    type: String,
    default: ''
  },
  errorMessage: {
    type: String,
    default: ''
  },
  publishedAt: {
    type: Date,
    default: Date.now
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('publicationSociale', SocialPostSchema);
