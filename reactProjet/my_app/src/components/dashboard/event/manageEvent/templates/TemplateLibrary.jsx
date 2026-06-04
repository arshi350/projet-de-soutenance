import React, { useState } from 'react';
import { SlidersHorizontal, Users, ArrowUpDown, Check } from 'lucide-react';

export default function TemplateLibrary() {
  // États pour les filtres multicritères
  const [selectedAmbiance, setSelectedAmbiance] = useState('Élégant');
  const [selectedCouleur, setSelectedCouleur] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('Plus récents');

  // Données des templates (avec images réalistes Unsplash axées tech/événementiel)
  const templates = [
    {
      id: 1,
      title: 'Minuit Doré',
      ambiance: 'Élégant',
      couleur: 'Neutre',
      tag: 'Professionnel',
      uses: '2.3k',
      isPremium: true,
      isNew: false,
      image: 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      subtext: 'moderne  •  élégant'
    },
    {
      id: 2,
      title: 'Aurora',
      ambiance: 'Dynamique',
      couleur: 'Chaud',
      tag: 'Festif',
      uses: '1.8k',
      isPremium: false,
      isNew: false,
      image: 'https://images.unsplash.com/photo-1634017839464-5c339ebe3cb4?w=400&auto=format&fit=crop&q=80',
      subtext: 'dynamique  •  créatif'
    },
    {
      id: 3,
      title: 'Urban Vibe',
      ambiance: 'Minimaliste',
      couleur: 'Froid',
      tag: 'Professionnel',
      uses: '0.9k',
      isPremium: false,
      isNew: true,
      image: 'https://images.unsplash.com/photo-1600585154340-be6161a56a0c?w=400&auto=format&fit=crop&q=80',
      subtext: 'minimaliste  •  professionnel'
    }
  ];

  return (
    <div className="px-60 font p-8 font-sans">
      
      {/* --- EN-TÊTE DE LA BIBLIOTHÈQUE --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          {/* Badge Nombre de Templates */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-blue-50 text-[#017EF7] uppercase">
            <span className="w-1 h-1 rounded-full bg-[#017EF7] mr-1.5"></span>
            12 Templates Disponibles
          </span>
          <h1 className="text-3xl font-bold text-gray-800 tracking-tight">
            Bibliothèque de templates
          </h1>
          <p className="text-xs text-gray-400 max-w-xl leading-relaxed">
            Choisissez un style, l'IA s'occupe du reste. Personnalisez chaque détail pour créer une expérience mémorable.
          </p>
        </div>

        {/* Bouton de Tri */}
        <div className="relative shrink-0">
          <button className="flex items-center gap-2 px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-700 hover:bg-gray-50 shadow-sm transition-all">
            <ArrowUpDown className="w-3.5 h-3.5 text-gray-400" />
            <span>{sortBy}</span>
          </button>
        </div>
      </div>

      {/* --- SECTION DES FILTRES (MULTICRITÈRES) --- */}
      <div className="space-y-4 flex flex-wrap justify-around mb-8 pb-6 border-b border-gray-100">
        
        {/* Ligne 1 : Ambiances */}
        <div className="flex flex-col items-center gap-x-4 gap-y-2">
          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider w-20">Ambiances</span>
          <div className="flex flex-wrap gap-2">
            {['Élégant', 'Dynamique', 'Minimaliste'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedAmbiance(selectedAmbiance === item ? null : item)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  selectedAmbiance === item
                    ? 'bg-[#017EF7] border-[#017EF7] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 2 : Couleurs */}
        <div className="flex flex-col items-center gap-x-4 gap-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider w-20">Couleurs</span>
          <div className="flex flex-wrap gap-2">
            {['Froid', 'Chaud', 'Neutre'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedCouleur(selectedCouleur === item ? null : item)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  selectedCouleur === item
                    ? 'bg-[#017EF7] border-[#017EF7] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

        {/* Ligne 3 : Tags */}
        <div className="flex flex-col items-center gap-x-4 gap-y-2">
          <span className="text-[10px] font-black text-gray-400 uppercase tracking-wider w-20">Tags</span>
          <div className="flex flex-wrap gap-2">
            {['Festif', 'Professionnel'].map((item) => (
              <button
                key={item}
                onClick={() => setSelectedTag(selectedTag === item ? null : item)}
                className={`px-4 py-1.5 text-xs font-bold rounded-full border transition-all ${
                  selectedTag === item
                    ? 'bg-[#017EF7] border-[#017EF7] text-white shadow-sm'
                    : 'bg-white border-gray-200 text-gray-600 hover:border-gray-300'
                }`}
              >
                {item}
              </button>
            ))}
          </div>
        </div>

      </div>

      {/* --- GRILLE DES TEMPLATES --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {templates.map((template) => (
          <div 
            key={template.id} 
            className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex flex-col justify-between group hover:shadow-md transition-all duration-200"
          >
            {/* Conteneur de l'image avec Aspect Ratio et Badges insérés */}
            <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-900">
              <img 
                src={template.image} 
                alt={template.title}
                className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-300"
              />
              
              {/* Badge Premium (Haut Droit) */}
              {template.isPremium && (
                <span className="absolute top-3 right-3 bg-white/95 backdrop-blur-sm text-gray-800 text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
                  PREMIUM
                </span>
              )}

              {/* Badge New (Bas Gauche) */}
              {template.isNew && (
                <span className="absolute bottom-3 left-3 bg-[#10B981] text-white text-[9px] font-black px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
                  NEW
                </span>
              )}
            </div>

            {/* Infos Textuelles du Template */}
            <div className="space-y-1 px-1 mb-4">
              <div className="flex items-center justify-between">
                <h3 className="text-sm font-black text-gray-800">{template.title}</h3>
                
                {/* Compteur de téléchargements/utilisations */}
                <div className="flex items-center gap-1 text-gray-400 text-[11px] font-bold">
                  <Users className="w-3.5 h-3.5" />
                  <span>{template.uses}</span>
                </div>
              </div>
              
              {/* Sous-catégories grises */}
              <p className="text-[10px] font-medium text-gray-400 capitalize tracking-wide">
                {template.subtext}
              </p>
            </div>

            {/* Bouton d'action principal (Bleu corporate) */}
            <button className="w-full bg-gradient-to-r from-[#EF5D02] to-[#FF7B2A] hover:from-[#FF7B2A] hover:to-[#EF5D02] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center gap-2">
              <span>Choisir ce template</span>
            </button>

          </div>
        ))}
      </div>

    </div>
  );
}