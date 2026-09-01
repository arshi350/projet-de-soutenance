const Report = require('../../models/report');
const AuditLog = require('../../models/auditLog');

// Récupérer la liste des signalements
const getReports = async (req, res) => {
    try {
        let reports = await Report.find().sort({ createdAt: -1 }).populate('eventId', 'titre').populate('reporterId', 'first_name last_name email');
        
        if (!reports || reports.length === 0) {
            // signalements de démonstration si BDD vide
            reports = [
                { _id: 'rep_1', targetType: 'Événement', reason: 'Vérification Manuelle', details: '12 événements en attente d\'approbation publique', badge: 'Modération', status: 'actif', createdAt: new Date() },
                { _id: 'rep_2', targetType: 'Événement', reason: 'Signalement Spam', details: 'Signalement utilisateur sur "Soirée X"', badge: 'Urgent', status: 'actif', createdAt: new Date() }
            ];
        }

        return res.status(200).json({ reports });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors de la récupération des signalements', error: error.message });
    }
};

// Traiter / Traiter un signalement
const resolveReport = async (req, res) => {
    try {
        const { id } = req.params;
        const { status } = req.body; // 'resolu' | 'rejete'

        const report = await Report.findByIdAndUpdate(id, { status: status || 'resolu' }, { returnDocument: 'after' });

        try {
            await AuditLog.create({
                userId: req.userId,
                type: 'Signalement',
                action: 'Traitement Signalement',
                description: `Signalement #${id} traité avec le statut ${status || 'résolu'}`,
                status: 'Validé',
                statusDot: 'bg-emerald-500'
            });
        } catch (_) {}

        return res.status(200).json({ message: 'Signalement mis à jour', report });
    } catch (error) {
        return res.status(500).json({ message: 'Erreur lors du traitement du signalement', error: error.message });
    }
};

module.exports = { getReports, resolveReport };
