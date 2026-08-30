const cron = require('node-cron');
const { invitationModel } = require('../models/invitation/invitation');
const { sendInvitation } = require('./invitationService');

/**
 * Scrute les invitations programmées dont la date d'échéance est atteinte
 */
async function processScheduledInvitations() {
  try {
    const now = new Date();
    const scheduledPending = await invitationModel.find({
      scheduledAt: { $lte: now },
      emailSent: false,
      isRevoked: { $ne: true },
    }).limit(50);

    if (!scheduledPending || scheduledPending.length === 0) {
      return;
    }

    console.log(`⏰ ${scheduledPending.length} invitation(s) programmée(s) à envoyer maintenant...`);

    for (const invite of scheduledPending) {
      try {
        await sendInvitation(invite._id, ['email']);
        console.log(`✅ Invitation programmée envoyée à ${invite.inviteeEmail}`);
      } catch (sendErr) {
        console.error(`❌ Erreur envoi invitation programmée ${invite._id}:`, sendErr.message);
      }
    }
  } catch (error) {
    console.error('Erreur processScheduledInvitations:', error.message);
  }
}

/**
 * Démarre le planificateur d'invitations programmées (toutes les minutes)
 */
function startInvitationScheduler() {
  cron.schedule('* * * * *', async () => {
    await processScheduledInvitations();
  });
  console.log('⏰ Planificateur d\'invitations différées démarré (vérification chaque minute)');
}

module.exports = {
  processScheduledInvitations,
  startInvitationScheduler,
};
