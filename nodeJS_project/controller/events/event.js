const { eventModel } = require("../../models/eventModels/event");
const { userModel } = require("../../models/user");
const { createNotification } = require('../../services/notificationService');
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

        // Succès : événements trouvés
        return res.status(200).json({ 
            message: "Événements récupérés avec succès", 
            count: events.length,  // Nombre d'événements trouvés
            events 
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

//supprimer un evenements de la base de donnee
const deleteEvent = async (req, res) => {
    try {
        const id = req.params.id;

        //verification de la validite de l'id de l'evenement
        if(!mongoose.Types.ObjectId.isValid(id)){
            return res.status(400).json({message: "id de l'evenement invalide"})
        }

        //recherche et suppression de l'evenement
        const event = await eventModel.findByIdAndDelete(id)
        if(!event){
            return res.status(404).json({message: "evenement non trouvé"})
        }

        try {
            await createNotification({
                userId: event.userId,
                title: 'Événement supprimé',
                message: `Votre événement "${event.titre}" a été supprimé.`,
                type: 'event',
                referenceId: event._id,
                referenceType: 'event'
            });
        } catch (notifError) {
            console.warn('Notification non créée pour la suppression d événement :', notifError.message);
        }

        return res.status(200).json({message: "evenement supprimé avec succès", event})
        
    } catch (error) {
        console.log(error);
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
const getRecentvents = async (req, res) =>{
    try {

        //recuperer les 5 dernier evenement de la base de donnees
        const events = await eventModel.find().sort({createdAt: -1}).limit(5);

        return res.status(200).json({ 
            message: "Événements récents récupérés avec succès", 
            count: events.length, 
            events 
        })
        

    } catch (error) {
        return res.status(500).json({message : "erreur lors de la recuperation de l'evenement", erreur : error})
    }
}

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

module.exports = { 
    AddEvent, 
    getAllEventByUser, 
    deleteEvent, 
    updateEvent, 
    getEventById, 
    getRecentEventsByUser, 
    getRecentvents, 
    getAllEventsForAdmin,
    calculateEventQuote,
    activateEvent,
    upgradeEventQuota
};