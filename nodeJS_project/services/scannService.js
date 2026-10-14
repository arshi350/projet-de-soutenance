const mongoose = require('mongoose');
const Invites = require('../models/invitesModel/invites');
const { invitationModel } = require('../models/invitation/invitation');
const { eventModel } = require('../models/eventModels/event');
const PurchasedTicket = require('../models/purchasedTicket/purchasedTicket');
const TicketCategory = require('../models/ticketCategory/ticketCategory');
const ticketPdfService = require('./ticketPdfService');
const { createNotification } = require('./notificationService');

/**
 * Service unifié de vérification et scan anti-fraude (Événements Privés & Publics)
 * Implémente l'idempotence et les transactions atomiques (HTTP 409 en cas de doublon)
 */
const verifyQRCode = async ({ qrData, eventId, scannerUserId }) => {
    if (!qrData) {
        const error = new Error('qrData est requis.');
        error.status = 400;
        throw error;
    }

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        const error = new Error('eventId invalide ou manquant.');
        error.status = 400;
        throw error;
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
        const error = new Error('Événement introuvable.');
        error.status = 404;
        throw error;
    }

    // Extraction du token ou identifiant
    let tokenOrId = null;
    if (typeof qrData === 'string') {
        try {
            const parsed = JSON.parse(qrData);
            tokenOrId = parsed.token || parsed._id || parsed.inviteId || parsed.ticketId || parsed.qrCodeToken || qrData;
        } catch {
            tokenOrId = qrData;
        }
    } else if (typeof qrData === 'object' && qrData !== null) {
        tokenOrId = qrData.token || qrData._id || qrData.inviteId || qrData.ticketId || qrData.qrCodeToken;
    }

    if (!tokenOrId) {
        const error = new Error('Données du QR code manquantes ou invalides.');
        error.status = 400;
        throw error;
    }

    // Tentative de décodage JWT si token signé
    const tokenVerification = ticketPdfService.verifyTicketToken(tokenOrId);
    let resolvedTicketId = null;
    if (tokenVerification.valid && tokenVerification.payload?.ticketId) {
        resolvedTicketId = tokenVerification.payload.ticketId;
    }

    // ==========================================
    // 1. VÉRIFICATION DANS LES BILLETS PUBLICS
    // ==========================================
    let publicTicket = null;
    if (resolvedTicketId && mongoose.Types.ObjectId.isValid(resolvedTicketId)) {
        publicTicket = await PurchasedTicket.findOne({ _id: resolvedTicketId, eventId });
    } else if (mongoose.Types.ObjectId.isValid(tokenOrId)) {
        publicTicket = await PurchasedTicket.findOne({ _id: tokenOrId, eventId });
    }
    
    if (!publicTicket) {
        publicTicket = await PurchasedTicket.findOne({ qrCodeToken: tokenOrId, eventId });
    }

    if (publicTicket) {
        // Cas A : Déjà scanné ➔ HTTP 409 Conflict anti-fraude
        if (publicTicket.status === 'scanned') {
            const error = new Error(`⛔ BILLET DÉJÀ UTILISÉ : Ce billet a déjà été scanné le ${new Date(publicTicket.scannedAt).toLocaleString('fr-FR')}.`);
            error.status = 409;
            error.alreadyScanned = true;
            error.scannedAt = publicTicket.scannedAt;
            throw error;
        }

        // Cas B : Billet annulé
        if (publicTicket.status === 'cancelled') {
            const error = new Error('⛔ ACCÈS REFUSÉ : Ce billet a été annulé.');
            error.status = 403;
            error.accessDenied = true;
            throw error;
        }

        // Cas C : Validation atomique
        const updatedTicket = await PurchasedTicket.findOneAndUpdate(
            { _id: publicTicket._id, status: 'valid' },
            { 
                $set: { 
                    status: 'scanned', 
                    scannedAt: new Date(),
                    scannedBy: scannerUserId || null 
                } 
            },
            { new: true }
        );

        if (!updatedTicket) {
            const error = new Error('⛔ CONFLIT DE VALIDATION : Le billet vient d\'être scanné simultanément sur un autre terminal.');
            error.status = 409;
            error.alreadyScanned = true;
            throw error;
        }

        const category = await TicketCategory.findById(publicTicket.ticketCategoryId);
        const scannedCount = await PurchasedTicket.countDocuments({ eventId, status: 'scanned' });
        const totalSold = await PurchasedTicket.countDocuments({ eventId, status: { $ne: 'cancelled' } });

        return {
            success: true,
            isPublicTicket: true,
            ticket: {
                _id: updatedTicket._id,
                ticketNumber: updatedTicket.ticketNumber,
                buyerName: updatedTicket.buyerName,
                buyerEmail: updatedTicket.buyerEmail,
                categoryName: category?.name || 'Standard',
                status: 'scanned',
                scannedAt: updatedTicket.scannedAt
            },
            stats: {
                scannedCount,
                totalTickets: totalSold
            }
        };
    }

    // ==========================================
    // 2. VÉRIFICATION DANS LES ÉVÉNEMENTS PRIVÉS
    // ==========================================
    let invitation = null;
    if (mongoose.Types.ObjectId.isValid(tokenOrId)) {
        invitation = await invitationModel.findOne({
            $or: [{ inviteId: tokenOrId, eventId }, { _id: tokenOrId, eventId }]
        });
    } else {
        invitation = await invitationModel.findOne({
            $or: [{ qrDataToken: tokenOrId, eventId }, { rsvpToken: tokenOrId, eventId }]
        });
    }

    const inviteId = invitation ? invitation.inviteId : (mongoose.Types.ObjectId.isValid(tokenOrId) ? tokenOrId : null);
    const invite = inviteId ? await Invites.findOne({ _id: inviteId, idEvent: eventId }) : null;

    if (!invite && !invitation) {
        const error = new Error("Invité ou billet introuvable pour cet événement.");
        error.status = 404;
        throw error;
    }

    // Sécurité RSVP : vérification si présence refusée
    const isRevoked = invitation?.isRevoked === true || invitation?.rsvpStatus === 'refusé' || invite?.status === 'refusé';
    if (isRevoked) {
        const error = new Error("⛔ ACCÈS REFUSÉ : Invitation révoquée (l'invité a signalé son absence).");
        error.status = 403;
        error.accessDenied = true;
        error.revoked = true;
        throw error;
    }

    const alreadyScanned = invite?.isScanned === true;
    if (alreadyScanned) {
        const error = new Error(`⛔ INVITATION DÉJÀ SCANNÉE : Cet invité a déjà été enregistré à l'entrée.`);
        error.status = 409;
        error.alreadyScanned = true;
        throw error;
    }

    const scanDate = new Date();
    const formattedScanTime = `${scanDate.getHours().toString().padStart(2, '0')}:${scanDate.getMinutes().toString().padStart(2, '0')}`;

    if (invite) {
        invite.isScanned = true;
        invite.isPresent = true;
        invite.scannedAt = scanDate;
        await invite.save();
    }

    if (invitation) {
        invitation.isScanned = true;
        invitation.isPresent = true;
        invitation.scannedAt = scanDate;
        await invitation.save();
    }

    const scannedCount = await Invites.countDocuments({ idEvent: eventId, isScanned: true });
    const presentCount = await Invites.countDocuments({ idEvent: eventId, isPresent: true });
    const absentCount = await Invites.countDocuments({ idEvent: eventId, isScanned: true, isPresent: false });
    const totalInvites = await Invites.countDocuments({ idEvent: eventId });

    try {
        await createNotification({
            userId: event.userId,
            title: 'Scan invité réussi',
            message: `${invite?.prenom || invitation?.prenom || ''} ${invite?.nom || invitation?.nom || ''} a été validé pour l'événement "${event.titre}".`,
            type: 'invite',
            referenceId: invite?._id || invitation?._id,
            referenceType: 'invite'
        });
    } catch (notifErr) {
        console.warn('Erreur création notification scan :', notifErr.message);
    }

    return {
        success: true,
        isPublicTicket: false,
        guest: {
            _id: invite?._id || invitation?.inviteId,
            id: invite?._id || invitation?.inviteId,
            nom: invite?.nom || invitation?.nom,
            prenom: invite?.prenom || invitation?.prenom,
            email: invite?.email || invitation?.inviteeEmail,
            telephone: invite?.telephone || invitation?.invitePhone,
            guestCategory: invite?.status || invitation?.guestStatus || 'classique',
            status: 'present',
            isScanned: true,
            isPresent: true,
            scannedAt: scanDate.toISOString(),
            scanTime: formattedScanTime,
            idEvent: eventId
        },
        scannedCount,
        presentCount,
        absentCount,
        totalInvites
    };
};

/**
 * Récupère les statistiques détaillées des scans pour un événement (Graphes, Catégories, Alertes)
 */
const getEventScanStats = async (eventId) => {
    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
        throw new Error('eventId invalide');
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
        throw new Error('Événement introuvable');
    }

    const isPublic = event.eventType === 'public';

    let total = 0;
    let scanned = 0;
    let present = 0;
    let absent = 0;
    let waiting = 0;
    let categoryDistribution = [];
    let recentScans = [];
    let hourlyTimeline = {};

    if (isPublic) {
        // Stats Billetterie Publique
        const allTickets = await PurchasedTicket.find({ eventId, status: { $ne: 'cancelled' } }).populate('ticketCategoryId');
        total = allTickets.length;
        scanned = allTickets.filter(t => t.status === 'scanned').length;
        present = scanned;
        absent = total - scanned;
        waiting = total - scanned;

        // Répartition par catégorie
        const catMap = {};
        allTickets.forEach(t => {
            const catName = t.ticketCategoryId?.name || 'Standard';
            if (!catMap[catName]) catMap[catName] = { name: catName, total: 0, scanned: 0 };
            catMap[catName].total += 1;
            if (t.status === 'scanned') catMap[catName].scanned += 1;
        });
        categoryDistribution = Object.values(catMap);

        // Timeline des scans par heure
        allTickets.filter(t => t.scannedAt).forEach(t => {
            const d = new Date(t.scannedAt);
            const hourKey = `${d.getHours().toString().padStart(2, '0')}h00`;
            hourlyTimeline[hourKey] = (hourlyTimeline[hourKey] || 0) + 1;
        });

        // 10 derniers scans
        recentScans = allTickets
            .filter(t => t.scannedAt)
            .sort((a, b) => new Date(b.scannedAt) - new Date(a.scannedAt))
            .slice(0, 10)
            .map(t => ({
                id: t._id,
                name: t.buyerName,
                category: t.ticketCategoryId?.name || 'Standard',
                ticketNumber: t.ticketNumber,
                scannedAt: t.scannedAt,
                status: 'valid'
            }));
    } else {
        // Stats Événement Privé
        const invites = await Invites.find({ idEvent: eventId });
        total = invites.length;
        scanned = invites.filter(i => i.isScanned === true).length;
        present = invites.filter(i => i.isPresent === true).length;
        absent = invites.filter(i => i.status === 'refusé' || (i.isScanned && !i.isPresent)).length;
        waiting = Math.max(0, total - scanned - absent);

        // Répartition par statut (VIP vs Classique)
        const vipTotal = invites.filter(i => (i.status || '').toLowerCase() === 'vip').length;
        const vipScanned = invites.filter(i => (i.status || '').toLowerCase() === 'vip' && i.isScanned).length;
        const classiqueTotal = total - vipTotal;
        const classiqueScanned = scanned - vipScanned;

        categoryDistribution = [
            { name: 'VIP', total: vipTotal, scanned: vipScanned },
            { name: 'Classique', total: classiqueTotal, scanned: classiqueScanned }
        ];

        // Timeline des scans
        invites.filter(i => i.updatedAt && i.isScanned).forEach(i => {
            const d = new Date(i.updatedAt);
            const hourKey = `${d.getHours().toString().padStart(2, '0')}h00`;
            hourlyTimeline[hourKey] = (hourlyTimeline[hourKey] || 0) + 1;
        });

        // 10 derniers scans
        recentScans = invites
            .filter(i => i.isScanned)
            .sort((a, b) => new Date(b.updatedAt) - new Date(a.updatedAt))
            .slice(0, 10)
            .map(i => ({
                id: i._id,
                name: `${i.prenom || ''} ${i.nom || ''}`.trim(),
                category: i.status || 'Classique',
                ticketNumber: `INV-${i._id.toString().slice(-4)}`,
                scannedAt: i.updatedAt,
                status: i.status === 'refusé' ? 'revoked' : 'valid'
            }));
    }

    // Formatage timeline pour graphiques Recharts / fl_chart
    const formattedTimeline = Object.entries(hourlyTimeline).map(([time, count]) => ({
        time,
        presence: count
    }));

    // Taux et alertes
    const scanRate = total > 0 ? Math.round((scanned / total) * 100) : 0;
    const presenceRate = total > 0 ? Math.round((present / total) * 100) : 0;
    const absenceRate = total > 0 ? Math.round((absent / total) * 100) : 0;

    const alerts = [];
    if (waiting > 0) {
        alerts.push({
            type: 'warning',
            title: 'Billets en attente',
            message: `${waiting} personne${waiting > 1 ? 's' : ''} n'ont pas encore été enregistrées à l'entrée.`
        });
    }
    if (scanRate > 80) {
        alerts.push({
            type: 'success',
            title: 'Forte affluence maîtrisée',
            message: `Plus de 80% des entrées ont été scannées avec succès (${scanRate}%).`
        });
    }

    return {
        success: true,
        eventId,
        eventType: event.eventType || 'private',
        eventTitle: event.titre,
        stats: {
            total,
            scanned,
            present,
            absent,
            waiting,
            scanRate,
            presenceRate,
            absenceRate
        },
        categoryDistribution,
        timeline: formattedTimeline.length > 0 ? formattedTimeline : [
            { time: '08h00', presence: 0 },
            { time: '12h00', presence: 0 },
            { time: '16h00', presence: 0 },
            { time: '20h00', presence: 0 }
        ],
        recentScans,
        alerts
    };
};

module.exports = {
    verifyQRCode,
    getEventScanStats
};
