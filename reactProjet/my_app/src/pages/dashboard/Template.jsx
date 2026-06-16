import React, { useState, useMemo } from 'react';
import { SlidersHorizontal, Users, ArrowUpDown, Check, Heart, MessageCircle, Star, ZoomIn, X } from 'lucide-react';
import { useGetAllTemplates } from '../../hooks/useTemplates';

export default function Template() {
  // États pour les filtres multicritères
  const [selectedAmbiance, setSelectedAmbiance] = useState(null);
  const [selectedCouleur, setSelectedCouleur] = useState(null);
  const [selectedTag, setSelectedTag] = useState(null);
  const [sortBy, setSortBy] = useState('Plus récents');
  const [likedTemplates, setLikedTemplates] = useState({});
  const [favoriteTemplates, setFavoriteTemplates] = useState({});
  const [commentCounts, setCommentCounts] = useState({});
  const [commentModalFor, setCommentModalFor] = useState(null);
  const [commentText, setCommentText] = useState('');
  const [imagePreview, setImagePreview] = useState(null);

  const { templates: dbTemplates, loading, error } = useGetAllTemplates();

  const templates = useMemo(() => dbTemplates.map((template, index) => {
    const title = template.titre || template.title || `Template ${index + 1}`;
    const description = template.description || '';
    const category = template.categorie || 'classique';
    const derivedAmbiance = category === 'vip' ? 'Élégant' : 'Minimaliste';
    const derivedCouleur = category === 'vip' ? 'Chaud' : 'Neutre';
    const derivedTag = category === 'vip' ? 'Professionnel' : 'Festif';

    return {
      ...template,
      id: template.id || template._id || title + index,
      title,
      ambiance: derivedAmbiance,
      couleur: derivedCouleur,
      tag: derivedTag,
      uses: template.downloads ? String(template.downloads) : '0',
      comments: template.comments || 0,
      isPremium: template.categorie === 'vip',
      isNew: template.isNew !== undefined ? template.isNew : false,
      image: template.image || 'https://images.unsplash.com/photo-1618005182384-a83a8bd57fbe?w=400&auto=format&fit=crop&q=80',
      subtext: description ? description.substring(0, 60) : 'Template disponible',
    };
  }), [dbTemplates]);

  const filteredTemplates = useMemo(() => {
    return templates.filter((template) => {
      const matchesAmbiance = !selectedAmbiance || template.ambiance === selectedAmbiance;
      const matchesCouleur = !selectedCouleur || template.couleur === selectedCouleur;
      const matchesTag = !selectedTag || template.tag === selectedTag;
      return matchesAmbiance && matchesCouleur && matchesTag;
    });
  }, [templates, selectedAmbiance, selectedCouleur, selectedTag]);

  const toggleLike = (id) => {
    setLikedTemplates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const toggleFavorite = (id) => {
    setFavoriteTemplates((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  const openCommentModal = (template) => {
    setCommentModalFor(template);
    setCommentText('');
  };

  const submitComment = () => {
    if (!commentText.trim() || !commentModalFor) return;
    setCommentCounts((prev) => ({
      ...prev,
      [commentModalFor.id]: (prev[commentModalFor.id] || commentModalFor.comments || 0) + 1,
    }));
    setCommentText('');
  };

  const closeCommentModal = () => {
    setCommentModalFor(null);
    setCommentText('');
  };

  const openPreview = (template) => setImagePreview(template);
  const closePreview = () => setImagePreview(null);

  return (
    <div className="px-60 font p-8 font-sans font">
      
      {/* --- EN-TÊTE DE LA BIBLIOTHÈQUE --- */}
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 mb-8">
        <div className="space-y-2">
          {/* Badge Nombre de Templates */}
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-[10px] font-semibold tracking-wider bg-blue-50 text-[#017EF7] uppercase">
            <span className="w-1 h-1 rounded-full bg-[#017EF7] mr-1.5"></span>
            {dbTemplates.length} Templates Disponibles
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
        {loading && (
          <div className="col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center text-slate-500">Chargement des templates...</div>
        )}
        {!loading && error && (
          <div className="col-span-full bg-white rounded-3xl border border-red-200 p-12 text-center text-red-600">Erreur lors du chargement des templates.</div>
        )}
        {!loading && !error && filteredTemplates.length > 0 && (
          filteredTemplates.map((template) => (
            <div 
              key={template.id} 
              className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100/80 flex flex-col justify-between group hover:shadow-md transition-all duration-200"
            >
              {/* Conteneur de l'image avec Aspect Ratio et Badges insérés */}
              <div className="relative w-full aspect-[4/3] rounded-xl overflow-hidden mb-4 bg-gray-900 cursor-pointer" onClick={() => openPreview(template)}>
                <img 
                  src={template.image} 
                  alt={template.title}
                  className="w-full h-full object-cover opacity-90 group-hover:scale-102 transition-transform duration-300"
                />
                <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <div className="inline-flex items-center gap-2 bg-white/90 text-slate-900 rounded-full px-3 py-2 text-xs font-bold">
                    <ZoomIn className="w-4 h-4" /> Voir en grand
                  </div>
                </div>
                
                {/* Badge Premium (Haut Droit) */}
                {template.isPremium && (
                  <span className="absolute top-3 right-3 bg-amber-100  backdrop-blur-sm text-amber-800 text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
                    PREMIUM
                  </span>
                )}

                {/* Badge New (Bas Gauche) */}
                {template.isNew && (
                  <span className="absolute bottom-3 left-3 bg-[#10B981] text-white text-[9px] font-bold px-2.5 py-1 rounded-md shadow-sm uppercase tracking-wider">
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

              <div className="flex flex-wrap items-center justify-between gap-2 mb-4">
                <button
                  type="button"
                  onClick={() => toggleLike(template.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${likedTemplates[template.id] ? 'bg-red-50 border-red-200 text-red-600' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Heart className="w-4 h-4" /> {likedTemplates[template.id] ? 'Liked' : 'Like'}
                </button>
                <button
                  type="button"
                  onClick={() => openCommentModal(template)}
                  className="inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border border-gray-200 bg-white text-xs font-bold text-gray-600 hover:bg-gray-50 transition"
                >
                  <MessageCircle className="w-4 h-4" /> {commentCounts[template.id] || template.comments || 0}
                </button>
                <button
                  type="button"
                  onClick={() => toggleFavorite(template.id)}
                  className={`inline-flex items-center gap-1.5 px-3 py-2 rounded-xl border text-xs font-bold transition ${favoriteTemplates[template.id] ? 'bg-yellow-50 border-yellow-200 text-yellow-700' : 'bg-white border-gray-200 text-gray-600 hover:bg-gray-50'}`}
                >
                  <Star className="w-4 h-4" /> {favoriteTemplates[template.id] ? 'Favori' : 'Favoris'}
                </button>
              </div>
              <button className="w-full bg-gradient-to-r from-[#EF5D02] to-[#FF7B2A] hover:from-[#FF7B2A] hover:to-[#EF5D02] text-white text-xs font-bold py-3 px-4 rounded-xl shadow-sm transition-colors duration-150 flex items-center justify-center gap-2">
                <span>Choisir ce template</span>
              </button>

            </div>
          ))
        )}
        {!loading && !error && filteredTemplates.length === 0 && (
          <div className="col-span-full bg-white rounded-3xl border border-gray-200 p-12 text-center text-slate-500">Aucun template ne correspond aux filtres.</div>
        )}
      </div>

      {commentModalFor && (
        <div className="fixed inset-0 z-50 bg-slate-900/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white rounded-3xl w-full max-w-lg p-6 shadow-2xl relative">
            <button onClick={closeCommentModal} className="absolute top-4 right-4 text-slate-500 hover:text-slate-700">
              <X className="w-5 h-5" />
            </button>
            <h2 className="text-xl font-bold mb-3">Commenter « {commentModalFor.title} »</h2>
            <p className="text-sm text-slate-500 mb-4">Ajouter un commentaire rapide pour enregistrer une préférence locale.</p>
            <textarea
              rows={4}
              value={commentText}
              onChange={(e) => setCommentText(e.target.value)}
              className="w-full border border-slate-200 rounded-2xl p-4 text-sm text-slate-700 outline-none focus:border-blue-300 focus:ring-2 focus:ring-blue-200"
              placeholder="Votre commentaire..."
            />
            <div className="mt-4 flex justify-end gap-3">
              <button onClick={closeCommentModal} className="px-4 py-2 rounded-2xl border border-slate-200 text-sm font-bold text-slate-600 hover:bg-slate-50">
                Annuler
              </button>
              <button onClick={submitComment} className="px-4 py-2 rounded-2xl bg-blue-600 text-white text-sm font-bold hover:bg-blue-700">
                Envoyer
              </button>
            </div>
          </div>
        </div>
      )}

      {imagePreview && (
        <div className="fixed inset-0 z-50 mt-20 bg-black/50 backdrop-blur-xs flex items-center justify-center p-4">
          <button onClick={closePreview} className="absolute top-4 right-4 text-white bg-black/40 rounded-full p-2 hover:bg-black/60">
            <X className="w-5 h-5" />
          </button>
          <div className="relative max-h-[90vh] max-w-[90vw] w-full">
            <img src={imagePreview.image} alt={imagePreview.title} className="max-h-[90vh] max-w-[90vw] w-full object-contain rounded-3xl shadow-2xl" />
            <div className="absolute left-1/2 bottom-6 z-10 flex -translate-x-1/2 items-center justify-center gap-2 rounded-full bg-slate-900/90 px-4 py-3 shadow-2xl backdrop-blur-sm">
              <button
                type="button"
                onClick={() => toggleLike(imagePreview.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition ${likedTemplates[imagePreview.id] ? 'bg-red-50 border border-red-200 text-red-600' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <Heart className="w-4 h-4" /> {likedTemplates[imagePreview.id] ? 'Liked' : 'Like'}
              </button>
              <button
                type="button"
                onClick={() => openCommentModal(imagePreview)}
                className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 text-xs font-bold text-slate-700 hover:bg-slate-100"
              >
                <MessageCircle className="w-4 h-4" /> {commentCounts[imagePreview.id] || imagePreview.comments || 0}
              </button>
              <button
                type="button"
                onClick={() => toggleFavorite(imagePreview.id)}
                className={`inline-flex items-center gap-2 rounded-full px-3 py-2 text-xs font-bold transition ${favoriteTemplates[imagePreview.id] ? 'bg-yellow-50 border border-yellow-200 text-yellow-700' : 'bg-white border border-slate-200 text-slate-700 hover:bg-slate-100'}`}
              >
                <Star className="w-4 h-4" /> {favoriteTemplates[imagePreview.id] ? 'Favori' : 'Favoris'}
              </button>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-full bg-blue-600 px-3 py-2 text-xs font-bold text-white hover:bg-blue-700"
              >
                <Check className="w-4 h-4" /> Choisir ce template
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
