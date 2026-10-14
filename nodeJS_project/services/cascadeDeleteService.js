const fs = require('fs');
const path = require('path');
const mongoose = require('mongoose');

// Modèles principaux
const { userModel } = require('../models/user');
const { eventModel } = require('../models/eventModels/event');

// Modèles liés aux événements & invités
const Invites = require('../models/invitesModel/invites');
const { invitationModel } = require('../models/invitation/invitation');
const QRCodeModel = require('../models/invitesModel/qrcode');
const AgentModel = require('../models/agent/agent');

// Modèles de billetterie
const TicketCategory = require('../models/ticketCategory/ticketCategory');
const PurchasedTicket = require('../models/purchasedTicket/purchasedTicket');
const TicketLock = require('../models/ticketLock/ticketLock');

// Modèles de sondages
const { Poll } = require('../models/poll/poll');
const { PollVote } = require('../models/poll/pollVote');

// Modèles de feedbacks post-événement
const { PostEventFeedback } = require('../models/feedback/postEventFeedback');
const { PostEventAnalysis } = require('../models/feedback/postEventAnalysis');

// Modèles de rappels
const { ReminderRule } = require('../models/reminder/reminderRule');
const { ReminderLog } = require('../models/reminder/reminderLog');

// Modèles réseaux sociaux
const SocialPost = require('../models/socialMedia/socialPost');
const SocialAccount = require('../models/socialMedia/socialAccount');
const SocialVerification = require('../models/socialMedia/socialVerification');

// Modèles annexes
const FavoriteTemplate = require('../models/templates/FavoriteTemplate');
const Report = require('../models/report');
const { Notification } = require('../models/notification/notification');
const AuditLog = require('../models/auditLog');

/**
 * Supprime un fichier local dans uploads/ en toute sécurité
 */
const safeDeleteUploadFile = (filename) => {
  if (!filename || typeof filename !== 'string') return;
  try {
    const filePath = path.join(__dirname, '..', 'uploads', path.basename(filename));
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      console.log(`🗑️ Fichier upload supprimé : ${filename}`);
    }
  } catch (err) {
    console.warn(`⚠️ Impossible de supprimer le fichier upload ${filename}:`, err.message);
  }
};

/**
 * Suppression complète en cascade d'un événement et de TOUTES ses données associées
 * @param {string|mongoose.Types.ObjectId} eventId - Identifiant de l'événement
 * @returns {Promise<Object>} Résumé des éléments supprimés
 */
const deleteEventCascade = async (eventId) => {
  if (!mongoose.Types.ObjectId.isValid(eventId)) {
    throw new Error('ID d\'événement invalide pour la suppression en cascade.');
  }

  const eventObjectId = new mongoose.Types.ObjectId(eventId);

  // 1. Récupérer l'événement avant suppression
  const event = await eventModel.findById(eventObjectId);
  if (!event) {
    return { success: false, notFound: true, message: 'Événement introuvable.' };
  }

  // 2. Identifier tous les agents de scan associés à cet événement
  const agents = await AgentModel.find({ eventId: eventObjectId });
  const agentUserIds = agents
    .map((a) => a.userId)
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

  // 3. Exécution parallèle de la purge de toutes les collections enfants
  const [
    invitesRes,
    invitationsRes,
    qrcodesRes,
    agentsRes,
    ticketCatsRes,
    purchasedTicketsRes,
    ticketLocksRes,
    pollsRes,
    pollVotesRes,
    feedbacksRes,
    analysesRes,
    reminderRulesRes,
    reminderLogsRes,
    socialPostsRes,
    favTemplatesRes,
    reportsRes,
    notifsRes
  ] = await Promise.all([
    // Invités (noter que le champ est idEvent dans invitesModel)
    Invites.deleteMany({ idEvent: eventObjectId }),
    // Invitations / RSVP
    invitationModel.deleteMany({ eventId: eventObjectId }),
    // QR codes générés
    QRCodeModel.deleteMany({ eventId: eventObjectId }),
    // Fiches agents de scan
    AgentModel.deleteMany({ eventId: eventObjectId }),
    // Catégories de billets
    TicketCategory.deleteMany({ eventId: eventObjectId }),
    // Billets achetés
    PurchasedTicket.deleteMany({ eventId: eventObjectId }),
    // Verrous temporaires de billets
    TicketLock.deleteMany({ eventId: eventObjectId }),
    // Sondages
    Poll.deleteMany({ eventId: eventObjectId }),
    // Votes aux sondages
    PollVote.deleteMany({ eventId: eventObjectId }),
    // Retours feedbacks post-événement
    PostEventFeedback.deleteMany({ eventId: eventObjectId }),
    // Analyses IA post-événement
    PostEventAnalysis.deleteMany({ eventId: eventObjectId }),
    // Règles de rappels automatiques
    ReminderRule.deleteMany({ eventId: eventObjectId }),
    // Journaux de rappels
    ReminderLog.deleteMany({ eventId: eventObjectId }),
    // Publications réseaux sociaux
    SocialPost.deleteMany({ eventId: eventObjectId }),
    // Modèles/Templates favoris
    FavoriteTemplate.deleteMany({ eventId: eventObjectId }),
    // Signalements / Rapports
    Report.deleteMany({ eventId: eventObjectId }),
    // Notifications rattachées à cet événement
    Notification.deleteMany({ referenceId: eventObjectId, referenceType: 'event' })
  ]);

  // 4. Supprimer les comptes utilisateurs créés pour les agents de cet événement
  let deletedAgentUsersCount = 0;
  if (agentUserIds.length > 0) {
    const userAgentDeleteRes = await userModel.deleteMany({
      _id: { $in: agentUserIds },
      role: 'agent'
    });
    deletedAgentUsersCount = userAgentDeleteRes.deletedCount || 0;
  }
  // Filet de sécurité supplémentaire : supprimer tout compte utilisateur avec eventId correspondant et role agent
  const orphanAgentUsersRes = await userModel.deleteMany({
    eventId: eventObjectId,
    role: 'agent'
  });
  deletedAgentUsersCount += orphanAgentUsersRes.deletedCount || 0;

  // 5. Nettoyer l'image de couverture locale si existante
  if (event.image) {
    safeDeleteUploadFile(event.image);
  }

  // 6. Supprimer le document de l'événement lui-même
  await eventModel.findByIdAndDelete(eventObjectId);

  // 7. Enregistrer une trace d'audit système
  try {
    await AuditLog.create({
      userId: event.userId || null,
      type: 'Événement',
      action: 'SUPPRESSION_CASCADE',
      description: `Suppression en cascade complète de l'événement "${event.titre}" (ID: ${eventId}).`,
      status: 'Validé',
      statusDot: 'bg-red-500'
    });
  } catch (auditErr) {
    // Non bloquant
  }

  return {
    success: true,
    eventId: String(eventId),
    eventTitle: event.titre,
    deletedCounts: {
      invites: invitesRes.deletedCount || 0,
      invitations: invitationsRes.deletedCount || 0,
      qrcodes: qrcodesRes.deletedCount || 0,
      agents: agentsRes.deletedCount || 0,
      agentUserAccounts: deletedAgentUsersCount,
      ticketCategories: ticketCatsRes.deletedCount || 0,
      purchasedTickets: purchasedTicketsRes.deletedCount || 0,
      ticketLocks: ticketLocksRes.deletedCount || 0,
      polls: pollsRes.deletedCount || 0,
      pollVotes: pollVotesRes.deletedCount || 0,
      feedbacks: feedbacksRes.deletedCount || 0,
      feedbackAnalyses: analysesRes.deletedCount || 0,
      reminderRules: reminderRulesRes.deletedCount || 0,
      reminderLogs: reminderLogsRes.deletedCount || 0,
      socialPosts: socialPostsRes.deletedCount || 0,
      favoriteTemplates: favTemplatesRes.deletedCount || 0,
      reports: reportsRes.deletedCount || 0,
      notifications: notifsRes.deletedCount || 0
    }
  };
};

/**
 * Suppression complète en cascade d'un utilisateur et de TOUTES ses données associées
 * @param {string|mongoose.Types.ObjectId} userId - Identifiant de l'utilisateur
 * @returns {Promise<Object>} Résumé des éléments supprimés
 */
const deleteUserCascade = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('ID utilisateur invalide pour la suppression en cascade.');
  }

  const userObjectId = new mongoose.Types.ObjectId(userId);

  // 1. Récupérer l'utilisateur
  const user = await userModel.findById(userObjectId);
  if (!user) {
    return { success: false, notFound: true, message: 'Utilisateur introuvable.' };
  }

  // 2. Trouver TOUS les événements créés par cet utilisateur
  const userEvents = await eventModel.find({ userId: userObjectId });
  const cascadeEventReports = [];

  // Supprimer en cascade chaque événement de l'utilisateur
  for (const ev of userEvents) {
    const report = await deleteEventCascade(ev._id);
    cascadeEventReports.push(report);
  }

  // 3. Supprimer les agents résiduels créés par cet organisateur (si non rattachés à un événement déjà traité)
  const remainingAgents = await AgentModel.find({ organizerId: userObjectId });
  const remainingAgentUserIds = remainingAgents
    .map((a) => a.userId)
    .filter((id) => id && mongoose.Types.ObjectId.isValid(id));

  await AgentModel.deleteMany({ organizerId: userObjectId });
  if (remainingAgentUserIds.length > 0) {
    await userModel.deleteMany({
      _id: { $in: remainingAgentUserIds },
      role: 'agent'
    });
  }

  // 4. Si l'utilisateur supprimé est lui-même un agent de scan, nettoyer sa fiche agent
  await AgentModel.deleteMany({ userId: userObjectId });

  // 5. Purger les comptes réseaux sociaux et publications orphelines de cet utilisateur
  const [
    socialAccountsRes,
    socialVerifsRes,
    socialPostsRes,
    favTemplatesRes,
    notificationsRes,
    reportsCreatedRes
  ] = await Promise.all([
    SocialAccount.deleteMany({ userId: userObjectId }),
    SocialVerification.deleteMany({ userId: userObjectId }),
    SocialPost.deleteMany({ userId: userObjectId }),
    FavoriteTemplate.deleteMany({ userId: userObjectId }),
    Notification.deleteMany({ userId: userObjectId }),
    Report.deleteMany({ reporterId: userObjectId })
  ]);

  // 6. Supprimer enfin le compte utilisateur
  await userModel.findByIdAndDelete(userObjectId);

  // 7. Enregistrer une trace d'audit
  try {
    await AuditLog.create({
      userId: null,
      type: 'Utilisateur',
      action: 'SUPPRESSION_CASCADE_UTILISATEUR',
      description: `Suppression en cascade complète du compte ${user.email} (ID: ${userId}) et de ses ${userEvents.length} événement(s).`,
      status: 'Validé',
      statusDot: 'bg-red-500'
    });
  } catch (auditErr) {
    // Non bloquant
  }

  return {
    success: true,
    userId: String(userId),
    userEmail: user.email,
    deletedEventsCount: userEvents.length,
    eventsDeleted: cascadeEventReports,
    userSpecificDataDeleted: {
      socialAccounts: socialAccountsRes.deletedCount || 0,
      socialVerifications: socialVerifsRes.deletedCount || 0,
      socialPosts: socialPostsRes.deletedCount || 0,
      favoriteTemplates: favTemplatesRes.deletedCount || 0,
      notifications: notificationsRes.deletedCount || 0,
      reportsCreated: reportsCreatedRes.deletedCount || 0
    }
  };
};

module.exports = {
  deleteEventCascade,
  deleteUserCascade
};
