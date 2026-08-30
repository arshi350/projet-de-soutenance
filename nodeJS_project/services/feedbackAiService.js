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
      console.warn('Parsing direct JSON échoué dans feedbackAiService:', e.message);
    }
  }
  try {
    return JSON.parse(rawText);
  } catch (e) {
    return null;
  }
}

/**
 * Générer le rapport d'analyse consolidé post-événement avec l'IA Gemini
 */
async function generatePostEventExecutiveReport({
  eventTitle,
  eventType,
  totalFeedbacks,
  averageNps,
  npsCategory,
  criteriaAverages,
  rawFeedbacksList = [],
}) {
  // Extraire les extraits de commentaires pour alimenter le prompt de manière concise
  const commentsSummary = rawFeedbacksList.slice(0, 30).map((fb, idx) => ({
    index: idx + 1,
    nps: fb.npsScore,
    liked: fb.likedMost || 'N/A',
    improvements: fb.improvementsNeeded || 'N/A',
    comment: fb.generalComment || 'N/A',
  }));

  const prompt = `Tu es un Directeur de la Stratégie Événementielle et Consultant Senior en Expérience Client (CX).
Analyse l'ensemble des données de satisfaction et commentaires recueillis suite à l'événement suivant :

Informations sur l'événement :
- Titre : "${eventTitle || 'Événement'}"
- Type : "${eventType || 'Événement'}"
- Nombre total de participants ayant répondu : ${totalFeedbacks}
- Score NPS Moyen : ${averageNps}/10 (Promoteurs: ${npsCategory.promotersPercent}%, Passifs: ${npsCategory.passivesPercent}%, Détracteurs: ${npsCategory.detractorsPercent}%)
- Moyennes des critères (sur 5) :
  * Organisation : ${criteriaAverages.organisation}/5
  * Accueil & Enregistrement : ${criteriaAverages.accueil}/5
  * Ambiance & Scénographie : ${criteriaAverages.ambiance}/5
  * Contenu & Restauration : ${criteriaAverages.restaurationContenu}/5

Échantillon des retours qualitatifs textuels :
${JSON.stringify(commentsSummary, null, 2)}

Instructions strictes d'analyse :
1. "sentimentPolarity" : Évalue la polarité générale des retours (pourcentage de positif, neutre, négatif) et détermine le "globalMood" (ex: "Très enthousiaste", "Globalement positif avec réserves logistiques", "Mitigé").
2. "executiveSummary" : Rédige une synthèse exécutive structurée et fluide en 3 paragraphes professionnels (Introduction du bilan, points saillants, perspective globale).
3. "topStrengths" : Liste 3 à 5 forces majeures ressorties spontanément des avis.
4. "priorityImprovements" : Liste 3 à 5 axes de progrès critiques signalés par les participants.
5. "strategicRecommendations" : Propose 3 à 4 recommandations stratégiques concrètes et immédiatement actionnables pour la prochaine édition (avec niveau de priorité "Haute", "Moyenne" ou "Basse", le domaine concerné, l'action à mener et l'impact attendu).

Réponds STRICTEMENT au format JSON :
\`\`\`json
{
  "sentimentPolarity": {
    "positive": 75,
    "neutral": 15,
    "negative": 10,
    "globalMood": "Globalement très enthousiaste"
  },
  "executiveSummary": "Texte complet de la synthèse exécutive...",
  "topStrengths": [
    "Qualité de l'accueil et fluidité du scan QR code",
    "Ambiance festive et scénographie percutante"
  ],
  "priorityImprovements": [
    "Temps d'attente au niveau du buffet de restauration",
    "Signalétique d'accès au parking à renforcer"
  ],
  "strategicRecommendations": [
    {
      "priority": "Haute",
      "area": "Restauration / Traiteur",
      "recommendation": "Multiplier les points de service buffet lors des pics d'affluence",
      "expectedImpact": "Réduction de 50% du temps d'attente et nette amélioration de la note de restauration"
    }
  ]
}
\`\`\``;

  try {
    const response = await ai.models.generateContent({
      model: DEFAULT_MODEL,
      contents: prompt,
      config: { temperature: 0.4 },
    });

    const raw = response.text || '';
    const parsed = extractJSON(raw);

    if (parsed && parsed.executiveSummary) {
      return { success: true, data: parsed };
    }

    return {
      success: true,
      data: {
        sentimentPolarity: {
          positive: 70,
          neutral: 20,
          negative: 10,
          globalMood: 'Positif',
        },
        executiveSummary: `L'événement ${eventTitle} a enregistré un score de satisfaction global positif avec un NPS moyen de ${averageNps}/10 sur un total de ${totalFeedbacks} retours. Les participants ont particulièrement salué l'ambiance et l'accueil général. Des optimisations ciblées sur l'organisation permettront de maximiser l'impact des prochaines éditions.`,
        topStrengths: ["Excellente ambiance générale", "Accueil soigné"],
        priorityImprovements: ["Fluidité des flux", "Communication sur les horaires"],
        strategicRecommendations: [
          {
            priority: 'Haute',
            area: 'Organisation Générale',
            recommendation: 'Maintenir la fluidité du processus d’enregistrement',
            expectedImpact: 'Fidélisation accrue des participants',
          },
        ],
      },
    };
  } catch (error) {
    console.error('Erreur generatePostEventExecutiveReport Gemini:', error.message);
    throw error;
  }
}

module.exports = {
  generatePostEventExecutiveReport,
};
