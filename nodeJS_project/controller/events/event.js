const { eventModel } = require("../../models/eventModels/event");
const { userModel } = require("../../models/user");
const { invitationModel } = require("../../models/invitation/invitation");
const Invites = require("../../models/invitesModel/invites");
const PurchasedTicket = require("../../models/purchasedTicket/purchasedTicket");
const { createNotification } = require('../../services/notificationService');
const { deleteEventCascade } = require('../../services/cascadeDeleteService');
const mongoose = require('mongoose')
const path = require('path');

const AddEvent = async (req, res) => {
    try {
       
        // Les champs texte sont dans req.body
        const { 
            titre, 
            description, 
            DateDebut, 
            DateFin, 
            heureDebut, 
            heureFin, 
            lieu, 
            categorie, 
            userId,
            eventType = 'private',
            maxCapacity = 50,
            channel = 'email',
            publicFeeBearer = 'buyer'
        } = req.body;
        
        // L'image est dans req.file
        let imageFilename = null;
        if (req.file) {
            // Stocker uniquement le nom de fichier (sécurisé et simple)
            imageFilename = req.file.filename;
        } else {
            console.log('⚠️ Aucune image reçue');
        }

        // Vérification des champs obligatoires
        if (!titre || !description || !DateDebut || !DateFin || !heureDebut || !heureFin || !lieu || !categorie) {
            return res.status(400).json({ message: "Tous les champs sont obligatoires" });
        }

        // Validation des dates
        const startDateTime = new Date(`${DateDebut}T${heureDebut}`);
        const endDateTime = new Date(`${DateFin}T${heureFin}`);
        
        if (endDateTime <= startDateTime) {
            return res.status(400).json({ message: "La date de fin doit être postérieure à la date de début" });
        }

        // Générer un code unique à 8 caractères
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let EventCode = '';
        for (let i = 0; i < 8; i++) {
            EventCode += characters.charAt(Math.floor(Math.random() * characters.length));
        }

        const pricingService = require('../../services/pricingService');
        let quote = null;
        if (eventType === 'public') {
            quote = pricingService.calculatePublicActivationFee({
                startDate: DateDebut,
                endDate: DateFin,
                maxCapacity: parseInt(maxCapacity, 10) || 200
            });
        } else {
            quote = pricingService.calculatePrivateEventPrice({
                startDate: DateDebut,
                endDate: DateFin,
                guestCount: parseInt(maxCapacity, 10) || 50,
                channel
            });
        }
        
        // Création de l'événement
        const NewEvent = new eventModel({
            titre,
            description,
            DateDebut,
            DateFin,
            heureDebut,
            heureFin,
            lieu,
            categorie,
            image: imageFilename,
            userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
            EventCode: EventCode,
            eventType: eventType || 'private',
            pricing: {
                maxCapacity: parseInt(maxCapacity, 10) || (eventType === 'public' ? 200 : 50),
                channel: channel || 'email',
                totalPaid: 0,
                isActivated: false,
                publicFeeBearer: publicFeeBearer || 'buyer',
                feeStructure: {
                    durationDays: quote.durationDays,
                    baseFee: quote.baseFee,
                    channelCost: quote.channelCost || quote.capacityFee || 0,
                    calculatedTotal: quote.total
                }
            }
        });

        const result = await NewEvent.save();
        try {
            await createNotification({
                userId: result.userId,
                title: 'Événement créé',
                message: `Votre événement "${result.titre}" a été créé avec succès.`,
                type: 'event',
                referenceId: result._id,
                referenceType: 'event'
            });
        } catch (notifError) {
            console.warn('Notification non créée pour la création d événement :', notifError.message);
        }
        
        res.status(201).json({ 
            message: "Événement créé avec succès", 
            event: result 
        });

    } catch (error) {
        console.error('❌ Erreur:', error);
        res.status(500).json({ 
            message: "Erreur lors de la création de l'événement", 
            error: error.message 
        });
    }
};

 // Récupère tous les événements liés à un utilisateur donné
const getAllEventByUser = async (req, res) => {
    try {
        const userId = req.params.id;
        // Vérification de la validité de l'ID utilisateur
        if (!mongoose.Types.ObjectId.isValid(userId)) {
            return res.status(400).json({ 
                message: 'ID utilisateur invalide' 
            });
        }
        // Recherche des événements liés à l'utilisateur par ordre decroissant
        const events = await eventModel.find({ userId: new mongoose.Types.ObjectId(userId) }).sort({ date: -1 });

        // Si aucun événement trouvé
        if (!events || events.length === 0) {
            return res.status(200).json({ 
                message: 'Aucun événement trouvé pour cet utilisateur', 
                events: []
            });
        }

        const eventsWithStats = await Promise.all(
            events.map(async (event) => {
                const evObj = event.toObject ? event.toObject() : { ...event };
                try {
                    let total = 0;
                    let scanned = 0;

                    if (evObj.eventType === 'public') {
                        [total, scanned] = await Promise.all([
                            PurchasedTicket.countDocuments({ eventId: event._id, status: { $ne: 'cancelled' } }),
                            PurchasedTicket.countDocuments({ eventId: event._id, status: 'scanned' })
                        ]);
                    } else {
                        const [invsTotal, invsScanned, docsTotal, docsScanned] = await Promise.all([
                            Invites.countDocuments({ idEvent: event._id }),
                            Invites.countDocuments({ idEvent: event._id, $or: [{ isPresent: true }, { isScanned: true }] }),
                            invitationModel.countDocuments({ eventId: event._id }),
                            invitationModel.countDocuments({ eventId: event._id, $or: [{ isPresent: true }, { isScanned: true }] })
                        ]);
                        total = Math.max(invsTotal, docsTotal);
                        scanned = Math.max(invsScanned, docsScanned);
                    }

                    evObj.totalGuests = total;
                    evObj.totalInvites = total;
                    evObj.scannedGuests = scanned;
                    evObj.scanned = scanned;
                } catch (e) {
                    console.warn(`Erreur stats event ${event._id}:`, e.message);
                }
                return evObj;
            })
        );

        // Succès : événements trouvés avec stats réelles
        return res.status(200).json({ 
            message: "Événements récupérés avec succès", 
            count: eventsWithStats.length,
            events: eventsWithStats 
        });

    } catch (error) {
        console.log(error);
        // Gestion des erreurs serveur
        return res.status(500).json({ 
            message: "Erreur serveur lors de la récupération des événements",
            error: error.message 
        });
    }
};

//supprimer un evenements de la base de donnee avec suppression en cascade
const deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;

        //verification de la validite de l'id de l'evenement
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({ message: "id de l'evenement invalide" });
        }

        // Suppression en cascade complète (invités, QR codes, agents, billets, feedbacks, etc.)
        const cascadeResult = await deleteEventCascade(id);
        if (!cascadeResult.success && cascadeResult.notFound) {
            return res.status(404).json({ message: "evenement non trouvé" });
        }

        return res.status(200).json({
            message: "evenement et toutes ses données associées supprimés avec succès",
            event: { _id: id, titre: cascadeResult.eventTitle },
            deletedDetails: cascadeResult.deletedCounts
        });
        
    } catch (error) {
        console.error("Erreur lors de la suppression en cascade de l'événement:", error);
        res.status(500).json({ message: "Erreur lors de la suppression de l'événement", error: error.message });
    }
}

//mettre a jour un evenement de la base de donnee
const updateEvent = async (req, res) => {
    try {
        let { Ntitre, Ndescription, NDateDebut, NDateFin, NheureDebut, NheureFin, Nlieu, Ncategorie } = req.body;
        const id = req.params.id;

        //met a jour l'evenement dans la bd
        const event = await eventModel.findByIdAndUpdate(id, {
            titre: Ntitre,
            description: Ndescription,
            DateDebut: NDateDebut,
            DateFin: NDateFin,
            heureDebut: NheureDebut,
            heureFin: NheureFin,
            lieu: Nlieu,
            categorie: Ncategorie
        }, { new: true, runValidators: true });

        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        try {
            await createNotification({
                userId: event.userId,
                title: 'Événement mis à jour',
                message: `Votre événement "${event.titre}" a été mis à jour.`,
                type: 'event',
                referenceId: event._id,
                referenceType: 'event'
            });
        } catch (notifError) {
            console.warn('Notification non créée pour la mise à jour d événement :', notifError.message);
        }

        return res.status(200).json({ message: "evenement mis a jour avec succes", event });
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'événement", error: error.message });
    }
}

// Récupérer un événement par son ID
const getEventById = async (req, res) => {
    try {
        const id = req.params.id;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID d'événement invalide" });
        }

        const event = await eventModel.findById(id);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        return res.status(200).json({ message: "Événement récupéré avec succès", event });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur serveur lors de la récupération de l'événement", error: error.message });
    }
};

//recuperer tous les evenement recement creer par un utilisateur
const getRecentEventsByUser = async (req, res) => {
    try {
        const id = req.params.id; // id est maintenant une string

        //verification de la validite de l'id utilisateur
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "id utilisateur invalide"})
        }

        //recherche de tous les evenement recement creer par un utilisateur
        const events = await eventModel.find({userId: id}).sort({createdAt: -1}).limit(4);

        return res.status(200).json({ message: "Événements récents récupérés avec succès", count: events.length, events });

    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur serveur lors de la récupération des événements récents", error: error.message });
    }
}


//recuperer tous les evenements recent de la base de donnee
const getRecentvents = async (req, res) => {
    try {
        //recuperer les 5 derniers evenements de la base de donnees avec infos organisateur
        const events = await eventModel.find().populate('userId', 'first_name last_name email').sort({ _id: -1 }).limit(5);

        const eventsWithStats = await Promise.all(
            events.map(async (event) => {
                const evObj = event.toObject ? event.toObject() : { ...event };

                // Extraire le nom de l'organisateur
                if (evObj.userId && typeof evObj.userId === 'object') {
                    const fullName = `${evObj.userId.first_name || ''} ${evObj.userId.last_name || ''}`.trim();
                    evObj.organizerName = fullName || evObj.userId.email || 'Organisateur';
                } else {
                    evObj.organizerName = 'Organisateur';
                }

                try {
                    let totalGuests = 0;
                    let presentGuests = 0;

                    if (evObj.eventType === 'public') {
                        // Billetterie publique
                        const [ticketsSold, ticketsScanned] = await Promise.all([
                            PurchasedTicket.countDocuments({ eventId: event._id, status: { $ne: 'cancelled' } }),
                            PurchasedTicket.countDocuments({ eventId: event._id, status: 'scanned' })
                        ]);
                        totalGuests = ticketsSold;
                        presentGuests = ticketsScanned;
                    } else {
                        // Événement privé (invités et invitations)
                        const [invitesCount, invitesPresent, invitationDocsCount, invitationDocsPresent] = await Promise.all([
                            Invites.countDocuments({ idEvent: event._id }),
                            Invites.countDocuments({ idEvent: event._id, isPresent: true }),
                            invitationModel.countDocuments({ eventId: event._id }),
                            invitationModel.countDocuments({ eventId: event._id, $or: [{ isPresent: true }, { isScanned: true }] })
                        ]);

                        totalGuests = Math.max(invitesCount, invitationDocsCount);
                        presentGuests = Math.max(invitesPresent, invitationDocsPresent);
                    }

                    // Repli sur les champs de l'événement si aucune liste détaillée d'invités
                    if (totalGuests === 0 && (evObj.totalInvites > 0 || evObj.confirmedInvites > 0)) {
                        totalGuests = evObj.totalInvites || evObj.confirmedInvites || 0;
                        presentGuests = evObj.attendeesCount || 0;
                    }

                    const tauxPresence = totalGuests > 0 
                        ? Math.min(100, Math.round((presentGuests / totalGuests) * 100)) 
                        : 0;

                    evObj.totalInvites = totalGuests;
                    evObj.totalGuests = totalGuests;
                    evObj.presentGuests = presentGuests;
                    evObj.attendeesCount = presentGuests;
                    evObj.tauxPresence = tauxPresence;
                } catch (statsErr) {
                    console.warn(`Erreur calcul stats invitation pour event ${event._id}:`, statsErr.message);
                    evObj.tauxPresence = 0;
                    evObj.totalGuests = evObj.totalInvites || 0;
                    evObj.presentGuests = 0;
                }
                return evObj;
            })
        );

        return res.status(200).json({ 
            message: "Événements récents récupérés avec succès", 
            count: eventsWithStats.length, 
            events: eventsWithStats 
        });
    } catch (error) {
        console.error("Erreur getRecentvents:", error);
        return res.status(500).json({ message: "erreur lors de la recuperation de l'evenement", erreur: error.message || error });
    }
};

// Calcul de devis d'événement (Tarification dynamique)
const calculateEventQuote = async (req, res) => {
    try {
        const { eventType = 'private', DateDebut, DateFin, maxCapacity, channel, publicFeeBearer } = req.body;

        const pricingService = require('../../services/pricingService');

        if (eventType === 'public') {
            const quote = pricingService.calculatePublicActivationFee({
                startDate: DateDebut,
                endDate: DateFin,
                maxCapacity: maxCapacity || 200
            });
            return res.status(200).json({ success: true, quote });
        } else {
            const quote = pricingService.calculatePrivateEventPrice({
                startDate: DateDebut,
                endDate: DateFin,
                guestCount: maxCapacity || 50,
                channel: channel || 'email'
            });
            return res.status(200).json({ success: true, quote });
        }
    } catch (error) {
        console.error('Erreur calculateEventQuote:', error);
        return res.status(500).json({ success: false, message: "Erreur lors du calcul du devis", error: error.message });
    }
};

// Activation d'un événement après paiement
const activateEvent = async (req, res) => {
    try {
        const { id } = req.params;
        const { paymentMethod = 'card' } = req.body;

        const event = await eventModel.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Événement introuvable." });
        }

        const paymentService = require('../../services/paymentService');
        const amountToPay = event.pricing?.feeStructure?.calculatedTotal || event.pricing?.totalPaid || 0;

        const paymentResult = await paymentService.processPayment({
            amount: amountToPay,
            currency: 'EUR',
            description: `Activation événement - ${event.titre}`,
            customerEmail: req.user?.email || 'organizer@event.com',
            paymentMethod
        });

        if (!paymentResult.success) {
            return res.status(400).json({ success: false, message: "Paiement refusé." });
        }

        event.pricing.isActivated = true;
        event.pricing.totalPaid = amountToPay;
        event.pricing.paidAt = new Date();
        event.status = 'en attente';
        await event.save();

        return res.status(200).json({
            success: true,
            message: "Événement activé avec succès !",
            event,
            transactionId: paymentResult.transactionId
        });
    } catch (error) {
        console.error('Erreur activateEvent:', error);
        return res.status(500).json({ success: false, message: "Erreur lors de l'activation de l'événement.", error: error.message });
    }
};

// Extension de jauge d'invités au prorata (Upgrade)
const upgradeEventQuota = async (req, res) => {
    try {
        const { id } = req.params;
        const { additionalGuests, paymentMethod = 'card' } = req.body;

        const event = await eventModel.findById(id);
        if (!event) {
            return res.status(404).json({ success: false, message: "Événement introuvable." });
        }

        const pricingService = require('../../services/pricingService');
        const upgradeCalculation = pricingService.calculateQuotaUpgrade({
            currentMaxGuests: event.pricing?.maxCapacity || 50,
            additionalGuests: additionalGuests || 20,
            channel: event.pricing?.channel || 'email'
        });

        const paymentService = require('../../services/paymentService');
        const paymentResult = await paymentService.processPayment({
            amount: upgradeCalculation.upgradeCost,
            currency: 'EUR',
            description: `Extension de jauge (+${additionalGuests} invités) - ${event.titre}`,
            customerEmail: req.user?.email || 'organizer@event.com',
            paymentMethod
        });

        if (!paymentResult.success) {
            return res.status(400).json({ success: false, message: "Paiement de l'upgrade refusé." });
        }

        event.pricing.maxCapacity = upgradeCalculation.newMaxGuests;
        event.pricing.totalPaid = (event.pricing.totalPaid || 0) + upgradeCalculation.upgradeCost;
        await event.save();

        return res.status(200).json({
            success: true,
            message: `Jauge étendue avec succès à ${upgradeCalculation.newMaxGuests} invités !`,
            newCapacity: upgradeCalculation.newMaxGuests,
            event,
            transactionId: paymentResult.transactionId
        });
    } catch (error) {
        console.error('Erreur upgradeEventQuota:', error);
        return res.status(500).json({ success: false, message: "Erreur lors de l'extension de jauge.", error: error.message });
    }
};

// Récupérer tous les événements pour l'administration
const getAllEventsForAdmin = async (req, res) => {
    try {
        const adminUser = await userModel.findById(req.userId);

        if (!adminUser || adminUser.role !== 'admin') {
            return res.status(403).json({ message: 'Accès interdit: rôle administrateur requis' });
        }

        const events = await eventModel.find().sort({ createdAt: -1 });

        return res.status(200).json({
            message: 'Événements récupérés avec succès',
            count: events.length,
            events
        });
    } catch (error) {
        console.error('Erreur lors de la récupération des événements admin :', error);
        return res.status(500).json({
            message: 'Erreur serveur lors de la récupération des événements',
            error: error.message
        });
    }
};

// Mettre à jour le statut d'un événement par l'admin (Publié, En attente, Signalé, Terminés, En cours)
const updateEventStatusForAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body;

        const event = await eventModel.findByIdAndUpdate(id, { status }, { returnDocument: 'after' });
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        // Journal d'audit
        try {
            const AuditLog = require('../../models/auditLog');
            await AuditLog.create({
                userId: req.userId,
                type: 'Événement',
                action: 'Modération Événement',
                description: `Statut de l'événement "${event.titre}" mis à jour en "${status}"`,
                status: 'Validé',
                statusDot: 'bg-orange-500'
            });
        } catch (_) {}

        return res.status(200).json({ message: 'Statut événement mis à jour avec succès', event });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de la mise à jour du statut', error: error.message });
    }
};

// Mettre en avant / désactiver la mise en avant d'un événement
const toggleFeaturedEventForAdmin = async (req, res) => {
    try {
        const { id } = req.params;
        const event = await eventModel.findById(id);
        if (!event) {
            return res.status(404).json({ message: 'Événement non trouvé' });
        }

        event.featured = !event.featured;
        await event.save();

        return res.status(200).json({ message: 'Mise en avant mise à jour', featured: event.featured, event });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de la mise en avant', error: error.message });
    }
};

module.exports = { 
    AddEvent, 
    getAllEventByUser, 
    deleteEvent, 
    updateEvent, 
    getEventById, 
    getRecentEventsByUser, 
    getRecentvents, 
    getAllEventsForAdmin,
    updateEventStatusForAdmin,
    toggleFeaturedEventForAdmin,
    calculateEventQuote,
    activateEvent,
    upgradeEventQuota
};