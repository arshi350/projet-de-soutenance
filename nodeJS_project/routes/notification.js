const express = require('express');
const router = express.Router();
const {
  getUserNotifications,
  markRead,
  markAllRead,
  deleteNotification,
  deleteMultipleNotifications,
  deleteAllNotificationsHandler,
  sendNotification
} = require('../controller/notifications/notification');

router.get('/user/:userId', getUserNotifications);
router.patch('/markAsRead/:id', markRead);
router.patch('/markAllAsRead/:userId', markAllRead);
router.delete('/bulk', deleteMultipleNotifications);
router.delete('/all/:userId', deleteAllNotificationsHandler);
router.delete('/:id', deleteNotification);
router.post('/sendNotification', sendNotification);

module.exports = router;
