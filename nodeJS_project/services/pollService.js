const { Poll } = require('../models/poll/poll');
const { PollVote } = require('../models/poll/pollVote');
const crypto = require('crypto');

/**
 * Créer un nouveau sondage
 */
async function createPoll({ eventId, creatorId, title, description, timingType, isAnonymous, showLiveResults, autoCloseAt, questions }) {
  if (!questions || !Array.isArray(questions) || questions.length === 0) {
    throw new Error('Un sondage doit contenir au moins une question');
  }

  // Générer des IDs uniques pour les questions et leurs options si non fournis
  const formattedQuestions = questions.map((q, qIndex) => ({
    id: q.id || `q_${Date.now()}_${qIndex}`,
    title: q.title,
    type: q.type || 'single_choice',
    isRequired: q.isRequired !== undefined ? q.isRequired : true,
    options: (q.options || []).map((opt, optIndex) => ({
      id: opt.id || `opt_${Date.now()}_${qIndex}_${optIndex}`,
      text: opt.text,
    })),
  }));

  const poll = new Poll({
    eventId,
    creatorId,
    title,
    description: description || '',
    timingType: timingType || 'live',
    status: 'active',
    isAnonymous: !!isAnonymous,
    showLiveResults: showLiveResults !== undefined ? !!showLiveResults : true,
    autoCloseAt: autoCloseAt || null,
    questions: formattedQuestions,
  });

  return await poll.save();
}

/**
 * Récupérer les sondages d'un événement
 */
async function getPollsByEvent(eventId) {
  return await Poll.find({ eventId }).sort({ createdAt: -1 });
}

/**
 * Récupérer un sondage par son ID avec les statistiques agrégées
 */
async function getPollWithAnalytics(pollId) {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error('Sondage non trouvé');
  }

  const votes = await PollVote.find({ pollId });
  const totalVotes = votes.length;

  // Calcul des agrégations par question
  const analytics = poll.questions.map((q) => {
    if (q.type === 'single_choice' || q.type === 'multiple_choice') {
      const optionCounts = {};
      q.options.forEach((opt) => {
        optionCounts[opt.id] = { id: opt.id, text: opt.text, count: 0, percentage: 0 };
      });

      let totalAnswersForQuestion = 0;
      votes.forEach((vote) => {
        const answer = vote.answers.find((a) => a.questionId === q.id);
        if (answer && Array.isArray(answer.selectedOptionIds)) {
          answer.selectedOptionIds.forEach((optId) => {
            if (optionCounts[optId]) {
              optionCounts[optId].count += 1;
              totalAnswersForQuestion += 1;
            }
          });
        }
      });

      // Calcul des pourcentages
      Object.keys(optionCounts).forEach((optId) => {
        const c = optionCounts[optId].count;
        optionCounts[optId].percentage = totalAnswersForQuestion > 0 ? Math.round((c / totalAnswersForQuestion) * 100) : 0;
      });

      return {
        questionId: q.id,
        title: q.title,
        type: q.type,
        totalAnswers: totalAnswersForQuestion,
        optionsDistribution: Object.values(optionCounts),
      };
    }

    if (q.type === 'star_rating') {
      let ratingSum = 0;
      let ratingCount = 0;
      const distribution = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0 };

      votes.forEach((vote) => {
        const answer = vote.answers.find((a) => a.questionId === q.id);
        if (answer && typeof answer.ratingValue === 'number' && answer.ratingValue >= 1 && answer.ratingValue <= 5) {
          ratingSum += answer.ratingValue;
          ratingCount += 1;
          distribution[answer.ratingValue] += 1;
        }
      });

      const averageRating = ratingCount > 0 ? (ratingSum / ratingCount).toFixed(1) : 0;

      return {
        questionId: q.id,
        title: q.title,
        type: q.type,
        totalAnswers: ratingCount,
        averageRating: Number(averageRating),
        distribution,
      };
    }

    if (q.type === 'free_text') {
      const textResponses = [];
      votes.forEach((vote) => {
        const answer = vote.answers.find((a) => a.questionId === q.id);
        if (answer && answer.textAnswer && answer.textAnswer.trim()) {
          textResponses.push({
            text: answer.textAnswer.trim(),
            voterName: poll.isAnonymous ? 'Anonyme' : (vote.voterName || 'Participant'),
            date: vote.votedAt,
          });
        }
      });

      return {
        questionId: q.id,
        title: q.title,
        type: q.type,
        totalAnswers: textResponses.length,
        responses: textResponses,
      };
    }

    return { questionId: q.id, title: q.title, type: q.type };
  });

  return {
    poll,
    totalVotes,
    analytics,
  };
}

/**
 * Enregistrer un vote de participant
 */
async function submitVote({ pollId, voterIdentifier, voterName, answers }) {
  const poll = await Poll.findById(pollId);
  if (!poll) {
    throw new Error('Sondage introuvable');
  }

  if (poll.status !== 'active') {
    throw new Error('Ce sondage est actuellement clôturé');
  }

  if (poll.autoCloseAt && new Date() > new Date(poll.autoCloseAt)) {
    poll.status = 'closed';
    await poll.save();
    throw new Error('Ce sondage a expiré');
  }

  // Vérifier si le votant a déjà voté
  const existingVote = await PollVote.findOne({ pollId, voterIdentifier });
  if (existingVote) {
    throw new Error('Vous avez déjà participé à ce sondage');
  }

  const vote = new PollVote({
    pollId,
    eventId: poll.eventId,
    voterIdentifier,
    voterName: poll.isAnonymous ? '' : (voterName || ''),
    answers,
  });

  await vote.save();

  // Incrémenter le compteur de votes
  poll.totalVotesCount = (poll.totalVotesCount || 0) + 1;
  await poll.save();

  return vote;
}

/**
 * Clôturer ou changer le statut d'un sondage
 */
async function updatePollStatus(pollId, status) {
  if (!['draft', 'active', 'closed'].includes(status)) {
    throw new Error('Statut invalide');
  }
  return await Poll.findByIdAndUpdate(pollId, { status }, { new: true });
}

/**
 * Supprimer un sondage et ses votes
 */
async function deletePoll(pollId) {
  await PollVote.deleteMany({ pollId });
  return await Poll.findByIdAndDelete(pollId);
}

module.exports = {
  createPoll,
  getPollsByEvent,
  getPollWithAnalytics,
  submitVote,
  updatePollStatus,
  deletePoll,
};
