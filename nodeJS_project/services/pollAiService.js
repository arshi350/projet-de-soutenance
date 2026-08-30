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
      console.warn('Parsing direct JSON échoué dans pollAiService:', e.message);
    }
  }
  try {
    return JSON.parse(rawText);
  } catch (e) {
    return null;
  }
}

/**
 * Générer intelligemment des questions de sondage pré-événement avec l'IA Gemini
 */
async function generatePreEventPollQuestions({
  eventTitle = 'Événement',
  eventType = 'Soirée Privée',
  eventDate = '',
  eventLocation = '',
  pollObjective = 'repas_et_allergies', // 'repas_et_allergies' | 'musique_et_ambiance' | 'attentes_et_themes' | 'logistique_et_transports' | 'personnalise'
  customInstructions = '',
}) {
  const objectiveMap = {
    repas_et_allergies: 'Identifier les régimes alimentaires, allergies et préférences de boissons/repas des invités',
    musique_et_ambiance: 'Connaître les goûts musicaux, titres préférés et attentes en termes d’ambiance et animations',
    attentes_et_themes: 'Recueillir les souhaits sur les thématiques abordées, ateliers ou dress-code préféré',
    logistique_et_transports: 'Anticiper les besoins en hébergement, covoiturage, navettes ou accès PMR',
    personnalise: customInstructions || 'Sondage général pour satisfaire au mieux chaque participant',
  };

  const objectiveDescription = objectiveMap[pollObjective] || customInstructions || 'Optimiser l’organisation pour les invités';

  const prompt = `Tu es un expert en planification événementielle haut de gamme et expérience invités (Guest Experience Manager).
Ton rôle est de concevoir un sondage pré-événement ultra-pertinent pour l'organisateur afin qu'il puisse anticiper et satisfaire parfaitement ses invités avant le jour J.

Informations sur l'événement :
- Titre : "${eventTitle}"
- Type d'événement : "${eventType}"
- Date / Lieu : "${eventDate || 'Prochainement'}" à "${eventLocation || 'Lieu prévu'}"
- Objectif clé du sondage : "${objectiveDescription}"
- Consignes spécifiques : "${customInstructions || 'Questions claires, engageantes et faciles à remplir'}"

Directives :
1. Rédige un titre de sondage chaleureux et attractif.
2. Rédige une courte description expliquant aux invités que ce sondage permettra de personnaliser leur accueil.
3. Génère entre 3 et 5 questions ultra-pertinentes en variant judicieusement les types de questions ("single_choice", "multiple_choice", "star_rating", "free_text").
4. Pour chaque question à choix ("single_choice" ou "multiple_choice"), fournis 3 à 5 options réalistes et bien formulées.
5. Donne un identifiant unique temporaire à chaque question (id: "q_1", "q_2", etc.) et à chaque option (id: "opt_1_1", "opt_1_2", etc.).

Réponds STRICTEMENT au format JSON suivant :
\`\`\`json
{
  "title": "Titre du sondage pré-événement",
  "description": "Courte introduction engageante...",
  "timingType": "pre_event",
  "isAnonymous": false,
  "showLiveResults": false,
  "questions": [
    {
      "id": "q_1",
      "title": "Avez-vous un régime alimentaire ou des allergies particulières ?",
      "type": "multiple_choice",
      "isRequired": true,
      "options": [
        { "id": "opt_1_1", "text": "Aucun (Je mange de tout)" },
        { "id": "opt_1_2", "text": "Végétarien / Végétalien" },
        { "id": "opt_1_3", "text": "Sans Gluten / Sans Lactose" },
        { "id": "opt_1_4", "text": "Halal / Casher" }
      ]
    },
    {
      "id": "q_2",
      "title": "Une demande particulière ou suggestion pour que votre soirée soit parfaite ?",
      "type": "free_text",
      "isRequired": false,
      "options": []
    }
  ]
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

    if (parsed && Array.isArray(parsed.questions) && parsed.questions.length > 0) {
      return { success: true, data: parsed };
    }

    return {
      success: true,
      data: {
        title: `Préférences pour ${eventTitle}`,
        description: 'Aidez-nous à préparer votre accueil sur-mesure en répondant à ce court sondage.',
        timingType: 'pre_event',
        isAnonymous: false,
        showLiveResults: false,
        questions: [
          {
            id: `q_${Date.now()}_0`,
            title: 'Avez-vous des préférences ou restrictions alimentaires ?',
            type: 'multiple_choice',
            isRequired: true,
            options: [
              { id: `opt_${Date.now()}_0_0`, text: 'Aucune restriction' },
              { id: `opt_${Date.now()}_0_1`, text: 'Végétarien / Végan' },
              { id: `opt_${Date.now()}_0_2`, text: 'Sans gluten / Sans lactose' },
              { id: `opt_${Date.now()}_0_3`, text: 'Halal / Casher' },
            ],
          },
          {
            id: `q_${Date.now()}_1`,
            title: 'Une chanson ou un morceau que vous aimeriez entendre ?',
            type: 'free_text',
            isRequired: false,
            options: [],
          },
        ],
      },
    };
  } catch (error) {
    console.error('Erreur generatePreEventPollQuestions Gemini:', error.message);
    throw error;
  }
}

module.exports = {
  generatePreEventPollQuestions,
};
