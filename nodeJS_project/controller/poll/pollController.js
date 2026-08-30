const pollService = require('../../services/pollService');
const { Poll } = require('../../models/poll/poll');

/**
 * Créer un sondage
 * POST /api/polls
 */
const createPoll = async (req, res) => {
  try {
    const { eventId, title, description, timingType, isAnonymous, showLiveResults, autoCloseAt, questions } = req.body;
    const creatorId = req.user?.id || req.user?._id;

    if (!eventId || !title) {
      return res.status(400).json({ success: false, message: 'eventId et title sont requis' });
    }

    const poll = await pollService.createPoll({
      eventId,
      creatorId,
      title,
      description,
      timingType,
      isAnonymous,
      showLiveResults,
      autoCloseAt,
      questions,
    });

    return res.status(201).json({
      success: true,
      message: 'Sondage créé avec succès',
      data: poll,
    });
  } catch (error) {
    console.error('Erreur createPoll controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lister les sondages d'un événement
 * GET /api/polls/event/:eventId
 */
const getPollsByEvent = async (req, res) => {
  try {
    const { eventId } = req.params;
    const polls = await pollService.getPollsByEvent(eventId);
    return res.status(200).json({ success: true, data: polls });
  } catch (error) {
    console.error('Erreur getPollsByEvent controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Récupérer un sondage avec ses analytics
 * GET /api/polls/:pollId
 */
const getPollDetails = async (req, res) => {
  try {
    const { pollId } = req.params;
    const result = await pollService.getPollWithAnalytics(pollId);
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getPollDetails controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mettre à jour le statut d'un sondage
 * PATCH /api/polls/:pollId/status
 */
const updatePollStatus = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { status } = req.body;
    const poll = await pollService.updatePollStatus(pollId, status);
    return res.status(200).json({ success: true, message: 'Statut mis à jour', data: poll });
  } catch (error) {
    console.error('Erreur updatePollStatus controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Supprimer un sondage
 * DELETE /api/polls/:pollId
 */
const deletePoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    await pollService.deletePoll(pollId);
    return res.status(200).json({ success: true, message: 'Sondage supprimé avec succès' });
  } catch (error) {
    console.error('Erreur deletePoll controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Récupérer le sondage public pour un invité
 * GET /api/public/polls/:pollId
 */
const getPublicPoll = async (req, res) => {
  try {
    const { pollId } = req.params;
    const poll = await Poll.findById(pollId).select('-creatorId');
    if (!poll) {
      return res.status(404).json({ success: false, message: 'Sondage non trouvé' });
    }
    return res.status(200).json({ success: true, data: poll });
  } catch (error) {
    console.error('Erreur getPublicPoll controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Soumettre un vote (public)
 * POST /api/public/polls/:pollId/vote
 */
const submitVote = async (req, res) => {
  try {
    const { pollId } = req.params;
    const { voterIdentifier, voterName, answers } = req.body;

    if (!voterIdentifier || !answers || !Array.isArray(answers)) {
      return res.status(400).json({ success: false, message: 'Identifiant du votant et réponses requis' });
    }

    const vote = await pollService.submitVote({
      pollId,
      voterIdentifier,
      voterName,
      answers,
    });

    return res.status(201).json({
      success: true,
      message: 'Vote enregistré avec succès !',
      data: vote,
    });
  } catch (error) {
    console.error('Erreur submitVote controller:', error);
    return res.status(400).json({ success: false, message: error.message });
  }
};

/**
 * Récupérer les résultats en direct pour le public
 * GET /api/public/polls/:pollId/live-results
 */
const getPublicLiveResults = async (req, res) => {
  try {
    const { pollId } = req.params;
    const result = await pollService.getPollWithAnalytics(pollId);
    if (!result.poll.showLiveResults) {
      return res.status(403).json({ success: false, message: 'Les résultats en direct ne sont pas publics pour ce sondage' });
    }
    return res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('Erreur getPublicLiveResults controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Générer intelligemment un sondage pré-événement avec l'IA Gemini
 * POST /api/polls/ai/generate
 */
const generatePollWithAi = async (req, res) => {
  try {
    const { eventId, pollObjective, customInstructions } = req.body;
    const { eventModel } = require('../../models/eventModels/event');
    const { generatePreEventPollQuestions } = require('../../services/pollAiService');

    let eventTitle = 'Événement';
    let eventType = 'Soirée Privée';
    let eventDate = '';
    let eventLocation = '';

    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        eventTitle = event.titre || event.title || eventTitle;
        eventType = event.typeEvenement || event.category || eventType;
        eventDate = event.DateDebut
          ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : '';
        eventLocation = event.lieu || '';
      }
    }

    const aiResult = await generatePreEventPollQuestions({
      eventTitle,
      eventType,
      eventDate,
      eventLocation,
      pollObjective,
      customInstructions,
    });

    return res.status(200).json(aiResult);
  } catch (error) {
    console.error('Erreur generatePollWithAi controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createPoll,
  getPollsByEvent,
  getPollDetails,
  updatePollStatus,
  deletePoll,
  getPublicPoll,
  submitVote,
  getPublicLiveResults,
  generatePollWithAi,
};
