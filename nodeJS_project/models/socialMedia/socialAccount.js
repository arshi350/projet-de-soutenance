const mongoose = require('mongoose');

const SocialAccountSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'utilisateur',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['facebook', 'instagram', 'tiktok', 'linkedin'],
    required: true
  },
  providerAccountId: {
    type: String,
    required: true
  },
  accountName: {
    type: String,
    required: true
  },
  avatarUrl: {
    type: String,
    default: ''
  },
  pageId: {
    type: String,
    default: ''
  },
  instagramBusinessId: {
    type: String,
    default: ''
  },
  encryptedAccessToken: {
    type: String,
    required: true
  },
  isActive: {
    type: Boolean,
    default: true
  },
  metadata: {
    type: mongoose.Schema.Types.Mixed,
    default: {}
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('compteSocial', SocialAccountSchema);
