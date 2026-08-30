const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const ai = new GoogleGenAI({ apiKey });
const DEFAULT_MODEL = process.env.GEMINI_MODEL_TEXT || 'gemini-2.5-flash';

/**
 * Nettoie et extrait un objet JSON depuis la réponse de Gemini
 */
function extractJSON(rawText) {
  if (!rawText) return null;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      console.warn('Parsing direct JSON échoué dans reminderAiService:', e.message);
    }
  }
  try {
    return JSON.parse(rawText);
  } catch (e) {
    return null;
  }
}

/**
 * Générer le contenu d'un rappel ou d'une relance par IA selon le ton et la cible
 */
async function generateReminderCopy({
  eventTitle = 'Événement',
  eventType = 'Soirée Privée',
  eventDate = '',
  eventLocation = '',
  targetAudience = 'unanswered_rsvp', // 'unanswered_rsvp' | 'confirmed_guests' | 'all_guests'
  triggerOffset = 3,
  triggerUnit = 'days',
  channel = 'email', // 'email' | 'sms' | 'whatsapp'
  tone = 'professionnel', // 'professionnel' | 'festif' | 'urgent' | 'chaleureux' | 'vip'
  customInstructions = '',
}) {
  const isRSVP = targetAudience === 'unanswered_rsvp';
  const timingLabel = triggerUnit === 'hours' ? `H-${triggerOffset}` : `J-${triggerOffset}`;

  const prompt = `Tu es un expert en communication événementielle et relations invités.
Rédige un message de relance / rappel automatisé pour un événement.

Détails de l'événement :
- Titre : "${eventTitle}"
- Catégorie : "${eventType}"
- Date / Heure : "${eventDate || 'Date prévue'}"
- Lieu : "${eventLocation || 'Lieu communiqué sur confirmation'}"

Contexte de la communication :
- Cible : ${isRSVP ? "Invités n'ayant PAS ENCORE répondu au RSVP (incitation à confirmer/décliner)" : "Participants AYANT DÉJÀ CONFIRMÉ leur présence (rappel pratique, enthousiasme, QR Code d'accès)"}
- Déclencheur temporel : ${timingLabel} avant l'événement
- Canal de diffusion : ${channel.toUpperCase()} (si SMS ou WhatsApp, le message doit être direct, concis et contenir des sauts de ligne élégants)
- Ton souhaité : "${tone}" (ex: Professionnel, Festif, Urgent, Chaleureux, VIP)
- Consignes supplémentaires de l'organisateur : "${customInstructions || 'Aucune'}"

Variables dynamiques autorisées à inclure dans le texte :
- {{nom_invite}} : Nom ou prénom du destinataire
- {{nom_evenement}} : Titre de l'événement
- {{date}} : Date de l'événement
- {{lieu}} : Adresse ou lieu
- {{lien_rsvp}} : Lien de confirmation RSVP
- {{lien_billet}} : Lien du pass / billet avec QR Code

Consignes strictes :
1. Rédige un objet d'email percutant qui donne envie d'ouvrir sans tomber dans le spam.
2. Rédige le corps du message en insérant judicieusement les variables dynamiques.
3. Rédige également une version courte pour SMS/WhatsApp.
4. Réponds STRICTEMENT au format JSON :
\`\`\`json
{
  "subject": "Objet de l'email ou titre court",
  "body": "Corps du message avec les variables dynamiques",
  "shortSmsVersion": "Version concise pour SMS (max 160 caractères)",
  "recommendedTimingAdvice": "Conseil IA sur le meilleur moment d'envoi"
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: { temperature: 0.6 },
    });

    const raw = response.text || '';
    const parsed = extractJSON(raw);

    if (parsed && parsed.body) {
      return { success: true, data: parsed };
    }

    return {
      success: true,
      data: {
        subject: `⏰ [${timingLabel}] Rappel important concernant {{nom_evenement}}`,
        body: `Bonjour {{nom_invite}},\n\nNous vous rappelons que l'événement {{nom_evenement}} aura lieu le {{date}} à {{lieu}}.\n\nMerci de confirmer votre présence via ce lien : {{lien_rsvp}}.\n\nÀ très bientôt !`,
        shortSmsVersion: `Rappel : {{nom_evenement}} le {{date}}. Confirmez vite votre présence : {{lien_rsvp}}`,
        recommendedTimingAdvice: 'Envoi recommandé entre 10h et 12h en semaine.',
      },
    };
  } catch (error) {
    console.error('Erreur generateReminderCopy Gemini:', error.message);
    throw error;
  }
}

/**
 * Analyse NLP des réponses d'invités (détection d'intentions, désistements, questions)
 */
async function analyzeGuestReplyNLP({ incomingText, eventDetails = {} }) {
  const prompt = `Tu es un module NLP d'analyse des messages d'invités pour un événement.
Événement : "${eventDetails.titre || 'Événement'}"

Message reçu de l'invité : "${incomingText}"

Analyse ce message et extrais :
1. L'intention principale : "CONFIRMATION", "CANCELLATION" (désistement), "QUESTION_LOGISTIQUE", "REGIME_ALIMENTAIRE", "AUTRE".
2. Le sentiment global : "POSITIF", "NEUTRE", "DECU_NEGATIF".
3. Un résumé en 1 phrase claire.
4. Une proposition de réponse polie et adaptée.

Réponds STRICTEMENT au format JSON :
\`\`\`json
{
  "intent": "CONFIRMATION" | "CANCELLATION" | "QUESTION_LOGISTIQUE" | "REGIME_ALIMENTAIRE" | "AUTRE",
  "sentiment": "POSITIF" | "NEUTRE" | "DECU_NEGATIF",
  "summary": "Résumé concis de la demande",
  "suggestedReply": "Proposition de réponse personnalisée",
  "requiresOrganiserAction": true | false
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: { temperature: 0.3 },
    });

    const parsed = extractJSON(response.text || '');
    return {
      success: true,
      data: parsed || {
        intent: 'QUESTION_LOGISTIQUE',
        sentiment: 'NEUTRE',
        summary: incomingText,
        suggestedReply: 'Merci pour votre retour, nous prenons note de votre message.',
        requiresOrganiserAction: false,
      },
    };
  } catch (error) {
    console.error('Erreur analyzeGuestReplyNLP Gemini:', error.message);
    throw error;
  }
}

module.exports = {
  generateReminderCopy,
  analyzeGuestReplyNLP,
};
