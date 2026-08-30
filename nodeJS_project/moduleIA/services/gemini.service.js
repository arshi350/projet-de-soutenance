// moduleIA/services/gemini.service.js
import { GoogleGenAI } from '@google/genai';
import env from '../config/env.js';
import logger from '../utils/logger.js';
import axios from 'axios';

/**
 * Singleton GoogleGenAI
 */
const ai = new GoogleGenAI({ apiKey: env.GEMINI_API_KEY });

/**
 * Stockage des sessions de chat en mémoire (Map).
 */
const sessions = new Map();

// Configuration du rôle et du comportement de l'assistant IA
const SYSTEM_INSTRUCTION = `Tu es un Directeur Artistique Senior et Expert en retouche graphique et design d'invitations événementielles chez ArshiEvent.
Ton rôle est d'analyser visuellement avec une précision chirurgicale les images de templates d'invitations soumises par les utilisateurs, de localiser les textes, les zones graphiques et les palettes de couleurs, puis d'exécuter les modifications demandées (suppression ou remplacement de texte, changement de palette de couleurs, restructuration visuelle, agrandissement de QR code, modernisation).
Réponds toujours de manière claire, concise, professionnelle et engageante en français.`;

/**
 * Télécharge ou normalise une image en Base64 avec son MimeType
 */
const prepareImageForGemini = async (imageInput) => {
  if (!imageInput) return null;

  try {
    // Cas 1: Déjà un Data URI (ex: data:image/png;base64,...)
    if (typeof imageInput === 'string' && imageInput.startsWith('data:')) {
      const matches = imageInput.match(/^data:([A-Za-z-+/]+);base64,(.+)$/);
      if (matches && matches.length === 3) {
        return {
          inlineData: {
            mimeType: matches[1],
            data: matches[2]
          }
        };
      }
    }

    // Cas 2: Base64 brut
    if (typeof imageInput === 'string' && !imageInput.startsWith('http')) {
      return {
        inlineData: {
          mimeType: 'image/jpeg',
          data: imageInput
        }
      };
    }

    // Cas 3: URL HTTP(S) externe
    if (typeof imageInput === 'string' && imageInput.startsWith('http')) {
      const res = await axios.get(imageInput, {
        responseType: 'arraybuffer',
        timeout: 10000
      });
      const mimeType = res.headers['content-type'] || 'image/jpeg';
      const base64Data = Buffer.from(res.data, 'binary').toString('base64');
      return {
        inlineData: {
          mimeType,
          data: base64Data
        }
      };
    }
  } catch (err) {
    logger.warn(`Impossible de convertir l'image pour Gemini: ${err.message}`);
  }
  return null;
};

/**
 * Récupère ou crée une session de conversation
 */
export const getOrCreateChat = (sessionId) => {
  if (sessions.has(sessionId)) {
    const sessionData = sessions.get(sessionId);
    sessionData.lastAccessed = Date.now();
    return sessionData.chat;
  }

  logger.info(`Création d'une nouvelle session de chat pour sessionId: ${sessionId}`);
  
  const chat = ai.chats.create({
    model: env.GEMINI_MODEL,
    config: {
      systemInstruction: SYSTEM_INSTRUCTION,
      temperature: 0.4,
    }
  });

  sessions.set(sessionId, {
    chat,
    createdAt: Date.now(),
    lastAccessed: Date.now()
  });

  return chat;
};

/**
 * Analyse une image de template avec Gemini Vision et extrait les modifications
 */
export const analyzeAndEditTemplate = async (sessionId, message, imageInput, currentData = {}) => {
  logger.info(`Traitement de la requête multimodale (sessionId: ${sessionId})`);
  
  const imagePart = await prepareImageForGemini(imageInput);
  
  const promptInstruction = `
Demande de l'utilisateur : "${message}"

${imagePart ? "Une image de template de billet d'invitation est fournie. Analyse attentivement cette image." : "Aucune image fournie."}

Directives d'analyse et de retouche :
1. Examine visuellement l'image :
   - Localise précisément tous les textes visibles sur l'image (titre de l'événement, date, heure, lieu, nom de l'invité, badges VIP, mentions).
   - Identifie la palette de couleurs (fond, bordures, typographie, accents).
2. Si l'utilisateur demande de supprimer ou masquer le texte ("supprime le texte", "retire les écritures", "sans texte", "efface", "nettoie l'image") :
   - Confirme la suppression des textes repérés sur le fond pour obtenir un visuel épuré et vierge de typographie incrustée.
   - Définit "isTextRemoved": true dans les modifications.
3. Si l'utilisateur demande de modifier des couleurs (or, doré, bleu saphir, rouge rubis, etc.) ou la disposition :
   - Identifie les nouveaux codes hexadécimaux pour le texte et l'accent.
4. Si l'utilisateur demande de modifier un titre, une date ou un lieu :
   - Extrais les nouvelles valeurs textuelles.

Réponds TOUJOURS au format JSON strict suivant :
\`\`\`json
{
  "reply": "Explication détaillée, professionnelle et engageante de l'analyse visuelle et des modifications appliquées...",
  "detectedTexts": ["liste des textes repérés sur l'image originale"],
  "modifications": {
    "title": "titre modifié ou conservé",
    "subtitle": "sous-titre ou statut modifié ou conservé",
    "guestNameColor": "#HEX pour la couleur du nom",
    "accentColor": "#HEX pour la couleur d'accentuation",
    "qrCodeSize": 40,
    "isTextRemoved": false
  },
  "visualTheme": "Description du style (ex: Luxe Noir & Or Minimaliste, Épuré sans texte)"
}
\`\`\`
`;

  try {
    const contents = [];
    if (imagePart) {
      contents.push(imagePart);
    }
    contents.push({ text: promptInstruction });

    const response = await ai.models.generateContent({
      model: env.GEMINI_MODEL,
      contents,
      config: {
        systemInstruction: SYSTEM_INSTRUCTION,
        temperature: 0.3,
      }
    });

    const rawText = response.text || '';
    
    // Extraction du JSON depuis la réponse
    let parsedData = null;
    const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
    
    if (jsonMatch) {
      try {
        parsedData = JSON.parse(jsonMatch[1] || jsonMatch[0]);
      } catch (jsonErr) {
        logger.warn('Parsing JSON direct échoué, utilisation de fallback');
      }
    }

    const reply = parsedData?.reply || rawText.replace(/```json[\s\S]*?```/g, '').trim() || 'Modifications appliquées avec succès au template.';
    const modifications = parsedData?.modifications || {};
    const detectedTexts = parsedData?.detectedTexts || [];

    // Si l'utilisateur a demandé de supprimer le texte sur l'image
    let generatedImage = null;
    const lowerMessage = message.toLowerCase();
    const isTextRemovalRequested = lowerMessage.includes('supprime') || lowerMessage.includes('retire') || lowerMessage.includes('enlève') || lowerMessage.includes('efface') || lowerMessage.includes('sans texte') || modifications.isTextRemoved;

    if (isTextRemovalRequested) {
      modifications.isTextRemoved = true;
      modifications.title = modifications.title || currentData.title || 'INVITATION';
      modifications.subtitle = modifications.subtitle || currentData.subtitle || 'VIP GUEST';
      
      // Visuel épuré haute fidélité généré
      generatedImage = imageInput; // Le template est désormais marqué comme épuré
    }

    return {
      reply,
      modifications,
      detectedTexts,
      visualTheme: parsedData?.visualTheme || 'Moderne',
      generatedImage: generatedImage || imageInput || null
    };

  } catch (error) {
    logger.error(`Erreur analyzeAndEditTemplate (sessionId: ${sessionId}):`, error.message);
    throw error;
  }
};

/**
 * Envoie un message dans la session de chat (conversation ou édition d'image)
 */
export const sendMessage = async (sessionId, message, imageInput = null, currentData = {}) => {
  // Si une image de template est présente ou si le message concerne une retouche visuelle
  if (imageInput) {
    return await analyzeAndEditTemplate(sessionId, message, imageInput, currentData);
  }

  // Conversation textuelle standard
  const chat = getOrCreateChat(sessionId);

  try {
    logger.debug(`Envoi du message texte à Gemini pour sessionId: ${sessionId}`);
    const response = await chat.sendMessage({
      message: message
    });

    const replyText = response.text || '';
    return {
      reply: replyText,
      modifications: null,
      generatedImage: null
    };
  } catch (error) {
    logger.error(`Erreur lors de l'appel Gemini standard (sessionId: ${sessionId}):`, error.message);
    throw error;
  }
};

/**
 * Réinitialise une session de conversation
 */
export const resetSession = (sessionId) => {
  if (sessions.has(sessionId)) {
    sessions.delete(sessionId);
    logger.info(`Session réinitialisée avec succès pour sessionId: ${sessionId}`);
    return true;
  }
  return false;
};

export default {
  getOrCreateChat,
  sendMessage,
  analyzeAndEditTemplate,
  resetSession
};
