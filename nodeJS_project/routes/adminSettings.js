const express = require('express');
const authenticateToken = require('../middleware/authmiddlewre');
const { getPlatformSettings, updatePlatformSettings } = require('../controller/admin/settings');

const adminSettingsRouter = express.Router();

adminSettingsRouter.route('/admin/settings')
    .get(authenticateToken, getPlatformSettings)
    .put(authenticateToken, updatePlatformSettings);

module.exports = adminSettingsRouter;
