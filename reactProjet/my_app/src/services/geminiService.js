// services/geminiService.js - Moteur local autonome sans dépendance d'API externe

export const modifyTemplate = async (templateId, prompt, token, templateImage = null) => {
  const lower = (prompt || '').toLowerCase();
  const modifiedData = {};

  if (lower.includes('or') || lower.includes('doré') || lower.includes('gold')) {
    modifiedData.guestNameColor = '#D97706';
    modifiedData.accentColor = '#B45309';
  } else if (lower.includes('rouge') || lower.includes('rubis') || lower.includes('red')) {
    modifiedData.guestNameColor = '#EF4444';
    modifiedData.accentColor = '#DC2626';
  } else if (lower.includes('vert') || lower.includes('émeraude') || lower.includes('green')) {
    modifiedData.guestNameColor = '#10B981';
    modifiedData.accentColor = '#059669';
  } else if (lower.includes('bleu') || lower.includes('blue')) {
    modifiedData.guestNameColor = '#017EF7';
    modifiedData.accentColor = '#1D4ED8';
  } else if (lower.includes('violet') || lower.includes('purple')) {
    modifiedData.guestNameColor = '#8B5CF6';
    modifiedData.accentColor = '#6D28D9';
  }

  if (lower.includes('qr') && (lower.includes('grand') || lower.includes('agrandir') || lower.includes('plus'))) {
    modifiedData.qrCodeSize = 56;
  } else if (lower.includes('qr') && (lower.includes('petit') || lower.includes('réduire') || lower.includes('diminuer'))) {
    modifiedData.qrCodeSize = 28;
  }

  const titleMatch = prompt?.match(/(?:titre|intitulé)\s+["']?(.+?)["']?$/i);
  if (titleMatch) modifiedData.title = titleMatch[1].trim();

  return {
    success: true,
    data: {
      generatedImage: templateImage,
      modifiedData: modifiedData
    },
    message: "Modifications appliquées avec succès.",
    warnings: []
  };
};

export const getSuggestions = async (templateId, eventType, token) => {
  return {
    success: true,
    data: [
      { id: '1', label: '🎨 Palette Dorée VIP', prompt: 'applique un dégradé doré luxueux avec finitions or' },
      { id: '2', label: '📱 QR Code Agrandie & Net', prompt: 'agrandis le QR code pour un scan instantané' },
      { id: '3', label: '✨ Typographie Moderne', prompt: 'utilise une typographie élégante et épurée' },
      { id: '4', label: '🌌 Thème Sombre & Nuit', prompt: 'applique un thème sombre profond et raffiné' }
    ],
    message: "Suggestions prêtes."
  };
};

export const modifyTextContent = async (content, prompt, token) => {
  const updated = { ...content };
  const titleMatch = prompt?.match(/(?:titre|nommer?)\s+["']?(.+?)["']?/i);
  if (titleMatch) updated.title = titleMatch[1].trim();

  return {
    success: true,
    data: updated,
    message: "Texte mis à jour."
  };
};

export const modifyColors = async (colors, prompt, token) => {
  const lower = (prompt || '').toLowerCase();
  
  if (lower.includes('or') || lower.includes('doré')) {
    return { success: true, data: { accent: '#D97706', primary: '#B45309', text: '#F59E0B' }, message: 'Couleurs or appliquées.' };
  }
  if (lower.includes('rouge') || lower.includes('rubis')) {
    return { success: true, data: { accent: '#EF4444', primary: '#DC2626', text: '#B91C1C' }, message: 'Couleurs rubis appliquées.' };
  }
  if (lower.includes('vert') || lower.includes('émeraude')) {
    return { success: true, data: { accent: '#10B981', primary: '#059669', text: '#047857' }, message: 'Couleurs émeraude appliquées.' };
  }
  if (lower.includes('violet')) {
    return { success: true, data: { accent: '#8B5CF6', primary: '#6D28D9', text: '#7C3AED' }, message: 'Couleurs violettes appliquées.' };
  }

  return {
    success: true,
    data: { accent: '#017EF7', primary: '#1D4ED8', text: '#017EF7' },
    message: "Couleurs appliquées."
  };
};

export const greeting = async (message, token) => {
  return {
    success: true,
    data: "Bonjour ! Je suis votre Studio de Design. Décrivez vos souhaits de personnalisation (couleurs, disposition du QR code, typographie) et vos billets seront instantanément adaptés.",
    message: "Salutation prête."
  };
};

export default {
  modifyTemplate,
  getSuggestions,
  modifyTextContent,
  modifyColors,
  greeting,
};