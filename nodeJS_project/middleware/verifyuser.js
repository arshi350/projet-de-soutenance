const mongoose = require('mongoose');
const { eventModel } = require('../models/eventModels/event');

/**
 * Middleware pour vérifier que l'utilisateur est bien le propriétaire de l'événement
 * @param {Request} req - Express request (doit contenir req.userId et req.params.eventId)
 * @param {Response} res - Express response
 * @param {Function} next - Express next middleware
 */
const verifyUserEvent = async (req, res, next) => {
    try {
        const userId = req.userId || req.body.userId || req.params.userId;
        const eventId = req.params.eventId || req.body.eventId;

        // Vérification de la validité des IDs
        if (!mongoose.Types.ObjectId.isValid(userId) || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "ID utilisateur ou événement invalide" });
        }

        // Recherche de l'événement
        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ message: "Événement non trouvé" });
        }

        // Vérification de la correspondance des IDs
        if (event.userId.toString() !== userId.toString()) {
            return res.status(403).json({ message: "Accès refusé : utilisateur non propriétaire de l'événement" });
        }

        // OK, l'utilisateur est bien le propriétaire
        next();
    } catch (error) {
        console.log(error);
        res.status(500).json({ message: "Erreur serveur lors de la vérification de l'utilisateur", error: error.message });
    }
};

module.exports = verifyUserEvent;
