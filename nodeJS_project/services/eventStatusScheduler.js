// services/eventStatusScheduler.js
const cron = require('node-cron');
const { eventModel } = require('../models/eventModels/event');

/**
 * Met à jour automatiquement tous les événements
 */
const updateAllEventsStatusAutomatically = async () => {
    try {
        console.log("🔄 Début de la mise à jour automatique des statuts...");
        
        // Récupérer tous les événements qui ne sont pas encore terminés
        const events = await eventModel.find({
            status: { $ne: 'terminer' }
        });
        
        let updatedCount = 0;
        const now = new Date();
        
        for (const event of events) {
            try {
                // Créer les dates complètes à partir des champs séparés
                const startDate = new Date(`${event.DateDebut.toISOString().split('T')[0]}T${event.heureDebut || '00:00'}`);
                const endDate = new Date(`${event.DateFin.toISOString().split('T')[0]}T${event.heureFin || '23:59'}`);
                
                let newStatus;
                if (now < startDate) {
                    newStatus = 'en attente';
                } else if (now >= startDate && now <= endDate) {
                    newStatus = 'en cours';
                } else {
                    newStatus = 'terminer';
                }
                
                if (event.status !== newStatus) {
                    await eventModel.findByIdAndUpdate(
                        event._id,
                        { status: newStatus },
                        { new: true }
                    );
                    updatedCount++;
                    console.log(`✅ Événement "${event.titre}" : ${event.status} -> ${newStatus}`);
                }
            } catch (eventError) {
                console.error(`⚠️ Erreur lors du traitement de l'événement ${event._id}:`, eventError.message);
            }
        }
        
        console.log(`🎉 Mise à jour terminée : ${updatedCount} événements modifiés`);
        
    } catch (error) {
        console.error("❌ Erreur lors de la mise à jour automatique:", error.message);
    }
};

// Planifier la tâche
const startStatusScheduler = () => {
    // Exécuter toutes les 5 minutes
    cron.schedule('*/5 * * * *', async () => {
        console.log('🕐 Vérification des statuts des événements');
        await updateAllEventsStatusAutomatically();
    });
    
    console.log('⏰ Planificateur de statuts démarré - Vérification toutes les 5 minutes');
};

module.exports = {
    updateAllEventsStatusAutomatically,
    startStatusScheduler
};