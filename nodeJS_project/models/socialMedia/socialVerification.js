const mongoose = require('mongoose');

const SocialVerificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'user',
    required: true,
    index: true
  },
  provider: {
    type: String,
    enum: ['facebook', 'instagram', 'tiktok', 'linkedin', 'twitter'],
    required: true
  },
  email: {
    type: String,
    trim: true,
    default: ''
  },
  identifier: {
    type: String,
    trim: true,
    default: ''
  },
  discoveredAccounts: [{
    providerAccountId: { type: String, required: true },
    accountName: { type: String, required: true },
    username: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    category: { type: String, default: 'Événementiel & Divertissement' },
    followerCount: { type: String, default: '' },
    verifiedBadge: { type: Boolean, default: false },
    profileUrl: { type: String, default: '' }
  }],
  accountData: {
    providerAccountId: { type: String, default: '' },
    accountName: { type: String, default: '' },
    username: { type: String, default: '' },
    avatarUrl: { type: String, default: '' },
    bio: { type: String, default: '' },
    category: { type: String, default: 'Événementiel & Divertissement' },
    followerCount: { type: String, default: '' },
    verifiedBadge: { type: Boolean, default: false },
    profileUrl: { type: String, default: '' },
    metadata: { type: mongoose.Schema.Types.Mixed, default: {} }
  },
  otpHash: {
    type: String,
    required: true
  },
  contactEmail: {
    type: String,
    default: ''
  },
  attempts: {
    type: Number,
    default: 0
  },
  maxAttempts: {
    type: Number,
    default: 3
  },
  isVerified: {
    type: Boolean,
    default: false
  },
  expiresAt: {
    type: Date,
    required: true,
    index: { expires: 0 }
  }
}, {
  timestamps: true
});

module.exports = mongoose.model('SocialVerification', SocialVerificationSchema);
