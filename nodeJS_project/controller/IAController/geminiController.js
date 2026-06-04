
const geminiTemplateService = require('../../services/geminiService');
const Template = require('../../models/templates/Template');

/**
 * Modifier un template avec l'IA
 */
async function modifyTemplate(req, res) {
  try {
    const { templateId, prompt } = req.body;
    
    if (!templateId || !prompt) {
      return res.status(400).json({ 
        message: 'templateId et prompt sont requis' 
      });
    }
    
    // Récupérer le template depuis la base
    const templateOriginal = await Template.findById(templateId);
    
    if (!templateOriginal) {
      return res.status(404).json({ message: 'Template non trouvé' });
    }
    
    // Modifier le template avec Gemini
    const modifiedTemplate = await geminiTemplateService.modifyTemplateWithPrompt(
      templateOriginal,
      prompt
    );
    
    res.status(200).json({ 
      message: 'Template modifié avec succès',
      template: modifiedTemplate 
    });
  } catch (error) {
    console.error('Erreur modification template:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du template' });
  }
}

/**
 * Générer des suggestions pour un template
 */
async function getSuggestions(req, res) {
  try {
    const { templateId, eventType } = req.body;
    
    if (!templateId || !eventType) {
      return res.status(400).json({ message: 'templateId et eventType sont requis' });
    }
    
    const template = await Template.findById(templateId);
    if (!template) {
      return res.status(404).json({ message: 'Template non trouvé' });
    }
    
    const suggestions = await geminiTemplateService.generateTemplateSuggestions(
      template,
      eventType
    );
    
    res.status(200).json({ 
      message: 'Suggestions générées avec succès',
      suggestions 
    });
  } catch (error) {
    console.error('Erreur génération suggestions:', error);
    res.status(500).json({ message: 'Erreur lors de la génération des suggestions' });
  }
}

/**
 * Appliquer des modifications textuelles
 */
async function modifyText(req, res) {
  try {
    const { content, prompt } = req.body;
    
    if (!content || !prompt) {
      return res.status(400).json({ message: 'content et prompt sont requis' });
    }
    
    const modifiedContent = await geminiTemplateService.modifyTextContent(content, prompt);
    
    res.status(200).json({ 
      message: 'Contenu textuel modifié avec succès',
      modifiedContent 
    });
  } catch (error) {
    console.error('Erreur modification texte:', error);
    res.status(500).json({ message: 'Erreur lors de la modification du texte' });
  }
}

/**
 * Modifier les couleurs
 */
async function modifyColors(req, res) {
  try {
    const { colors, prompt } = req.body;
    
    if (!colors || !prompt) {
      return res.status(400).json({ message: 'colors et prompt sont requis' });
    }
    
    const newColors = await geminiTemplateService.modifyColors(colors, prompt);
    
    res.status(200).json({ 
      message: 'Palette de couleurs modifiée avec succès',
      colors: newColors 
    });
  } catch (error) {
    console.error('Erreur modification couleurs:', error);
    res.status(500).json({ message: 'Erreur lors de la modification des couleurs' });
  }
}

module.exports = {
  modifyTemplate,
  getSuggestions,
  modifyText,
  modifyColors
};