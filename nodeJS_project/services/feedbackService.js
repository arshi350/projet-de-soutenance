const { PostEventFeedback } = require('../models/feedback/postEventFeedback');
const { PostEventAnalysis } = require('../models/feedback/postEventAnalysis');
const { eventModel } = require('../models/eventModels/event');
const { generatePostEventExecutiveReport } = require('./feedbackAiService');

/**
 * Soumettre un avis post-événement
 */
async function submitFeedback({ eventId, inviteId, guestEmail, guestName, voterIdentifier, npsScore, criteriaRatings, likedMost, improvementsNeeded, generalComment }) {
  const event = await eventModel.findById(eventId);
  if (!event) {
    throw new Error('Événement introuvable');
  }

  // Vérifier si le participant a déjà soumis un avis
  const existing = await PostEventFeedback.findOne({ eventId, voterIdentifier });
  if (existing) {
    throw new Error('Vous avez déjà soumis votre avis pour cet événement');
  }

  const feedback = new PostEventFeedback({
    eventId,
    inviteId: inviteId || null,
    guestEmail: guestEmail || '',
    guestName: guestName || '',
    voterIdentifier,
    npsScore: Number(npsScore),
    criteriaRatings: {
      organisation: criteriaRatings?.organisation ? Number(criteriaRatings.organisation) : 5,
      accueil: criteriaRatings?.accueil ? Number(criteriaRatings.accueil) : 5,
      ambiance: criteriaRatings?.ambiance ? Number(criteriaRatings.ambiance) : 5,
      restaurationContenu: criteriaRatings?.restaurationContenu ? Number(criteriaRatings.restaurationContenu) : 5,
    },
    likedMost: likedMost || '',
    improvementsNeeded: improvementsNeeded || '',
    generalComment: generalComment || '',
  });

  return await feedback.save();
}

/**
 * Calculer les statistiques globales des feedbacks d'un événement
 */
async function calculateFeedbackStats(eventId) {
  const feedbacks = await PostEventFeedback.find({ eventId }).sort({ submittedAt: -1 });
  const total = feedbacks.length;

  if (total === 0) {
    return {
      total: 0,
      averageNps: 0,
      npsCategory: { promotersPercent: 0, passivesPercent: 0, detractorsPercent: 0 },
      criteriaAverages: { organisation: 0, accueil: 0, ambiance: 0, restaurationContenu: 0 },
      feedbacks: [],
    };
  }

  let sumNps = 0;
  let promoters = 0;
  let passives = 0;
  let detractors = 0;

  let sumOrg = 0;
  let sumAcc = 0;
  let sumAmb = 0;
  let sumRest = 0;

  feedbacks.forEach((fb) => {
    sumNps += fb.npsScore;
    if (fb.npsScore >= 9) promoters++;
    else if (fb.npsScore >= 7) passives++;
    else detractors++;

    sumOrg += fb.criteriaRatings?.organisation || 5;
    sumAcc += fb.criteriaRatings?.accueil || 5;
    sumAmb += fb.criteriaRatings?.ambiance || 5;
    sumRest += fb.criteriaRatings?.restaurationContenu || 5;
  });

  const averageNps = Number((sumNps / total).toFixed(1));
  const promotersPercent = Math.round((promoters / total) * 100);
  const passivesPercent = Math.round((passives / total) * 100);
  const detractorsPercent = Math.round((detractors / total) * 100);

  const criteriaAverages = {
    organisation: Number((sumOrg / total).toFixed(1)),
    accueil: Number((sumAcc / total).toFixed(1)),
    ambiance: Number((sumAmb / total).toFixed(1)),
    restaurationContenu: Number((sumRest / total).toFixed(1)),
  };

  return {
    total,
    averageNps,
    npsCategory: { promotersPercent, passivesPercent, detractorsPercent },
    criteriaAverages,
    feedbacks,
  };
}

/**
 * Générer ou régénérer le rapport d'analyse IA pour un événement
 */
async function generateAndSaveAiAnalysis(eventId) {
  const event = await eventModel.findById(eventId);
  if (!event) {
    throw new Error('Événement introuvable');
  }

  const stats = await calculateFeedbackStats(eventId);
  if (stats.total === 0) {
    throw new Error('Aucun avis enregistré pour le moment pour cet événement');
  }

  // Appel au service IA Gemini
  const aiResult = await generatePostEventExecutiveReport({
    eventTitle: event.titre || event.title,
    eventType: event.typeEvenement || event.category,
    totalFeedbacks: stats.total,
    averageNps: stats.averageNps,
    npsCategory: stats.npsCategory,
    criteriaAverages: stats.criteriaAverages,
    rawFeedbacksList: stats.feedbacks,
  });

  const analysisPayload = {
    eventId,
    computedAt: new Date(),
    totalResponsesCount: stats.total,
    averageNps: stats.averageNps,
    npsCategory: stats.npsCategory,
    criteriaAverages: stats.criteriaAverages,
    aiAnalysis: aiResult.data,
  };

  const savedAnalysis = await PostEventAnalysis.findOneAndUpdate(
    { eventId },
    analysisPayload,
    { new: true, upsert: true }
  );

  return savedAnalysis;
}

/**
 * Récupérer l'analyse IA enregistrée pour un événement
 */
async function getSavedAiAnalysis(eventId) {
  return await PostEventAnalysis.findOne({ eventId });
}

module.exports = {
  submitFeedback,
  calculateFeedbackStats,
  generateAndSaveAiAnalysis,
  getSavedAiAnalysis,
};
