const express = require('express');
const ScanRouter = express.Router();
const { verifyScanController, getScanStatsController } = require('../controller/scann/scann');

ScanRouter.post('/verify', verifyScanController);
ScanRouter.get('/stats/:eventId', getScanStatsController);

module.exports = ScanRouter;
