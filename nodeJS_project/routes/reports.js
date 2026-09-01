const express = require('express');
const authenticateToken = require('../middleware/authmiddlewre');
const { getReports, resolveReport } = require('../controller/admin/reports');

const reportsRouter = express.Router();

reportsRouter.route('/admin/reports').get(authenticateToken, getReports);
reportsRouter.route('/admin/reports/:id/resolve').put(authenticateToken, resolveReport);

module.exports = reportsRouter;
