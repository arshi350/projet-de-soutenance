const mongoose = require('mongoose');
const crypto = require('crypto');
const QRCode = require('qrcode');
const { invitationModel } = require('../models/invitation/invitation');
const { eventModel } = require('../models/eventModels/event');
const Invites = require('../models/invitesModel/invites');
const QRCodeModel = require('../models/invitesModel/qrcode');
const { sendEmailViaBrevo } = require('./brevoEmailService');
const { sendWhatsApp } = require('./brevoService');
const { generateAndUploadQRCode } = require('./qrCloudinaryService');

/**
 * Envoie une invitation individuelle via les canaux spécifiés (Email et/ou WhatsApp)
 */
async function sendInvitation(inviteId, channels = ['email', 'whatsapp']) {
  try {
    const invite = await invitationModel.findById(inviteId);
    if (!invite) return { success: false, error: 'Invitation introuvable' };

    const event = await eventModel.findById(invite.eventId);

    const results = {};

    if (channels.includes('email')) {
      try {
        const qr = invite.qrCodeImage || null;
        const ticket = invite.billetImage || invite.ticketImage || null;
        const res = await sendEmailViaBrevo(invite, event || {}, qr, ticket);
        if (res.success) {
          invite.emailSent = true;
          invite.emailSentAt = new Date();
          results.email = { success: true, data: res.data };
        } else {
          results.email = { success: false, error: res.error };
        }
      } catch (err) {
        results.email = { success: false, error: err.message || err };
      }
    }

    if (channels.includes('whatsapp')) {
      try {
        const res = await sendWhatsApp(invite, event || {});
        if (res.success) {
          invite.whatsappSent = true;
          invite.whatsappSentAt = new Date();
          results.whatsapp = { success: true, data: res.data };
        } else {
          results.whatsapp = { success: false, error: res.error };
        }
      } catch (err) {
        results.whatsapp = { success: false, error: err.message || err };
      }
    }

    await invite.save();
    return { success: true, results };
  } catch (error) {
    console.error('invitationService.sendInvitation error', error);
    return { success: false, error: error.message || error };
  }
}

/**
 * Envoi d'invitations en lot pour un événement
 */
async function sendInvitationsBatch(eventId, guestIds = [], channels = ['email', 'whatsapp']) {
  return sendMultiChannelInvitations(eventId, guestIds, channels);
}

/**
 * Service principal d'envoi automatique multi-canal d'invitations
 * Si guestIds est vide ou absent, envoie automatiquement à TOUS les invités de l'événement.
 * Génère automatiquement les invitations et QR codes à la volée pour les invités manquants.
 *
 * @param {string} eventId - ID de l'événement
 * @param {Array<string>} guestIds - Liste d'IDs d'invités ou d'invitations (optionnel, si vide envoie à tous)
 * @param {Array<string>} channels - Canaux d'envoi (['email', 'whatsapp'])
 */
async function sendMultiChannelInvitations(eventId, guestIds = [], channels = ['email', 'whatsapp']) {
  try {
    if (!eventId) {
      return { success: false, message: 'ID d\'événement manquant' };
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
      return { success: false, message: 'Événement introuvable' };
    }

    // 1. Récupérer tous les invités de la collection Invites pour cet événement
    const allGuests = await Invites.find({ idEvent: eventId });

    if (!allGuests || allGuests.length === 0) {
      return { 
        success: false, 
        message: 'Aucun invité trouvé pour cet événement. Veuillez d\'abord ajouter des invités.' 
      };
    }

    // 2. Filtrer les invités cibles (Tous les invités si guestIds est vide)
    let targetGuests = allGuests;
    if (Array.isArray(guestIds) && guestIds.length > 0) {
      const idSet = new Set(guestIds.map(id => id.toString()));
      targetGuests = allGuests.filter(g => idSet.has(g._id.toString()) || idSet.has(g.id?.toString()));
      // Si le filtre par id d'invité n'a rien trouvé, chercher si ce sont des id d'invitations
      if (targetGuests.length === 0) {
        const matchingInvs = await invitationModel.find({ _id: { $in: guestIds }, eventId });
        const inviteIds = new Set(matchingInvs.map(inv => inv.inviteId?.toString()));
        targetGuests = allGuests.filter(g => inviteIds.has(g._id.toString()));
      }
    }

    if (targetGuests.length === 0) {
      targetGuests = allGuests; // Par défaut, envoyer à tous les invités
    }

    // 3. S'assurer que chaque invité ciblé possède un QR code et une invitation en base
    const invitationsToSend = [];

    for (const guest of targetGuests) {
      let invDoc = await invitationModel.findOne({ eventId, inviteId: guest._id });

      const emailVal = (guest.email || 'guest@arshievent.com').trim().toLowerCase();
      const phoneVal = (guest.telephone || '').trim();
      const guestStatusVal = ((guest.status || '').toLowerCase() === 'vip') ? 'vip' : 'classique';

      // Générer et héberger le QR code sur Cloudinary
      let qrCodeUrl = null;
      try {
        const qrRes = await generateAndUploadQRCode(guest, eventId);
        qrCodeUrl = qrRes.secureUrl;
      } catch (err) {
        console.warn(`Erreur génération Cloudinary QR pour invité ${guest._id}:`, err.message);
      }

      if (!invDoc) {
        invDoc = new invitationModel({
          eventId,
          inviteId: guest._id,
          prenom: guest.prenom || 'Invité',
          nom: guest.nom || 'Participant',
          inviteeEmail: emailVal,
          invitePhone: phoneVal,
          status: 'en attente',
          guestStatus: guestStatusVal,
          message: 'Invitation officielle pour votre événement',
          qrCodeImage: qrCodeUrl,
          rsvpToken: crypto.randomBytes(24).toString('hex'),
          token: new mongoose.Types.ObjectId().toString(),
        });
        await invDoc.save();
      } else {
        invDoc.nom = guest.nom || invDoc.nom;
        invDoc.prenom = guest.prenom || invDoc.prenom;
        invDoc.inviteeEmail = emailVal;
        invDoc.invitePhone = phoneVal;
        invDoc.guestStatus = guestStatusVal;
        if (qrCodeUrl) {
          invDoc.qrCodeImage = qrCodeUrl;
        }
        if (!invDoc.rsvpToken) {
          invDoc.rsvpToken = crypto.randomBytes(24).toString('hex');
        }
        await invDoc.save();
      }

      invitationsToSend.push(invDoc);
    }

    // 4. Envoi multi-canal à tous les destinataires préparés
    const outcomes = [];
    let successCount = 0;
    let failureCount = 0;

    for (const invite of invitationsToSend) {
      const results = {};

      if (channels.includes('email')) {
        try {
          const qr = invite.qrCodeImage || null;
          const ticket = invite.billetImage || invite.ticketImage || null;
          const emailRes = await sendEmailViaBrevo(invite, event, qr, ticket);
          if (emailRes.success) {
            invite.emailSent = true;
            invite.emailSentAt = new Date();
            results.email = { success: true, data: emailRes.data };
          } else {
            results.email = { success: false, error: emailRes.error };
          }
        } catch (err) {
          results.email = { success: false, error: err.message || err };
        }
      }

      if (channels.includes('whatsapp')) {
        try {
          const waRes = await sendWhatsApp(invite, event);
          if (waRes.success) {
            invite.whatsappSent = true;
            invite.whatsappSentAt = new Date();
            results.whatsapp = { success: true, data: waRes.data };
          } else {
            results.whatsapp = { success: false, error: waRes.error };
          }
        } catch (err) {
          results.whatsapp = { success: false, error: err.message || err };
        }
      }

      await invite.save();

      const hasSuccess = (results.email?.success || results.whatsapp?.success);
      if (hasSuccess) {
        successCount++;
      } else {
        failureCount++;
      }

      outcomes.push({
        invitationId: invite._id,
        inviteId: invite.inviteId,
        recipient: `${invite.prenom} ${invite.nom}`,
        email: invite.inviteeEmail,
        phone: invite.invitePhone,
        results
      });
    }

    // Extraction du premier message d'erreur si échec
    let firstError = null;
    if (failureCount > 0) {
      for (const outcome of outcomes) {
        if (outcome.results?.email?.error) {
          firstError = typeof outcome.results.email.error === 'object' 
            ? (outcome.results.email.error.message || JSON.stringify(outcome.results.email.error))
            : outcome.results.email.error;
          break;
        }
        if (outcome.results?.whatsapp?.error) {
          firstError = typeof outcome.results.whatsapp.error === 'object'
            ? (outcome.results.whatsapp.error.message || JSON.stringify(outcome.results.whatsapp.error))
            : outcome.results.whatsapp.error;
          break;
        }
      }
    }

    if (successCount === 0 && failureCount > 0) {
      return {
        success: false,
        message: firstError ? `Échec d'envoi : ${firstError}` : "Aucune invitation n'a pu être envoyée.",
        error: firstError,
        total: invitationsToSend.length,
        sentCount: successCount,
        failedCount: failureCount,
        outcomes
      };
    }

    if (failureCount > 0 && successCount > 0) {
      return {
        success: true,
        partial: true,
        message: `Envoi partiel : ${successCount} invitation(s) envoyée(s), ${failureCount} échec(s).`,
        total: invitationsToSend.length,
        sentCount: successCount,
        failedCount: failureCount,
        outcomes
      };
    }

    return {
      success: true,
      message: `${successCount} invitation(s) envoyée(s) automatiquement avec succès à tous les invités !`,
      total: invitationsToSend.length,
      sentCount: successCount,
      failedCount: failureCount,
      outcomes
    };
  } catch (error) {
    console.error('invitationService.sendMultiChannelInvitations error:', error);
    return { 
      success: false, 
      message: error.message || 'Erreur interne lors de l\'envoi des invitations.',
      error: error.message || error 
    };
  }
}

module.exports = {
  sendInvitation,
  sendInvitationsBatch,
  sendMultiChannelInvitations
};
