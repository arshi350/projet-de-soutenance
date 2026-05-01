
const QRCode = require('qrcode');
const QRCodeModel = require('../../models/invitesModel/qrcode');
const invitesModel = require('../../models/invitesModel/invites');
const { eventModel } = require('../../models/eventModels/event');

//generer les qrcode pour tous les invite
const generateQrCode = async (req, res) => {
    try {
        const { eventId } = req.params;
        
        // Vérifier si l'événement existe
        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }
        
        // Récupérer tous les invités de cet événement
        const invites = await invitesModel.find({ idEvent: eventId });
        
        if (!invites || invites.length === 0) {
            return res.status(404).json({ 
                message: "Aucun invité trouvé pour cet événement" 
            });
        }
        
        const generatedQRCodes = [];
        const errors = [];
        
        // Parcourir chaque invité et générer son QR code
        for (const invite of invites) {
            try {
                // Vérifier si un QR code existe déjà pour cet invité
                const existingQR = await QRCodeModel.findOne({ inviteId: invite._id });
                
                if (existingQR) {
                    // Option 1: Ignorer et passer
                    generatedQRCodes.push({
                        inviteId: invite._id,
                        status: 'already_exists',
                        qrCode: existingQR
                    });
                    continue;
                    
                    // Option 2: Mettre à jour l'existant
                    // const updatedQR = await updateQRCodeForInvite(invite);
                }
                
                // Générer le contenu du QR code
                const content = JSON.stringify({
                    _id: invite._id,
                    nom: invite.nom,
                    prenom: invite.prenom,
                    telephone: invite.telephone,
                    email: invite.email,
                    status: invite.status,
                    idEvent: invite.idEvent,
                    eventName: event.nom || event.name,
                    eventDate: event.date
                });
                

                // Générer le QR code en buffer PNG (binaire)
                const qrCodeBuffer = await QRCode.toBuffer(content, {
                    type: 'png',
                    width: 300,
                    margin: 2,
                    errorCorrectionLevel: 'M'
                });
                // Générer aussi la dataURL pour affichage rapide (optionnel)
                const qrCodeDataUrl = await QRCode.toDataURL(content, {
                    width: 300,
                    margin: 2,
                    errorCorrectionLevel: 'M'
                });

                // Sauvegarder dans la base
                const newQRCode = new QRCodeModel({
                    inviteId: invite._id,
                    eventId: eventId,
                    qrCodeData: qrCodeBuffer,
                    qrCodeDataUrl: qrCodeDataUrl,
                    content: content,
                    generatedAt: new Date()
                });

                const savedQRCode = await newQRCode.save();

                generatedQRCodes.push({
                    inviteId: invite._id,
                    eventId: eventId,
                    inviteName: `${invite.prenom} ${invite.nom}`,
                    status: 'success',
                    qrCode: savedQRCode
                });
                
            } catch (error) {
                console.error(`Erreur pour l'invité ${invite._id}:`, error);
                errors.push({
                    inviteId: invite._id,
                    error: error.message
                });
            }
        }
        
        res.status(200).json({
            message: `Génération terminée: ${generatedQRCodes.length} QR codes créés`,
            totalInvites: invites.length,
            successful: generatedQRCodes.filter(q => q.status === 'success').length,
            alreadyExisting: generatedQRCodes.filter(q => q.status === 'already_exists').length,
            errors: errors,
            qrCodes: generatedQRCodes
        });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ 
            message: "Erreur lors de la génération des QR codes", 
            error: error.message 
        });
    }
};


// Récupérer tous les QR codes d'un événement (JSON)
const getQrcode = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({ message: "L'ID de l'événement est requis" });
        }

        // Récupérer tous les QR codes liés aux invités de cet événement
        const invites = await invitesModel.find({ idEvent: eventId }, '_id prenom nom');
        if (!invites || invites.length === 0) {
            return res.status(404).json({ message: "Aucun invité trouvé pour cet événement" });
        }
        const inviteIds = invites.map(invite => invite._id);

        // Récupérer tous les QR codes associés à ces invités
        const qrCodes = await QRCodeModel.find({ inviteId: { $in: inviteIds } });

        // Optionnel : joindre les infos de l'invité à chaque QR code
        const qrCodesWithInvite = qrCodes.map(qr => {
            const invite = invites.find(i => i._id.equals(qr.inviteId));
            return {
                ...qr.toObject(),
                invite: invite ? { _id: invite._id, nom: invite.nom, prenom: invite.prenom } : null
            };
        });

        res.status(200).json({
            eventId,
            total: qrCodesWithInvite.length,
            qrCodes: qrCodesWithInvite
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la récupération des QR codes", error: error.message });
    }
};

// Récupérer l'image PNG d'un QR code à partir de l'inviteId
const getQrcodeImage = async (req, res) => {
    try {
        const { inviteId } = req.params;
        if (!inviteId) {
            return res.status(400).json({ message: "L'ID de l'invité est requis" });
        }
        const qrCode = await QRCodeModel.findOne({ inviteId });
        if (!qrCode || !qrCode.qrCodeData) {
            return res.status(404).json({ message: "QR code non trouvé pour cet invité" });
        }
        res.set('Content-Type', 'image/png');
        res.send(qrCode.qrCodeData);
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la récupération de l'image du QR code", error: error.message });
    }
};


// Récupérer les images PNG des QR codes de tous les invités d'un événement
const getAllQrcodeImages = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId) {
            return res.status(400).json({ message: "L'ID de l'événement est requis" });
        }

        // Récupérer tous les invités de l'événement
        const invites = await invitesModel.find({ idEvent: eventId }, '_id nom prenom');
        if (!invites || invites.length === 0) {
            return res.status(404).json({ message: "Aucun invité trouvé pour cet événement" });
        }
        const inviteIds = invites.map(invite => invite._id);

        // Récupérer tous les QR codes associés à ces invités
        const qrCodes = await QRCodeModel.find({ inviteId: { $in: inviteIds } });

        // Préparer la liste des images
        const images = invites.map(invite => {
            const qr = qrCodes.find(q => q.inviteId.equals(invite._id));
            return {
                inviteId: invite._id,
                nom: invite.nom,
                prenom: invite.prenom,
                image: qr && qr.qrCodeData ? qr.qrCodeData.toString('base64') : null // Encodé en base64 pour le transport JSON
            };
        });

        res.status(200).json({
            eventId,
            total: images.length,
            images
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la récupération des images des QR codes", error: error.message });
    }
};

module.exports = { generateQrCode, getQrcode, getQrcodeImage, getAllQrcodeImages };