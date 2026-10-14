const bcrypt = require('bcrypt');
const mongoose = require('mongoose');
const { userModel } = require('../../models/user');
const { eventModel } = require('../../models/eventModels/event');
const AgentModel = require('../../models/agent/agent');
const { sendAgentCredentialsEmail, sendEventCodeEmail } = require('../../services/brevoEmailService');
const { createNotification } = require('../../services/notificationService');

/**
 * Création d'un agent de scan pour un événement
 */
const createAgentController = async (req, res) => {
  try {
    const { email, defaultPassword, nom, prenom, eventId, sendEmailNow } = req.body;
    const organizerId = req.user?.id || req.user?._id || req.userId;

    if (!email || !defaultPassword || !eventId) {
      return res.status(400).json({
        success: false,
        message: 'L\'email, le mot de passe par défaut et l\'ID de l\'événement sont requis.'
      });
    }

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'ID d\'événement invalide.' });
    }

    // Vérifier l'événement
    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Événement introuvable.' });
    }

    // Vérifier que l'email n'est pas déjà enregistré dans les utilisateurs
    const existingUser = await userModel.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: 'Un utilisateur avec cet email existe déjà sur la plateforme.'
      });
    }

    // Hasher le mot de passe par défaut
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(defaultPassword, salt);

    // Créer le compte Utilisateur avec le rôle 'agent'
    let agentUser;
    try {
      agentUser = await userModel.create({
        first_name: prenom?.trim() || 'Agent',
        last_name: nom?.trim() || 'Scan',
        email: email.toLowerCase().trim(),
        password: hashedPassword,
        role: 'agent',
        eventId: event._id,
        organizerId: organizerId || event.userId,
        suspended: false
      });
    } catch (userErr) {
      if (userErr.code === 11000 && (userErr.errmsg?.includes('phone') || userErr.message?.includes('phone'))) {
        console.warn('⚠️ Conflit d\'index legacy phone_1 détecté dans MongoDB. Purge de l\'index et réessai...');
        try {
          await userModel.collection.dropIndex('phone_1');
        } catch (_) {}
        agentUser = await userModel.create({
          first_name: prenom?.trim() || 'Agent',
          last_name: nom?.trim() || 'Scan',
          email: email.toLowerCase().trim(),
          password: hashedPassword,
          role: 'agent',
          eventId: event._id,
          organizerId: organizerId || event.userId,
          suspended: false
        });
      } else {
        throw userErr;
      }
    }

    // Créer la fiche Agent dans la collection agent_scan
    const agentRecord = await AgentModel.create({
      userId: agentUser._id,
      eventId: event._id,
      organizerId: organizerId || event.userId,
      email: email.toLowerCase().trim(),
      nom: nom?.trim() || '',
      prenom: prenom?.trim() || '',
      defaultPassword: defaultPassword,
      isPasswordChanged: false
    });

    // Optionnel : Envoi immédiat des identifiants par email
    let emailSent = false;
    if (sendEmailNow) {
      if (!event.EventCode) {
        const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
        let code = '';
        for (let i = 0; i < 8; i++) {
          code += characters.charAt(Math.floor(Math.random() * characters.length));
        }
        event.EventCode = code;
        await event.save();
      }

      const emailResult = await sendAgentCredentialsEmail({
        agentEmail: agentUser.email,
        agentName: `${agentUser.first_name} ${agentUser.last_name}`.trim(),
        defaultPassword: defaultPassword,
        eventTitle: event.titre,
        eventCode: event.EventCode
      });
      if (emailResult.success) {
        agentRecord.credentialsSentAt = new Date();
        await agentRecord.save();
        emailSent = true;
      }
    }

    return res.status(201).json({
      success: true,
      message: 'Agent de scan créé avec succès.',
      agent: agentRecord,
      emailSent
    });

  } catch (error) {
    console.error('Erreur createAgentController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la création de l\'agent.'
    });
  }
};

/**
 * Récupération des agents pour un événement
 */
const getAgentsByEventController = async (req, res) => {
  try {
    const { eventId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'eventId invalide.' });
    }

    const agents = await AgentModel.find({ eventId }).sort({ createdAt: -1 });

    // Masquer le mot de passe s'il a été personnalisé et crypté par l'agent
    const sanitizedAgents = agents.map(agent => {
      const agentObj = agent.toObject();
      if (agentObj.isPasswordChanged) {
        agentObj.defaultPassword = '•••••••• (Crypté & Sécurisé)';
      }
      return agentObj;
    });

    return res.status(200).json({
      success: true,
      count: sanitizedAgents.length,
      agents: sanitizedAgents
    });
  } catch (error) {
    console.error('Erreur getAgentsByEventController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération des agents.'
    });
  }
};

/**
 * Envoi des identifiants (Email + Mot de passe) à un ou plusieurs agents
 */
const sendAgentCredentialsController = async (req, res) => {
  try {
    const { agentId } = req.body;

    if (!agentId || !mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ success: false, message: 'agentId invalide ou manquant.' });
    }

    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent introuvable.' });
    }

    if (agent.isPasswordChanged) {
      return res.status(400).json({
        success: false,
        message: 'L\'agent a déjà personnalisé et crypté son mot de passe. Pour des raisons de sécurité, seul l\'agent connaît son mot de passe actif.'
      });
    }

    const event = await eventModel.findById(agent.eventId);
    if (event && !event.EventCode) {
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 8; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      event.EventCode = code;
      await event.save();
    }
    const eventTitle = event ? event.titre : 'Votre Événement';
    const eventCode = event ? event.EventCode : '';

    const emailResult = await sendAgentCredentialsEmail({
      agentEmail: agent.email,
      agentName: `${agent.prenom} ${agent.nom}`.trim() || 'Agent',
      defaultPassword: agent.defaultPassword,
      eventTitle,
      eventCode
    });

    if (!emailResult.success) {
      return res.status(500).json({
        success: false,
        message: emailResult.error || 'Échec de l\'envoi de l\'email d\'identifiants.'
      });
    }

    agent.credentialsSentAt = new Date();
    await agent.save();

    return res.status(200).json({
      success: true,
      message: `Identifiants envoyés avec succès à ${agent.email}.`
    });
  } catch (error) {
    console.error('Erreur sendAgentCredentialsController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'envoi des identifiants.'
    });
  }
};

/**
 * Envoi automatique du Code d'Événement (EventCode) en un clic aux agents
 */
const sendEventCodeController = async (req, res) => {
  try {
    const { eventId, agentIds } = req.body;

    if (!eventId || !mongoose.Types.ObjectId.isValid(eventId)) {
      return res.status(400).json({ success: false, message: 'eventId invalide ou manquant.' });
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({ success: false, message: 'Événement introuvable.' });
    }

    if (!event.EventCode) {
      // Générer un EventCode s'il n'existe pas
      const characters = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
      let code = '';
      for (let i = 0; i < 6; i++) {
        code += characters.charAt(Math.floor(Math.random() * characters.length));
      }
      event.EventCode = code;
      await event.save();
    }

    let filter = { eventId };
    if (Array.isArray(agentIds) && agentIds.length > 0) {
      filter._id = { $in: agentIds };
    }

    const agents = await AgentModel.find(filter);
    if (agents.length === 0) {
      return res.status(404).json({ success: false, message: 'Aucun agent trouvé pour cet événement.' });
    }

    let sentCount = 0;
    for (const agent of agents) {
      const resEmail = await sendEventCodeEmail({
        agentEmail: agent.email,
        agentName: `${agent.prenom} ${agent.nom}`.trim() || 'Agent',
        eventTitle: event.titre,
        eventCode: event.EventCode
      });
      if (resEmail.success) {
        agent.eventCodeSentAt = new Date();
        await agent.save();
        sentCount++;
      }
    }

    return res.status(200).json({
      success: true,
      message: `Code d'événement (${event.EventCode}) envoyé par email à ${sentCount} agent(s).`,
      sentCount,
      eventCode: event.EventCode
    });
  } catch (error) {
    console.error('Erreur sendEventCodeController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de l\'envoi du code d\'événement.'
    });
  }
};

/**
 * Modification de mot de passe par l'Agent depuis l'application mobile
 */
const changeAgentPasswordController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.userId;
    const { oldPassword, newPassword } = req.body;

    if (!oldPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        message: 'L\'ancien mot de passe et le nouveau mot de passe sont requis.'
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        message: 'Le nouveau mot de passe doit contenir au moins 6 caractères.'
      });
    }

    const user = await userModel.findById(userId);
    if (!user) {
      return res.status(404).json({ success: false, message: 'Utilisateur introuvable.' });
    }

    // Vérifier l'ancien mot de passe
    const isMatch = await bcrypt.compare(oldPassword, user.password);
    if (!isMatch) {
      return res.status(400).json({
        success: false,
        message: 'L\'ancien mot de passe est incorrect.'
      });
    }

    // Hasher le nouveau mot de passe pour le compte utilisateur
    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(newPassword, salt);
    user.password = hashedPassword;
    await user.save();

    // Remplacer le mot de passe par défaut par le nouveau mot de passe crypté dans la fiche Agent
    const agent = await AgentModel.findOne({ userId: user._id });
    if (agent) {
      agent.defaultPassword = hashedPassword; // Mot de passe crypté (par sécurité, seul l'agent le possède)
      agent.isPasswordChanged = true;
      await agent.save();

      // NOTIFIER L'ORGANISATEUR DANS LES NOTIFICATIONS DE L'ÉVÉNEMENT
      const event = await eventModel.findById(agent.eventId);
      const eventTitle = event ? event.titre : 'Événement';

      try {
        await createNotification({
          userId: agent.organizerId || (event ? event.userId : user.organizerId),
          title: 'Mot de passe agent sécurisé',
          message: `L'agent de scan ${user.email} (${user.first_name} ${user.last_name}) a modifié son mot de passe pour l'événement "${eventTitle}". Le mot de passe par défaut a été remplacé et crypté.`,
          type: 'event',
          referenceId: agent.eventId,
          referenceType: 'event'
        });
      } catch (notifErr) {
        console.warn('Erreur notification changement mot de passe agent:', notifErr.message);
      }
    }

    return res.status(200).json({
      success: true,
      message: 'Mot de passe mis à jour et crypté avec succès. L\'organisateur a été notifié.'
    });
  } catch (error) {
    console.error('Erreur changeAgentPasswordController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la modification du mot de passe.'
    });
  }
};

/**
 * Suppression d'un agent de scan
 */
const deleteAgentController = async (req, res) => {
  try {
    const { agentId } = req.params;

    if (!mongoose.Types.ObjectId.isValid(agentId)) {
      return res.status(400).json({ success: false, message: 'agentId invalide.' });
    }

    const agent = await AgentModel.findById(agentId);
    if (!agent) {
      return res.status(404).json({ success: false, message: 'Agent introuvable.' });
    }

    // Supprimer le compte utilisateur et la fiche agent
    await userModel.findByIdAndDelete(agent.userId);
    await AgentModel.findByIdAndDelete(agentId);

    return res.status(200).json({
      success: true,
      message: 'Agent de scan supprimé avec succès.'
    });
  } catch (error) {
    console.error('Erreur deleteAgentController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la suppression de l\'agent.'
    });
  }
};

/**
 * Récupération de l'événement assigné à l'agent connecté
 */
const getMyAgentEventController = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.userId;

    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié.' });
    }

    // Chercher la fiche agent
    let agent = await AgentModel.findOne({ userId });
    let eventId = agent ? agent.eventId : null;

    if (!eventId) {
      const user = await userModel.findById(userId);
      if (user && user.eventId) {
        eventId = user.eventId;
      }
    }

    if (!eventId) {
      return res.status(404).json({
        success: false,
        message: 'Aucun événement assigné à cet agent.'
      });
    }

    const event = await eventModel.findById(eventId);
    if (!event) {
      return res.status(404).json({
        success: false,
        message: 'Événement assigné introuvable.'
      });
    }

    return res.status(200).json({
      success: true,
      event
    });
  } catch (error) {
    console.error('Erreur getMyAgentEventController:', error);
    return res.status(500).json({
      success: false,
      message: error.message || 'Erreur lors de la récupération de l\'événement de l\'agent.'
    });
  }
};

module.exports = {
  createAgentController,
  getAgentsByEventController,
  sendAgentCredentialsController,
  sendEventCodeController,
  changeAgentPasswordController,
  deleteAgentController,
  getMyAgentEventController
};
