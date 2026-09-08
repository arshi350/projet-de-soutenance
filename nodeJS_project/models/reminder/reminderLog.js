const mongoose = require('mongoose');

const reminderLogSchema = new mongoose.Schema(
  {
    ruleId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'regleRappel',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'evenement',
      required: true,
      index: true,
    },
    recipientEmail: {
      type: String,
      default: '',
      trim: true,
    },
    recipientPhone: {
      type: String,
      default: '',
      trim: true,
    },
    recipientName: {
      type: String,
      default: '',
      trim: true,
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      default: 'email',
    },
    status: {
      type: String,
      enum: ['sent', 'failed', 'simulated'],
      default: 'sent',
    },
    subjectSent: {
      type: String,
      default: '',
    },
    bodySent: {
      type: String,
      default: '',
    },
    errorMessage: {
      type: String,
      default: null,
    },
    sentAt: {
      type: Date,
      default: Date.now,
      index: true,
    },
  },
  {
    timestamps: true,
  }
);

const ReminderLog = mongoose.model('journalRappel', reminderLogSchema);

module.exports = {
  ReminderLog,
};
