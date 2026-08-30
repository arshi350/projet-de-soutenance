const mongoose = require('mongoose');
const { eventModel } = require('../models/eventModels/event');
const TicketCategory = require('../models/ticketCategory/ticketCategory');
const PurchasedTicket = require('../models/purchasedTicket/purchasedTicket');

/**
 * Calcule l'ensemble des métriques de vente, de revenus et d'affluence pour un événement public
 * @param {string} eventId 
 * @returns {Promise<Object>}
 */
const getSalesAnalytics = async (eventId) => {
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error("Identifiant d'événement invalide.");
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
        throw new Error("Événement introuvable.");
    }

    // Récupération des catégories et des billets vendus
    const categories = await TicketCategory.find({ eventId, isActive: { $ne: false } }).lean();
    const tickets = await PurchasedTicket.find({ eventId }).sort({ createdAt: -1 }).lean();

    // Map rapide des catégories par ID
    const categoryMap = new Map();
    categories.forEach(cat => {
        categoryMap.set(cat._id.toString(), cat);
    });

    const nonCancelledTickets = tickets.filter(t => t.status !== 'cancelled');

    // 1. Calcul des KPI Globaux
    let totalCapacity = 0;
    categories.forEach(cat => {
        totalCapacity += Number(cat.capacity || 0);
    });

    const totalSold = nonCancelledTickets.length;
    const remainingCapacity = Math.max(0, totalCapacity - totalSold);
    const fillRate = totalCapacity > 0 ? Number(((totalSold / totalCapacity) * 100).toFixed(1)) : 0;

    const totalRevenue = nonCancelledTickets.reduce((sum, t) => sum + Number(t.totalAmount || t.unitPrice || 0), 0);
    const averageTicketPrice = totalSold > 0 ? Number((totalRevenue / totalSold).toFixed(2)) : 0;

    const uniqueBuyersSet = new Set(nonCancelledTickets.map(t => (t.buyerEmail || '').toLowerCase().trim()).filter(Boolean));
    const uniqueBuyersCount = uniqueBuyersSet.size;

    const scannedCount = nonCancelledTickets.filter(t => t.status === 'scanned').length;
    const scanRate = totalSold > 0 ? Number(((scannedCount / totalSold) * 100).toFixed(1)) : 0;

    // 2. Répartition et performance par catégorie
    const categoryBreakdown = categories.map(cat => {
        const catIdStr = cat._id.toString();
        const catTickets = nonCancelledTickets.filter(t => t.ticketCategoryId?.toString() === catIdStr);
        const actualSoldCount = catTickets.length;
        const capacity = Number(cat.capacity || 0);
        const reserved = Number(cat.reservedCount || 0);
        const available = Math.max(0, capacity - actualSoldCount - reserved);
        const categoryRevenue = catTickets.reduce((sum, t) => sum + Number(t.totalAmount || t.unitPrice || 0), 0);
        const catFillRate = capacity > 0 ? Number(((actualSoldCount / capacity) * 100).toFixed(1)) : 0;

        return {
            id: cat._id,
            name: cat.name,
            price: cat.price,
            capacity,
            soldCount: actualSoldCount,
            reservedCount: reserved,
            availableCount: available,
            revenue: categoryRevenue,
            fillRate: catFillRate,
            isSoldOut: available <= 0,
            aiBackgroundUrl: cat.aiBackgroundUrl || '',
            benefits: cat.benefits || []
        };
    });

    // 3. Évolution des ventes dans le temps (Timeline journalière)
    const salesByDateMap = new Map();

    // Trier les billets du plus ancien au plus récent pour le cumul
    const chronologicalTickets = [...nonCancelledTickets].sort((a, b) => new Date(a.createdAt) - new Date(b.createdAt));

    let runningTickets = 0;
    let runningRevenue = 0;

    chronologicalTickets.forEach(ticket => {
        const dateObj = new Date(ticket.createdAt);
        const dateKey = dateObj.toISOString().split('T')[0]; // YYYY-MM-DD
        const formattedDate = dateObj.toLocaleDateString('fr-FR', { day: '2-digit', month: 'short' });

        if (!salesByDateMap.has(dateKey)) {
            salesByDateMap.set(dateKey, {
                date: dateKey,
                formattedDate,
                ticketsCount: 0,
                revenue: 0,
                cumulativeTickets: 0,
                cumulativeRevenue: 0
            });
        }

        const entry = salesByDateMap.get(dateKey);
        const amount = Number(ticket.totalAmount || ticket.unitPrice || 0);

        entry.ticketsCount += 1;
        entry.revenue += amount;
        runningTickets += 1;
        runningRevenue += amount;

        entry.cumulativeTickets = runningTickets;
        entry.cumulativeRevenue = runningRevenue;
    });

    const salesTimeline = Array.from(salesByDateMap.values());

    // 4. Liste formatée des transactions / billets vendus
    const transactions = tickets.map(t => {
        const cat = categoryMap.get(t.ticketCategoryId?.toString());
        return {
            id: t._id,
            ticketNumber: t.ticketNumber,
            buyerName: t.buyerName,
            buyerEmail: t.buyerEmail,
            buyerPhone: t.buyerPhone || '',
            categoryId: t.ticketCategoryId,
            categoryName: cat ? cat.name : 'Billet Général',
            unitPrice: t.unitPrice || 0,
            totalAmount: t.totalAmount || t.unitPrice || 0,
            status: t.status || 'valid',
            paymentReference: t.paymentReference || 'N/A',
            createdAt: t.createdAt,
            scannedAt: t.scannedAt || null,
            qrCodeToken: t.qrCodeToken || ''
        };
    });

    // 5. Génération d'Insights IA & Recommandations
    const aiInsights = generateSmartSalesInsights({
        event,
        totalCapacity,
        totalSold,
        fillRate,
        totalRevenue,
        categoryBreakdown,
        salesTimeline
    });

    return {
        success: true,
        event: {
            id: event._id,
            titre: event.titre,
            lieu: event.lieu,
            DateDebut: event.DateDebut,
            DateFin: event.DateFin,
            status: event.status,
            eventType: event.eventType
        },
        kpis: {
            totalRevenue: Number(totalRevenue.toFixed(2)),
            totalSold,
            totalCapacity,
            remainingCapacity,
            fillRate,
            averageTicketPrice,
            uniqueBuyersCount,
            scannedCount,
            scanRate
        },
        categoryBreakdown,
        salesTimeline,
        transactions,
        aiInsights
    };
};

/**
 * Génère des insights et recommandations intelligentes basées sur les dynamiques de vente
 */
function generateSmartSalesInsights({ event, totalCapacity, totalSold, fillRate, totalRevenue, categoryBreakdown, salesTimeline }) {
    const tips = [];
    let healthScore = 50;

    // Catégorie la plus populaire
    const sortedCategories = [...categoryBreakdown].sort((a, b) => b.soldCount - a.soldCount);
    const topCategory = sortedCategories[0];

    if (topCategory && topCategory.soldCount > 0) {
        tips.push({
            type: 'top_performer',
            title: `Meilleure vente : « ${topCategory.name} »`,
            message: `La catégorie ${topCategory.name} représente ${topCategory.soldCount} billet(s) vendus (${topCategory.fillRate}% de sa jauge) pour un total de ${topCategory.revenue} €.`,
            level: 'success'
        });
    }

    // Taux de remplissage
    if (fillRate >= 80) {
        healthScore = 95;
        tips.push({
            type: 'high_demand',
            title: 'Forte affluence & Sold-Out imminent !',
            message: `Votre événement a atteint ${fillRate}% de remplissage. Envisagez de clôturer les préventes ou de créer une catégorie Last-Minute à tarif majoré.`,
            level: 'info'
        });
    } else if (fillRate >= 40) {
        healthScore = 75;
        tips.push({
            type: 'steady_growth',
            title: 'Dynamique de vente équilibrée',
            message: `${fillRate}% des places sont réservées. Activez une campagne d'emailing ou un compte à rebours sur vos réseaux sociaux pour accélérer la cadence.`,
            level: 'info'
        });
    } else if (totalCapacity > 0) {
        healthScore = 45;
        tips.push({
            type: 'boost_needed',
            title: 'Opportunité de relance marketing',
            message: `Il reste ${totalCapacity - totalSold} place(s) disponible(s). Nous vous recommandons de diffuser le lien public de billetterie et d'activer une offre promotionnelle Early Bird.`,
            level: 'warning'
        });
    }

    // Vérifier les catégories Sold-out vs catégories peu vendues
    const soldOutCats = categoryBreakdown.filter(c => c.isSoldOut);
    if (soldOutCats.length > 0) {
        tips.push({
            type: 'sold_out_category',
            title: `Rupture de stock sur ${soldOutCats.map(c => c.name).join(', ')}`,
            message: 'Certains participants recherchent encore ce type de place. Vous pouvez ajuster la capacité maximale depuis l\'onglet Billetterie si votre lieu le permet.',
            level: 'success'
        });
    }

    return {
        healthScore,
        summary: totalSold > 0 
            ? `${totalSold} place(s) vendue(s) pour ${totalRevenue.toFixed(2)} € générés (${fillRate}% de la jauge).`
            : "Aucun billet n'a encore été vendu. Partagez votre lien public pour lancer la billetterie !",
        tips
    };
}

/**
 * Exporte l'ensemble des transactions de vente au format CSV
 * @param {string} eventId 
 * @returns {Promise<Object>} Contenu CSV et nom de fichier
 */
const exportSalesCSV = async (eventId) => {
    const data = await getSalesAnalytics(eventId);
    const { transactions, event } = data;

    const headers = [
        "Numéro de Billet",
        "Date Achat",
        "Nom de l'Acheteur",
        "Email",
        "Téléphone",
        "Catégorie",
        "Montant Total (€)",
        "Statut du Billet",
        "Référence Paiement",
        "Statut d'Entrée / Scan",
        "Date de Scan"
    ];

    const rows = transactions.map(t => {
        const dateStr = t.createdAt ? new Date(t.createdAt).toLocaleString('fr-FR') : '';
        const scanDateStr = t.scannedAt ? new Date(t.scannedAt).toLocaleString('fr-FR') : 'Non scanné';
        const scanStatus = t.status === 'scanned' ? 'Validé à l\'entrée' : (t.status === 'cancelled' ? 'Annulé' : 'En attente de scan');

        return [
            `"${t.ticketNumber || ''}"`,
            `"${dateStr}"`,
            `"${(t.buyerName || '').replace(/"/g, '""')}"`,
            `"${t.buyerEmail || ''}"`,
            `"${t.buyerPhone || ''}"`,
            `"${(t.categoryName || '').replace(/"/g, '""')}"`,
            `"${Number(t.totalAmount || 0).toFixed(2)}"`,
            `"${t.status || 'valid'}"`,
            `"${t.paymentReference || ''}"`,
            `"${scanStatus}"`,
            `"${scanDateStr}"`
        ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    return {
        csvContent,
        filename: `ventes_billetterie_${(event.titre || 'evenement').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.csv`
    };
};

module.exports = {
    getSalesAnalytics,
    exportSalesCSV
};
