const { userModel } = require('../../models/user');
const { eventModel } = require('../../models/eventModels/event');

const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await userModel.countDocuments();
    const totalEvents = await eventModel.countDocuments();
    const eventsInProgress = await eventModel.countDocuments({ status: 'en cours' });

    const activityRate = totalEvents > 0
      ? Number(((eventsInProgress / totalEvents) * 100).toFixed(2))
      : 0;

    return res.status(200).json({
      message: 'Statistiques admin récupérées avec succès',
      stats: {
        totalUsers,
        totalEvents,
        eventsInProgress,
        activityRate
      }
    });
  } catch (error) {
    console.error('Erreur lors de la récupération des statistiques admin :', error);
    return res.status(500).json({
      message: 'Erreur serveur lors de la récupération des statistiques admin'
    });
  }
};

module.exports = { getAdminStats };
