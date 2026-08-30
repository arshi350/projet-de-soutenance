// moduleIA/middlewares/validateChatInput.js

/**
 * Middleware de validation et d'assainissement des entrées du chat
 */
export const validateChatInput = (req, res, next) => {
  const { sessionId, message } = req.body;

  // 1. Vérification de la présence des champs requis
  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
    return res.status(400).json({
      error: 'Le champ sessionId est obligatoire et doit être une chaîne non vide.'
    });
  }

  if (!message || typeof message !== 'string' || message.trim() === '') {
    return res.status(400).json({
      error: 'Le champ message est obligatoire et ne peut pas être vide.'
    });
  }

  // 2. Vérification de la taille maximale (4000 caractères)
  const trimmedMessage = message.trim();
  if (trimmedMessage.length > 4000) {
    return res.status(400).json({
      error: 'Le message dépasse la limite autorisée de 4000 caractères.'
    });
  }

  // 3. Normalisation dans la requête
  req.body.sessionId = sessionId.trim();
  req.body.message = trimmedMessage;

  next();
};

export const validateResetInput = (req, res, next) => {
  const { sessionId } = req.body;

  if (!sessionId || typeof sessionId !== 'string' || sessionId.trim() === '') {
    return res.status(400).json({
      error: 'Le champ sessionId est obligatoire pour réinitialiser la session.'
    });
  }

  req.body.sessionId = sessionId.trim();
  next();
};

export default {
  validateChatInput,
  validateResetInput
};
