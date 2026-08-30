const mongoose = require('mongoose');
const { Notification } = require('../models/notification/notification');

const createNotification = async ({ userId, title, message, type = 'general', referenceId, referenceType = 'other' }) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide pour la notification');
  }

  const notification = new Notification({
    userId,
    title,
    message,
    type,
    referenceId,
    referenceType
  });

  return notification.save();
};

const getNotificationsByUser = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide pour la recherche de notifications');
  }
  return Notification.find({ userId }).sort({ createdAt: -1 });
};

const markNotificationRead = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error('notificationId invalide');
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide');
  }
  return Notification.findOneAndUpdate(
    { _id: notificationId, userId },
    { isRead: true },
    { new: true }
  );
};

const markAllNotificationsRead = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide');
  }
  return Notification.updateMany({ userId, isRead: false }, { isRead: true });
};

const deleteNotificationById = async (notificationId, userId) => {
  if (!mongoose.Types.ObjectId.isValid(notificationId)) {
    throw new Error('notificationId invalide');
  }
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide');
  }
  return Notification.findOneAndDelete({ _id: notificationId, userId });
};

const deleteNotificationsByIds = async (userId, notificationIds) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide');
  }
  if (!Array.isArray(notificationIds) || notificationIds.length === 0) {
    throw new Error('notificationIds invalide');
  }
  if (!notificationIds.every((id) => mongoose.Types.ObjectId.isValid(id))) {
    throw new Error('Un ou plusieurs notificationIds sont invalides');
  }
  return Notification.deleteMany({ userId, _id: { $in: notificationIds } });
};

const deleteAllNotifications = async (userId) => {
  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new Error('userId invalide');
  }
  return Notification.deleteMany({ userId });
};

module.exports = {
  createNotification,
  getNotificationsByUser,
  markNotificationRead,
  markAllNotificationsRead,
  deleteNotificationById,
  deleteNotificationsByIds,
  deleteAllNotifications
};
