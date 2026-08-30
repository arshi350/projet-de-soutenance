const Invites = require('../../models/invitesModel/invites');
const { eventModel } = require('../../models/eventModels/event');
const { createNotification } = require('../../services/notificationService');
const mongoose = require('mongoose');
const fs = require('fs');
const xlsx = require('xlsx');

// Ajouter un invité unique
const addInvite = async (req, res) => {
    try {
        const { nom, prenom, telephone, email, status, idEvent } = req.body;

        if (!nom || !prenom || !idEvent) {
            return res.status(400).json({ message: "Le nom, le prénom et l'id de l'événement sont obligatoires" });
        }

        if (!mongoose.Types.ObjectId.isValid(idEvent)) {
            return res.status(400).json({ message: "ID d'événement invalide" });
        }

        if (!telephone && !email) {
            return res.status(400).json({ message: "Veuillez fournir au moins un numéro de téléphone ou une adresse email" });
        }

        const invitePayload = {
            nom: nom.trim(),
            prenom: prenom.trim(),
            status: status || 'classique',
            idEvent: new mongoose.Types.ObjectId(idEvent)
        };

        if (email && email.trim()) {
            invitePayload.email = email.trim().toLowerCase();
        }
        if (telephone && telephone.trim()) {
            let formattedPhone = telephone.replace(/[\s\-\+\(\)]/g, '');
            if (formattedPhone.startsWith('237') && formattedPhone.length === 12) {
                formattedPhone = formattedPhone.substring(3);
            }
            invitePayload.telephone = formattedPhone;
        }

        const newInvite = new Invites(invitePayload);
        const savedInvite = await newInvite.save();

        try {
            const event = await eventModel.findById(idEvent);
            await createNotification({
                userId: event ? event.userId : idEvent,
                title: 'Nouvel invité ajouté',
                message: `${prenom} ${nom} a été ajouté(e) à l'événement.`,
                type: 'invite',
                referenceId: savedInvite._id,
                referenceType: 'invite'
            });
        } catch (notifErr) {
            console.warn('Notification non créée pour addInvite:', notifErr.message);
        }

        return res.status(201).json({
            message: "Invité ajouté avec succès",
            invite: savedInvite
        });
    } catch (error) {
        console.error("Erreur addInvite:", error);
        return res.status(500).json({ message: "Erreur lors de l'ajout de l'invité", error: error.message });
    }
};

// Récupérer tous les invités d'un événement
const getInvitesByEvent = async (req, res) => {
    try {
        const eventId = req.params.eventId || req.params.idEvent;
        if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
            return res.status(400).json({ message: "ID d'événement invalide ou manquant" });
        }

        const invites = await Invites.find({ idEvent: eventId }).sort({ createdAt: -1 });
        return res.status(200).json({
            count: invites.length,
            invites
        });
    } catch (error) {
        console.error("Erreur getInvitesByEvent:", error);
        return res.status(500).json({ message: "Erreur lors de la récupération des invités", error: error.message });
    }
};

// Récupérer les invités récemment scannés pour un événement
const getRecentScannedByEvent = async (req, res) => {
    try {
        const idEvent = req.params.idEvent || req.params.eventId;
        const limit = parseInt(req.query.limit) || 10;
        if (!idEvent || !mongoose.Types.ObjectId.isValid(idEvent)) {
            return res.status(400).json({ message: "ID d'événement invalide ou manquant" });
        }

        const scannedInvites = await Invites.find({ idEvent, isScanned: true })
            .sort({ updatedAt: -1 })
            .limit(limit);

        return res.status(200).json({
            count: scannedInvites.length,
            invites: scannedInvites
        });
    } catch (error) {
        console.error("Erreur getRecentScannedByEvent:", error);
        return res.status(500).json({ message: "Erreur lors de la récupération des scans récents", error: error.message });
    }
};

// Mettre à jour un invité
const updateInvite = async (req, res) => {
    try {
        const inviteId = req.params.inviteId || req.params.id;
        const { nom, prenom, email, telephone, status } = req.body;

        if (!inviteId || !mongoose.Types.ObjectId.isValid(inviteId)) {
            return res.status(400).json({ message: "ID d'invité invalide" });
        }

        const updateData = {};
        if (nom) updateData.nom = nom.trim();
        if (prenom) updateData.prenom = prenom.trim();
        if (status) updateData.status = status;
        if (email !== undefined) {
            updateData.email = email ? email.trim().toLowerCase() : undefined;
        }
        if (telephone !== undefined) {
            if (telephone) {
                let formatted = telephone.replace(/[\s\-\+\(\)]/g, '');
                if (formatted.startsWith('237') && formatted.length === 12) {
                    formatted = formatted.substring(3);
                }
                updateData.telephone = formatted;
            } else {
                updateData.telephone = undefined;
            }
        }

        const updated = await Invites.findByIdAndUpdate(inviteId, updateData, { new: true, runValidators: true });
        if (!updated) {
            return res.status(404).json({ message: "Invité introuvable" });
        }

        return res.status(200).json({ message: "Invité mis à jour", invite: updated });
    } catch (error) {
        console.error("Erreur updateInvite:", error);
        return res.status(500).json({ message: "Erreur lors de la mise à jour", error: error.message });
    }
};

// Supprimer un invité
const deleteInvite = async (req, res) => {
    try {
        const inviteId = req.params.inviteId || req.params.id;
        if (!inviteId || !mongoose.Types.ObjectId.isValid(inviteId)) {
            return res.status(400).json({ message: "ID d'invité invalide" });
        }

        const deleted = await Invites.findByIdAndDelete(inviteId);
        if (!deleted) {
            return res.status(404).json({ message: "Invité introuvable" });
        }

        // Supprimer également les invitations et QR codes liés
        try {
            const { invitationModel } = require('../../models/invitation/invitation');
            const QRCodeModel = require('../../models/invitesModel/qrcode');
            await invitationModel.deleteMany({ inviteId });
            await QRCodeModel.deleteMany({ inviteId });
        } catch (cascadeErr) {
            console.warn("Cascade delete warning:", cascadeErr.message);
        }

        return res.status(200).json({ message: "Invité, invitation et QR Code supprimés avec succès", invite: deleted });
    } catch (error) {
        console.error("Erreur deleteInvite:", error);
        return res.status(500).json({ message: "Erreur lors de la suppression", error: error.message });
    }
};

// Importer des invités depuis un fichier Excel (.xlsx, .xls) ou CSV (.csv)
const importInvites = async (req, res) => {
    let filePath = null;
    try {
        if (!req.file) {
            return res.status(400).json({ message: "Veuillez fournir un fichier Excel ou CSV (.xlsx, .xls, .csv)" });
        }
        filePath = req.file.path;

        const idEvent = req.params.idEvent || req.body.idEvent;
        if (!idEvent || !mongoose.Types.ObjectId.isValid(idEvent)) {
            return res.status(400).json({ message: "ID d'événement invalide ou manquant" });
        }

        // Nettoyer en amont les index potentiellement conflictuels
        try {
            const collection = Invites.collection;
            const indexes = await collection.indexes();
            for (const idx of indexes) {
                if ((idx.name === 'telephone_1' || idx.name === 'email_1') && !idx.sparse) {
                    await collection.dropIndex(idx.name);
                }
            }
        } catch (idxErr) {
            // Ignorer si les index sont déjà propres
        }

        const workbook = xlsx.readFile(filePath);
        const sheetName = workbook.SheetNames[0];
        if (!sheetName) {
            return res.status(400).json({ message: "Le fichier Excel est vide" });
        }

        const sheet = workbook.Sheets[sheetName];
        const rawRows = xlsx.utils.sheet_to_json(sheet, { defval: "" });

        if (!rawRows || rawRows.length === 0) {
            return res.status(400).json({ message: "Aucune donnée trouvée dans le fichier" });
        }

        const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
        const phoneRegex = /^6[25789]\d{7}$/;

        const newInvitesToInsert = [];
        let skippedCount = 0;
        const errors = [];

        // Récupérer les téléphones et emails déjà enregistrés pour CET ÉVÉNEMENT
        const existingInvitesInDb = await Invites.find({ idEvent });
        const existingEmails = new Set(existingInvitesInDb.map(i => i.email ? i.email.toLowerCase() : null).filter(Boolean));
        const existingPhones = new Set(existingInvitesInDb.map(i => i.telephone ? String(i.telephone).trim() : null).filter(Boolean));

        for (let i = 0; i < rawRows.length; i++) {
            const row = rawRows[i];
            const rowNum = i + 2;

            let nom = "";
            let prenom = "";
            let email = "";
            let telephone = "";
            let status = "classique";

            for (const key of Object.keys(row)) {
                const cleanKey = key.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
                const val = String(row[key]).trim();

                if (['nom', 'last name', 'lastname', 'nomdefamille'].includes(cleanKey)) {
                    nom = val;
                } else if (['prenom', 'first name', 'firstname'].includes(cleanKey)) {
                    prenom = val;
                } else if (['email', 'e-mail', 'courriel', 'mail'].includes(cleanKey)) {
                    email = val.toLowerCase();
                } else if (['telephone', 'phone', 'tel', 'mobile', 'contact'].includes(cleanKey)) {
                    telephone = val;
                } else if (['status', 'statut', 'type', 'categorie'].includes(cleanKey)) {
                    if (val.toLowerCase().includes('vip')) {
                        status = 'vip';
                    } else {
                        status = 'classique';
                    }
                }
            }

            let formattedPhone = telephone ? telephone.replace(/[\s\-\+\(\)]/g, '') : '';
            if (formattedPhone.startsWith('237') && formattedPhone.length === 12) {
                formattedPhone = formattedPhone.substring(3);
            }

            if (!nom || nom.length < 2) {
                errors.push(`Ligne ${rowNum} : Nom manquant ou trop court`);
                skippedCount++;
                continue;
            }
            if (!prenom || prenom.length < 2) {
                errors.push(`Ligne ${rowNum} : Prénom manquant ou trop court`);
                skippedCount++;
                continue;
            }

            const isEmailValid = email && emailRegex.test(email);
            const isPhoneValid = formattedPhone && phoneRegex.test(formattedPhone);

            if (!isEmailValid && !isPhoneValid) {
                errors.push(`Ligne ${rowNum} : Aucun email ou téléphone valide fourni pour ${prenom} ${nom}`);
                skippedCount++;
                continue;
            }

            let cleanEmail = isEmailValid ? email : undefined;
            let cleanPhone = isPhoneValid ? formattedPhone : undefined;

            if (cleanEmail && existingEmails.has(cleanEmail)) {
                errors.push(`Ligne ${rowNum} : L'email ${cleanEmail} existe déjà pour cet événement`);
                skippedCount++;
                continue;
            }
            if (cleanPhone && existingPhones.has(cleanPhone)) {
                errors.push(`Ligne ${rowNum} : Le téléphone ${cleanPhone} existe déjà pour cet événement`);
                skippedCount++;
                continue;
            }

            if (cleanEmail) existingEmails.add(cleanEmail);
            if (cleanPhone) existingPhones.add(cleanPhone);

            const docToInsert = {
                nom,
                prenom,
                status,
                idEvent: new mongoose.Types.ObjectId(idEvent)
            };

            // N'ajouter que les propriétés définies pour éviter les conflits d'indexation null
            if (cleanEmail) docToInsert.email = cleanEmail;
            if (cleanPhone) docToInsert.telephone = cleanPhone;

            newInvitesToInsert.push(docToInsert);
        }

        let insertedInvites = [];
        if (newInvitesToInsert.length > 0) {
            insertedInvites = await Invites.insertMany(newInvitesToInsert, { ordered: false });

            try {
                const event = await eventModel.findById(idEvent);
                await createNotification({
                    userId: event ? event.userId : idEvent,
                    title: 'Importation d\'invités réussie',
                    message: `${insertedInvites.length} invités ont été importés avec succès.`,
                    type: 'invite',
                    referenceId: idEvent,
                    referenceType: 'event'
                });
            } catch (notifErr) {
                console.warn('Notification non créée pour l importation d invités :', notifErr.message);
            }
        }

        const updatedInvites = await Invites.find({ idEvent });

        return res.status(200).json({
            message: `${insertedInvites.length} invité(s) importé(s) avec succès.`,
            importedCount: insertedInvites.length,
            skippedCount,
            totalRows: rawRows.length,
            errors,
            invites: updatedInvites
        });

    } catch (error) {
        console.error("Erreur lors de l'importation Excel :", error);
        return res.status(500).json({
            message: "Erreur lors du traitement du fichier Excel",
            error: error.message
        });
    } finally {
        if (filePath && fs.existsSync(filePath)) {
            try {
                fs.unlinkSync(filePath);
            } catch (err) {
                console.warn("Impossible de supprimer le fichier temporaire :", err.message);
            }
        }
    }
};

// Supprimer plusieurs invités en lot
const bulkDeleteInvites = async (req, res) => {
    try {
        const { ids, idEvent } = req.body;
        if (!Array.isArray(ids) || ids.length === 0) {
            return res.status(400).json({ success: false, message: "Liste d'identifiants requise" });
        }

        const validIds = ids.filter(id => mongoose.Types.ObjectId.isValid(id));
        const result = await Invites.deleteMany({ _id: { $in: validIds } });

        // Supprimer également les invitations et QR codes liés
        try {
            const { invitationModel } = require('../../models/invitation/invitation');
            const QRCodeModel = require('../../models/invitesModel/qrcode');
            await invitationModel.deleteMany({ inviteId: { $in: validIds } });
            await QRCodeModel.deleteMany({ inviteId: { $in: validIds } });
        } catch (cascadeErr) {
            console.warn("Cascade delete error in bulkDeleteInvites:", cascadeErr.message);
        }

        return res.status(200).json({
            success: true,
            message: `${result.deletedCount} invité(s) et leurs données associées supprimé(s) avec succès.`,
            deletedCount: result.deletedCount,
        });
    } catch (error) {
        console.error("Erreur bulkDeleteInvites:", error);
        return res.status(500).json({ success: false, message: "Erreur lors de la suppression groupée", error: error.message });
    }
};

module.exports = {
    addInvite,
    getInvitesByEvent,
    getRecentScannedByEvent,
    updateInvite,
    deleteInvite,
    bulkDeleteInvites,
    importInvites
};