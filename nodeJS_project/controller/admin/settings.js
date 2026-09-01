const PlatformSettings = require('../../models/platformSettings');
const AuditLog = require('../../models/auditLog');

// Récupérer les paramètres globaux
const getPlatformSettings = async (req, res) => {
    try {
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = await PlatformSettings.create({});
        }
        return res.status(200).json({ settings });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors du chargement des paramètres', error: error.message });
    }
};

// Mettre à jour les paramètres globaux
const updatePlatformSettings = async (req, res) => {
    try {
        const updates = req.body;
        let settings = await PlatformSettings.findOne();
        if (!settings) {
            settings = new PlatformSettings(updates);
        } else {
            Object.assign(settings, updates);
            settings.updatedAt = new Date();
        }
        await settings.save();

        // Enregistrer le journal d'audit
        try {
            await AuditLog.create({
                userId: req.userId,
                type: 'Système',
                action: 'Modification Paramètres',
                description: 'Mise à jour de la configuration globale du système',
                status: 'Réussi',
                statusDot: 'bg-emerald-500'
            });
        } catch (_) {}

        return res.status(200).json({ message: 'Paramètres enregistrés avec succès', settings });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de l\'enregistrement des paramètres', error: error.message });
    }
};

module.exports = { getPlatformSettings, updatePlatformSettings };
