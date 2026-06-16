const geminiTemplateService = require('../../services/geminiService');
const Template = require('../../models/templates/Template');

// Helper pour les réponses d'erreur standardisées
const sendError = (res, status, message, details = null) => {
  console.error(`[Gemini Error] ${message}`, details);
  res.status(status).json({ 
    success: false,
    message,
    ...(details && { details }),
    timestamp: new Date().toISOString()
  });
};

const sendSuccess = (res, data, message = 'Succès', warnings = null) => {
  const response = {
    success: true,
    message,
    data,
    timestamp: new Date().toISOString()
  };
  
  if (warnings) {
    response.warnings = warnings;
  }
  
  res.status(200).json(response);
};

/**
 * Modifier un template avec l'IA et générer une image
 */
async function modifyTemplate(req, res) {
  try {
    const { templateId, prompt } = req.body;
    
    // Validation des entrées
    if (!templateId || !prompt) {
      return sendError(res, 400, 'templateId et prompt sont requis', {
        required: ['templateId', 'prompt'],
        received: { templateId, prompt }
      });
    }
    
    if (typeof prompt !== 'string' || prompt.trim().length < 3) {
      return sendError(res, 400, 'Le prompt doit contenir au moins 3 caractères');
    }
    
    // Récupérer le template depuis la base
    const templateOriginal = await Template.findById(templateId);
    
    if (!templateOriginal) {
      return sendError(res, 404, `Template non trouvé avec l'ID: ${templateId}`);
    }
    
    // Vérifier le mode dégradé
    const isDegraded = geminiTemplateService.isInDegradedMode?.() || false;
    
    // Appel au service avec génération d'image
    const result = await geminiTemplateService.modifyTemplateWithImage(
      templateOriginal,
      prompt,
      req.headers.authorization // Passer le token pour validation
    );
    
    // Log de l'action
    console.log(`[Gemini] Template ${templateId} modifié par ${req.user?.id || 'anonymous'}`);
    
    const warnings = [];
    if (result.degradedMode || isDegraded) {
      warnings.push("Service IA en mode dégradé - certains fonctionnalités sont limitées");
    }
    if (result.error) {
      warnings.push("Génération d'image temporairement indisponible - image originale conservée");
    }
    
    sendSuccess(res, {
      templateId: templateOriginal._id,
      generatedImage: result.generatedImage,
      description: result.description,
      modifications: {
        applied: !result.error,
        promptUsed: prompt,
        generatedAt: new Date().toISOString(),
        degradedMode: result.degradedMode || isDegraded || false
      }
    }, 'Template modifié avec succès', warnings.length > 0 ? warnings : null);
    
  } catch (error) {
    console.error('[Gemini] Erreur modification template:', error);
    
    // Gestion spécifique des erreurs de quota
    if (error.message?.includes('QUOTA_EXCEEDED') || error.message?.includes('429')) {
      return sendError(res, 429, 'Limite quotidienne de l\'API atteinte. Le service fonctionne en mode dégradé.', {
        retryAfter: '24h',
        limit: '20 requêtes/jour',
        degradedMode: true,
        suggestion: "Les suggestions et modifications basiques restent disponibles"
      });
    }
    
    // Erreur d'authentification
    if (error.message?.includes('API key') || error.message?.includes('auth')) {
      return sendError(res, 401, 'Erreur d\'authentification avec l\'API Gemini', {
        suggestion: "Vérifiez votre clé API dans la configuration"
      });
    }
    
    sendError(res, 500, 'Erreur lors de la modification du template', {
      error: process.env.NODE_ENV === 'development' ? error.message : undefined
    });
  }
}

/**
 * Générer des suggestions pour un template
 */
async function getSuggestions(req, res) {
  try {
    const { templateId, eventType } = req.body;
    
    if (!templateId || !eventType) {
      return sendError(res, 400, 'templateId et eventType sont requis');
    }
    
    const template = await Template.findById(templateId);
    if (!template) {
      return sendError(res, 404, 'Template non trouvé');
    }
    
    const isDegraded = geminiTemplateService.isInDegradedMode?.() || false;
    
    const suggestions = await geminiTemplateService.generateTemplateSuggestions(
      template,
      eventType
    );
    
    const warnings = [];
    if (isDegraded) {
      warnings.push("Suggestions par défaut (mode dégradé)");
    }
    
    sendSuccess(res, { 
      suggestions, 
      count: suggestions.length,
      source: isDegraded ? 'fallback' : 'ai'
    }, 'Suggestions générées avec succès', warnings.length > 0 ? warnings : null);
    
  } catch (error) {
    console.error('[Gemini] Erreur suggestions:', error);
    
    // En cas d'erreur, retourner des suggestions par défaut
    const defaultSuggestions = [
      "Rendre les couleurs plus dynamiques",
      "Ajouter une image de fond personnalisée",
      "Mettre en avant la date et le lieu",
      "Personnaliser la police d'écriture"
    ];
    
    sendSuccess(res, {
      suggestions: defaultSuggestions,
      count: defaultSuggestions.length,
      source: 'emergency_fallback',
      error: error.message
    }, 'Suggestions par défaut (service temporairement indisponible)', ['Service IA momentanément indisponible']);
  }
}

/**
 * Appliquer des modifications textuelles
 */
async function modifyText(req, res) {
  try {
    const { content, prompt } = req.body;
    
    if (!content || !prompt) {
      return sendError(res, 400, 'content et prompt sont requis');
    }
    
    const isDegraded = geminiTemplateService.isInDegradedMode?.() || false;
    
    let modifiedContent;
    let source = 'ai';
    
    try {
      modifiedContent = await geminiTemplateService.modifyTextContent(content, prompt);
      if (!modifiedContent || Object.keys(modifiedContent).length === 0) {
        // Fallback local si l'API ne retourne rien
        modifiedContent = generateTextFallback(content, prompt);
        source = 'fallback';
      }
    } catch (error) {
      console.warn('[Gemini] Fallback textuel:', error.message);
      modifiedContent = generateTextFallback(content, prompt);
      source = 'fallback';
    }
    
    const warnings = [];
    if (isDegraded || source === 'fallback') {
      warnings.push("Mode dégradé - modifications textuelles basiques appliquées");
    }
    
    sendSuccess(res, { 
      original: content,
      modified: modifiedContent,
      promptUsed: prompt,
      source
    }, 'Texte modifié avec succès', warnings.length > 0 ? warnings : null);
    
  } catch (error) {
    console.error('[Gemini] Erreur modification texte:', error);
    
    // Fallback même en cas d'erreur
    const fallbackContent = generateTextFallback(content, prompt);
    
    sendSuccess(res, {
      original: content,
      modified: fallbackContent,
      promptUsed: prompt,
      source: 'emergency_fallback',
      warning: "Service IA temporairement indisponible - modification basique appliquée"
    }, 'Texte modifié (mode secours)');
  }
}

/**
 * Modifier les couleurs
 */
async function modifyColors(req, res) {
  try {
    const { colors, prompt } = req.body;
    
    if (!colors || !prompt) {
      return sendError(res, 400, 'colors et prompt sont requis');
    }
    
    const isDegraded = geminiTemplateService.isInDegradedMode?.() || false;
    
    let newColors;
    let source = 'ai';
    
    try {
      newColors = await geminiTemplateService.modifyColors(colors, prompt);
      if (!newColors || Object.keys(newColors).length === 0) {
        newColors = generateColorFallback(colors, prompt);
        source = 'fallback';
      }
    } catch (error) {
      console.warn('[Gemini] Fallback couleurs:', error.message);
      newColors = generateColorFallback(colors, prompt);
      source = 'fallback';
    }
    
    const warnings = [];
    if (isDegraded || source === 'fallback') {
      warnings.push("Mode dégradé - palette de couleurs basique appliquée");
    }
    
    sendSuccess(res, { 
      original: colors,
      modified: newColors,
      promptUsed: prompt,
      source
    }, 'Couleurs modifiées avec succès', warnings.length > 0 ? warnings : null);
    
  } catch (error) {
    console.error('[Gemini] Erreur modification couleurs:', error);
    
    // Fallback même en cas d'erreur
    const fallbackColors = generateColorFallback(colors, prompt);
    
    sendSuccess(res, {
      original: colors,
      modified: fallbackColors,
      promptUsed: prompt,
      source: 'emergency_fallback',
      warning: "Service IA temporairement indisponible - palette de secours appliquée"
    }, 'Couleurs modifiées (mode secours)');
  }
}

/**
 * Fonction de fallback pour les modifications textuelles
 */
function generateTextFallback(content, prompt) {
  const lowerPrompt = prompt.toLowerCase();
  const result = {};
  
  // Détection du titre
  if (lowerPrompt.includes('titre') || lowerPrompt.includes('title')) {
    if (lowerPrompt.includes('gala')) result.titre = 'Soirée de Gala';
    else if (lowerPrompt.includes('mariage')) result.titre = 'Mariage Royal';
    else if (lowerPrompt.includes('anniversaire')) result.titre = 'Anniversaire Prestige';
    else result.titre = 'Invitation Spéciale';
  }
  
  // Détection du message
  if (lowerPrompt.includes('message') || lowerPrompt.includes('description')) {
    if (lowerPrompt.includes('festif')) result.message = 'Venez célébrer ce moment unique avec nous !';
    else if (lowerPrompt.includes('professionnel')) result.message = 'Nous vous invitons cordialement à notre événement.';
    else result.message = 'Une invitation personnalisée pour un moment inoubliable.';
  }
  
  // Détection de la date
  const dateMatch = prompt.match(/(\d{1,2})\/(\d{1,2})\/(\d{4})/);
  if (dateMatch) {
    result.date = `${dateMatch[1]}/${dateMatch[2]}/${dateMatch[3]}`;
  }
  
  // Détection du lieu
  const lieuMatch = prompt.match(/à\s+([A-Z][a-z]+(?:\s+[A-Z][a-z]+)?)/);
  if (lieuMatch) {
    result.lieu = lieuMatch[1];
  }
  
  return result;
}

/**
 * Fonction de fallback pour les couleurs
 */
function generateColorFallback(colors, prompt) {
  const lowerPrompt = prompt.toLowerCase();
  
  // Palettes prédéfinies selon les mots-clés
  const palettes = {
    rose: { primary: '#E91E63', secondary: '#F06292', accent: '#FF80AB', background: '#FCE4EC', text: '#880E4F' },
    bleu: { primary: '#1976D2', secondary: '#42A5F5', accent: '#64B5F6', background: '#E3F2FD', text: '#0D47A1' },
    vert: { primary: '#388E3C', secondary: '#66BB6A', accent: '#81C784', background: '#E8F5E9', text: '#1B5E20' },
    doré: { primary: '#F57F17', secondary: '#F9A825', accent: '#FBC02D', background: '#FFF8E1', text: '#E65100' },
    rouge: { primary: '#C62828', secondary: '#EF5350', accent: '#E57373', background: '#FFEBEE', text: '#B71C1C' },
    violet: { primary: '#6A1B9A', secondary: '#AB47BC', accent: '#CE93D8', background: '#F3E5F5', text: '#4A148C' }
  };
  
  for (const [key, palette] of Object.entries(palettes)) {
    if (lowerPrompt.includes(key)) {
      return palette;
    }
  }
  
  // Retourner les couleurs originales modifiées subtilement
  return {
    ...colors,
    accent: colors.accent || '#017EF7',
    primary: colors.primary || colors.accent || '#1a1a1a'
  };
}

/**
 * Répond à une salutation utilisateur - Version améliorée
 */
async function greeting(req, res) {
  try {
    const { message } = req.body;

    if (!message || typeof message !== 'string') {
      return sendError(res, 400, 'message (string) est requis');
    }

    const isDegraded = geminiTemplateService.isInDegradedMode?.() || false;
    
    let responseText;
    let source = 'ai';
    
    try {
      responseText = await geminiTemplateService.generateGreetingResponse(message);
      
      // Vérifier si la réponse est vide ou trop courte
      if (!responseText || responseText.length < 20) {
        responseText = getFallbackGreetingResponse(message);
        source = 'fallback';
      }
    } catch (error) {
      console.warn('[Gemini] Fallback greeting:', error.message);
      responseText = getFallbackGreetingResponse(message);
      source = 'fallback';
    }
    
    const warnings = [];
    if (isDegraded || source === 'fallback') {
      warnings.push("Mode dégradé - réponse basique");
    }
    
    sendSuccess(res, { 
      response: responseText,
      isGreeting: true,
      source
    }, 'Réponse générée', warnings.length > 0 ? warnings : null);
    
  } catch (error) {
    console.error('[Gemini] Erreur greeting:', error);
    
    // Fallback robuste
    const fallbackResponse = getFallbackGreetingResponse(req.body?.message);
    
    sendSuccess(res, {
      response: fallbackResponse,
      isGreeting: true,
      source: 'emergency_fallback',
      warning: "Service IA temporairement indisponible"
    }, 'Réponse de secours');
  }
}

/**
 * Réponse de fallback pour les salutations
 */
function getFallbackGreetingResponse(userMessage) {
  const lowerMessage = (userMessage || '').toLowerCase();
  
  // Détection des salutations
  if (lowerMessage.includes('bonjour') || lowerMessage.includes('salut') || lowerMessage.includes('coucou')) {
    return "Bonjour ! Je suis votre assistant design IA. Je peux vous aider à :\n• Modifier les couleurs de votre invitation\n• Personnaliser les textes (titre, date, lieu)\n• Ajuster la taille et la position du QR code\n\nQue souhaitez-vous modifier ?";
  }
  
  if (lowerMessage.includes('aide') || lowerMessage.includes('help')) {
    return "Voici ce que je peux faire pour vous :\n\n🎨 MODIFIER LES COULEURS : dites-moi \"mets le nom en bleu\" ou \"palette plus festive\"\n\n📝 MODIFIER LE TEXTE : dites-moi \"change le titre pour Soirée de Gala\" ou \"modifie la date au 15/06/2024\"\n\n🔲 MODIFIER LE QR CODE : dites-moi \"agrandis le QR code\" ou \"réduis le QR code\"\n\nDécrivez-moi simplement ce que vous souhaitez changer !";
  }
  
  return "Bonjour ! Je suis votre assistant design IA. Je peux modifier les couleurs, le texte et le QR code de votre invitation. Décrivez-moi ce que vous souhaitez changer, par exemple : \"mets le nom en bleu\" ou \"change le titre pour Soirée de Gala\".";
}

/**
 * Vérifier le statut du quota
 */
async function checkQuotaStatus(req, res) {
  try {
    const isDegraded = geminiTemplateService.isInDegradedMode?.() || false;
    
    const stats = {
      status: isDegraded ? 'degraded' : 'operational',
      degradedMode: isDegraded,
      model: {
        text: 'gemini-2.5-flash',
        image: 'gemini-3-pro-image-preview'
      },
      limits: {
        daily: '20 requêtes/jour (gratuit)',
        upgradeInfo: 'https://ai.google.dev/pricing'
      },
      cacheSize: responseCache?.size || 0,
      suggestions: {
        message: isDegraded ? "Suggestions par défaut actives" : "Suggestions IA disponibles"
      }
    };
    
    sendSuccess(res, stats, 'Statut du service Gemini');
  } catch (error) {
    console.error('[Gemini] Erreur statut:', error);
    sendSuccess(res, {
      status: 'unknown',
      error: error.message,
      degradedMode: true
    }, 'Statut partiel');
  }
}

// Variable pour suivre la taille du cache (à synchroniser avec geminiService)
let responseCache = { size: 0 };

module.exports = {
  modifyTemplate,
  getSuggestions,
  modifyText,
  modifyColors,
  greeting,
  checkQuotaStatus
};