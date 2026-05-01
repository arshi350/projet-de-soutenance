
const { eventModel } = require('../../models/eventModels/event');
const Invites = require('../../models/invitesModel/invites');



const getUserstats = async (req, res) =>{
	try {
			const { userId } = req.params;
					
			// 1. Tous les événements de l'utilisateur
			const allEvents = await eventModel.find({ userId });
			const totalEvents = allEvents.length;

			// 2. Tous les événements actifs (status: 'en cours')
			const activeEvents = allEvents.filter(e => e.status === 'en cours').length;

			// 3. Tous les invités appartenant aux événements de l'utilisateur
			const eventIds = allEvents.map(e => e._id);
			const totalInvites = await Invites.countDocuments({ idEvent: { $in: eventIds } });

			// 4. Retourner le résultat
			return res.status(200).json({
				message: "Statistiques de l'utilisateur récupérées avec succès",
				stats: {
					totalEvents,
					activeEvents,
					totalInvites
				}
			});

	} catch (error) {
		console.error("Erreur lors de la récupération des statistiques de l'utilisateur :", error);
		return res.status(500).json({
			message: "Erreur serveur"
		});
	}
}

module.exports = { getUserstats };
