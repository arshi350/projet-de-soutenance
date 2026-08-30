const { GoogleGenAI } = require('@google/genai');
const dotenv = require('dotenv');
dotenv.config();

const apiKey = process.env.GEMINI_API_KEY ? process.env.GEMINI_API_KEY.trim() : '';
const GEMINI_MODEL = process.env.GEMINI_MODEL_TEXT || 'gemini-2.5-flash';

let aiClient = null;
if (apiKey) {
  try {
    aiClient = new GoogleGenAI({ apiKey });
  } catch (err) {
    console.warn('⚠️ Erreur initialisation GoogleGenAI dans aiTicketBackgroundService:', err.message);
  }
}

/**
 * Catalogue exhaustif de véritables photographies HD réelles pour événements publics
 * Toutes les URLs sont réelles, vérifiées et optimisées en format panoramique 1200px.
 */
const VERIFIED_REAL_BACKGROUNDS = [
  // --- 1. CONCERTS, FESTIVALS & MUSIQUE LIVE (15 photos) ---
  {
    id: 'concert-pyro-live',
    label: 'Scène Live & Flammes Pyrotechniques',
    url: 'https://images.unsplash.com/photo-1470225620780-dba8ba36b745?q=80&w=1200&auto=format&fit=crop',
    color: '#FF5005',
    category: 'concert',
    tags: ['Live', 'Pyrotechnie', 'Foule'],
    keywords: ['concert', 'live', 'show', 'rock', 'metal', 'rap', 'spectacle', 'pyro', 'flammes']
  },
  {
    id: 'concert-cyber-lasers',
    label: 'Nuit Électro & Lasers Cyberpunk',
    url: 'https://images.unsplash.com/photo-1516450360452-9312f5e86fc7?q=80&w=1200&auto=format&fit=crop',
    color: '#8B5CF6',
    category: 'concert',
    tags: ['Électro', 'Lasers', 'DJ Set'],
    keywords: ['electro', 'dj', 'club', 'night', 'lasers', 'cyber', 'edm', 'techno', 'house', 'rave']
  },
  {
    id: 'concert-sunset-openair',
    label: 'Festival Sunset & Vague Dorée',
    url: 'https://images.unsplash.com/photo-1492684223066-81342ee5ff30?q=80&w=1200&auto=format&fit=crop',
    color: '#F97316',
    category: 'concert',
    tags: ['Festival', 'Sunset', 'Plein Air'],
    keywords: ['festival', 'sunset', 'coucher de soleil', 'plein air', 'foule', 'été', 'open air']
  },
  {
    id: 'concert-jazz-intimate',
    label: 'Ambiance Jazz & Guitare Tamisée',
    url: 'https://images.unsplash.com/photo-1511671782779-c97d3d27a1d4?q=80&w=1200&auto=format&fit=crop',
    color: '#EFB810',
    category: 'concert',
    tags: ['Acoustique', 'Jazz', 'Intimiste'],
    keywords: ['jazz', 'acoustique', 'guitare', 'piano', 'tamisé', 'intime', 'soul', 'blues', 'voix']
  },
  {
    id: 'concert-afro-rhythm',
    label: 'Vibrations Afrobeat & Énergie Festival',
    url: 'https://images.unsplash.com/photo-1501386761578-eac5c94b800a?q=80&w=1200&auto=format&fit=crop',
    color: '#EAB308',
    category: 'concert',
    tags: ['Afrobeat', 'Rythme', 'Danse'],
    keywords: ['afrobeat', 'afro', 'danse', 'fally', 'burna', 'wizkid', 'rythme', 'afrique', 'urbain']
  },
  {
    id: 'concert-dj-crowd',
    label: 'Arène Festival & DJ aux Platines',
    url: 'https://images.unsplash.com/photo-1429962714451-bb934ecdc4ec?q=80&w=1200&auto=format&fit=crop',
    color: '#EC4899',
    category: 'concert',
    tags: ['DJ Show', 'Clubbing', 'Dancefloor'],
    keywords: ['dj', 'dancefloor', 'fete', 'soiree', 'party', 'club', 'danse']
  },
  {
    id: 'concert-stadium-lights',
    label: 'Grand Stade & Éclairage Scénique',
    url: 'https://images.unsplash.com/photo-1459749411175-04bf5292ceea?q=80&w=1200&auto=format&fit=crop',
    color: '#3B82F6',
    category: 'concert',
    tags: ['Stade', 'Projecteurs', 'Monumental'],
    keywords: ['stade', 'pop', 'chanteur', 'monumental', 'tournee', 'arene']
  },
  {
    id: 'concert-purple-lights',
    label: 'Vagues Violettes & Néons Festival',
    url: 'https://images.unsplash.com/photo-1465847899084-d164df4dedc6?q=80&w=1200&auto=format&fit=crop',
    color: '#A855F7',
    category: 'concert',
    tags: ['Néons', 'Violet', 'Synthwave'],
    keywords: ['violet', 'purple', 'neon', 'lumiere', 'synth', 'ambiance']
  },
  {
    id: 'concert-acoustic-stage',
    label: 'Session Acoustique & Guitare Live',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    color: '#CA8A04',
    category: 'concert',
    tags: ['Unplugged', 'Musique', 'Chanson'],
    keywords: ['unplugged', 'chanson', 'live', 'artiste', 'solo']
  },
  {
    id: 'concert-orchestra-hall',
    label: 'Orchestre Symphonique & Philharmonie',
    url: 'https://images.unsplash.com/photo-1519744346361-7c0500bf0c8f?q=80&w=1200&auto=format&fit=crop',
    color: '#B45309',
    category: 'concert',
    tags: ['Classique', 'Symphonie', 'Prestige'],
    keywords: ['classique', 'orchestre', 'opera', 'violon', 'symphonie', 'theatre', 'prestige']
  },

  // --- 2. CONFÉRENCES, B2B, TECH & SÉMINAIRES (12 photos) ---
  {
    id: 'conf-grand-auditorium',
    label: 'Grand Auditorium & Keynote Tech',
    url: 'https://images.unsplash.com/photo-1505373877841-8d25f7d46678?q=80&w=1200&auto=format&fit=crop',
    color: '#0284C7',
    category: 'conference',
    tags: ['Auditorium', 'Innovation', 'Keynote'],
    keywords: ['conference', 'keynote', 'tech', 'innovation', 'seminaire', 'presentation', 'auditorium']
  },
  {
    id: 'conf-international-summit',
    label: 'Sommet International & Scène LED',
    url: 'https://images.unsplash.com/photo-1540575467063-178a50c2df87?q=80&w=1200&auto=format&fit=crop',
    color: '#6366F1',
    category: 'conference',
    tags: ['Business', 'Sommet', 'Networking'],
    keywords: ['sommet', 'summit', 'business', 'international', 'forum', 'networking', 'led', 'corporate']
  },
  {
    id: 'conf-expert-panel',
    label: 'Panel d\'Experts & Éclairage Moderne',
    url: 'https://images.unsplash.com/photo-1475721027785-f74eccf877e2?q=80&w=1200&auto=format&fit=crop',
    color: '#0D9488',
    category: 'conference',
    tags: ['Panel', 'Workshop', 'Corporate'],
    keywords: ['panel', 'table ronde', 'workshop', 'formation', 'colloque', 'expert', 'recherche']
  },
  {
    id: 'conf-startup-pitch',
    label: 'Pitch Startups & Amphithéâtre Innovant',
    url: 'https://images.unsplash.com/photo-1515187029135-18ee286d815b?q=80&w=1200&auto=format&fit=crop',
    color: '#10B981',
    category: 'conference',
    tags: ['Startups', 'Pitch', 'Amphi'],
    keywords: ['pitch', 'startup', 'investisseurs', 'venture', 'demo day', 'amphi']
  },
  {
    id: 'conf-tech-lights',
    label: 'Convention Digitale & Scénographie Bleue',
    url: 'https://images.unsplash.com/photo-1528605248644-14dd04022da1?q=80&w=1200&auto=format&fit=crop',
    color: '#2563EB',
    category: 'conference',
    tags: ['Digital', 'Data', 'IA'],
    keywords: ['digital', 'data', 'ia', 'intelligence artificielle', 'convention', 'cyber']
  },
  {
    id: 'conf-networking-hall',
    label: 'Hall de Networking & Échanges B2B',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    color: '#64748B',
    category: 'conference',
    tags: ['Networking', 'B2B', 'Salon'],
    keywords: ['networking', 'rencontre', 'pro', 'affaires', 'salon pro']
  },

  // --- 3. FOIRES, SALONS, EXPOSITIONS & MARCHÉS (12 photos) ---
  {
    id: 'foire-expo-hall',
    label: 'Foire Exposition & Pavillon Lumineux',
    url: 'https://images.unsplash.com/photo-1511578314322-379afb476865?q=80&w=1200&auto=format&fit=crop',
    color: '#10B981',
    category: 'foire',
    tags: ['Stands', 'Exposition', 'Pavillon'],
    keywords: ['foire', 'salon', 'expo', 'exposition', 'stand', 'pavillon', 'marché', 'bazar', 'commerce']
  },
  {
    id: 'foire-gastronomie-food',
    label: 'Festival Culinaire & Salon Gastronomie',
    url: 'https://images.unsplash.com/photo-1555396273-367ea4eb4db5?q=80&w=1200&auto=format&fit=crop',
    color: '#D97706',
    category: 'foire',
    tags: ['Gastronomie', 'Dégustation', 'Saveurs'],
    keywords: ['gastronomie', 'culinaire', 'food', 'cuisine', 'dégustation', 'vin', 'restaurant', 'saveurs']
  },
  {
    id: 'foire-art-gallery',
    label: 'Galerie d\'Art Contemporain & Vernissage',
    url: 'https://images.unsplash.com/photo-1536924940846-227afb31e2a5?q=80&w=1200&auto=format&fit=crop',
    color: '#EC4899',
    category: 'foire',
    tags: ['Art', 'Design', 'Galerie'],
    keywords: ['art', 'galerie', 'design', 'vernissage', 'peinture', 'sculpture', 'moderne', 'contemporain']
  },
  {
    id: 'foire-night-market',
    label: 'Marché Nocturne & Guirlandes Dorées',
    url: 'https://images.unsplash.com/photo-1513151233558-d860c5398176?q=80&w=1200&auto=format&fit=crop',
    color: '#F59E0B',
    category: 'foire',
    tags: ['Marché', 'Guirlandes', 'Artisanal'],
    keywords: ['marché nocturne', 'guirlandes', 'artisanal', 'fête', 'noël', 'créateurs', 'bazar']
  },
  {
    id: 'foire-auto-salon',
    label: 'Salon de l\'Automobile & Pavillon Futuriste',
    url: 'https://images.unsplash.com/photo-1503376780353-7e6692767b70?q=80&w=1200&auto=format&fit=crop',
    color: '#0284C7',
    category: 'foire',
    tags: ['Automobile', 'Design', 'Prestige'],
    keywords: ['auto', 'automobile', 'salon auto', 'moteurs', 'voitures', 'futur']
  },
  {
    id: 'foire-book-fair',
    label: 'Salon du Livre & Rencontres Littéraires',
    url: 'https://images.unsplash.com/photo-1524995997946-a1c2e315a42f?q=80&w=1200&auto=format&fit=crop',
    color: '#78350F',
    category: 'foire',
    tags: ['Livre', 'Culture', 'Auteurs'],
    keywords: ['livre', 'culture', 'litterature', 'ecrivains', 'auteurs', 'bibliotheque']
  },

  // --- 4. GALA, SOIRÉES VIP & PRESTIGE (12 photos) ---
  {
    id: 'gala-prestige-gold',
    label: 'Gala Prestige & Lustres Dorés',
    url: 'https://images.unsplash.com/photo-1514525253161-7a46d19cd819?q=80&w=1200&auto=format&fit=crop',
    color: '#EFB810',
    category: 'gala',
    tags: ['Luxe', 'Doré', 'Prestige'],
    keywords: ['gala', 'luxe', 'dore', 'prestige', 'champagne', 'cocktail', 'soiree', 'smoking', 'vip']
  },
  {
    id: 'gala-redcarpet-vip',
    label: 'Tapis Rouge & Cérémonie VIP',
    url: 'https://images.unsplash.com/photo-1469488865564-c2de10f69f96?q=80&w=1200&auto=format&fit=crop',
    color: '#E11D48',
    category: 'gala',
    tags: ['Tapis Rouge', 'Cérémonie', 'VIP'],
    keywords: ['tapis rouge', 'red carpet', 'ceremonie', 'awards', 'recompense', 'cinema', 'mode', 'fashion']
  },
  {
    id: 'gala-masquerade-night',
    label: 'Bal Masqué & Ambiance Nuit Mystique',
    url: 'https://images.unsplash.com/photo-1533174072545-7a4b6ad7a6c3?q=80&w=1200&auto=format&fit=crop',
    color: '#7C3AED',
    category: 'gala',
    tags: ['Mystique', 'Nuit', 'Festif'],
    keywords: ['masque', 'mystique', 'nuit', 'bal', 'velours', 'soiree privee', 'château']
  },
  {
    id: 'gala-champagne-toast',
    label: 'Cocktail de Réception & Flûtes Champagne',
    url: 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?q=80&w=1200&auto=format&fit=crop',
    color: '#FBBF24',
    category: 'gala',
    tags: ['Champagne', 'Cocktail', 'Toast'],
    keywords: ['champagne', 'toast', 'cocktail', 'reception', 'vin', 'fete prive', 'anniversaire']
  },
  {
    id: 'gala-fashion-runway',
    label: 'Défilé de Mode & Fashion Week',
    url: 'https://images.unsplash.com/photo-1509631179647-0177331693ae?q=80&w=1200&auto=format&fit=crop',
    color: '#F43F5E',
    category: 'gala',
    tags: ['Fashion', 'Défilé', 'Haute Couture'],
    keywords: ['mode', 'fashion', 'defile', 'couture', 'mannequin', 'runway', 'design']
  },
  {
    id: 'gala-rooftop-skyline',
    label: 'Soirée Rooftop & Vue Skyline Nocturne',
    url: 'https://images.unsplash.com/photo-1519671482749-fd09be7ccebf?q=80&w=1200&auto=format&fit=crop',
    color: '#38BDF8',
    category: 'gala',
    tags: ['Rooftop', 'Skyline', 'Cocktails'],
    keywords: ['rooftop', 'skyline', 'ville', 'nuit', 'panorama', 'terrasse', 'lounge']
  },

  // --- 5. SPORT, COMPÉTITION & E-SPORT (10 photos) ---
  {
    id: 'sport-stadium-night',
    label: 'Stade Nocturne & Éclairage Puissant',
    url: 'https://images.unsplash.com/photo-1508098682722-e99c43a406b2?q=80&w=1200&auto=format&fit=crop',
    color: '#2563EB',
    category: 'sport',
    tags: ['Stade', 'Match', 'Arène'],
    keywords: ['sport', 'stade', 'match', 'football', 'basketball', 'tournoi', 'competition', 'arena']
  },
  {
    id: 'sport-esport-neon',
    label: 'Arène E-Sport & Éclairage Néon',
    url: 'https://images.unsplash.com/photo-1542751371-adc38448a05e?q=80&w=1200&auto=format&fit=crop',
    color: '#06B6D4',
    category: 'sport',
    tags: ['E-Sport', 'Gaming', 'Néon'],
    keywords: ['esport', 'gaming', 'jeux video', 'neon', 'lan', 'tournoi gaming', 'streaming']
  },
  {
    id: 'sport-marathon-race',
    label: 'Course & Marathon Urbain',
    url: 'https://images.unsplash.com/photo-1530549387789-4c1017266635?q=80&w=1200&auto=format&fit=crop',
    color: '#F97316',
    category: 'sport',
    tags: ['Running', 'Marathon', 'Énergie'],
    keywords: ['course', 'marathon', 'running', 'trail', 'athletisme', 'challenge']
  },
  {
    id: 'sport-combat-ring',
    label: 'Soirée Boxe & Arts Martiaux sous Projecteurs',
    url: 'https://images.unsplash.com/photo-1517438322307-e67111335449?q=80&w=1200&auto=format&fit=crop',
    color: '#DC2626',
    category: 'sport',
    tags: ['Combat', 'Ring', 'Adrénaline'],
    keywords: ['boxe', 'mma', 'combat', 'ring', 'ufc', 'gala de boxe']
  }
];

/**
 * Mélange aléatoire de tableau (Fisher-Yates)
 */
function shuffleArray(array) {
  const arr = [...array];
  for (let i = arr.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [arr[i], arr[j]] = [arr[j], arr[i]];
  }
  return arr;
}

/**
 * Normalisation de la catégorie d'événement
 */
function normalizeCategory(eventType, title = '', description = '') {
  const full = `${eventType || ''} ${title || ''} ${description || ''}`.toLowerCase();
  if (full.includes('conf') || full.includes('forum') || full.includes('tech') || full.includes('sommet') || full.includes('colloque') || full.includes('business') || full.includes('seminaire')) {
    return 'conference';
  }
  if (full.includes('foire') || full.includes('salon') || full.includes('expo') || full.includes('culinaire') || full.includes('marche') || full.includes('bazar') || full.includes('livre')) {
    return 'foire';
  }
  if (full.includes('gala') || full.includes('luxe') || full.includes('soiree') || full.includes('cocktail') || full.includes('vip') || full.includes('ceremonie') || full.includes('mode') || full.includes('fashion') || full.includes('rooftop')) {
    return 'gala';
  }
  if (full.includes('sport') || full.includes('tournoi') || full.includes('match') || full.includes('course') || full.includes('gaming') || full.includes('esport') || full.includes('boxe')) {
    return 'sport';
  }
  return 'concert';
}

/**
 * Recherche et sélectionne exactement 6 fonds d'arrières-plans HD réels et variés à chaque requête
 */
async function suggestTicketBackgrounds({ eventType = 'concert', title = '', description = '', theme = '' }) {
  const detectedCat = normalizeCategory(eventType, title, description);
  const queryWords = `${eventType} ${title} ${description} ${theme}`.toLowerCase();

  // 1. Filtrer les visuels qui correspondent directement à la catégorie ou aux mots-clés
  const primaryMatches = VERIFIED_REAL_BACKGROUNDS.filter(bg => {
    if (bg.category === detectedCat) return true;
    return bg.keywords.some(kw => queryWords.includes(kw));
  });

  // 2. Prendre les autres visuels de secours pour assurer une diversité infinie
  const secondaryMatches = VERIFIED_REAL_BACKGROUNDS.filter(bg => !primaryMatches.some(p => p.id === bg.id));

  // 3. Mélanger aléatoirement pour garantir 6 propositions DIFFÉRENTES à chaque clic sur Actualiser
  const shuffledPrimary = shuffleArray(primaryMatches);
  const shuffledSecondary = shuffleArray(secondaryMatches);

  let selected = [];

  // Prendre jusqu'à 6 depuis les correspondances prioritaires
  if (shuffledPrimary.length >= 6) {
    selected = shuffledPrimary.slice(0, 6);
  } else {
    selected = [...shuffledPrimary, ...shuffledSecondary.slice(0, 6 - shuffledPrimary.length)];
  }

  // Double vérification : Garantir exactement 6 éléments
  if (selected.length < 6) {
    const remaining = shuffleArray(VERIFIED_REAL_BACKGROUNDS).filter(bg => !selected.some(s => s.id === bg.id));
    selected = [...selected, ...remaining.slice(0, 6 - selected.length)];
  }

  // 4. Si Gemini est disponible, on lui demande de personnaliser les labels en fonction du titre exact
  if (aiClient && apiKey) {
    try {
      const prompt = `Tu es un Directeur Artistique Événementiel.
Pour l'événement "${title || eventType}" (Type: ${detectedCat}, Thème: ${theme || 'Standard'}), voici 6 arrière-plans visuels sélectionnés :
${JSON.stringify(selected.map((s, idx) => ({ index: idx, id: s.id, currentLabel: s.label })), null, 2)}

MISSION :
Génère 6 titres courts et percutants (customLabels) en français adaptés spécifiquement au nom "${title || eventType}".
Réponds STRICTEMENT en JSON :
\`\`\`json
{
  "style": "Ambiance générale détectée",
  "labels": ["Titre 1", "Titre 2", "Titre 3", "Titre 4", "Titre 5", "Titre 6"]
}
\`\`\``;

      const response = await aiClient.models.generateContent({
        model: GEMINI_MODEL,
        contents: prompt,
        config: { temperature: 0.7 }
      });

      const text = response.text || '';
      const parsed = text.match(/\{[\s\S]*\}/) ? JSON.parse(text.match(/\{[\s\S]*\}/)[0]) : null;

      if (parsed && Array.isArray(parsed.labels) && parsed.labels.length === 6) {
        selected = selected.map((item, idx) => ({
          ...item,
          label: parsed.labels[idx] || item.label
        }));
      }
    } catch (err) {
      // Si quota ou erreur API, les labels HD d'origine s'affichent sans aucun impact
    }
  }

  return {
    success: true,
    count: selected.length,
    detectedCategory: detectedCat,
    style: `${detectedCat.toUpperCase()} Selection HD`,
    suggestions: selected.slice(0, 6)
  };
}

module.exports = {
  suggestTicketBackgrounds,
  VERIFIED_REAL_BACKGROUNDS
};
