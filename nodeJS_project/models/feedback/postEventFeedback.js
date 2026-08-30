const mongoose = require('mongoose');

const postEventFeedbackSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    inviteId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Invitation',
      default: null,
    },
    guestEmail: {
      type: String,
      default: '',
      trim: true,
    },
    guestName: {
      type: String,
      default: '',
      trim: true,
    },
    voterIdentifier: {
      type: String,
      required: true,
      index: true,
    },
    npsScore: {
      type: Number,
      required: true,
      min: 1,
      max: 10,
    },
    criteriaRatings: {
      organisation: { type: Number, min: 1, max: 5, default: 5 },
      accueil: { type: Number, min: 1, max: 5, default: 5 },
      ambiance: { type: Number, min: 1, max: 5, default: 5 },
      restaurationContenu: { type: Number, min: 1, max: 5, default: 5 },
    },
    likedMost: {
      type: String,
      default: '',
      trim: true,
    },
    improvementsNeeded: {
      type: String,
      default: '',
      trim: true,
    },
    generalComment: {
      type: String,
      default: '',
      trim: true,
    },
    submittedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

postEventFeedbackSchema.index({ eventId: 1, voterIdentifier: 1 }, { unique: true });

const PostEventFeedback = mongoose.model('PostEventFeedback', postEventFeedbackSchema);

module.exports = {
  PostEventFeedback,
};
