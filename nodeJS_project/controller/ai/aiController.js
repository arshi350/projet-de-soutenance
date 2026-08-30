const {
  generateInvitationCopy,
  generateEventMarketing,
  optimizeTableSeating,
  processConciergeRSVP,
  processEmailConcierge
} = require('../../services/geminiService');
const { eventModel } = require('../../models/eventModels/event');

/**
 * Générer le message d'invitation avec l'IA Gemini
 * POST /api/ai/invitations/generate
 */
const generateInvitationText = async (req, res) => {
  try {
    const { eventId, eventTitle, eventType, guestName, guestStatus, tone, details } = req.body;

    let titleToUse = eventTitle;
    let typeToUse = eventType;
    let dateToUse = '';
    let locationToUse = '';

    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        titleToUse = event.titre || event.title || titleToUse;
        typeToUse = event.typeEvenement || event.category || typeToUse;
        dateToUse = event.DateDebut ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '';
        locationToUse = event.lieu || '';
      }
    }

    const result = await generateInvitationCopy({
      eventTitle: titleToUse,
      eventType: typeToUse,
      guestName: guestName || 'Invité',
      guestStatus: guestStatus || 'classique',
      tone: tone || 'Luxe & Prestigieux',
      details: details || '',
      date: dateToUse,
      location: locationToUse
    });

    return res.status(200).json({
      success: true,
      message: 'Invitation rédigée avec succès par Gemini IA',
      data: result.data
    });
  } catch (error) {
    console.error('Erreur generateInvitationText controller:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la génération de l'invitation par l'IA",
      error: error.message
    });
  }
};

/**
 * Générer une campagne marketing et réseaux sociaux pour un événement public
 * POST /api/ai/marketing/generate
 */
const generateMarketingCampaign = async (req, res) => {
  try {
    const { eventId, eventTitle, category, artists, targetAudience, highlights } = req.body;

    let titleToUse = eventTitle;
    let catToUse = category;
    let dateToUse = '';
    let locToUse = '';

    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        titleToUse = event.titre || event.title || titleToUse;
        catToUse = event.category || catToUse;
        dateToUse = event.DateDebut ? new Date(event.DateDebut).toLocaleDateString('fr-FR') : '';
        locToUse = event.lieu || '';
      }
    }

    const result = await generateEventMarketing({
      eventTitle: titleToUse,
      category: catToUse,
      date: dateToUse,
      location: locToUse,
      artists,
      targetAudience,
      highlights
    });

    return res.status(200).json({
      success: true,
      message: 'Campagne marketing générée avec succès par Gemini IA',
      data: result.data
    });
  } catch (error) {
    console.error('Erreur generateMarketingCampaign controller:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de la génération marketing",
      error: error.message
    });
  }
};

/**
 * Optimiser le plan de table d'un événement
 * POST /api/ai/seating/optimize
 */
const optimizeSeatingPlan = async (req, res) => {
  try {
    const { guests, tables } = req.body;

    if (!Array.isArray(guests) || guests.length === 0) {
      return res.status(400).json({ success: false, message: 'Liste des invités requise' });
    }

    const result = await optimizeTableSeating({
      guests,
      tables: tables || []
    });

    return res.status(200).json({
      success: true,
      message: 'Plan de table optimisé avec succès par Gemini IA',
      data: result.data
    });
  } catch (error) {
    console.error('Erreur optimizeSeatingPlan controller:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'optimisation du plan de table",
      error: error.message
    });
  }
};

/**
 * Traiter un message entrant pour le concierge RSVP (WhatsApp/SMS)
 * POST /api/ai/concierge/reply
 */
const handleConciergeMessage = async (req, res) => {
  try {
    const { message, guestName, eventId } = req.body;

    let eventDetails = {};
    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        eventDetails = {
          titre: event.titre,
          date: event.DateDebut ? new Date(event.DateDebut).toLocaleDateString('fr-FR') : '',
          heure: event.heureDebut,
          lieu: event.lieu
        };
      }
    }

    const result = await processConciergeRSVP({
      incomingMessage: message,
      guestName,
      eventDetails
    });

    return res.status(200).json({
      success: true,
      data: result.data
    });
  } catch (error) {
    console.error('Erreur handleConciergeMessage controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur assistant concierge IA',
      error: error.message
    });
  }
};

/**
 * Traiter / Rédiger un email via le Concierge Email IA
 * POST /api/ai/concierge/email
 */
const handleEmailConcierge = async (req, res) => {
  try {
    const { emailType, guestName, guestStatus, guestQuestion, eventId, customInstructions } = req.body;

    let eventDetails = {};
    if (eventId) {
      const event = await eventModel.findById(eventId);
      if (event) {
        eventDetails = {
          titre: event.titre || event.title,
          typeEvenement: event.typeEvenement || event.category,
          date: event.DateDebut ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) : '',
          heure: event.heureDebut,
          lieu: event.lieu,
          dressCode: event.dressCode
        };
      }
    }

    const result = await processEmailConcierge({
      emailType: emailType || 'GUEST_REPLY',
      guestName: guestName || 'Invité',
      guestStatus: guestStatus || 'classique',
      guestQuestion: guestQuestion || '',
      eventDetails,
      customInstructions: customInstructions || ''
    });

    return res.status(200).json({
      success: true,
      message: 'Email rédigé avec succès par le Concierge IA',
      data: result.data
    });
  } catch (error) {
    console.error('Erreur handleEmailConcierge controller:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors du traitement par le Concierge Email IA',
      error: error.message
    });
  }
};

module.exports = {
  generateInvitationText,
  generateMarketingCampaign,
  optimizeSeatingPlan,
  handleConciergeMessage,
  handleEmailConcierge
};
