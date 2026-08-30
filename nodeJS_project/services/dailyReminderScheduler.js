const cron = require('node-cron');
const { invitationModel } = require('../models/invitation/invitation');
const { eventModel } = require('../models/eventModels/event');
const axios = require('axios');

const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';
const apiKey = process.env.BREVO_API_KEY;

/**
 * Calcul du nombre de jours restants entre aujourd'hui et la date de l'événement
 */
function getDaysUntilEvent(eventDate) {
  const now = new Date();
  const target = new Date(eventDate);
  const diffTime = target.setHours(0, 0, 0, 0) - now.setHours(0, 0, 0, 0);
  return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
}

/**
 * Envoie un email de rappel personnalisé
 */
async function sendDailyReminderEmail(invitation, event, daysLeft) {
  try {
    if (!apiKey) return;
    const toEmail = invitation.inviteeEmail;
    if (!toEmail) return;

    let countdownLabel = `J-${daysLeft}`;
    let subjectHeader = `⏰ Rappel : Plus que ${daysLeft} jour(s) avant "${event.titre}"`;
    if (daysLeft === 0) {
      countdownLabel = `AUJOURD'HUI`;
      subjectHeader = `🎉 C'est aujourd'hui ! Votre événement "${event.titre}"`;
    } else if (daysLeft === 1) {
      countdownLabel = `DEMAIN`;
      subjectHeader = `🚀 C'est demain ! Préparez votre QR Code pour "${event.titre}"`;
    }

    const eventDateStr = event.DateDebut 
      ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
      : '';

    const htmlContent = `
    <!DOCTYPE html>
    <html lang="fr">
    <head>
      <meta charset="UTF-8">
      <style>
        body { margin: 0; padding: 0; background-color: #0F172A; font-family: 'Helvetica Neue', Helvetica, Arial, sans-serif; }
        .container { max-width: 580px; margin: 20px auto; background: #1E293B; border-radius: 20px; padding: 30px; color: #F8FAFC; border: 1px solid #334155; text-align: center; }
        .badge { background: #017EF7; color: white; font-weight: 800; font-size: 11px; padding: 5px 14px; border-radius: 20px; text-transform: uppercase; letter-spacing: 1px; display: inline-block; }
        .qr-card { background: #FFFFFF; border-radius: 16px; padding: 14px; display: inline-block; margin: 15px 0; }
      </style>
    </head>
    <body style="background-color: #0F172A; padding: 20px 10px;">
      <div class="container">
        <span class="badge">${countdownLabel}</span>
        <h2 style="color: #FFFFFF; font-size: 22px; margin: 16px 0 8px 0;">${subjectHeader}</h2>
        <p style="color: #94A3B8; font-size: 13px;">
          Bonjour <strong style="color: #FFFFFF;">${invitation.prenom} ${invitation.nom}</strong>, nous avons hâte de vous accueillir !
        </p>

        <div style="background: #0F172A; border-radius: 14px; padding: 16px; margin: 20px 0; text-align: left; border: 1px solid #334155;">
          <p style="margin: 4px 0; font-size: 13px; color: #CBD5E1;">📅 <strong>Date :</strong> ${eventDateStr}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #CBD5E1;">⏰ <strong>Heure :</strong> ${event.heureDebut || '19h00'}</p>
          <p style="margin: 4px 0; font-size: 13px; color: #CBD5E1;">📍 <strong>Lieu :</strong> ${event.lieu || 'Consultez votre billet'}</p>
        </div>

        ${invitation.qrCodeImage ? `
        <div>
          <p style="color: #94A3B8; font-size: 12px; margin-bottom: 6px;">Votre pass d'accès vérifié :</p>
          <div class="qr-card">
            <img src="${invitation.qrCodeImage}" alt="QR Code" width="160" height="160" style="display: block; border-radius: 8px;" />
          </div>
        </div>` : ''}

        <p style="color: #64748B; font-size: 11px; margin-top: 20px;">
          Présentez ce message ou votre QR Code lors de votre enregistrement à l'entrée.
        </p>
      </div>
    </body>
    </html>
    `;

    await axios.post(BREVO_EMAIL_API_URL, {
      sender: {
        email: process.env.BREVO_FROM_EMAIL || process.env.RESEND_FROM || 'no-reply@arshievent.com',
        name: process.env.BREVO_FROM_NAME || 'Rappels Événements',
      },
      to: [{ email: toEmail, name: `${invitation.prenom} ${invitation.nom}` }],
      subject: subjectHeader,
      htmlContent,
    }, {
      headers: {
        'api-key': apiKey,
        'Content-Type': 'application/json',
      },
    });

    console.log(`📢 Rappel ${countdownLabel} envoyé avec succès à ${toEmail} pour "${event.titre}"`);
  } catch (error) {
    console.error(`❌ Erreur envoi rappel à ${invitation.inviteeEmail}:`, error.message);
  }
}

/**
 * Tâche quotidienne principale analysant les événements et expédiant les rappels automatiques
 */
async function runDailyReminderRoutine() {
  try {
    console.log('🌅 Démarrage de la vérification quotidienne des rappels...');
    const now = new Date();

    // 1. Trouver les événements à venir (non terminés)
    const upcomingEvents = await eventModel.find({
      DateDebut: { $gte: new Date(now.getFullYear(), now.getMonth(), now.getDate()) },
      status: { $ne: 'terminer' },
    });

    if (!upcomingEvents || upcomingEvents.length === 0) {
      console.log('✨ Aucun événement à venir nécessitant des rappels aujourd\'hui.');
      return;
    }

    let totalRemindersSent = 0;

    for (const event of upcomingEvents) {
      const daysLeft = getDaysUntilEvent(event.DateDebut);

      // Seuils de rappels recommandés : J-7, J-3, J-1, Jour J (0)
      if (![7, 3, 1, 0].includes(daysLeft)) {
        continue;
      }

      const reminderType = daysLeft === 0 ? 'JOUR_J' : `J-${daysLeft}`;

      // 2. Sélectionner UNIQUEMENT les invités ayant CONFIRMÉ et NON RÉVOQUÉS
      const confirmedInvites = await invitationModel.find({
        eventId: event._id,
        rsvpStatus: 'confirmé',
        isRevoked: { $ne: true },
      });

      for (const invite of confirmedInvites) {
        // Protection anti-spam : Vérifier si ce rappel a déjà été envoyé aujourd'hui
        const alreadyLogged = invite.reminderLogs?.some(log => {
          const logDate = new Date(log.sentAt);
          return log.type === reminderType && logDate.toDateString() === now.toDateString();
        });

        if (alreadyLogged) continue;

        await sendDailyReminderEmail(invite, event, daysLeft);

        invite.reminderLogs.push({
          type: reminderType,
          sentAt: new Date(),
          success: true,
        });
        await invite.save();
        totalRemindersSent++;
      }
    }

    // 3. Exécuter les règles personnalisées ReminderRule configurées par les organisateurs
    const { ReminderRule } = require('../models/reminder/reminderRule');
    const { executeReminderRule } = require('./reminderService');

    const activeRules = await ReminderRule.find({ isEnabled: true });
    for (const rule of activeRules) {
      try {
        const ev = upcomingEvents.find(e => e._id.toString() === rule.eventId.toString());
        if (ev && rule.triggerType === 'relative_to_event' && rule.triggerUnit === 'days') {
          const daysLeft = getDaysUntilEvent(ev.DateDebut);
          if (daysLeft === rule.triggerOffset) {
            // Vérifier si déjà exécuté aujourd'hui
            const alreadyRunToday = rule.lastExecutedAt && new Date(rule.lastExecutedAt).toDateString() === now.toDateString();
            if (!alreadyRunToday) {
              console.log(`🚀 Exécution de la règle de rappel personnalisée : "${rule.title}"`);
              await executeReminderRule(rule._id);
            }
          }
        }
      } catch (ruleErr) {
        console.error(`Erreur exécution ReminderRule ${rule._id}:`, ruleErr.message);
      }
    }

    console.log(`🎉 Routine de rappels terminée : ${totalRemindersSent} rappel(s) distribué(s).`);
  } catch (error) {
    console.error('❌ Erreur routine quotidienne des rappels:', error.message);
  }
}

/**
 * Démarre le planificateur de rappels quotidiens (exécuté tous les jours à 08:00 AM)
 */
function startDailyReminderScheduler() {
  // Format cron : À 08:00 tous les jours
  cron.schedule('0 8 * * *', async () => {
    console.log('⏰ Déclenchement automatique du cron des rappels quotidiens (08h00)');
    await runDailyReminderRoutine();
  });

  console.log('⏰ Planificateur de rappels quotidiens activé (Tous les matins à 08h00)');
}

module.exports = {
  runDailyReminderRoutine,
  startDailyReminderScheduler,
  getDaysUntilEvent,
};
