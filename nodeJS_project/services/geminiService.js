const { GoogleGenAI } = require('@google/genai');
const fs = require('fs').promises;
const path = require('path');
const crypto = require('crypto');
const axios = require('axios');
require('dotenv').config();

// Configuration
const GEMINI_MODEL = {
  TEXT: 'gemini-2.5-flash',
  IMAGE: 'gemini-3-pro-image-preview' // Modèle pour génération d'images
};

// Cache simple pour éviter les appels redondants (durée de vie: 1 heure)
const responseCache = new Map();
const CACHE_TTL = 3600000; // 1 heure

// Compteur de requêtes pour le rate limiting
let requestCount = 0;
let lastResetTime = Date.now();
const MAX_REQUESTS_PER_DAY = 18; // Garder une marge sur la limite de 20

// Mode dégradé pour le quota
let isQuotaExhausted = false;
let quotaResetTime = null;

// INITIALISATION DU CLIENT GEMINI
const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY
});

/**
 * Vérifie et gère le rate limiting
 */
async function checkRateLimit() {
  const now = Date.now();
  
  // Réinitialiser le compteur quotidien si nécessaire (Pacific Time)
  const lastReset = new Date(lastResetTime);
  const nowDate = new Date(now);
  const isNewDay = lastReset.getDate() !== nowDate.getDate() || 
                   lastReset.getMonth() !== nowDate.getMonth();
  
  if (isNewDay) {
    requestCount = 0;
    lastResetTime = now;
    isQuotaExhausted = false;
    quotaResetTime = null;
    console.log('✅ Quota quotidien réinitialisé');
  }
  
  if (requestCount >= MAX_REQUESTS_PER_DAY) {
    const timeUntilReset = getTimeUntilPacificMidnight();
    isQuotaExhausted = true;
    throw new Error(`QUOTA_EXCEEDED: Limite quotidienne atteinte. Réinitialisation dans ${Math.ceil(timeUntilReset / 3600000)} heures.`);
  }
  
  requestCount++;
}

/**
 * Calcule le temps jusqu'à minuit (heure du Pacifique)
 */
function getTimeUntilPacificMidnight() {
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const midnight = new Date(pacificTime);
  midnight.setHours(24, 0, 0, 0);
  return midnight - pacificTime;
}

/**
 * Vérifie si le service est en mode dégradé
 */
function isInDegradedMode() {
  if (isQuotaExhausted) return true;
  const now = new Date();
  const pacificTime = new Date(now.toLocaleString('en-US', { timeZone: 'America/Los_Angeles' }));
  const midnight = new Date(pacificTime);
  midnight.setHours(24, 0, 0, 0);
  return now >= midnight ? false : isQuotaExhausted;
}

/**
 * Génère une clé de cache à partir du prompt et du template
 */
function getCacheKey(templateId, userPrompt, operation) {
  const hash = crypto.createHash('md5')
    .update(`${templateId}|${userPrompt}|${operation}`)
    .digest('hex');
  return `${operation}_${hash}`;
}

/**
 * Récupère une réponse du cache si disponible
 */
function getFromCache(key) {
  const cached = responseCache.get(key);
  if (cached && (Date.now() - cached.timestamp) < CACHE_TTL) {
    return cached.data;
  }
  responseCache.delete(key);
  return null;
}

/**
 * Sauvegarde une réponse dans le cache
 */
function saveToCache(key, data) {
  responseCache.set(key, { data, timestamp: Date.now() });
  
  // Nettoyer le cache s'il devient trop grand
  if (responseCache.size > 100) {
    const oldestKey = responseCache.keys().next().value;
    responseCache.delete(oldestKey);
  }
}

/**
 * Fonction générique avec retry automatique
 */
async function callGeminiWithRetry(fn, maxRetries = 3) {
  let lastError;
  
  for (let i = 0; i < maxRetries; i++) {
    try {
      await checkRateLimit();
      return await fn();
    } catch (error) {
      lastError = error;
      const errorMsg = error.message?.toLowerCase() || '';
      
      // Rate limit - attente avec backoff exponentiel
      if (errorMsg.includes('429') || errorMsg.includes('quota') || errorMsg.includes('resource_exhausted')) {
        isQuotaExhausted = true;
        const delay = Math.min(1000 * Math.pow(2, i), 16000);
        console.log(`⚠️ Rate limit atteint, nouvelle tentative dans ${delay}ms (tentative ${i + 1}/${maxRetries})`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Erreur serveur - réessayer
      if (errorMsg.includes('500') || errorMsg.includes('503') || errorMsg.includes('unavailable')) {
        const delay = 1000 * (i + 1);
        console.log(`Erreur serveur, nouvelle tentative dans ${delay}ms`);
        await new Promise(resolve => setTimeout(resolve, delay));
        continue;
      }
      
      // Autres erreurs - ne pas réessayer
      throw error;
    }
  }
  
  throw lastError;
}

/**
 * Convertit une URL ou un chemin de fichier en base64
 * @param {string} imageUrl - URL ou chemin de l'image
 * @returns {Promise<{base64: string, mimeType: string}>}
 */
async function imageUrlToBase64(imageUrl) {
  try {
    let data;
    let mimeType = 'image/png';
    
    console.log(`🖼️ Conversion de l'image: ${imageUrl}`);
    
    if (imageUrl.startsWith('http://') || imageUrl.startsWith('https://')) {
      const response = await axios.get(imageUrl, {
        responseType: 'arraybuffer',
        timeout: 30000
      });
      data = Buffer.from(response.data, 'binary');
      
      if (response.headers['content-type']) {
        mimeType = response.headers['content-type'];
      }
    } 
    else {
      let fullPath = imageUrl;
      if (!path.isAbsolute(imageUrl)) {
        if (imageUrl.startsWith('/uploads/')) {
          fullPath = path.join(process.cwd(), imageUrl);
        } else {
          fullPath = path.join(process.cwd(), 'uploads', path.basename(imageUrl));
        }
      }
      
      console.log(`📁 Lecture du fichier local: ${fullPath}`);
      await fs.access(fullPath);
      data = await fs.readFile(fullPath);
      
      const ext = path.extname(fullPath).toLowerCase();
      const mimeTypes = {
        '.jpg': 'image/jpeg',
        '.jpeg': 'image/jpeg',
        '.png': 'image/png',
        '.gif': 'image/gif',
        '.webp': 'image/webp',
        '.svg': 'image/svg+xml'
      };
      mimeType = mimeTypes[ext] || 'image/png';
    }
    
    const base64 = data.toString('base64');
    console.log(`✅ Image convertie avec succès (${mimeType}, ${Math.round(base64.length / 1024)}KB)`);
    
    return { base64, mimeType };
  } catch (error) {
    console.error('❌ Erreur conversion image en base64:', error.message);
    throw new Error(`Impossible de charger l'image: ${error.message}`);
  }
}

/**
 * Extrait le base64 d'une image depuis différents formats
 */
async function extractImageData(imageSource) {
  if (imageSource && imageSource.startsWith('data:image')) {
    const matches = imageSource.match(/^data:([^;]+);base64,(.+)$/);
    if (matches) {
      console.log('📦 Format data URL détecté');
      return {
        base64: matches[2],
        mimeType: matches[1]
      };
    }
  }
  
  if (imageSource && imageSource.length > 100 && !imageSource.includes('://') && !imageSource.startsWith('/')) {
    console.log('📦 Format base64 pur détecté');
    return {
      base64: imageSource,
      mimeType: 'image/png'
    };
  }
  
  if (imageSource) {
    console.log('🌐 Conversion depuis URL/chemin');
    return await imageUrlToBase64(imageSource);
  }
  
  throw new Error('Aucune source d\'image fournie');
}

/**
 * Génère une image modifiée à partir d'un template et d'un prompt
 */
async function generateModifiedTemplateImage(template, userPrompt, imageSource = null) {
  const cacheKey = getCacheKey(template._id || template.id, userPrompt, 'generate_image');
  const cached = getFromCache(cacheKey);
  
  if (cached) {
    console.log('✅ Réponse du cache');
    return cached;
  }
  
  if (isInDegradedMode()) {
    console.log('⚠️ Mode dégradé actif, retour de l\'image originale');
    let originalImage = null;
    try {
      if (imageSource || template.image) {
        const imgData = await extractImageData(imageSource || template.image);
        originalImage = `data:${imgData.mimeType};base64,${imgData.base64}`;
      }
    } catch (e) {
      originalImage = template.image || null;
    }
    
    return {
      imageUrl: originalImage,
      description: `⚠️ Service de génération d'images temporairement indisponible. Réessayez demain.`,
      modifiedData: template,
      degradedMode: true
    };
  }
  
  return callGeminiWithRetry(async () => {
    try {
      const enhancedPrompt = buildImageGenerationPrompt(template, userPrompt);
      const contents = [];
      
      if (imageSource) {
        const imageData = await extractImageData(imageSource);
        contents.push({
          text: "Voici le template original à modifier."
        });
        contents.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64
          }
        });
      } else if (template.image) {
        const imageData = await extractImageData(template.image);
        contents.push({
          text: "Voici le template original à modifier:"
        });
        contents.push({
          inlineData: {
            mimeType: imageData.mimeType,
            data: imageData.base64
          }
        });
      }
      
      contents.push({ text: enhancedPrompt });
      
      console.log('📤 Envoi de la requête à Gemini');
      
      const response = await ai.models.generateContent({
        model: GEMINI_MODEL.IMAGE,
        contents: contents,
        config: {
          temperature: 0.8,
          topP: 0.95,
          topK: 40,
          maxOutputTokens: 8192,
          responseModalities: ["TEXT", "IMAGE"]
        }
      });
      
      const result = parseImageGenerationResponse(response);
      saveToCache(cacheKey, result);
      
      return result;
    } catch (error) {
      console.error('❌ Erreur génération image:', error.message);
      
      let originalImage = null;
      try {
        if (imageSource || template.image) {
          const imgData = await extractImageData(imageSource || template.image);
          originalImage = `data:${imgData.mimeType};base64,${imgData.base64}`;
        }
      } catch (e) {
        originalImage = template.image || null;
      }
      
      return {
        imageUrl: originalImage,
        description: `⚠️ Génération temporairement indisponible. ${error.message}`,
        modifiedData: template,
        error: true
      };
    }
  });
}

function buildImageGenerationPrompt(template, userPrompt) {
  const templateStructure = template.structure || {};
  const colors = templateStructure.couleurs || {};
  
  return `Tu es un expert en design d'invitations événementielles.

STRUCTURE ACTUELLE :
- Titre : "${templateStructure.titre || template.titre || 'Invitation'}"
- Sous-titre : "${templateStructure.sousTitre || template.description || ''}"
- Date : "${templateStructure.date || ''}"
- Lieu : "${templateStructure.lieu || ''}"
- Couleur principale : ${colors.primary || '#1a1a1a'}
- Couleur d'accent : ${colors.accent || '#017EF7'}

DEMANDE : "${userPrompt}"

Génère une invitation modifiée selon la demande.`;
}

function parseImageGenerationResponse(response) {
  const result = { imageUrl: null, description: '', modifiedData: null };
  
  if (!response || !response.candidates || !response.candidates[0]) {
    throw new Error('Réponse API invalide');
  }
  
  const candidate = response.candidates[0];
  const parts = candidate.content?.parts || [];
  
  for (const part of parts) {
    if (part.inlineData && part.inlineData.data) {
      const mimeType = part.inlineData.mimeType || 'image/png';
      const base64Data = part.inlineData.data;
      result.imageUrl = `data:${mimeType};base64,${base64Data}`;
      console.log('🖼️ Image générée avec succès');
    }
    
    if (part.text) {
      result.description += part.text;
    }
  }
  
  if (!result.imageUrl) {
    throw new Error('Aucune image générée dans la réponse');
  }
  
  return result;
}

async function modifyTemplateWithImage(templateOriginal, userPrompt, token) {
  if (!token) {
    throw new Error('Authentification requise');
  }
  
  let imageSource = templateOriginal.imageBase64 || templateOriginal.image || templateOriginal.imageUrl;
  
  console.log(`🎨 Modification du template avec l'IA`);
  console.log(`📝 Prompt: "${userPrompt.substring(0, 100)}..."`);
  
  const result = await generateModifiedTemplateImage(templateOriginal, userPrompt, imageSource);
  
  const modifiedTemplate = {
    ...(typeof templateOriginal.toObject === 'function' ? templateOriginal.toObject() : templateOriginal),
    generatedImage: result.imageUrl,
    lastModifiedByAI: new Date(),
    lastPrompt: userPrompt,
    generationDescription: result.description
  };
  
  return {
    template: modifiedTemplate,
    generatedImage: result.imageUrl,
    description: result.description
  };
}

async function modifyTemplateWithPrompt(templateOriginal, userPrompt) {
  const prompt = `
Tu es un expert en design de billets d'invitations.

Template original :
${JSON.stringify(templateOriginal.structure || templateOriginal, null, 2)}

L'utilisateur demande : "${userPrompt}"

Retourne UNIQUEMENT le JSON modifié.
`;

  const responseText = await callGeminiWithRetry(async () => {
    const response = await ai.models.generateContent({
      model: GEMINI_MODEL.TEXT,
      contents: prompt
    });
    return response.text || response.candidates?.[0]?.content || '';
  });
  
  const jsonMatch = responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      const modifiedStructure = JSON.parse(jsonMatch[0]);
      const base = typeof templateOriginal.toObject === 'function' 
        ? templateOriginal.toObject() 
        : { ...templateOriginal };
      
      return {
        template: {
          ...base,
          structure: modifiedStructure,
          version: (templateOriginal.version || 0) + 1,
          derniereModification: new Date()
        },
        preview: await generateTemplatePreview(templateOriginal.structure, modifiedStructure, userPrompt)
      };
    } catch (e) {
      console.error('Erreur parsing JSON:', e.message);
      return { template: templateOriginal, preview: 'Aucun aperçu disponible' };
    }
  }
  
  return { template: templateOriginal, preview: 'Aucun aperçu disponible' };
}

async function generateTemplatePreview(originalStructure, modifiedStructure, userPrompt) {
  return callGeminiWithRetry(async () => {
    const prompt = `
Présente les changements appliqués à un template d'invitation.

Original: ${JSON.stringify(originalStructure, null, 2)}
Modifié: ${JSON.stringify(modifiedStructure, null, 2)}
Demande: "${userPrompt}"

Donne un court aperçu en français des modifications. Retourne uniquement le texte.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL.TEXT,
      contents: prompt
    });
    
    const text = response.text || response.candidates?.[0]?.content || '';
    return text.trim() || 'Aperçu non disponible';
  }).catch(() => 'Aperçu non disponible');
}

async function generateTemplateSuggestions(template, eventType) {
  const cacheKey = getCacheKey(template._id || template.id, eventType, 'suggestions');
  const cached = getFromCache(cacheKey);
  if (cached) return cached;
  
  if (isInDegradedMode()) {
    console.log('⚠️ Mode dégradé, suggestions par défaut');
    return getDefaultSuggestions(eventType);
  }
  
  return callGeminiWithRetry(async () => {
    const prompt = `
Propose 4 suggestions de modification pour un événement "${eventType}".

Template: ${JSON.stringify(template.structure || template, null, 2)}

Retourne UNIQUEMENT un tableau JSON de 4 suggestions.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL.TEXT,
      contents: prompt
    });
    
    const responseText = response.text || response.candidates?.[0]?.content || '';
    const jsonMatch = responseText.match(/\[[\s\S]*\]/);
    
    let suggestions = [];
    if (jsonMatch) {
      try {
        suggestions = JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing suggestions:', e.message);
      }
    }
    
    if (!suggestions.length) {
      suggestions = getDefaultSuggestions(eventType);
    }
    
    saveToCache(cacheKey, suggestions);
    return suggestions;
  });
}

function getDefaultSuggestions(eventType) {
  const suggestions = {
    'mariage': [
      "Ajouter une touche romantique avec des cœurs",
      "Changer les couleurs pour du rose et blanc",
      "Mettre en avant la date du mariage",
      "Ajouter les noms des mariés"
    ],
    'anniversaire': [
      "Ajouter des éléments festifs et colorés",
      "Personnaliser avec l'âge de l'anniversaire",
      "Mettre en avant le code vestimentaire",
      "Ajouter une section pour les cadeaux"
    ],
    'entreprise': [
      "Adopter un style plus professionnel",
      "Mettre en avant les objectifs",
      "Ajouter le logo de l'entreprise",
      "Inclure un programme détaillé"
    ]
  };
  
  return suggestions[eventType] || [
    "Rendre les couleurs plus dynamiques",
    "Ajouter une image de fond personnalisée",
    "Mettre en avant la date et le lieu",
    "Personnaliser la police d'écriture"
  ];
}

async function modifyTextContent(content, userPrompt) {
  if (isInDegradedMode()) {
    console.log('⚠️ Mode dégradé, retour du contenu original');
    return {};
  }
  
  return callGeminiWithRetry(async () => {
    const prompt = `
Contenu actuel:
- Titre: "${content.titre || content.title || ''}"
- Message: "${content.message || ''}"
- Date: "${content.date || ''}"
- Lieu: "${content.location || ''}"

Demande: "${userPrompt}"

Retourne UNIQUEMENT un JSON avec les champs modifiés:
{"titre": "...", "message": "...", "date": "...", "lieu": "..."}
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL.TEXT,
      contents: prompt
    });
    
    const responseText = response.text || response.candidates?.[0]?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing contenu:', e.message);
      }
    }
    return {};
  });
}

async function modifyColors(colors, userPrompt) {
  if (isInDegradedMode()) {
    console.log('⚠️ Mode dégradé, génération de couleurs par défaut');
    return generateColorFallback(colors, userPrompt);
  }
  
  return callGeminiWithRetry(async () => {
    const prompt = `
Palette actuelle: ${JSON.stringify(colors, null, 2)}
Demande: "${userPrompt}"

Propose une nouvelle palette JSON:
{
  "primary": "#code hex",
  "secondary": "#code hex",
  "accent": "#code hex",
  "background": "#code hex",
  "text": "#code hex"
}
Retourne UNIQUEMENT le JSON.
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL.TEXT,
      contents: prompt
    });
    
    const responseText = response.text || response.candidates?.[0]?.content || '';
    const jsonMatch = responseText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing couleurs:', e.message);
      }
    }
    return generateColorFallback(colors, userPrompt);
  });
}

function generateColorFallback(colors, userPrompt) {
  const lowerPrompt = userPrompt.toLowerCase();
  
  if (lowerPrompt.includes('rose') || lowerPrompt.includes('romantique')) {
    return { primary: '#E91E63', secondary: '#F06292', accent: '#FF80AB', background: '#FCE4EC', text: '#880E4F' };
  }
  if (lowerPrompt.includes('bleu') || lowerPrompt.includes('professionnel')) {
    return { primary: '#1976D2', secondary: '#42A5F5', accent: '#64B5F6', background: '#E3F2FD', text: '#0D47A1' };
  }
  if (lowerPrompt.includes('vert') || lowerPrompt.includes('nature')) {
    return { primary: '#388E3C', secondary: '#66BB6A', accent: '#81C784', background: '#E8F5E9', text: '#1B5E20' };
  }
  if (lowerPrompt.includes('doré') || lowerPrompt.includes('luxe')) {
    return { primary: '#F57F17', secondary: '#F9A825', accent: '#FBC02D', background: '#FFF8E1', text: '#E65100' };
  }
  if (lowerPrompt.includes('rouge') || lowerPrompt.includes('gala')) {
    return { primary: '#C62828', secondary: '#EF5350', accent: '#E57373', background: '#FFEBEE', text: '#B71C1C' };
  }
  
  return colors;
}

/**
 * Réponse de bienvenue avec suggestions - VERSION AMÉLIORÉE
 * Détecte les salutations et répond brièvement
 */
async function generateGreetingResponse(userMessage) {
  const lowerMessage = userMessage.toLowerCase().trim();
  
  // Détection des salutations
  const greetings = ['bonjour', 'salut', 'coucou', 'hello', 'hi', 'hey', 'bonsoir', 'bienvenue'];
  const isGreeting = greetings.some(g => lowerMessage.includes(g));
  
  // Si c'est une simple salutation, réponse brève
  if (isGreeting && lowerMessage.length < 30) {
    console.log('👋 Salutation détectée, réponse brève');
    return getQuickGreetingResponse();
  }
  
  // Si le message est très court
  if (userMessage.length < 20) {
    console.log('📝 Message court détecté');
    return getShortResponse();
  }
  
  // Mode dégradé - réponse sans API
  if (isInDegradedMode()) {
    console.log('⚠️ Mode dégradé pour greeting');
    return getDegradedGreetingResponse();
  }
  
  // Appel API normal
  return callGeminiWithRetry(async () => {
    const prompt = `
Tu es un assistant IA pour la création d'invitations.

Message: "${userMessage}"

RÈGLES IMPORTANTES:
1. Si c'est une salutation simple, réponds brièvement en 1 phrase + 3 suggestions
2. Garde les réponses courtes (max 100 mots)
3. Propose toujours 3 suggestions d'action
4. Sois chaleureux mais professionnel

Structure de réponse:
- Réponse directe au message
- Puis: "Je peux vous aider à :"
- 3 suggestions sur une seule ligne séparées par "|"

Exemple:
"Bonjour ! Je peux vous aider à : modifier les couleurs | personnaliser le texte | ajuster le QR code"
`;

    const response = await ai.models.generateContent({
      model: GEMINI_MODEL.TEXT,
      contents: prompt
    });
    
    let text = response.text || response.candidates?.[0]?.content || '';
    
    if (!text || text.includes('unavailable') || text.length > 300) {
      return getFallbackGreetingResponse();
    }
    
    return text.trim();
  }).catch(() => {
    console.log('⚠️ Fallback pour greeting');
    return getFallbackGreetingResponse();
  });
}

/**
 * Réponse rapide pour les salutations simples
 */
function getQuickGreetingResponse() {
  const responses = [
    "Bonjour ! Je peux vous aider à : modifier les couleurs | personnaliser le texte | ajuster le QR code",
    "Salut ! Je suis là pour vos invitations. Besoin de : changer le design | mettre à jour les textes | ajouter un logo",
    "Bonjour ! Que souhaitez-vous modifier ? Je propose : couleurs élégantes | texte personnalisé | QR code sur mesure"
  ];
  return responses[Math.floor(Math.random() * responses.length)];
}

/**
 * Réponse courte pour les messages courts
 */
function getShortResponse() {
  return "Je suis votre assistant design. Je peux : modifier les couleurs | personnaliser le texte | ajuster la mise en page. Que souhaitez-vous faire ?";
}

/**
 * Réponse en mode dégradé
 */
function getDegradedGreetingResponse() {
  return "⚠️ Mode dégradé (quota atteint). Je peux encore vous aider avec des suggestions ! Voici ce que je propose : modifier les couleurs | personnaliser le texte | ajuster le QR code";
}

/**
 * Réponse de fallback générique
 */
function getFallbackGreetingResponse() {
  return "Bonjour ! Je suis votre assistant design IA. Je peux vous aider à : créer une invitation | modifier les couleurs | personnaliser le texte. Décrivez-moi votre projet !";
}

module.exports = {
  modifyTemplateWithPrompt,
  generateTemplateSuggestions,
  modifyTextContent,
  modifyColors,
  generateGreetingResponse,
  generateModifiedTemplateImage,
  modifyTemplateWithImage,
  generateContent: callGeminiWithRetry,
  isInDegradedMode
};