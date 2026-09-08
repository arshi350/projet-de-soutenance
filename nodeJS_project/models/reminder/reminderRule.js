const mongoose = require('mongoose');

const reminderRuleSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'evenement',
      required: true,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    targetAudience: {
      type: String,
      enum: ['unanswered_rsvp', 'confirmed_guests', 'all_guests'],
      default: 'unanswered_rsvp',
    },
    triggerType: {
      type: String,
      enum: ['relative_to_event', 'relative_to_deadline', 'scheduled_date'],
      default: 'relative_to_event',
    },
    triggerOffset: {
      type: Number,
      default: 3, // Ex: 3 jours avant l'événement
    },
    triggerUnit: {
      type: String,
      enum: ['days', 'hours'],
      default: 'days',
    },
    channel: {
      type: String,
      enum: ['email', 'sms', 'whatsapp'],
      default: 'email',
    },
    tone: {
      type: String,
      enum: ['professionnel', 'festif', 'urgent', 'chaleureux', 'vip'],
      default: 'professionnel',
    },
    customInstructions: {
      type: String,
      default: '',
      trim: true,
    },
    template: {
      subject: { type: String, default: '' },
      body: { type: String, default: '' },
    },
    isEnabled: {
      type: Boolean,
      default: true,
      index: true,
    },
    lastExecutedAt: {
      type: Date,
      default: null,
    },
    executionCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,
  }
);

const ReminderRule = mongoose.model('regleRappel', reminderRuleSchema);

module.exports = {
  ReminderRule,
};
