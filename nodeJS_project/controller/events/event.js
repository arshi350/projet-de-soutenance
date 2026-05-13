const { eventModel } = require("../../models/eventModels/event");
const mongoose = require('mongoose')
const path = require('path');

const AddEvent = async (req, res) => {
    try {
       
        // Les champs texte sont dans req.body
        const { titre, description, DateDebut, DateFin, heureDebut, heureFin, lieu, categorie, userId } = req.body;
        
        // L'image est dans req.file
        let imagePath = null;
        if (req.file) {
            // Stocker le chemin relatif pour l'accès web
            imagePath = '/uploads/' + path.basename(req.file.path);
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
        
        console.log("Code généré:", EventCode);
        
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
            image: imagePath,
            userId: mongoose.Types.ObjectId.isValid(userId) ? new mongoose.Types.ObjectId(userId) : undefined,
            EventCode: EventCode
        });

        const result = await NewEvent.save();
        
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
        const event = await eventModel.updateOne({_id:id}, {$set : {
            titre: Ntitre,
            description: Ndescription,
            DateDebut: NDateDebut,
            DateFin: NDateFin,
            heureDebut: NheureDebut,
            heureFin: NheureFin,
            lieu: Nlieu,
            categorie: Ncategorie
        }})
        return res.status(201).json({message:"evenement mis a jour avec succes", event})
        
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur serveur lors de la mise à jour de l'événement", error: error.message });
    }
}

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



module.exports = { AddEvent, getAllEventByUser, deleteEvent, updateEvent, getRecentEventsByUser, getRecentvents };