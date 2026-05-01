
const { invitationModel } = require('../../models/invitation/invitation')
const {eventModel} = require('../../models/eventModels/event')
const invitesModel = require('../../models/invitesModel/invites')


// Créer automatiquement les invitations pour tous les invités d'un événement spécifique
const createInvitations = async (req, res) => {
    const { eventId } = req.params;
    const {message} = req.body
    try {
        // Vérifier que l'événement existe
        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        // Récupérer tous les invités liés à cet événement
        const invites = await invitesModel.find({ idEvent: eventId });
        if (!invites || invites.length === 0) {
            return res.status(404).json({ message: "Aucun invité trouvé pour cet événement" });
        }

        // Récupérer tous les QR codes associés à ces invités
        const QRCodeModel = require('../../models/invitesModel/qrcode');
        const qrCodes = await QRCodeModel.find({ inviteId: { $in: invites.map(i => i._id) } });

        // Générer les invitations pour chaque invité avec image QR code
        const invitations = invites.map(invite => {
            const qr = qrCodes.find(q => q.inviteId.equals(invite._id));
            return {
                eventId: eventId,
                inviteId: invite._id,
                inviteeEmail: invite.email,
                invitePhone: invite.telephone,
                message: message || `Vous êtes invité à l'événement ${event.titre}`,
                qrCodeImage: qr && qr.qrCodeData ? qr.qrCodeData.toString('base64') : null
            };
        });

        // Sauvegarder les invitations dans la base de données
        const createdInvitations = await invitationModel.insertMany(invitations);
        return res.status(201).json({ message: "Invitations créées avec succès", invitations: createdInvitations });
    } catch (error) {
        console.error("Erreur lors de la création des invitations :", error);
        return res.status(500).json({ message: "Erreur lors de la création des invitations", error });
    }
}

module.exports = {
    createInvitations,
}