const mongoose = require('mongoose');

const pollVoteSchema = new mongoose.Schema(
  {
    pollId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Poll',
      required: true,
      index: true,
    },
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      index: true,
    },
    voterIdentifier: {
      type: String,
      required: true,
      index: true,
    },
    voterName: {
      type: String,
      default: '',
      trim: true,
    },
    answers: [
      {
        questionId: { type: String, required: true },
        selectedOptionIds: [{ type: String }],
        ratingValue: { type: Number, min: 1, max: 5 },
        textAnswer: { type: String, trim: true },
      },
    ],
    votedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

// Un votant ne peut voter qu'une fois par sondage avec son identifiant unique
pollVoteSchema.index({ pollId: 1, voterIdentifier: 1 }, { unique: true });

const PollVote = mongoose.model('PollVote', pollVoteSchema);

module.exports = {
  PollVote,
};
