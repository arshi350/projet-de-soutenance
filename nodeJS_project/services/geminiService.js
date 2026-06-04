const { GoogleGenAI } = require('@google/genai');
require('dotenv').config();

// INITIALISATION DU CLIENT GEMINI
const ai = new GoogleGenAI({ 
  apiKey: process.env.GEMINI_API_KEY 
});

// FONCTION GÉNÉRIQUE DE GÉNÉRATION DE CONTENU
async function generateContent(prompt) {
  try {
    const response = await ai.models.generateContent({
      model: 'gemini-2.5-flash',
      contents: prompt,
    });
    
    return response.text;
  } catch (error) {
    console.error('Erreur Gemini API:', error.message);
    throw new Error('Erreur lors de l\'appel à l\'API Gemini');
  }
}

/**
 * Modifie un template selon le prompt utilisateur
 * @param {Object} templateOriginal - Template d'origine
 * @param {string} userPrompt - Prompt de l'utilisateur
 * @returns {Promise<Object>} - Template modifié
 */
async function modifyTemplateWithPrompt(templateOriginal, userPrompt) {
  try {
    const prompt = `
Tu es un expert en design de biellets d'invitations événementielles.

Voici le template original que l'utilisateur a choisi :

TEMPLATE ORIGINAL (format JSON) :
${JSON.stringify(templateOriginal.structure, null, 2)}

L'utilisateur demande les modifications suivantes :
"${userPrompt}"

OBJECTIF :
Applique les modifications demandées au template tout en conservant la structure globale.

RÈGLES :
1. Ne change que ce qui est demandé par l'utilisateur
2. Si l'utilisateur demande de changer les couleurs, propose une palette harmonieuse
3. Si l'utilisateur demande de changer le texte, réécris le message principal
4. Si l'utilisateur demande une disposition différente, ajuste miseEnPage
5. Si la demande est vague, interprète-la de manière professionnelle
6. Retourne UNIQUEMENT le JSON modifié, sans texte explicatif

Le JSON retourné doit avoir EXACTEMENT la même structure que l'original.

JSON MODIFIÉ :
`;

    const response = await generateContent(prompt);

    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const modifiedStructure = JSON.parse(jsonMatch[0]);
        return {
          ...templateOriginal.toObject(),
          structure: modifiedStructure,
          version: templateOriginal.version + 1,
          derniereModification: new Date()
        };
      } catch (e) {
        console.error('Erreur parsing JSON Gemini:', e.message);
        return templateOriginal;
      }
    }
    
    return templateOriginal;
  } catch (error) {
    console.error('Erreur modifyTemplateWithPrompt:', error.message);
    throw error;
  }
}

/**
 * Génère des suggestions de modification basées sur le type d'événement
 * @param {Object} template - Template actuel
 * @param {string} eventType - Type d'événement
 * @returns {Promise<Array>} - Liste de suggestions
 */
async function generateTemplateSuggestions(template, eventType) {
  try {
    const prompt = `
Analyse le template suivant et propose 4 suggestions de modification adaptées à un événement de type "${eventType}".

Template actuel (couleurs principales: ${template.structure?.couleurs?.primary || '#1a1a1a'}, 
style: ${template.structure?.miseEnPage || 'standard'})

Retourne UNIQUEMENT un tableau JSON de suggestions, exemple :
[
  "Rendre les couleurs plus festives",
  "Ajouter un compte à rebours",
  "Mettre le QR code plus en évidence",
  "Ajouter une section invités +1"
]

SUGGESTIONS :
`;

    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing suggestions:', e.message);
        return [
          "Rendre les couleurs plus dynamiques",
          "Ajouter une image de fond",
          "Mettre en avant la date",
          "Personnaliser le bouton d'action"
        ];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Erreur generateTemplateSuggestions:', error.message);
    throw error;
  }
}

/**
 * Applique des modifications spécifiques au contenu textuel
 * @param {Object} contenu - Contenu actuel
 * @param {string} userPrompt - Demande de modification
 * @returns {Promise<Object>} - Contenu modifié
 */
async function modifyTextContent(contenu, userPrompt) {
  try {
    const prompt = `
Voici le contenu actuel d'une invitation :
- Titre : "${contenu.titre || 'Titre'}"
- Message : "${contenu.message || 'Message'}"
- Footer : "${contenu.footer || 'Footer'}"
- Bouton : "${contenu.bouton || 'Bouton'}"

Demande utilisateur : "${userPrompt}"

Retourne UNIQUEMENT un JSON avec les champs modifiés (seulement ceux qui changent) :
{
  "titre": "nouveau titre",
  "message": "nouveau message",
  "footer": "nouveau footer",
  "bouton": "nouveau bouton"
}
`;

    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing contenu modifié:', e.message);
        return {};
      }
    }
    return {};
  } catch (error) {
    console.error('Erreur modifyTextContent:', error.message);
    throw error;
  }
}

/**
 * Suggère une palette de couleurs modifiée
 * @param {Object} colorsActuelles - Palette actuelle
 * @param {string} userPrompt - Demande de modification
 * @returns {Promise<Object>} - Nouvelle palette
 */
async function modifyColors(colorsActuelles, userPrompt) {
  try {
    const prompt = `
Palette actuelle :
${JSON.stringify(colorsActuelles, null, 2)}

Demande utilisateur : "${userPrompt}"

Propose une nouvelle palette JSON respectant la structure :
{
  "primary": "#code hex",
  "secondary": "#code hex",
  "accent": "#code hex",
  "background": "#code hex",
  "text": "#code hex"
}

Retourne UNIQUEMENT le JSON.
`;

    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing couleurs:', e.message);
        return colorsActuelles;
      }
    }
    return colorsActuelles;
  } catch (error) {
    console.error('Erreur modifyColors:', error.message);
    throw error;
  }
}

module.exports = {
  modifyTemplateWithPrompt,
  generateTemplateSuggestions,
  modifyTextContent,
  modifyColors,
  generateContent
};



/**
 * Modifie un template selon le prompt utilisateur
 * @param {Object} templateOriginal - Template d'origine
 * @param {string} userPrompt - Prompt de l'utilisateur
 * @returns {Promise<Object>} - Template modifié
 */
async function modifyTemplateWithPrompt(templateOriginal, userPrompt) {
  try {
    const prompt = `
Tu es un expert en design de biellets d'invitations événementielles.

Voici le template original que l'utilisateur a choisi :

TEMPLATE ORIGINAL (format JSON) :
${JSON.stringify(templateOriginal.structure, null, 2)}

L'utilisateur demande les modifications suivantes :
"${userPrompt}"

OBJECTIF :
Applique les modifications demandées au template tout en conservant la structure globale.

RÈGLES :
1. Ne change que ce qui est demandé par l'utilisateur
2. Si l'utilisateur demande de changer les couleurs, propose une palette harmonieuse
3. Si l'utilisateur demande de changer le texte, réécris le message principal
4. Si l'utilisateur demande une disposition différente, ajuste miseEnPage
5. Si la demande est vague, interprète-la de manière professionnelle
6. Retourne UNIQUEMENT le JSON modifié, sans texte explicatif

Le JSON retourné doit avoir EXACTEMENT la même structure que l'original.

JSON MODIFIÉ :
`;

    const response = await generateContent(prompt);

    // Extraire le JSON de la réponse
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        const modifiedStructure = JSON.parse(jsonMatch[0]);
        return {
          ...templateOriginal.toObject(),
          structure: modifiedStructure,
          version: templateOriginal.version + 1,
          derniereModification: new Date()
        };
      } catch (e) {
        console.error('Erreur parsing JSON Gemini:', e.message);
        return templateOriginal;
      }
    }
    
    return templateOriginal;
  } catch (error) {
    console.error('Erreur modifyTemplateWithPrompt:', error.message);
    throw error;
  }
}

/**
 * Génère des suggestions de modification basées sur le type d'événement
 * @param {Object} template - Template actuel
 * @param {string} eventType - Type d'événement
 * @returns {Promise<Array>} - Liste de suggestions
 */
async function generateTemplateSuggestions(template, eventType) {
  try {
    const prompt = `
Analyse le template suivant et propose 4 suggestions de modification adaptées à un événement de type "${eventType}".

Template actuel (couleurs principales: ${template.structure?.couleurs?.primary || '#1a1a1a'}, 
style: ${template.structure?.miseEnPage || 'standard'})

Retourne UNIQUEMENT un tableau JSON de suggestions, exemple :
[
  "Rendre les couleurs plus festives",
  "Ajouter un compte à rebours",
  "Mettre le QR code plus en évidence",
  "Ajouter une section invités +1"
]

SUGGESTIONS :
`;

    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\[[\s\S]*\]/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing suggestions:', e.message);
        return [
          "Rendre les couleurs plus dynamiques",
          "Ajouter une image de fond",
          "Mettre en avant la date",
          "Personnaliser le bouton d'action"
        ];
      }
    }
    
    return [];
  } catch (error) {
    console.error('Erreur generateTemplateSuggestions:', error.message);
    throw error;
  }
}


/**
 * Applique des modifications spécifiques au contenu textuel
 * @param {Object} contenu - Contenu actuel
 * @param {string} userPrompt - Demande de modification
 * @returns {Promise<Object>} - Contenu modifié
 */
async function modifyTextContent(contenu, userPrompt) {
  try {
    const prompt = `
Voici le contenu actuel d'une invitation :
- Titre : "${contenu.titre || 'Titre'}"
- Message : "${contenu.message || 'Message'}"
- Footer : "${contenu.footer || 'Footer'}"
- Bouton : "${contenu.bouton || 'Bouton'}"

Demande utilisateur : "${userPrompt}"

Retourne UNIQUEMENT un JSON avec les champs modifiés (seulement ceux qui changent) :
{
  "titre": "nouveau titre",
  "message": "nouveau message",
  "footer": "nouveau footer",
  "bouton": "nouveau bouton"
}
`;

    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing contenu modifié:', e.message);
        return {};
      }
    }
    return {};
  } catch (error) {
    console.error('Erreur modifyTextContent:', error.message);
    throw error;
  }
}

/**
 * Suggère une palette de couleurs modifiée
 * @param {Object} colorsActuelles - Palette actuelle
 * @param {string} userPrompt - Demande de modification
 * @returns {Promise<Object>} - Nouvelle palette
 */
async function modifyColors(colorsActuelles, userPrompt) {
  try {
    const prompt = `
Palette actuelle :
${JSON.stringify(colorsActuelles, null, 2)}

Demande utilisateur : "${userPrompt}"

Propose une nouvelle palette JSON respectant la structure :
{
  "primary": "#code hex",
  "secondary": "#code hex",
  "accent": "#code hex",
  "background": "#code hex",
  "text": "#code hex"
}

Retourne UNIQUEMENT le JSON.
`;

    const response = await generateContent(prompt);
    const jsonMatch = response.match(/\{[\s\S]*\}/);
    if (jsonMatch) {
      try {
        return JSON.parse(jsonMatch[0]);
      } catch (e) {
        console.error('Erreur parsing couleurs:', e.message);
        return colorsActuelles;
      }
    }
    return colorsActuelles;
  } catch (error) {
    console.error('Erreur modifyColors:', error.message);
    throw error;
  }
}

module.exports = {
  modifyTemplateWithPrompt,
  generateTemplateSuggestions,
  modifyTextContent,
  modifyColors,
  generateContent
};


