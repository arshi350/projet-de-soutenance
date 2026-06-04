const Template = require('../../models/templates/Template');
const mongoose = require('mongoose');

//fonction pour ajouter un template
async function addTemplate(req, res) {
  try {
    const { image, titre, description } = req.body;

    if (!image || !titre || !description) {
      return res.status(400).json({
        message: 'Les champs image, titre et description sont requis.',
      });
    }

    const template = new Template({ image, titre, description });
    await template.save();

    res.status(201).json({
      message: 'Template créé avec succès',
      template,
    });
  } catch (error) {
    console.error('Erreur addTemplate:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la création du template.' });
  }
}

//fonction pour récupérer tous les templates
async function getAllTemplates(req, res) {
  try {
    const templates = await Template.find().sort({ createdAt: -1 });
    res.status(200).json({ message: 'Templates récupérés avec succès', templates });
  } catch (error) {
    console.error('Erreur getAllTemplates:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération des templates.' });
  }
}

//fonction pour récupérer un template par ID
async function getTemplateById(req, res) {
  try {
    const { id } = req.params;
    const template = await Template.findById(id);

    if (!template) {
      return res.status(404).json({ message: 'Template non trouvé.' });
    }

    res.status(200).json({ message: 'Template récupéré avec succès', template });
  } catch (error) {
    console.error('Erreur getTemplateById:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la récupération du template.' });
  }
}

//fonction pour modifier un template
async function updateTemplate(req, res) {
  try {
    const { id } = req.params;
    const { image, titre, description } = req.body;

    const updatedTemplate = await Template.findByIdAndUpdate(
      id,
      { image, titre, description },
      { new: true, runValidators: true }
    );

    if (!updatedTemplate) {
      return res.status(404).json({ message: 'Template non trouvé.' });
    }

    res.status(200).json({ message: 'Template mis à jour avec succès', template: updatedTemplate });
  } catch (error) {
    console.error('Erreur updateTemplate:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la mise à jour du template.' });
  }
}

//fonction pour supprimer un template
async function deleteTemplate(req, res) {
  try {
    const { id } = req.params;
    const deletedTemplate = await Template.findByIdAndDelete(id);

    if (!deletedTemplate) {
      return res.status(404).json({ message: 'Template non trouvé.' });
    }

    res.status(200).json({ message: 'Template supprimé avec succès.' });
  } catch (error) {
    console.error('Erreur deleteTemplate:', error);
    res.status(500).json({ message: 'Erreur serveur lors de la suppression du template.' });
  }
}

module.exports = {
  addTemplate,
  getAllTemplates,
  getTemplateById,
  updateTemplate,
  deleteTemplate,
};
