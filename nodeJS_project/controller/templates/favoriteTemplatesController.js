const FavoriteTemplate = require('../../models/templates/FavoriteTemplate');
const mongoose = require('mongoose');

/**
 * Enregistrer un template personnalisé dans les favoris de l'utilisateur
 * POST /api/templates/favorites
 */
const saveFavoriteTemplate = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.body.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { eventId, titre, imageUrl, cloudinaryPublicId, prompt, metadata, aspectRatio } = req.body;

    if (!imageUrl) {
      return res.status(400).json({ success: false, message: "L'URL de l'image est obligatoire" });
    }

    const newFavorite = new FavoriteTemplate({
      userId,
      eventId: eventId && mongoose.Types.ObjectId.isValid(eventId) ? eventId : null,
      titre: titre || 'Billet Personnalisé IA',
      imageUrl,
      cloudinaryPublicId: cloudinaryPublicId || '',
      promptHistorique: prompt ? [{ prompt, aspectRatio: aspectRatio || '16:9' }] : [],
      metadata: {
        theme: metadata?.theme || 'modern-luxury',
        palette: metadata?.palette || [],
        aspectRatio: aspectRatio || metadata?.aspectRatio || '16:9',
        sourceModel: metadata?.sourceModel || 'FLUX_IMAGEN',
      },
    });

    const saved = await newFavorite.save();
    return res.status(201).json({
      success: true,
      message: 'Modèle enregistré dans vos favoris avec succès',
      data: saved,
    });
  } catch (error) {
    console.error('Erreur saveFavoriteTemplate:', error);
    return res.status(500).json({
      success: false,
      message: "Erreur lors de l'enregistrement du favori",
      error: error.message,
    });
  }
};

/**
 * Récupérer tous les templates favoris de l'utilisateur connecté
 * GET /api/templates/favorites
 */
const getUserFavoriteTemplates = async (req, res) => {
  try {
    const userId = req.user?.id || req.user?._id || req.query.userId;
    if (!userId) {
      return res.status(401).json({ success: false, message: 'Utilisateur non authentifié' });
    }

    const { eventId } = req.query;
    const filter = { userId };
    if (eventId && mongoose.Types.ObjectId.isValid(eventId)) {
      filter.eventId = eventId;
    }

    const favorites = await FavoriteTemplate.find(filter).sort({ createdAt: -1 });
    return res.status(200).json({
      success: true,
      count: favorites.length,
      data: favorites,
    });
  } catch (error) {
    console.error('Erreur getUserFavoriteTemplates:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la récupération des favoris',
      error: error.message,
    });
  }
};

/**
 * Supprimer un template favori par ID
 * DELETE /api/templates/favorites/:id
 */
const deleteFavoriteTemplate = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || req.user?._id;

    if (!id || !mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID de favori invalide' });
    }

    const filter = { _id: id };
    if (userId) filter.userId = userId;

    const deleted = await FavoriteTemplate.findOneAndDelete(filter);
    if (!deleted) {
      return res.status(404).json({ success: false, message: 'Modèle favori introuvable' });
    }

    return res.status(200).json({
      success: true,
      message: 'Modèle retiré des favoris avec succès',
      data: { id },
    });
  } catch (error) {
    console.error('Erreur deleteFavoriteTemplate:', error);
    return res.status(500).json({
      success: false,
      message: 'Erreur lors de la suppression du favori',
      error: error.message,
    });
  }
};

module.exports = {
  saveFavoriteTemplate,
  getUserFavoriteTemplates,
  deleteFavoriteTemplate,
};
