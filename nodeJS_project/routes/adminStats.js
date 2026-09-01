const express = require('express');
const authenticateToken = require('../middleware/authmiddlewre');
const { getAdminStats, getAdminSubscriptionsStats, getAuditLogs, getAdminAnalytics } = require('../controller/stats/adminStats');

const adminStatsRouter = express.Router();

adminStatsRouter.route('/admin/stats').get(authenticateToken, getAdminStats);
adminStatsRouter.route('/admin/subscriptions').get(authenticateToken, getAdminSubscriptionsStats);
adminStatsRouter.route('/admin/audit-logs').get(authenticateToken, getAuditLogs);
adminStatsRouter.route('/admin/analytics').get(authenticateToken, getAdminAnalytics);

module.exports = adminStatsRouter;
