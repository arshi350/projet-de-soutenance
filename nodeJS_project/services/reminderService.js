const { ReminderRule } = require('../models/reminder/reminderRule');
const { ReminderLog } = require('../models/reminder/reminderLog');
const { invitationModel } = require('../models/invitation/invitation');
const { eventModel } = require('../models/eventModels/event');
const axios = require('axios');

const BREVO_EMAIL_API_URL = 'https://api.brevo.com/v3/smtp/email';
const apiKey = process.env.BREVO_API_KEY;

/**
 * Créer ou enregistrer une règle de relance
 */
async function createReminderRule(ruleData) {
  const rule = new ReminderRule(ruleData);
  return await rule.save();
}

/**
 * Lister les règles d'un événement
 */
async function getReminderRulesByEvent(eventId) {
  return await ReminderRule.find({ eventId }).sort({ createdAt: -1 });
}

/**
 * Mettre à jour une règle de relance
 */
async function updateReminderRule(ruleId, updateData) {
  return await ReminderRule.findByIdAndUpdate(ruleId, updateData, { new: true });
}

/**
 * Supprimer une règle
 */
async function deleteReminderRule(ruleId) {
  return await ReminderRule.findByIdAndDelete(ruleId);
}

/**
 * Remplacer les variables de template dans un texte
 */
function interpolateTemplate(text, variables) {
  if (!text) return '';
  let result = text;
  Object.keys(variables).forEach((key) => {
    const reg = new RegExp(`{{${key}}}`, 'g');
    result = result.replace(reg, variables[key] || '');
  });
  return result;
}

/**
 * Envoyer un email de relance via Brevo
 */
async function sendEmailReminder({ toEmail, toName, subject, bodyContent, eventTitle }) {
  if (!apiKey) {
    console.warn('BREVO_API_KEY non renseignée. Simulation de l\'envoi email.');
    return { success: true, simulated: true };
  }

  const htmlContent = `
  <!DOCTYPE html>
  <html>
  <head>
    <meta charset="utf-8">
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0f172a; margin: 0; padding: 20px; }
      .card { max-width: 560px; margin: 0 auto; background-color: #1e293b; border: 1px solid #334155; border-radius: 16px; padding: 32px; color: #f8fafc; }
      .header { border-bottom: 1px solid #334155; padding-bottom: 16px; margin-bottom: 20px; }
      .title { font-size: 20px; font-weight: 700; color: #38bdf8; margin: 0; }
      .content { font-size: 15px; line-height: 1.6; color: #cbd5e1; white-space: pre-line; }
      .footer { margin-top: 24px; border-top: 1px solid #334155; padding-top: 16px; font-size: 12px; color: #64748b; text-align: center; }
    </style>
  </head>
  <body>
    <div class="card">
      <div class="header">
        <h1 class="title">${eventTitle || 'Notification Événement'}</h1>
      </div>
      <div class="content">
        ${bodyContent}
      </div>
      <div class="footer">
        Ceci est un message automatisé concernant votre participation à l'événement.
      </div>
    </div>
  </body>
  </html>
  `;

  try {
    await axios.post(
      BREVO_EMAIL_API_URL,
      {
        sender: {
          email: process.env.BREVO_FROM_EMAIL || process.env.RESEND_FROM || 'no-reply@arshievent.com',
          name: process.env.BREVO_FROM_NAME || 'Rappels Événements',
        },
        to: [{ email: toEmail, name: toName }],
        subject,
        htmlContent,
      },
      {
        headers: {
          'api-key': apiKey,
          'Content-Type': 'application/json',
        },
      }
    );
    return { success: true };
  } catch (error) {
    console.error(`Erreur envoi Brevo (${toEmail}):`, error.response?.data || error.message);
    throw new Error(error.response?.data?.message || error.message);
  }
}

/**
 * Exécuter une règle de relance (Immédiat ou Scheduler)
 */
async function executeReminderRule(ruleId) {
  const rule = await ReminderRule.findById(ruleId);
  if (!rule) {
    throw new Error('Règle de relance introuvable');
  }

  const event = await eventModel.findById(rule.eventId);
  if (!event) {
    throw new Error('Événement associé introuvable');
  }

  // 1. Filtrer les destinataires selon l'audience cible
  let query = { eventId: rule.eventId, isRevoked: { $ne: true } };
  if (rule.targetAudience === 'unanswered_rsvp') {
    query.rsvpStatus = { $in: ['en attente', 'pending', null] };
  } else if (rule.targetAudience === 'confirmed_guests') {
    query.rsvpStatus = { $in: ['confirmé', 'confirmed', 'accepted'] };
  }

  const invitations = await invitationModel.find(query);
  const results = {
    totalTargeted: invitations.length,
    sentCount: 0,
    failedCount: 0,
  };

  const eventDateStr = event.DateDebut
    ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
    : '';

  for (const inv of invitations) {
    const recipientName = `${inv.prenom || ''} ${inv.nom || ''}`.trim() || 'Invité';
    const toEmail = inv.inviteeEmail || inv.email;
    const toPhone = inv.telephone || inv.phone || '';

    const variables = {
      nom_invite: recipientName,
      nom_evenement: event.titre || event.title || 'Événement',
      date: eventDateStr,
      lieu: event.lieu || 'Voir détails sur votre pass',
      lien_rsvp: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/rsvp/${inv.uniqueToken || inv._id}`,
      lien_billet: `${process.env.FRONTEND_URL || 'http://localhost:5173'}/ticket/download/${inv.uniqueToken || inv._id}`,
    };

    const interpolatedSubject = interpolateTemplate(rule.template.subject || `Rappel pour ${event.titre}`, variables);
    const interpolatedBody = interpolateTemplate(rule.template.body || `Bonjour {{nom_invite}}, rappel pour {{nom_evenement}}.`, variables);

    let status = 'sent';
    let errorMessage = null;

    try {
      if (rule.channel === 'email' && toEmail) {
        await sendEmailReminder({
          toEmail,
          toName: recipientName,
          subject: interpolatedSubject,
          bodyContent: interpolatedBody,
          eventTitle: event.titre,
        });
        results.sentCount++;
      } else {
        // SMS ou WhatsApp (simulation / logging sécurisé)
        status = 'simulated';
        results.sentCount++;
      }
    } catch (err) {
      status = 'failed';
      errorMessage = err.message;
      results.failedCount++;
    }

    // Enregistrer le log
    await ReminderLog.create({
      ruleId: rule._id,
      eventId: event._id,
      recipientEmail: toEmail,
      recipientPhone: toPhone,
      recipientName,
      channel: rule.channel,
      status,
      subjectSent: interpolatedSubject,
      bodySent: interpolatedBody,
      errorMessage,
    });
  }

  // Mettre à jour les métriques de la règle
  rule.lastExecutedAt = new Date();
  rule.executionCount = (rule.executionCount || 0) + 1;
  await rule.save();

  return results;
}

/**
 * Récupérer les logs d'un événement
 */
async function getReminderLogsByEvent(eventId) {
  return await ReminderLog.find({ eventId }).sort({ sentAt: -1 }).limit(100);
}

module.exports = {
  createReminderRule,
  getReminderRulesByEvent,
  updateReminderRule,
  deleteReminderRule,
  executeReminderRule,
  getReminderLogsByEvent,
};
