const Invites = require('../../models/invitesModel/invites')
const mongoose = require('mongoose')



// Ajouter un invite avec vérifications avancées
const addInvite = async (req, res) => {
    try {
        const { nom, prenom, telephone, email, status, idEvent } = req.body;

        // Vérification des champs obligatoires
        if (!nom || !prenom || !telephone || !email || !status || !idEvent) {
            return res.status(400).json({ message: "Tous les champs sont requis" });
        }

        // Vérification du format de l'email
        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        if(!emailRegex.test(email)){
            return res.status(400).json({message: "L'email n'est pas valide"})
        }

        // Vérification du format du téléphone (commence par 6, puis 2/5/7/8/9, puis 7 chiffres)
       const phoneRegex = /^6[25789]\d{7}$/;
        if (!phoneRegex.test(telephone)) {
            return res.status(400).json({ 
                message: "Le numéro de téléphone n'est pas valide. Il doit contenir 9 chiffres, commencer par 6 et le deuxième chiffre doit être 2, 5, 7, 8 ou 9. Exemple: 683660987" 
            });
        }

        // Vérification du status
        if (!['vip', 'classique'].includes(status)) {
            return res.status(400).json({ message: "Le status doit être soit 'vip' soit 'classique'" });
        }

        // Vérification unicité email et téléphone
        const existingInvite = await Invites.findOne({ $or: [{ email }, { telephone }] });
        if (existingInvite) {
            return res.status(409).json({ message: "Un invité avec cet email ou ce téléphone existe déjà" });
        }

        const newInvite = new Invites({
            nom,
            prenom,
            telephone,
            email,
            status,
            idEvent: mongoose.Types.ObjectId.isValid(idEvent) ? new mongoose.Types.ObjectId(idEvent) : undefined,
        });

        const result = await newInvite.save();
        res.status(201).json({
            message: "Invité enregistré avec succès",
            invite: result
        });
    } catch (error) {
        console.log(error);
        return res.status(500).json({
            message: "Erreur lors de l'enregistrement de l'invité"
        });
    }
};

// Supprimer une invitation par son ID
const deleteInvite = async (req, res) => {
    try {
        const { id } = req.params;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID d'invité invalide" });
        }
        const deleted = await Invites.findByIdAndDelete(id);
        if (!deleted) {
            return res.status(404).json({ message: "Invité non trouvé" });
        }
        res.status(200).json({ message: "Invité supprimé avec succès" });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la suppression de l'invité" });
    }
};

// Mettre à jour une invitation par son ID
const updateInvite = async (req, res) => {
    try {
        const { id } = req.params;
        const { nom, prenom, telephone, email, status } = req.body;
        if (!mongoose.Types.ObjectId.isValid(id)) {
            return res.status(400).json({ message: "ID d'invité invalide" });
        }
        // Optionnel: vérifier les champs comme dans addInvite
        const updateFields = {};
        if (nom) updateFields.nom = nom;
        if (prenom) updateFields.prenom = prenom;
        if (telephone) {
            const telRegex = /^6[25789]\d{7}$/;
            if (!telRegex.test(telephone)) {
                return res.status(400).json({ message: "Numéro de téléphone invalide" });
            }
            updateFields.telephone = telephone;
        }
        if (email) {
            const emailRegex = /^\w+([\.-]?\w+)*@\w+([\.-]?\w+)*(\.\w{2,3})+$/;
            if (!emailRegex.test(email)) {
                return res.status(400).json({ message: "Adresse email invalide" });
            }
            updateFields.email = email;
        }
        if (status) {
            if (!['vip', 'classique'].includes(status)) {
                return res.status(400).json({ message: "Le status doit être soit 'vip' soit 'classique'" });
            }
            updateFields.status = status;
        }

        const updated = await Invites.findByIdAndUpdate(id, updateFields, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ message: "Invité non trouvé" });
        }
        res.status(200).json({ message: "Invité mis à jour avec succès", invite: updated });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la mise à jour de l'invité" });
    }
};

// Récupérer tous les invités d'un événement spécifique
const getInvitesByEvent = async (req, res) => {
    try {
        const { idEvent } = req.params;
        if (!mongoose.Types.ObjectId.isValid(idEvent)) {
            return res.status(400).json({ message: "ID d'événement invalide" });
        }
        const invites = await Invites.find({ idEvent });
        res.status(200).json({ invites });
    } catch (error) {
        console.log(error);
        return res.status(500).json({ message: "Erreur lors de la récupération des invités" });
    }
};


module.exports = {
    addInvite,
    deleteInvite,
    updateInvite,
    getInvitesByEvent
}