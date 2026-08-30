const mongoose = require('mongoose');
const crypto = require('crypto');
const { eventModel } = require('../../models/eventModels/event');
const TicketCategory = require('../../models/ticketCategory/ticketCategory');
const PurchasedTicket = require('../../models/purchasedTicket/purchasedTicket');
const TicketLock = require('../../models/ticketLock/ticketLock');
const pricingService = require('../../services/pricingService');
const paymentService = require('../../services/paymentService');
const ticketPdfService = require('../../services/ticketPdfService');
const { sendEmail } = require('../../services/brevoEmailService');

/**
 * Récupère les données publiques d'un événement pour sa billetterie en ligne
 */
const getPublicEventDetails = async (req, res) => {
    try {
        const { eventId } = req.params;

        if (!mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ success: false, message: "Identifiant d'événement invalide." });
        }

        const event = await eventModel.findById(eventId).select('-userId -EventCode');
        if (!event) {
            return res.status(404).json({ success: false, message: "Événement introuvable." });
        }

        // Récupération des catégories de billets actives
        const categories = await TicketCategory.find({ eventId, isActive: true });

        const formattedCategories = categories.map(cat => {
            const availableCount = Math.max(0, cat.capacity - cat.soldCount - (cat.reservedCount || 0));
            return {
                id: cat._id,
                name: cat.name,
                description: cat.description,
                price: cat.price,
                capacity: cat.capacity,
                soldCount: cat.soldCount,
                availableCount,
                isSoldOut: availableCount <= 0,
                aiBackgroundUrl: cat.aiBackgroundUrl,
                benefits: cat.benefits
            };
        });

        return res.status(200).json({
            success: true,
            event: {
                id: event._id,
                titre: event.titre,
                description: event.description,
                DateDebut: event.DateDebut,
                DateFin: event.DateFin,
                heureDebut: event.heureDebut,
                heureFin: event.heureFin,
                lieu: event.lieu,
                categorie: event.categorie,
                image: event.image,
                eventType: event.eventType
            },
            categories: formattedCategories
        });
    } catch (err) {
        console.error("Erreur getPublicEventDetails:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de la récupération des détails de l'événement." });
    }
};

/**
 * Création d'une catégorie de billets (Organisateur)
 */
const createTicketCategory = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { name, price, capacity, description, aiBackgroundUrl, aiPrompt, benefits } = req.body;

        if (!name || price === undefined || !capacity) {
            return res.status(400).json({ success: false, message: "Nom, prix et capacité sont obligatoires." });
        }

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Événement introuvable." });
        }

        const newCategory = new TicketCategory({
            eventId,
            name,
            price: Number(price),
            capacity: Number(capacity),
            description: description || '',
            aiBackgroundUrl: aiBackgroundUrl || '',
            aiPrompt: aiPrompt || '',
            benefits: benefits || []
        });

        await newCategory.save();

        return res.status(201).json({
            success: true,
            message: "Catégorie de billets créée avec succès.",
            category: newCategory
        });
    } catch (err) {
        console.error("Erreur createTicketCategory:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de la création de la catégorie." });
    }
};

/**
 * Récupération des catégories pour un événement (Organisateur)
 */
const getEventTicketCategories = async (req, res) => {
    try {
        const { eventId } = req.params;
        if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ success: false, message: "Identifiant d'événement invalide." });
        }
        const categories = await TicketCategory.find({ eventId, isActive: { $ne: false } }).sort({ createdAt: -1 });
        return res.status(200).json({ success: true, categories });
    } catch (err) {
        console.error("Erreur getEventTicketCategories:", err);
        return res.status(500).json({ success: false, message: "Erreur de récupération des catégories." });
    }
};

const { suggestTicketBackgrounds } = require('../../services/aiTicketBackgroundService');

/**
 * Suggestions d'arrières-plans de billets par IA adaptées au type d'événement
 */
const getAITicketBackgrounds = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { eventType, title, description, theme } = req.body || {};

        let typeToUse = eventType;
        let titleToUse = title;
        let descToUse = description;

        if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
            const event = await eventModel.findById(eventId);
            if (event) {
                typeToUse = typeToUse || event.eventType || event.categorie || event.category || 'concert';
                titleToUse = titleToUse || event.titre || event.title;
                descToUse = descToUse || event.description;
            }
        }

        const result = await suggestTicketBackgrounds({
            eventType: typeToUse || 'concert',
            title: titleToUse || '',
            description: descToUse || '',
            theme: theme || ''
        });

        return res.status(200).json(result);
    } catch (err) {
        console.error("Erreur getAITicketBackgrounds:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de la suggestion des fonds." });
    }
};

/**
 * Upload d'une image d'arrière-plan personnalisée par l'organisateur
 */
const uploadTicketBackground = async (req, res) => {
    try {
        if (!req.file) {
            return res.status(400).json({ success: false, message: "Aucun fichier image fourni." });
        }

        const host = req.get('host') || 'localhost:3000';
        const protocol = req.protocol || 'http';
        const fileUrl = `${protocol}://${host}/uploads/${req.file.filename}`;

        return res.status(200).json({
            success: true,
            message: "Image importée avec succès !",
            url: fileUrl,
            filename: req.file.filename
        });
    } catch (err) {
        console.error("Erreur uploadTicketBackground:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de l'import de l'image." });
    }
};

/**
 * Suppression définitive d'une catégorie de billet en base de données
 */
const deleteTicketCategory = async (req, res) => {
    try {
        const { categoryId } = req.params;
        if (!categoryId || !mongoose.Types.ObjectId.isValid(categoryId)) {
            return res.status(400).json({ success: false, message: "Identifiant de catégorie invalide." });
        }

        const category = await TicketCategory.findById(categoryId);
        if (!category) {
            return res.status(404).json({ success: false, message: "Catégorie de billet introuvable." });
        }

        // Suppression définitive en base de données MongoDB
        await TicketCategory.findByIdAndDelete(categoryId);

        // Nettoyage des réservations temporaires associées
        await TicketLock.deleteMany({ 'items.ticketCategoryId': categoryId });

        return res.status(200).json({ 
            success: true, 
            message: `Le billet « ${category.name} » a été définitivement supprimé de la base de données.`,
            deleted: true
        });
    } catch (err) {
        console.error("Erreur deleteTicketCategory:", err);
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression de la catégorie." });
    }
};

/**
 * Verrouillage temporaire du panier (Time-lock 10 min)
 */
const lockTickets = async (req, res) => {
    try {
        const { eventId, items, buyerInfo } = req.body; // items: [{ ticketCategoryId, quantity }]

        if (!eventId || !items || !items.length) {
            return res.status(400).json({ success: false, message: "Données de réservation incomplètes." });
        }

        const event = await eventModel.findById(eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Événement introuvable." });
        }

        let totalAmount = 0;
        const lockedItems = [];

        // Vérification des stocks pour chaque catégorie
        for (const item of items) {
            const category = await TicketCategory.findById(item.ticketCategoryId);
            if (!category || !category.isActive) {
                return res.status(404).json({ success: false, message: `Catégorie introuvable.` });
            }

            const requestedQty = Math.max(1, parseInt(item.quantity, 10));
            const available = category.capacity - category.soldCount - (category.reservedCount || 0);

            if (available < requestedQty) {
                return res.status(400).json({
                    success: false,
                    message: `Stock insuffisant pour la catégorie ${category.name}. Places restantes : ${available}`
                });
            }

            const pricing = pricingService.calculateTicketPriceAndCommission({
                unitPrice: category.price,
                quantity: requestedQty,
                feeBearer: event.pricing?.publicFeeBearer || 'buyer'
            });

            totalAmount += pricing.buyerTotal;

            lockedItems.push({
                ticketCategoryId: category._id,
                quantity: requestedQty,
                unitPrice: category.price
            });

            // Incrémenter reservedCount
            category.reservedCount = (category.reservedCount || 0) + requestedQty;
            await category.save();
        }

        const lockToken = `LOCK-${Date.now()}-${crypto.randomBytes(6).toString('hex')}`;
        const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 minutes

        const ticketLock = new TicketLock({
            lockToken,
            eventId,
            items: lockedItems,
            buyerInfo: buyerInfo || {},
            totalAmount,
            expiresAt
        });

        await ticketLock.save();

        return res.status(200).json({
            success: true,
            lockToken,
            expiresAt,
            totalAmount: Number(totalAmount.toFixed(2)),
            message: "Places réservées pour 10 minutes."
        });
    } catch (err) {
        console.error("Erreur lockTickets:", err);
        return res.status(500).json({ success: false, message: "Erreur lors du verrouillage des billets." });
    }
};

/**
 * Validation de la commande et paiement B2C
 */
const checkoutTickets = async (req, res) => {
    try {
        const { lockToken, buyerName, buyerEmail, buyerPhone, paymentMethod } = req.body;

        if (!lockToken || !buyerName || !buyerEmail) {
            return res.status(400).json({ success: false, message: "Informations acheteur obligatoires." });
        }

        const lock = await TicketLock.findOne({ lockToken, status: 'pending' });
        if (!lock) {
            return res.status(404).json({ success: false, message: "Session de réservation expirée ou introuvable." });
        }

        if (new Date() > new Date(lock.expiresAt)) {
            lock.status = 'expired';
            await lock.save();
            return res.status(400).json({ success: false, message: "La réservation de 10 minutes a expiré. Veuillez recommencer." });
        }

        const event = await eventModel.findById(lock.eventId);
        if (!event) {
            return res.status(404).json({ success: false, message: "Événement introuvable." });
        }

        // Traitement du paiement
        const paymentResult = await paymentService.processPayment({
            amount: lock.totalAmount,
            currency: 'EUR',
            description: `Achat billets - ${event.titre}`,
            customerEmail: buyerEmail,
            paymentMethod: paymentMethod || 'card'
        });

        if (!paymentResult.success) {
            return res.status(400).json({ success: false, message: "Paiement refusé." });
        }

        // Création des billets achetés
        const generatedTickets = [];

        for (const item of lock.items) {
            const category = await TicketCategory.findById(item.ticketCategoryId);

            for (let i = 0; i < item.quantity; i++) {
                const ticketNumber = `TKT-${event._id.toString().slice(-4).toUpperCase()}-${Date.now().toString().slice(-6)}-${crypto.randomBytes(2).toString('hex').toUpperCase()}`;
                const tempTicketId = new mongoose.Types.ObjectId();

                // Génération du token signé JWT
                const qrCodeToken = ticketPdfService.generateSignedTicketToken({
                    ticketId: tempTicketId.toString(),
                    eventId: event._id.toString(),
                    ticketNumber,
                    buyerEmail
                });

                // Génération du QR Code DataURL
                const qrCodeImage = await ticketPdfService.generateQrCodeDataUrl(qrCodeToken);

                const purchasedTicket = new PurchasedTicket({
                    _id: tempTicketId,
                    eventId: event._id,
                    ticketCategoryId: category._id,
                    ticketNumber,
                    buyerName,
                    buyerEmail,
                    buyerPhone: buyerPhone || '',
                    qrCodeToken,
                    qrCodeImage,
                    unitPrice: item.unitPrice,
                    totalAmount: item.unitPrice,
                    paymentReference: paymentResult.transactionId,
                    status: 'valid'
                });

                await purchasedTicket.save();

                generatedTickets.push({
                    id: purchasedTicket._id,
                    ticketNumber,
                    categoryName: category.name,
                    buyerName,
                    qrCodeToken,
                    qrCodeImage
                });
            }

            // Mise à jour des compteurs de la catégorie
            category.soldCount = (category.soldCount || 0) + item.quantity;
            category.reservedCount = Math.max(0, (category.reservedCount || 0) - item.quantity);
            await category.save();
        }

        // Finalisation du lock
        lock.status = 'completed';
        await lock.save();

        // Envoi d'email de confirmation
        try {
            await sendEmail({
                email: buyerEmail,
                subject: `Vos billets officiels pour ${event.titre}`,
                html: `
                <div style="font-family: Arial, sans-serif; background-color: #0f172a; color: #ffffff; padding: 30px; border-radius: 12px;">
                    <h2 style="color: #6366f1;">Confirmation de votre commande</h2>
                    <p>Bonjour <strong>${buyerName}</strong>,</p>
                    <p>Votre commande pour l'événement <strong>${event.titre}</strong> a été validée avec succès.</p>
                    <p>Nombre de billets : <strong>${generatedTickets.length}</strong></p>
                    <p>Référence transaction : <code>${paymentResult.transactionId}</code></p>
                    <div style="margin-top: 25px;">
                        <a href="http://localhost:5173/ticket/download/${generatedTickets[0].qrCodeToken}" 
                           style="background: #6366f1; color: #ffffff; padding: 12px 24px; text-decoration: none; border-radius: 8px; font-weight: bold; display: inline-block;">
                            Télécharger mes billets
                        </a>
                    </div>
                </div>
                `
            });
        } catch (emailErr) {
            console.warn("Notification email d'achat non envoyée :", emailErr.message);
        }

        return res.status(200).json({
            success: true,
            message: "Achat validé et billets générés avec succès !",
            transactionId: paymentResult.transactionId,
            tickets: generatedTickets
        });
    } catch (err) {
        console.error("Erreur checkoutTickets:", err);
        return res.status(500).json({ success: false, message: "Erreur lors du traitement de la commande." });
    }
};

/**
 * Téléchargement / Affichage du billet officiel
 */
const getTicketDownload = async (req, res) => {
    try {
        const { token } = req.params;
        const verification = ticketPdfService.verifyTicketToken(token);

        let ticket = null;
        if (verification.valid && verification.payload?.ticketId) {
            ticket = await PurchasedTicket.findById(verification.payload.ticketId);
        } else {
            ticket = await PurchasedTicket.findOne({ qrCodeToken: token });
        }

        if (!ticket) {
            return res.status(404).send("<h1>Billet introuvable</h1>");
        }

        const event = await eventModel.findById(ticket.eventId);
        const category = await TicketCategory.findById(ticket.ticketCategoryId);

        const qrCodeDataUrl = await ticketPdfService.generateQrCodeDataUrl(ticket.qrCodeToken);

        const html = ticketPdfService.generateTicketHtml({
            event: event || { titre: 'Événement', lieu: 'Lieu', DateDebut: new Date() },
            category: category || { name: 'Billet Standard', aiBackgroundUrl: '' },
            ticket,
            qrCodeDataUrl
        });

        res.setHeader('Content-Type', 'text/html');
        return res.send(html);
    } catch (err) {
        console.error("Erreur getTicketDownload:", err);
        return res.status(500).send("<h1>Erreur lors du chargement du billet</h1>");
    }
};

const { getSalesAnalytics, exportSalesCSV } = require('../../services/salesStatsService');

/**
 * Récupère l'ensemble des statistiques de vente et de revenus pour un événement (Organisateur)
 */
const getEventSalesAnalytics = async (req, res) => {
    try {
        const { eventId } = req.params;
        const analytics = await getSalesAnalytics(eventId);
        return res.status(200).json(analytics);
    } catch (err) {
        console.error("Erreur getEventSalesAnalytics:", err);
        return res.status(500).json({ 
            success: false, 
            message: err.message || "Erreur lors de la récupération des statistiques de vente." 
        });
    }
};

/**
 * Exporte l'historique complet des ventes de billets au format CSV
 */
const getEventSalesExport = async (req, res) => {
    try {
        const { eventId } = req.params;
        const { csvContent, filename } = await exportSalesCSV(eventId);

        res.setHeader('Content-Type', 'text/csv; charset=utf-8');
        res.setHeader('Content-Disposition', `attachment; filename="${filename}"`);
        return res.status(200).send(csvContent);
    } catch (err) {
        console.error("Erreur getEventSalesExport:", err);
        return res.status(500).json({ 
            success: false, 
            message: err.message || "Erreur lors de l'export des données de vente." 
        });
    }
};

module.exports = {
    getPublicEventDetails,
    createTicketCategory,
    getEventTicketCategories,
    getAITicketBackgrounds,
    uploadTicketBackground,
    deleteTicketCategory,
    lockTickets,
    checkoutTickets,
    getTicketDownload,
    getEventSalesAnalytics,
    getEventSalesExport
};
