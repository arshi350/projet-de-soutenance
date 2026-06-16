const { eventModel } = require("../../models/eventModels/event");

const connectToEventByCode = async (req, res) => {
    try {
        const rawCode = req.body.EventCode || req.body.eventCode || req.body.code || req.body.codeEvenement;
        const code = typeof rawCode === 'string' ? rawCode.trim().toUpperCase() : '';

        if (!code) {
            return res.status(400).json({ message: "Le code de l'événement est requis." });
        }

        const event = await eventModel.findOne({ EventCode: code });

        if (!event) {
            return res.status(404).json({ message: "Code d'événement invalide ou événement introuvable." });
        }

        return res.status(200).json({
            message: "Code valide, événement trouvé.",
            event
        });
    } catch (error) {
        console.error('Erreur lors de la connexion à l événement :', error);
        return res.status(500).json({
            message: "Erreur serveur lors de la vérification du code de l'événement.",
            error: error.message
        });
    }
};

module.exports = { connectToEventByCode };
