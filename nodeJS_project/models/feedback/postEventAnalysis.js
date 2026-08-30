const mongoose = require('mongoose');

const strategicRecommendationSchema = new mongoose.Schema({
  priority: {
    type: String,
    enum: ['Haute', 'Moyenne', 'Basse'],
    default: 'Moyenne',
  },
  area: {
    type: String,
    required: true,
  },
  recommendation: {
    type: String,
    required: true,
  },
  expectedImpact: {
    type: String,
    default: '',
  },
});

const postEventAnalysisSchema = new mongoose.Schema(
  {
    eventId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Event',
      required: true,
      unique: true,
      index: true,
    },
    computedAt: {
      type: Date,
      default: Date.now,
    },
    totalResponsesCount: {
      type: Number,
      default: 0,
    },
    averageNps: {
      type: Number,
      default: 0,
    },
    npsCategory: {
      promotersPercent: { type: Number, default: 0 },
      passivesPercent: { type: Number, default: 0 },
      detractorsPercent: { type: Number, default: 0 },
    },
    criteriaAverages: {
      organisation: { type: Number, default: 0 },
      accueil: { type: Number, default: 0 },
      ambiance: { type: Number, default: 0 },
      restaurationContenu: { type: Number, default: 0 },
    },
    aiAnalysis: {
      sentimentPolarity: {
        positive: { type: Number, default: 0 },
        neutral: { type: Number, default: 0 },
        negative: { type: Number, default: 0 },
        globalMood: { type: String, default: 'Positif' },
      },
      executiveSummary: {
        type: String,
        default: '',
      },
      topStrengths: [{ type: String }],
      priorityImprovements: [{ type: String }],
      strategicRecommendations: [strategicRecommendationSchema],
    },
  },
  {
    timestamps: true,
  }
);

const PostEventAnalysis = mongoose.model('PostEventAnalysis', postEventAnalysisSchema);

module.exports = {
  PostEventAnalysis,
};
