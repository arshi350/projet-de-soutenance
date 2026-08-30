const {
  getNotificationsByUser,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  deleteNotificationsByIds,
  deleteAllNotifications,
  createNotification
} = require('../../services/notificationService');

const getUserNotifications = async (req, res) => {
  try {
    const { userId } = req.params;
    const notifications = await getNotificationsByUser(userId);
    return res.status(200).json({ notifications });
  } catch (error) {
    console.error('Erreur récupération notifications:', error);
    return res.status(500).json({ message: 'Erreur lors de la récupération des notifications', error: error.message });
  }
};

const markRead = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const notification = await markNotificationRead(id, userId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    return res.status(200).json({ message: 'Notification marquée comme lue', notification });
  } catch (error) {
    console.error('Erreur marquer notification lue:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour de la notification', error: error.message });
  }
};

const markAllRead = async (req, res) => {
  try {
    const { userId } = req.params;
    await markAllNotificationsRead(userId);
    return res.status(200).json({ message: 'Toutes les notifications ont été marquées comme lues' });
  } catch (error) {
    console.error('Erreur marquer toutes notifications lues:', error);
    return res.status(500).json({ message: 'Erreur lors de la mise à jour des notifications', error: error.message });
  }
};

const deleteNotification = async (req, res) => {
  try {
    const { id } = req.params;
    const { userId } = req.body;
    const notification = await deleteNotificationById(id, userId);
    if (!notification) {
      return res.status(404).json({ message: 'Notification non trouvée' });
    }
    return res.status(200).json({ message: 'Notification supprimée', notification });
  } catch (error) {
    console.error('Erreur suppression notification :', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression de la notification', error: error.message });
  }
};

const deleteMultipleNotifications = async (req, res) => {
  try {
    const { userId, notificationIds } = req.body;
    if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
      return res.status(400).json({ message: 'Aucune notification sélectionnée pour la suppression' });
    }
    await deleteNotificationsByIds(userId, notificationIds);
    return res.status(200).json({ message: 'Notifications supprimées' });
  } catch (error) {
    console.error('Erreur suppression multiple notifications :', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression des notifications', error: error.message });
  }
};

const deleteAllNotificationsHandler = async (req, res) => {
  try {
    const { userId } = req.params;
    await deleteAllNotifications(userId);
    return res.status(200).json({ message: 'Toutes les notifications ont été supprimées' });
  } catch (error) {
    console.error('Erreur suppression de toutes les notifications :', error);
    return res.status(500).json({ message: 'Erreur lors de la suppression des notifications', error: error.message });
  }
};

const sendNotification = async (req, res) => {
  try {
    const { userId, title, message, type, referenceId, referenceType } = req.body;
    const notification = await createNotification({ userId, title, message, type, referenceId, referenceType });
    return res.status(201).json({ message: 'Notification créée', notification });
  } catch (error) {
    console.error('Erreur création notification:', error);
    return res.status(500).json({ message: 'Erreur lors de la création de la notification', error: error.message });
  }
};

module.exports = {
  getUserNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllNotificationsHandler,
  sendNotification
};
