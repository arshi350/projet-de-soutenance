const mongoose = require('mongoose');

const notificationSchema = new mongoose.Schema({
  userId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'utilisateur',
    required: true
  },
  title: {
    type: String,
    required: true,
    trim: true
  },
  message: {
    type: String,
    required: true
  },
  type: {
    type: String,
    default: 'general'
  },
  referenceId: {
    type: mongoose.Schema.Types.ObjectId,
    refPath: 'referenceType'
  },
  referenceType: {
    type: String,
    enum: ['event', 'invite', 'invitation', 'user', 'other'],
    default: 'other'
  },
  isRead: {
    type: Boolean,
    default: false
  }
}, {
  timestamps: true
});

const Notification = mongoose.model('notification', notificationSchema);

module.exports = { Notification };
