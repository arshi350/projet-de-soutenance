const { invitationModel } = require('../../models/invitation/invitation');
const { eventModel } = require('../../models/eventModels/event');
const invitesModel = require('../../models/invitesModel/invites');

/**
 * Récupérer les détails d'une invitation via son token public RSVP
 * GET /api/rsvp/:token
 */
const getGuestRsvpDetails = async (req, res) => {
  try {
    const { token } = req.params;
    if (!token) {
      return res.status(400).json({ success: false, message: 'Token RSVP manquant' });
    }

    const invitation = await invitationModel.findOne({
      $or: [{ rsvpToken: token }, { qrDataToken: token }, { _id: token.match(/^[0-9a-fA-F]{24}$/) ? token : null }],
    });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation introuvable ou lien expiré' });
    }

    const event = await eventModel.findById(invitation.eventId);

    return res.status(200).json({
      success: true,
      invitation: {
        _id: invitation._id,
        nom: invitation.nom,
        prenom: invitation.prenom,
        inviteeEmail: invitation.inviteeEmail,
        guestStatus: invitation.guestStatus,
        status: invitation.status,
        rsvpStatus: invitation.rsvpStatus,
        isRevoked: invitation.isRevoked,
        qrCodeImage: invitation.qrCodeImage,
        finalInvitationUrl: invitation.finalInvitationUrl,
        message: invitation.message,
      },
      event: event ? {
        _id: event._id,
        titre: event.titre,
        lieu: event.lieu,
        DateDebut: event.DateDebut,
        heureDebut: event.heureDebut,
        description: event.description,
        categorie: event.categorie,
      } : null,
    });
  } catch (error) {
    console.error('Erreur getGuestRsvpDetails:', error);
    return res.status(500).json({ success: false, message: 'Erreur serveur', error: error.message });
  }
};

/**
 * Confirmer sa présence à l'événement
 * POST /api/rsvp/:token/confirm
 */
const confirmGuestPresence = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await invitationModel.findOne({
      $or: [{ rsvpToken: token }, { qrDataToken: token }, { _id: token.match(/^[0-9a-fA-F]{24}$/) ? token : null }],
    });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation introuvable' });
    }

    invitation.rsvpStatus = 'confirmé';
    invitation.status = 'confirmé';
    invitation.isRevoked = false;
    invitation.rsvpUpdatedAt = new Date();
    await invitation.save();

    // Mettre également à jour la collection Invites parente
    if (invitation.inviteId) {
      await invitesModel.findByIdAndUpdate(invitation.inviteId, {
        status: 'confirmé',
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Votre présence a été confirmée avec succès ! Vos rappels automatiques sont activés.',
      invitation,
    });
  } catch (error) {
    console.error('Erreur confirmGuestPresence:', error);
    return res.status(500).json({ success: false, message: 'Erreur lors de la confirmation', error: error.message });
  }
};

/**
 * Signaler son absence à l'événement et INVALIDER le QR Code
 * POST /api/rsvp/:token/decline
 */
const declineGuestPresence = async (req, res) => {
  try {
    const { token } = req.params;
    const invitation = await invitationModel.findOne({
      $or: [{ rsvpToken: token }, { qrDataToken: token }, { _id: token.match(/^[0-9a-fA-F]{24}$/) ? token : null }],
    });

    if (!invitation) {
      return res.status(404).json({ success: false, message: 'Invitation introuvable' });
    }

    // INVALIDATION IMMÉDIATE DU QR CODE
    invitation.rsvpStatus = 'refusé';
    invitation.status = 'refusé';
    invitation.isRevoked = true;
    invitation.revokedAt = new Date();
    invitation.revocationReason = "Absence signalée par l'invité via son lien RSVP personnel";
    invitation.rsvpUpdatedAt = new Date();
    await invitation.save();

    // Mettre à jour la collection Invites
    if (invitation.inviteId) {
      await invitesModel.findByIdAndUpdate(invitation.inviteId, {
        status: 'refusé',
        isPresent: false,
      });
    }

    return res.status(200).json({
      success: true,
      message: 'Votre absence a bien été enregistrée. Votre QR code d\'accès a été révoqué et ne pourra plus être scanné.',
      invitation,
    });
  } catch (error) {
    console.error('Erreur declineGuestPresence:', error);
    return res.status(500).json({ success: false, message: "Erreur lors de l'enregistrement du refus", error: error.message });
  }
};

module.exports = {
  getGuestRsvpDetails,
  confirmGuestPresence,
  declineGuestPresence,
};
