const mongoose = require('mongoose');

const questionSchema = new mongoose.Schema({
  id: {
    type: String,
    required: true,
  },
  title: {
    type: String,
    required: true,
    trim: true,
  },
  type: {
    type: String,
    enum: ['single_choice', 'multiple_choice', 'star_rating', 'free_text'],
    default: 'single_choice',
  },
  options: [
    {
      id: { type: String, required: true },
      text: { type: String, required: true, trim: true },
    },
  ],
  isRequired: {
    type: Boolean,
    default: true,
  },
});

const pollSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'evenement',
      required: true,
      index: true,
    },
    creatorId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'utilisateur',
      required: true,
    },
    eventType: {
      type: String,
      enum: ['private', 'public'],
      default: 'private',
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    timingType: {
      type: String,
      enum: ['pre_event', 'live'],
      default: 'live',
    },
    status: {
      type: String,
      enum: ['draft', 'active', 'closed'],
      default: 'active',
      index: true,
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    showLiveResults: {
      type: Boolean,
      default: true,
    },
    autoCloseAt: {
      type: Date,
      default: null,
    },
    questions: [questionSchema],
    totalVotesCount: {
      type: Number,
      default: 0,
    },
  },
  {
    timestamps: true,  
  }
);



const Poll = mongoose.model('sondage', pollSchema);

module.exports = {
  Poll,
};
