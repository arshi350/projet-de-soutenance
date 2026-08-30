const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
if (!apiKey) {
  console.warn('⚠️ GEMINI_API_KEY non configurée dans le fichier .env');
}

const ai = new GoogleGenAI({ apiKey });
const DEFAULT_MODEL = process.env.GEMINI_MODEL_TEXT || 'gemini-2.5-flash';

/**
 * Nettoie et extrait un objet JSON valide depuis la réponse de Gemini
 */
function extractJSONFromText(rawText) {
  if (!rawText) return null;
  const jsonMatch = rawText.match(/```(?:json)?\s*([\s\S]*?)\s*```/) || rawText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    try {
      return JSON.parse(jsonMatch[1] || jsonMatch[0]);
    } catch (e) {
      console.warn('Échec parsing direct bloc JSON Gemini:', e.message);
    }
  }
  try {
    return JSON.parse(rawText);
  } catch (e) {
    return null;
  }
}

/**
 * 1. Rédacteur Intelligent de Messages d'Invitation & Discours
 * Génère des textes personnalisés selon le ton (Luxe, Chaleureux, Festif, Officiel)
 */
async function generateInvitationCopy({
  eventTitle = 'Événement Officiel',
  eventType = 'Soirée Privée',
  guestName = 'Invité',
  guestStatus = 'classique',
  tone = 'Luxe & Prestigieux',
  details = '',
  date = '',
  location = ''
}) {
  const isVip = (guestStatus || '').toLowerCase() === 'vip';
  const prompt = `Tu es un Directeur de la Communication et Rédacteur d'élite spécialisé dans l'événementiel haut de gamme.
Rédige un message d'invitation personnalisé avec les informations suivantes :
- Titre de l'événement : "${eventTitle}"
- Type d'événement : "${eventType}"
- Date / Heure : "${date || 'Date communiquée ultérieurement'}"
- Lieu : "${location || 'Lieu communiqué sur confirmation'}"
- Nom de l'invité : "${guestName}"
- Statut de l'invité : ${isVip ? 'INVITÉ VIP (Accès Privilégié)' : 'INVITÉ OFFICIEL'}
- Ton souhaité : "${tone}"
- Détails / Consignes particulières : "${details || 'Aucune consigne spéciale'}"

Instructions strictes :
1. Adopte parfaitement le ton demandé (vocabulaire élégant, rythme fluide, percutant).
2. Fournis un objet d'email captivant qui évite les filtres anti-spam.
3. Fournis un message court adapté aux SMS ou WhatsApp.
4. Fournis un corps complet d'invitation prêt à être envoyé par email.

Réponds STRICTEMENT au format JSON avec cette structure :
\`\`\`json
{
  "subject": "Objet d'email sobre et attractif",
  "shortMessage": "Message court et percutant (max 180 caractères)",
  "fullInvitation": "Corps complet et soigné du message d'invitation",
  "highlights": ["Point fort 1", "Point fort 2"]
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    const parsed = extractJSONFromText(text);

    if (parsed && parsed.fullInvitation) {
      return {
        success: true,
        data: parsed,
      };
    }

    return {
      success: true,
      data: {
        subject: `Invitation officielle - ${eventTitle}`,
        shortMessage: `Bonjour ${guestName}, vous êtes cordialement invité(e) à ${eventTitle}.`,
        fullInvitation: text.replace(/```json[\s\S]*?```/g, '').trim() || `Nous avons le plaisir de vous convier à l'événement ${eventTitle}.`,
        highlights: ['Accès exclusif', 'QR Code d\'entrée sécurisé']
      }
    };
  } catch (error) {
    console.error('Erreur Gemini generateInvitationCopy:', error.message);
    throw error;
  }
}

/**
 * 2. Générateur de Campagne Marketing pour Événements Publics
 */
async function generateEventMarketing({
  eventTitle = 'Grand Concert / Festival',
  category = 'Musique & Culture',
  date = '',
  location = '',
  artists = '',
  targetAudience = 'Grand Public',
  highlights = ''
}) {
  const prompt = `Tu es un Expert en Marketing Digital et Growth Hacking pour les grands événements culturels et festivals.
Conçois une campagne promotionnelle percutante pour l'événement public suivant :
- Nom : "${eventTitle}"
- Catégorie : "${category}"
- Date / Lieu : "${date}" à "${location}"
- Artistes / Intervenants : "${artists || 'Artistes de renom'}"
- Cible : "${targetAudience}"
- Points forts : "${highlights || 'Expérience immersive unique'}"

Réponds STRICTEMENT au format JSON avec cette structure :
\`\`\`json
{
  "seoDescription": "Description attractive et optimisée pour la page de billetterie en ligne (120-180 mots)",
  "punchline": "Slogan ou accroche publicitaire percutante",
  "instagramPost": "Texte engageant pour Instagram avec emojis et hashtags tendances",
  "facebookPost": "Publication Facebook avec appel à l'action pour réserver",
  "newsletterSubject": "Objet d'emailing promotionnel à fort taux d'ouverture",
  "newsletterBody": "Email de lancement complet pour les abonnés"
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.7,
      }
    });

    const text = response.text || '';
    const parsed = extractJSONFromText(text);

    if (parsed) {
      return { success: true, data: parsed };
    }

    return {
      success: true,
      data: {
        seoDescription: text,
        punchline: `Vivez une expérience inoubliable avec ${eventTitle}`,
        instagramPost: `Ne manquez pas ${eventTitle} ! Réservez vos places dès maintenant. #Event #Live`,
        facebookPost: `La billetterie pour ${eventTitle} est officiellement ouverte !`,
        newsletterSubject: `Billetterie ouverte : ${eventTitle}`,
        newsletterBody: text
      }
    };
  } catch (error) {
    console.error('Erreur Gemini generateEventMarketing:', error.message);
    throw error;
  }
}

/**
 * 3. Optimiseur Intelligent de Plan de Table
 */
async function optimizeTableSeating({
  guests = [],
  tables = []
}) {
  const prompt = `Tu es un maître d'hôtel et organisateur de banquets de prestige.
Organise le plan de table optimal selon les affinités et contraintes suivantes :
- Liste des invités : ${JSON.stringify(guests)}
- Configuration des tables disponibles (nom, capacité) : ${JSON.stringify(tables)}

Instructions :
1. Regroupe les personnes ayant des affinités similaires (famille, amis, collègues, VIP).
2. Respecte scrupuleusement la capacité maximale de chaque table.
3. Évite de placer des personnes isolées.

Réponds STRICTEMENT au format JSON :
\`\`\`json
{
  "seatingPlan": [
    {
      "tableName": "Table Prestige 1",
      "capacity": 8,
      "assignedGuests": ["Nom Prénom 1", "Nom Prénom 2"],
      "themeOrCategory": "Famille Proche / VIP"
    }
  ],
  "summary": "Explication synthétique de l'organisation retenue",
  "unassignedCount": 0
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.4,
      }
    });

    const text = response.text || '';
    const parsed = extractJSONFromText(text);

    return {
      success: true,
      data: parsed || { seatingPlan: [], summary: text, unassignedCount: 0 }
    };
  } catch (error) {
    console.error('Erreur Gemini optimizeTableSeating:', error.message);
    throw error;
  }
}

/**
 * 4. Concierge / Assistant Virtuel WhatsApp (Traitement des messages RSVP)
 */
async function processConciergeRSVP({
  incomingMessage,
  guestName = 'Invité',
  eventDetails = {}
}) {
  const prompt = `Tu es l'assistant virtuel et concierge de l'événement "${eventDetails.titre || 'Événement'}".
Détails de l'événement : Date: ${eventDetails.date || ''}, Heure: ${eventDetails.heure || ''}, Lieu: ${eventDetails.lieu || ''}.
Nom de l'interlocuteur : ${guestName}.

Message reçu : "${incomingMessage}"

Instructions :
1. Détermine si l'invité confirme sa présence ("CONFIRMED"), décline ("DECLINED"), ou pose simplement une question informative ("QUESTION").
2. Rédige une réponse courtoise, chaleureuse et concise (adaptée au format SMS/WhatsApp).

Réponds STRICTEMENT au format JSON :
\`\`\`json
{
  "intent": "CONFIRMED" | "DECLINED" | "QUESTION",
  "replyMessage": "Message de réponse bienveillant",
  "notes": "Précisions utiles (ex: a demandé des infos sur le parking)"
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.5,
      }
    });

    const text = response.text || '';
    const parsed = extractJSONFromText(text);

    return {
      success: true,
      data: parsed || { intent: 'QUESTION', replyMessage: text, notes: '' }
    };
  } catch (error) {
    console.error('Erreur Gemini processConciergeRSVP:', error.message);
    throw error;
  }
}

/**
 * 5. Concierge IA pour les Emails (Email Concierge AI)
 * Analyse les emails reçus des invités ou rédige des emails d'assistance, relance ou remerciements.
 */
async function processEmailConcierge({
  emailType = 'GUEST_REPLY', // 'GUEST_REPLY' | 'REMINDER_J1' | 'VIP_ACCESS_INFO' | 'THANK_YOU_POST_EVENT' | 'CUSTOM'
  guestName = 'Invité',
  guestStatus = 'classique',
  guestQuestion = '',
  eventDetails = {},
  customInstructions = ''
}) {
  const isVip = (guestStatus || '').toLowerCase() === 'vip';
  const prompt = `Tu es le Concierge & Responsable des Relations Invités de l'événement "${eventDetails.titre || 'Événement Officiel'}".
Informations sur l'événement :
- Titre : ${eventDetails.titre || 'Événement'}
- Type : ${eventDetails.typeEvenement || 'Événement Privé'}
- Date : ${eventDetails.date || 'À confirmer'}
- Heure : ${eventDetails.heure || '19h00'}
- Lieu : ${eventDetails.lieu || 'Lieu communiqué sur confirmation'}
- Dress code / Ambiance : ${eventDetails.dressCode || 'Élégant'}

Informations sur l'invité :
- Nom : ${guestName}
- Statut : ${isVip ? 'Invité VIP (Accès Privilégié)' : 'Invité Officiel'}

Type d'email à traiter / rédiger : "${emailType}"
Question ou message de l'invité : "${guestQuestion || 'Aucune question spécifique'}"
Consignes spécifiques de l'organisateur : "${customInstructions || 'Réponse polie, claire et rassurante'}"

Directives :
1. Rédige un email professionnel, chaleureux et protocolaire.
2. Si l'invité a posé une question, apporte une réponse concrète et utile.
3. Rappelle les points clés nécessaires (date, heure, présentation du QR Code).
4. Fournis un objet d'email percutant et adapté.

Réponds STRICTEMENT au format JSON :
\`\`\`json
{
  "emailSubject": "Objet clair et élégant de l'email",
  "emailBody": "Corps complet et soigné de l'email rédigé",
  "keyAdvice": "Conseil synthétique pour l'organisateur (ex: 'Penser à lui réserver une place au premier rang')",
  "detectedCategory": "Question Pratique / Remerciement / Demande VIP / Logistique"
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: {
        temperature: 0.6,
      }
    });

    const text = response.text || '';
    const parsed = extractJSONFromText(text);

    return {
      success: true,
      data: parsed || {
        emailSubject: `Re: Votre question concernant ${eventDetails.titre || 'l\'événement'}`,
        emailBody: text,
        keyAdvice: 'Réponse générée par le Concierge IA',
        detectedCategory: 'Assistance Invité'
      }
    };
  } catch (error) {
    console.error('Erreur Gemini processEmailConcierge:', error.message);
    throw error;
  }
}

module.exports = {
  generateInvitationCopy,
  generateEventMarketing,
  optimizeTableSeating,
  processConciergeRSVP,
  processEmailConcierge
};

