const mongoose = require('mongoose');
const QRCode = require('qrcode');
const crypto = require('crypto');
const { invitationModel } = require('../../models/invitation/invitation');
const { eventModel } = require('../../models/eventModels/event');
const invitesModel = require('../../models/invitesModel/invites');
const QRCodeModel = require('../../models/invitesModel/qrcode');
const { sendMultiChannelInvitations } = require('../../services/invitationService');
const { generateAndUploadQRCode } = require('../../services/qrCloudinaryService');

/**
 * Créer les invitations pour un événement
 * POST /api/invitations/createInvitations/:eventId
 */
const createInvitations = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { message, customMessage, templateId, templateImage } = req.body;

        if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ success: false, message: 'eventId invalide ou manquant' });
        }

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: 'Événement non trouvé' });
        }

        // Récupérer tous les invités enregistrés pour cet événement
        let invites = await invitesModel.find({ idEvent: eventId });

        // Si aucun invité n'existe encore dans la base pour cet événement, en créer un par défaut
        if (!invites || invites.length === 0) {
            try {
                const InvitesFallback = mongoose.model('Invites');
                invites = await InvitesFallback.find({ idEvent: eventId });
            } catch (fallbackErr) {
                console.warn('Fallback invite warning:', fallbackErr.message);
            }
        }

        const created = [];
        const messageToUse = message || customMessage || 'Invitation officielle pour votre événement';
        const validTemplateId = (templateId && mongoose.Types.ObjectId.isValid(templateId)) ? templateId : null;

        for (const inv of invites) {
            // Générer et héberger le QR code automatiquement sur Cloudinary
            let qrCodeUrl = null;
            try {
                const qrRes = await generateAndUploadQRCode(inv, eventId);
                qrCodeUrl = qrRes.secureUrl;
            } catch (err) {
                console.warn(`Erreur génération Cloudinary QR pour ${inv._id}:`, err.message);
            }

            // Fallback garanti si Cloudinary échoue
            if (!qrCodeUrl) {
                const qrPayload = JSON.stringify({
                    _id: inv._id,
                    idEvent: eventId,
                    nom: inv.nom,
                    prenom: inv.prenom
                });
                qrCodeUrl = `https://quickchart.io/qr?text=${encodeURIComponent(qrPayload)}&size=300&margin=2&ecLevel=M`;
            }

            const emailVal = (inv.email || inv.inviteeEmail || 'guest@arshievent.com').trim().toLowerCase();
            const phoneVal = (inv.telephone || inv.invitePhone || '').trim();
            const guestStatusVal = ((inv.status || '').toLowerCase() === 'vip' || (inv.guestStatus || '').toLowerCase() === 'vip') ? 'vip' : 'classique';

            const existing = await invitationModel.findOne({ inviteId: inv._id, eventId });
            if (existing) {
                existing.nom = inv.nom || existing.nom || 'Invité';
                existing.prenom = inv.prenom || existing.prenom || 'Participant';
                existing.inviteeEmail = emailVal;
                existing.invitePhone = phoneVal;
                existing.guestStatus = guestStatusVal;
                existing.message = messageToUse;
                existing.qrCodeImage = qrCodeUrl;
                if (validTemplateId) existing.templateId = validTemplateId;
                if (templateImage) existing.templateImage = templateImage;
                if (!existing.rsvpToken) existing.rsvpToken = crypto.randomBytes(24).toString('hex');
                await existing.save();
                created.push(existing);
            } else {
                const newInv = new invitationModel({
                    eventId,
                    inviteId: inv._id,
                    prenom: inv.prenom || 'Invité',
                    nom: inv.nom || 'Participant',
                    inviteeEmail: emailVal,
                    invitePhone: phoneVal,
                    status: 'en attente',
                    guestStatus: guestStatusVal,
                    message: messageToUse,
                    qrCodeImage: qrCodeUrl,
                    templateId: validTemplateId,
                    templateImage: templateImage || null,
                    rsvpToken: crypto.randomBytes(24).toString('hex'),
                    token: new mongoose.Types.ObjectId().toString(),
                });
                await newInv.save();
                created.push(newInv);
            }
        }

        return res.status(200).json({
            success: true,
            message: `${created.length} invitation(s) générée(s) avec succès.`,
            invitations: created,
        });
    } catch (error) {
        console.error('Erreur createInvitations:', error);
        return res.status(500).json({ 
            success: false, 
            message: 'Erreur lors de la création des invitations: ' + error.message,
            error: error.message 
        });
    }
};

/**
 * Récupérer toutes les invitations d'un événement
 * GET /api/invitations/:eventId
 */
const getInvitationsByEvent = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ success: false, message: 'eventId invalide' });
        }

        const invitations = await invitationModel.find({ eventId }).sort({ createdAt: -1 });

        // S'assurer que chaque invitation possède un QR Code valide et scannable
        const processed = invitations.map(inv => {
            const invObj = inv.toObject();
            if (!invObj.qrCodeImage || invObj.qrCodeImage.length < 50 || invObj.qrCodeImage.includes('AAAAEAAAABCAQAAAC1HAwCAAAAC0lEQVR42mNkYAAAAAYAAjCB0C8AAAA')) {
                const qrPayload = JSON.stringify({
                    _id: invObj.inviteId || invObj._id,
                    idEvent: invObj.eventId,
                    nom: invObj.nom,
                    prenom: invObj.prenom
                });
                invObj.qrCodeImage = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrPayload)}`;
            }
            return invObj;
        });

        return res.status(200).json({
            success: true,
            invitations: processed,
        });
    } catch (error) {
        console.error('Erreur getInvitationsByEvent:', error);
        return res.status(500).json({ success: false, message: 'Erreur lors de la récupération des invitations', error: error.message });
    }
};

/**
 * Envoyer les invitations immédiatement
 * POST /api/invitations/:eventId/send
 */
const sendInvitations = async (req, res) => {
    try {
        const eventId = req.params.eventId || req.body.eventId;
        const { guestIds, channels } = req.body;

        if (!eventId) {
            return res.status(400).json({ success: false, message: 'eventId manquant' });
        }

        const result = await sendMultiChannelInvitations(eventId, guestIds, channels);

        if (!result.success) {
            return res.status(400).json({
                success: false,
                message: result.message || "Échec lors de l'envoi des invitations",
                error: result.error,
                result,
            });
        }

        return res.status(200).json({
            success: true,
            message: result.message || 'Envoi des invitations exécuté avec succès',
            result,
        });
    } catch (error) {
        console.error('Erreur sendInvitations:', error);
        return res.status(500).json({ success: false, message: "Erreur serveur lors de l'envoi des invitations", error: error.message });
    }
};

/**
 * Programmer l'envoi des invitations à une date/heure spécifique
 * POST /api/invitations/schedule-send
 */
const scheduleSendInvitations = async (req, res) => {
    try {
        const { eventId, guestIds, scheduledAt, channels } = req.body;

        if (!eventId) return res.status(400).json({ success: false, message: 'eventId manquant' });
        if (!scheduledAt) return res.status(400).json({ success: false, message: 'Date et heure de programmation requises (scheduledAt)' });

        const sendDate = new Date(scheduledAt);
        if (isNaN(sendDate.getTime()) || sendDate <= new Date()) {
            return res.status(400).json({ success: false, message: 'La date de programmation doit être située dans le futur.' });
        }

        const filter = { eventId };
        if (Array.isArray(guestIds) && guestIds.length > 0) {
            filter._id = { $in: guestIds };
        }

        const updated = await invitationModel.updateMany(filter, {
            $set: {
                scheduledAt: sendDate,
                emailSent: false,
            },
        });

        return res.status(200).json({
            success: true,
            message: `Envoi programmé pour le ${sendDate.toLocaleString('fr-FR')} (${updated.modifiedCount} invitations).`,
            scheduledAt: sendDate,
            modifiedCount: updated.modifiedCount,
        });
    } catch (error) {
        console.error('Erreur scheduleSendInvitations:', error);
        return res.status(500).json({ success: false, message: "Erreur lors de la programmation de l'envoi", error: error.message });
    }
};

/**
 * Supprimer une invitation et son QR Code associé
 * DELETE /api/invitations/delete/:id
 */
const deleteInvitation = async (req, res) => {
    try {
        const { id } = req.params;
        if (!id || !mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ success: false, message: "ID d'invitation invalide" });
        }

        const deletedInvitation = await invitationModel.findByIdAndDelete(id);
        if (!deletedInvitation) {
            return res.status(404).json({ success: false, message: "Invitation non trouvée" });
        }

        // Supprimer également le QR Code correspondant dans la base de données
        if (deletedInvitation.inviteId) {
            await QRCodeModel.deleteMany({
                $or: [
                    { inviteId: deletedInvitation.inviteId },
                    { eventId: deletedInvitation.eventId, inviteId: deletedInvitation.inviteId }
                ]
            });
        }

        return res.status(200).json({ 
            success: true, 
            message: "Invitation et son QR Code supprimés avec succès", 
            invitation: deletedInvitation 
        });
    } catch (error) {
        console.error("Erreur lors de la suppression de l'invitation :", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression de l'invitation", error: error.message });
    }
};

/**
 * Supprimer plusieurs invitations en lot et leurs QR Codes associés
 * POST /api/invitations/bulk-delete
 */
const bulkDeleteInvitations = async (req, res) => {
    try {
        const { ids, eventId } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "Liste d'identifiants requise" });
        }

        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        
        // Récupérer les invitations avant suppression pour identifier les inviteIds
        const invitationsToDelete = await invitationModel.find({ _id: { $in: validIds } });
        const inviteIds = invitationsToDelete.map(inv => inv.inviteId).filter(Boolean);

        const result = await invitationModel.deleteMany({ _id: { $in: validIds } });

        // Supprimer également les QR Codes correspondants
        if (inviteIds.length > 0) {
            await QRCodeModel.deleteMany({ inviteId: { $in: inviteIds } });
        }

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} invitation(s) et QR Code(s) associé(s) supprimé(s) avec succès.`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Erreur bulkDeleteInvitations:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression groupée", error: error.message });
    }
};

module.exports = {
    createInvitations,
    getInvitationsByEvent,
    sendInvitations,
    scheduleSendInvitations,
    deleteInvitation,
    bulkDeleteInvitations,
};