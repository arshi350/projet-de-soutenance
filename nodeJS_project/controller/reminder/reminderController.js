const reminderService = require('../../services/reminderService');
const reminderAiService = require('../../services/reminderAiService');
const { eventModel } = require('../../models/eventModels/event');

/**
 * Créer une règle de rappel
 * POST /api/reminders/rules
 */
const createReminderRule = async (req, res) => {
  try {
    const { eventId, title, targetAudience, triggerType, triggerOffset, triggerUnit, channel, tone, customInstructions, template } = req.body;

    if (!eventId || !title) {
      return res.status(400).json({ success: false, message: 'eventId et title sont requis' });
    }

    const rule = await reminderService.createReminderRule({
      eventId,
      title,
      targetAudience,
      triggerType,
      triggerOffset,
      triggerUnit,
      channel,
      tone,
      customInstructions,
      template,
    });

    return res.status(201).json({
      success: true,
      message: 'Règle de relance configurée avec succès',
      data: rule,
    });
  } catch (error) {
    console.error('Erreur createReminderRule controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lister les règles d'un événement
 * GET /api/reminders/rules/:eventId
 */
const getReminderRules = async (req, res) => {
  try {
    const { eventId } = req.params;
    const rules = await reminderService.getReminderRulesByEvent(eventId);
    return res.status(200).json({ success: true, data: rules });
  } catch (error) {
    console.error('Erreur getReminderRules controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Mettre à jour une règle de rappel
 * PUT /api/reminders/rules/:ruleId
 */
const updateReminderRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const rule = await reminderService.updateReminderRule(ruleId, req.body);
    return res.status(200).json({ success: true, message: 'Règle mise à jour', data: rule });
  } catch (error) {
    console.error('Erreur updateReminderRule controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Supprimer une règle
 * DELETE /api/reminders/rules/:ruleId
 */
const deleteReminderRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    await reminderService.deleteReminderRule(ruleId);
    return res.status(200).json({ success: true, message: 'Règle supprimée avec succès' });
  } catch (error) {
    console.error('Erreur deleteReminderRule controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Déclencher manuellement l'envoi d'une règle (Test / Forçage)
 * POST /api/reminders/rules/:ruleId/trigger
 */
const triggerReminderRule = async (req, res) => {
  try {
    const { ruleId } = req.params;
    const results = await reminderService.executeReminderRule(ruleId);
    return res.status(200).json({
      success: true,
      message: `Relance exécutée : ${results.sentCount} envoyée(s), ${results.failedCount} échec(s).`,
      data: results,
    });
  } catch (error) {
    console.error('Erreur triggerReminderRule controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Générer le contenu d'un rappel par IA (Copilote Gemini)
 * POST /api/reminders/ai/generate-copy
 */
const generateReminderWithAi = async (req, res) => {
  try {
    const { eventId, targetAudience, triggerOffset, triggerUnit, channel, tone, customInstructions } = req.body;

    let eventTitle = 'Événement';
    let eventType = 'Privé';
    let eventDate = '';
    let eventLocation = '';

    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        eventTitle = event.titre || event.title || eventTitle;
        eventType = event.typeEvenement || event.category || eventType;
        eventDate = event.DateDebut
          ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })
          : '';
        eventLocation = event.lieu || '';
      }
    }

    const aiResult = await reminderAiService.generateReminderCopy({
      eventTitle,
      eventType,
      eventDate,
      eventLocation,
      targetAudience,
      triggerOffset,
      triggerUnit,
      channel,
      tone,
      customInstructions,
    });

    return res.status(200).json(aiResult);
  } catch (error) {
    console.error('Erreur generateReminderWithAi controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Analyser une réponse NLP d'un invité
 * POST /api/reminders/ai/analyze-reply
 */
const analyzeGuestReply = async (req, res) => {
  try {
    const { incomingText, eventId } = req.body;
    let eventDetails = {};
    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        eventDetails = { titre: event.titre || event.title };
      }
    }

    const analysis = await reminderAiService.analyzeGuestReplyNLP({ incomingText, eventDetails });
    return res.status(200).json(analysis);
  } catch (error) {
    console.error('Erreur analyzeGuestReply controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

/**
 * Lister les logs de relances d'un événement
 * GET /api/reminders/logs/:eventId
 */
const getReminderLogs = async (req, res) => {
  try {
    const { eventId } = req.params;
    const logs = await reminderService.getReminderLogsByEvent(eventId);
    return res.status(200).json({ success: true, data: logs });
  } catch (error) {
    console.error('Erreur getReminderLogs controller:', error);
    return res.status(500).json({ success: false, message: error.message });
  }
};

module.exports = {
  createReminderRule,
  getReminderRules,
  updateReminderRule,
  deleteReminderRule,
  triggerReminderRule,
  generateReminderWithAi,
  analyzeGuestReply,
  getReminderLogs,
};
