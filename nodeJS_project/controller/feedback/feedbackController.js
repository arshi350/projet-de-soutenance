const feedbackService = require('../../services/feedbackService');
const { eventModel } = require('../../models/eventModels/event');

/**
 * Récupérer les infos publiques de l'événement pour la page de feedback
 * GET /api/public/feedback/:eventId
 */
const getPublicFeedbackEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const event = await eventModel.findById(eventId).select('titre title lieu DateDebut coverImage image typeEvenement eventType categorie category description');
    if (!event) {
      return res.status(404).json({ success: false, message: 'Événement non trouvé' });
    }
    return res.status(200).json({ success: true, data: event });
  } catch (error) {
    console.error('Erreur getPublicFeedbackEvent controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Soumettre un avis post-événement (Public)
 * POST /api/public/feedback/:eventId
 */
const submitFeedback = async (req, res) => {
  try {
    const { eventId } = req.params;
    const { inviteId, guestEmail, guestName, voterIdentifier, npsScore, criteriaRatings, likedMost, improvementsNeeded, generalComment } = req.body;

    if (!npsScore || !voterIdentifier) {
      return res.status(400).json({ success: false, message: 'Score NPS et identifiant requis' });
    }

    const feedback = await feedbackService.submitFeedback({
      eventId,
      inviteId,
      guestEmail,
      guestName,
      voterIdentifier,
      npsScore,
      criteriaRatings,
      likedMost,
      improvementsNeeded,
      generalComment,
    });

    return res.status(201).json({
      success: true,
      message: 'Merci beaucoup pour votre retour précieux !',
      data: feedback,
    });
  } catch (error) {
    console.error('Erreur submitFeedback controller:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Récupérer les statistiques globales des feedbacks pour l'organisateur
 * GET /api/feedback/:eventId/stats
 */
const getFeedbackStats = async (req, res) => {
  try {
    const { eventId } = req.params;
    const stats = await feedbackService.calculateFeedbackStats(eventId);
    return res.status(200).json({ success: true, data: stats });
  } catch (error) {
    console.error('Erreur getFeedbackStats controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Déclencher ou régénérer le rapport d'analyse IA consolidé
 * POST /api/feedback/:eventId/generate-ai-report
 */
const generateAiReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    const report = await feedbackService.generateAndSaveAiAnalysis(eventId);
    return res.status(200).json({
      success: true,
      message: 'Rapport d\'analyse IA généré avec succès',
      data: report,
    });
  } catch (error) {
    console.error('Erreur generateAiReport controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Récupérer le dernier rapport d'analyse IA sauvegardé
 * GET /api/feedback/:eventId/ai-report
 */
const getSavedAiReport = async (req, res) => {
  try {
    const { eventId } = req.params;
    const report = await feedbackService.getSavedAiAnalysis(eventId);
    return res.status(200).json({ success: true, data: report });
  } catch (error) {
    console.error('Erreur getSavedAiReport controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  getPublicFeedbackEvent,
  submitFeedback,
  getFeedbackStats,
  generateAiReport,
  getSavedAiReport,
};
