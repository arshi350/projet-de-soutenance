import React, { useState, useEffect, useRef, useCallback } from 'react';
import { 
  QrCode, Ticket, Plus, Trash2, CheckCircle2, Check,
  Layers, DollarSign, Users, Eye, Palette, Sparkles, X, ArrowRight,
  RefreshCw, Image as ImageIcon, Flame, Tag, Loader2, Upload, FileImage,
  ChevronDown, Edit3
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api from '../../../../services/api';
import { toast } from 'react-hot-toast';

const PRESET_CATEGORIES = [
  { value: 'VIP', label: 'VIP' },
  { value: 'Standard', label: 'Standard' },
  { value: 'Classique', label: 'Classique' },
  { value: 'Pass VIP Prestige', label: 'Pass VIP Prestige' },
  { value: 'Early Bird', label: 'Early Bird' },
  { value: 'Pass Premium', label: 'Pass Premium' },
  { value: 'Carré Or', label: 'Carré Or' },
  { value: 'Pass Journée', label: 'Pass Journée' },
  { value: 'Pass Week-end', label: 'Pass Week-end' },
  { value: 'custom', label: 'Autre (Catégorie personnalisée)...' }
];

export const TicketDesignerAI = ({ eventId, eventTitle, eventInfo }) => {
  const [categories, setCategories] = useState([]);
  const [loadingList, setLoadingList] = useState(false);
  
  // Suggestions d'arrières-plans IA - Zéro image par défaut, chargement en direct
  const [aiSuggestions, setAiSuggestions] = useState([]);
  const [loadingSuggestions, setLoadingSuggestions] = useState(true);
  const [customThemePrompt, setCustomThemePrompt] = useState('');
  const [selectedStyleTag, setSelectedStyleTag] = useState('');

  // Upload d'image personnalisée par l'utilisateur
  const fileInputRef = useRef(null);
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [customUploadedImage, setCustomUploadedImage] = useState(null);

  // Gestion de la catégorie (Select avec options pré-définies et option personnalisée)
  const [selectedCategoryPreset, setSelectedCategoryPreset] = useState('VIP');
  const [customCategoryName, setCustomCategoryName] = useState('');

  const eventType = eventInfo?.eventType || eventInfo?.categorie || eventInfo?.category || 'Concert / Événement Public';
  const displayTitle = eventTitle || eventInfo?.titre || eventInfo?.title || 'Mon Événement';

  const [newCat, setNewCat] = useState({
    name: 'VIP',
    price: 25000,
    capacity: 100,
    description: 'Accès coupe-file, espace réservé et cocktail offert.',
    aiBackgroundUrl: '',
    benefits: ['Accès prioritaire', 'Espace lounge dédié', 'Cocktail de bienvenue']
  });

  const [benefitInput, setBenefitInput] = useState('');
  const [isSaving, setIsSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  // Charger les catégories de billets enregistrées directement depuis la base de données
  const fetchCategories = useCallback(async () => {
    if (!eventId) return;
    try {
      setLoadingList(true);
      const res = await api.get(`/public/event/${eventId}/categories`);
      if (res.data.success) {
        setCategories(res.data.categories || []);
      }
    } catch (err) {
      console.warn("Impossible de charger les catégories depuis la base de données :", err.message);
    } finally {
      setLoadingList(false);
    }
  }, [eventId]);

  // Charger les suggestions d'arrières-plans adaptées par IA en temps réel
  const fetchAiBackgroundSuggestions = useCallback(async (themeOverride = '') => {
    if (!eventId) return;
    try {
      setLoadingSuggestions(true);
      const res = await api.post(`/public/event/${eventId}/suggest-backgrounds`, {
        eventType,
        title: displayTitle,
        description: eventInfo?.description || '',
        theme: themeOverride || customThemePrompt
      });

      if (res.data.success && Array.isArray(res.data.suggestions) && res.data.suggestions.length > 0) {
        setAiSuggestions(res.data.suggestions);
        setSelectedStyleTag(res.data.style || res.data.detectedCategory || '');
        
        // Si aucune image personnalisée n'a été importée, appliquer la 1ère suggestion
        if (!newCat.aiBackgroundUrl && !customUploadedImage) {
          setNewCat(prev => ({
            ...prev,
            aiBackgroundUrl: res.data.suggestions[0].url
          }));
        }
      }
    } catch (err) {
      console.warn("Erreur chargement suggestions IA :", err.message);
    } finally {
      setLoadingSuggestions(false);
    }
  }, [eventId, eventType, displayTitle, eventInfo?.description, customThemePrompt, newCat.aiBackgroundUrl, customUploadedImage]);

  useEffect(() => {
    if (eventId) {
      fetchCategories();
      fetchAiBackgroundSuggestions();
    }
  }, [eventId, fetchCategories, fetchAiBackgroundSuggestions]);

  // Synchronisation du nom du billet avec le select / custom input
  const handleCategoryPresetChange = (presetValue) => {
    setSelectedCategoryPreset(presetValue);
    if (presetValue === 'custom') {
      setNewCat(prev => ({ ...prev, name: customCategoryName }));
    } else {
      setNewCat(prev => ({ ...prev, name: presetValue }));
    }
  };

  const handleCustomCategoryNameChange = (customName) => {
    setCustomCategoryName(customName);
    setNewCat(prev => ({ ...prev, name: customName }));
  };

  // Gestion de l'upload d'image de fond par l'organisateur
  const handleCustomImageUpload = async (e) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith('image/')) {
      toast.error("Veuillez sélectionner un fichier image valide (PNG, JPG, WEBP).");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("L'image ne doit pas dépasser 10 Mo.");
      return;
    }

    // Prévisualisation locale immédiate
    const localPreviewUrl = URL.createObjectURL(file);
    setNewCat(prev => ({ ...prev, aiBackgroundUrl: localPreviewUrl }));
    setCustomUploadedImage({ url: localPreviewUrl, file, name: file.name });

    try {
      setIsUploadingImage(true);
      const formData = new FormData();
      formData.append('image', file);

      const res = await api.post(`/public/tickets/upload-background`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        }
      });

      if (res.data.success && res.data.url) {
        setNewCat(prev => ({ ...prev, aiBackgroundUrl: res.data.url }));
        setCustomUploadedImage({ url: res.data.url, name: file.name });
        toast.success("✓ Votre image de fond a été importée avec succès !");
      }
    } catch (err) {
      console.error("Erreur upload image fond :", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'envoi de l'image sur le serveur.");
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleAddBenefit = () => {
    if (!benefitInput.trim()) return;
    setNewCat(prev => ({
      ...prev,
      benefits: [...prev.benefits, benefitInput.trim()]
    }));
    setBenefitInput('');
  };

  const handleRemoveBenefit = (index) => {
    setNewCat(prev => ({
      ...prev,
      benefits: prev.benefits.filter((_, i) => i !== index)
    }));
  };

  const handleSelectBackground = (preset) => {
    setNewCat(prev => ({
      ...prev,
      aiBackgroundUrl: preset.url
    }));
  };

  const handleSaveCategory = async (e) => {
    e.preventDefault();
    const finalName = selectedCategoryPreset === 'custom' ? customCategoryName.trim() : selectedCategoryPreset;

    if (!finalName) {
      toast.error("Veuillez sélectionner ou renseigner une catégorie de billet.");
      return;
    }

    if (!newCat.price || !newCat.capacity) {
      toast.error("Veuillez renseigner le prix et la jauge de places.");
      return;
    }

    if (!newCat.aiBackgroundUrl) {
      toast.error("Veuillez choisir un arrière-plan IA ou importer votre propre image.");
      return;
    }

    try {
      setIsSaving(true);
      const payload = {
        ...newCat,
        name: finalName
      };

      const res = await api.post(`/public/event/${eventId}/categories`, payload);

      if (res.data.success) {
        toast.success(`🎉 Billet « ${finalName} » enregistré en base de données et mis en vente !`);
        await fetchCategories();
        setSelectedCategoryPreset('Standard');
        setCustomCategoryName('');
        setNewCat({
          name: 'Standard',
          price: 29.99,
          capacity: 50,
          description: '',
          aiBackgroundUrl: customUploadedImage?.url || aiSuggestions[0]?.url || '',
          benefits: []
        });
      }
    } catch (err) {
      console.error("Erreur création catégorie :", err);
      toast.error(err.response?.data?.message || "Erreur lors de la création de la catégorie.");
    } finally {
      setIsSaving(false);
    }
  };

  // Suppression définitive de la base de données MongoDB et de l'interface
  const handleDeleteCategory = async (categoryId, categoryName) => {
    const confirmMessage = `Êtes-vous sûr de vouloir supprimer définitivement le billet « ${categoryName || 'cette catégorie'} » de la base de données ?`;
    if (!window.confirm(confirmMessage)) return;

    try {
      setDeletingId(categoryId);
      const res = await api.delete(`/public/categories/${categoryId}`);

      if (res.data.success) {
        toast.success(res.data.message || "✓ Billet définitivement supprimé de la base de données.");
        // Mise à jour immédiate de l'état local et resynchronisation avec la BD
        setCategories(prev => prev.filter(c => (c._id !== categoryId && c.id !== categoryId)));
        await fetchCategories();
      } else {
        toast.error(res.data.message || "Erreur lors de la suppression en base de données.");
      }
    } catch (err) {
      console.error("Erreur suppression catégorie :", err);
      const errorMsg = err.response?.data?.message || "Erreur lors de la suppression du billet en base de données.";
      toast.error(errorMsg);
    } finally {
      setDeletingId(null);
    }
  };

  return (
    <div className="space-y-8 text-left font-sans text-slate-900">
      
      {/* HEADER AVEC BADGE DU TYPE D'ÉVÉNEMENT */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-white border border-gray-200/80 p-6 sm:p-8 rounded-3xl shadow-xs">
        <div>
          <div className="inline-flex items-center gap-1.5 text-[#FF5005] text-[10px] font-extrabold uppercase tracking-widest mb-1">
            <Palette className="w-3.5 h-3.5" />
            <span>Configurateur de Billetterie & Design IA</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">Catégories & Arrières-Plans IA</h2>
          <p className="text-gray-500 text-xs mt-1">
            L'IA analyse votre événement « <strong className="text-gray-800">{displayTitle}</strong> » (Type: <span className="text-[#FF5005] font-semibold capitalize">{eventType}</span>) pour vous proposer en direct les meilleurs arrières-plans réels, ou importez vos propres visuels.
          </p>
        </div>
        
        <div className="bg-orange-50/50 px-5 py-3 rounded-2xl border border-orange-200/60 text-right shrink-0">
          <span className="text-[10px] text-gray-400 uppercase font-extrabold tracking-wider block">Billets en Vente</span>
          <span className="text-xl font-black text-[#FF5005]">{categories.length} actif(s)</span>
        </div>
      </div>

      {/* SECTION SUGGESTIONS D'ARRIÈRES-PLANS IA ET IMPORTATION PERSONNALISÉE */}
      <div className="bg-gradient-to-br from-slate-900 via-[#0B1727] to-slate-950 text-white border border-slate-800 p-6 sm:p-7 rounded-3xl shadow-xl space-y-5">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3 border-b border-white/10 pb-4">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-tr from-[#FF5005] to-[#EFB810] flex items-center justify-center text-white shadow-md">
              <Sparkles className="w-4 h-4" />
            </div>
            <div>
              <h3 className="text-sm font-bold text-white flex items-center gap-2">
                <span>Inspirations Arrières-Plans IA pour :</span>
                <span className="text-[#FF5005] uppercase tracking-wider text-xs font-black bg-white/10 px-2.5 py-0.5 rounded-full">
                  {eventType}
                </span>
              </h3>
              <p className="text-[11px] text-slate-400">
                Sélectionnez un visuel réel trouvé par l'IA ou importez l'affiche / image officielle de votre événement.
              </p>
            </div>
          </div>

          <div className="flex items-center gap-2 shrink-0">
            {/* Bouton Importation Personnalisée */}
            <input
              type="file"
              ref={fileInputRef}
              accept="image/png, image/jpeg, image/jpg, image/webp"
              onChange={handleCustomImageUpload}
              className="hidden"
            />
            <button
              type="button"
              onClick={() => fileInputRef.current?.click()}
              disabled={isUploadingImage}
              className="px-3.5 py-2 bg-white/10 hover:bg-white/20 text-white border border-white/15 rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
            >
              <Upload className={`w-3.5 h-3.5 text-emerald-400 ${isUploadingImage ? 'animate-bounce' : ''}`} />
              <span>{isUploadingImage ? 'Envoi...' : 'Importer mon Image'}</span>
            </button>

            {/* Bouton Actualiser IA */}
            <button
              type="button"
              onClick={() => fetchAiBackgroundSuggestions()}
              disabled={loadingSuggestions}
              className="px-3.5 py-2 bg-gradient-to-r from-[#FF5005] to-[#FF5005]/90 hover:from-[#FF5005]/90 hover:to-[#FF5005] text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-md cursor-pointer disabled:opacity-50"
            >
              <RefreshCw className={`w-3.5 h-3.5 ${loadingSuggestions ? 'animate-spin' : ''}`} />
              <span>{loadingSuggestions ? 'Recherche IA...' : 'Actualiser IA'}</span>
            </button>
          </div>
        </div>

        {/* IMAGE PERSONNALISÉE IMPORTÉE PAR L'ORGANISATEUR (SI PRÉSENTE) */}
        {customUploadedImage && (
          <div className="p-3 bg-emerald-500/10 border border-emerald-500/30 rounded-2xl flex items-center justify-between gap-3 animate-fadeIn">
            <div className="flex items-center gap-3 min-w-0">
              <div 
                className="w-12 h-12 rounded-xl bg-cover bg-center border border-emerald-500/50 flex-shrink-0"
                style={{ backgroundImage: `url(${customUploadedImage.url})` }}
              />
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-bold text-white truncate">{customUploadedImage.name || 'Mon image de fond importée'}</span>
                  <span className="text-[9px] bg-emerald-500/20 text-emerald-300 font-semibold px-2 py-0.5 rounded-full">
                    Importée
                  </span>
                </div>
                <p className="text-[11px] text-emerald-400">Arrière-plan personnalisé prêt pour votre billet.</p>
              </div>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => handleSelectBackground({ url: customUploadedImage.url })}
                className={`px-3 py-1.5 rounded-xl text-xs font-bold cursor-pointer transition ${
                  newCat.aiBackgroundUrl === customUploadedImage.url
                    ? 'bg-emerald-600 text-white shadow-md'
                    : 'bg-white/10 hover:bg-white/20 text-white'
                }`}
              >
                {newCat.aiBackgroundUrl === customUploadedImage.url ? '✓ Sélectionnée' : 'Utiliser'}
              </button>
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="p-1.5 text-slate-400 hover:text-white hover:bg-white/10 rounded-lg transition cursor-pointer"
                title="Remplacer par une autre image"
              >
                <RefreshCw className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        )}

        {/* GRILLE : SKELETONS ANIMÉS EN DÉGRADÉ PENDANT LA RECHERCHE IA / RESULTATS REELS QUAND PRET */}
        {loadingSuggestions ? (
          <div className="space-y-3">
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
              {[1, 2, 3, 4, 5, 6].map((item) => (
                <div
                  key={item}
                  className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 p-2.5 flex flex-col justify-between h-28 relative animate-pulse"
                >
                  <div className="h-16 rounded-xl bg-gradient-to-r from-white/5 via-white/15 to-white/5 animate-pulse w-full" />
                  <div className="space-y-1.5 pt-2">
                    <div className="h-2.5 w-3/4 rounded-full bg-gradient-to-r from-white/10 via-white/20 to-white/10" />
                    <div className="h-2 w-1/2 rounded-full bg-white/5" />
                  </div>
                </div>
              ))}
            </div>
            <div className="flex items-center justify-center gap-2 text-xs text-slate-400 py-1">
              <Loader2 className="w-3.5 h-3.5 text-[#FF5005] animate-spin" />
              <span>L'IA recherche les visuels réels les plus adaptés pour « {displayTitle} »...</span>
            </div>
          </div>
        ) : aiSuggestions.length === 0 ? (
          <div className="p-6 bg-white/5 border border-white/10 rounded-2xl text-center text-xs text-slate-400 space-y-2">
            <ImageIcon className="w-8 h-8 text-slate-500 mx-auto" />
            <p>Cliquez sur « Actualiser IA » ou utilisez le bouton « Importer mon Image ».</p>
          </div>
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
            {aiSuggestions.map((preset, idx) => {
              const isSelected = newCat.aiBackgroundUrl === preset.url;
              return (
                <div
                  key={idx}
                  onClick={() => handleSelectBackground(preset)}
                  className={`group relative rounded-2xl overflow-hidden border-2 cursor-pointer transition-all duration-300 transform hover:-translate-y-1 ${
                    isSelected 
                      ? 'border-[#FF5005] ring-2 ring-[#FF5005]/40 shadow-lg scale-[1.02]' 
                      : 'border-white/10 hover:border-white/30 bg-white/5'
                  }`}
                >
                  <div 
                    className="h-24 bg-cover bg-center relative flex flex-col justify-between p-2"
                    style={{ backgroundImage: `url(${preset.url})` }}
                  >
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="relative z-10 flex justify-end">
                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#FF5005] text-white flex items-center justify-center shadow-md">
                          <Check className="w-3 h-3" />
                        </span>
                      )}
                    </div>

                    <div className="relative z-10">
                      <span className="text-[10px] font-bold text-white leading-tight block drop-shadow-md truncate">
                        {preset.label}
                      </span>
                    </div>
                  </div>

                  <div className="p-2 bg-slate-900/90 flex items-center justify-between text-[10px]">
                    <span className="text-slate-400 truncate max-w-[85px]">{preset.tags?.[0] || 'HD Pass'}</span>
                    <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: preset.color || '#FF5005' }} />
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Barre de recherche d'ambiance spécifique */}
        <div className="pt-2 flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder="Rechercher une ambiance spécifique (ex: Néon violet électro, Soirée jazz intimiste, Foire artisanale)..."
            value={customThemePrompt}
            onChange={(e) => setCustomThemePrompt(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); fetchAiBackgroundSuggestions(customThemePrompt); } }}
            className="flex-1 bg-white/10 border border-white/15 rounded-xl px-3.5 py-2 text-xs text-white placeholder-slate-400 focus:outline-none focus:border-[#FF5005]"
          />
          <button
            type="button"
            onClick={() => fetchAiBackgroundSuggestions(customThemePrompt)}
            disabled={loadingSuggestions || !customThemePrompt.trim()}
            className="px-4 py-2 bg-white/10 hover:bg-white/20 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 border border-white/15 cursor-pointer disabled:opacity-40"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#EFB810]" />
            <span>Rechercher ce thème</span>
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        
        {/* COLONNE GAUCHE : FORMULAIRE DE CRÉATION DE BILLET (7/12) */}
        <div className="lg:col-span-7 space-y-6">
          <form onSubmit={handleSaveCategory} className="bg-white border border-gray-200/80 p-6 sm:p-8 rounded-3xl shadow-xs space-y-5">
            <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2 border-b border-gray-100 pb-3">
              <Ticket className="w-4 h-4 text-[#FF5005]" />
              <span>Créer une Catégorie de Billet</span>
            </h3>

            {/* SÉLECTEUR DE CATÉGORIE AVEC LISTE DÉROULANTE ET SAISIE LIBRE */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                  Catégorie du billet *
                </label>
                <div className="relative">
                  <select
                    value={selectedCategoryPreset}
                    onChange={(e) => handleCategoryPresetChange(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-900 appearance-none focus:outline-none focus:border-[#FF5005] transition cursor-pointer pr-10"
                  >
                    {PRESET_CATEGORIES.map((cat) => (
                      <option key={cat.value} value={cat.value}>
                        {cat.label}
                      </option>
                    ))}
                  </select>
                  <ChevronDown className="absolute right-3 top-3 w-4 h-4 text-gray-400 pointer-events-none" />
                </div>

                {/* Saisie libre si "Autre" est sélectionné */}
                {selectedCategoryPreset === 'custom' && (
                  <motion.div
                    initial={{ opacity: 0, y: -5 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="mt-2"
                  >
                    <div className="relative">
                      <Edit3 className="absolute left-3 top-2.5 w-3.5 h-3.5 text-[#FF5005]" />
                      <input
                        type="text"
                        required
                        placeholder="Ex: Pass Backstage, Couple VIP, Accès Presse..."
                        value={customCategoryName}
                        onChange={(e) => handleCustomCategoryNameChange(e.target.value)}
                        className="w-full bg-orange-50/40 border border-[#FF5005]/40 rounded-xl pl-9 pr-3.5 py-2 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition"
                        autoFocus
                      />
                    </div>
                  </motion.div>
                )}
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">Prix unitaire (FCFA) *</label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="number"
                    step="100"
                    min="0"
                    required
                    placeholder="5000"
                    value={newCat.price}
                    onChange={e => setNewCat({...newCat, price: parseFloat(e.target.value) || 0})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition font-mono"
                  />
                </div>
              </div>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">Jauge max de places *</label>
                <div className="relative">
                  <Users className="absolute left-3 top-2.5 w-4 h-4 text-gray-400" />
                  <input 
                    type="number"
                    min="1"
                    required
                    placeholder="100"
                    value={newCat.capacity}
                    onChange={e => setNewCat({...newCat, capacity: parseInt(e.target.value) || 0})}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl pl-9 pr-3.5 py-2.5 text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">Description courte</label>
                <input 
                  type="text"
                  placeholder="Ex: Entrée coupe-file + cocktail inclus"
                  value={newCat.description}
                  onChange={e => setNewCat({...newCat, description: e.target.value})}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition"
                />
              </div>
            </div>

            {/* URL D'ARRIÈRE-PLAN CHOISI OU IMPORTÉ */}
            <div className="p-4 bg-gray-50/70 border border-gray-200 rounded-2xl space-y-2">
              <div className="flex items-center justify-between">
                <label className="block text-[10px] font-bold text-gray-500 uppercase tracking-wider">
                  Arrière-Plan Sélectionné (HD) :
                </label>
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  className="text-[10px] text-[#FF5005] hover:underline font-bold flex items-center gap-1 cursor-pointer"
                >
                  <Upload className="w-3 h-3" />
                  <span>Importer un fichier image</span>
                </button>
              </div>

              <input
                type="url"
                required
                placeholder="https://... ou importer un fichier"
                value={newCat.aiBackgroundUrl}
                onChange={e => setNewCat({...newCat, aiBackgroundUrl: e.target.value})}
                className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition font-mono"
              />
            </div>

            {/* AVANTAGES INCLUS */}
            <div className="space-y-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Avantages inclus avec ce billet</label>
              <div className="flex gap-2">
                <input 
                  type="text"
                  placeholder="Ex: Coupe de champagne offerte, Espace VIP..."
                  value={benefitInput}
                  onChange={e => setBenefitInput(e.target.value)}
                  onKeyDown={e => { if (e.key === 'Enter') { e.preventDefault(); handleAddBenefit(); } }}
                  className="flex-1 bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] transition"
                />
                <button
                  type="button"
                  onClick={handleAddBenefit}
                  className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1 cursor-pointer"
                >
                  <Plus className="w-3.5 h-3.5" />
                  <span>Ajouter</span>
                </button>
              </div>

              <div className="flex flex-wrap gap-2 pt-1">
                {newCat.benefits.map((b, i) => (
                  <span key={i} className="inline-flex items-center gap-1.5 bg-orange-50 border border-orange-200 text-[#FF5005] px-3 py-1 rounded-full text-xs font-semibold">
                    <span>{b}</span>
                    <button type="button" onClick={() => handleRemoveBenefit(i)} className="hover:text-red-600 cursor-pointer">
                      &times;
                    </button>
                  </span>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={isSaving || !newCat.aiBackgroundUrl}
              className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF5005] to-[#FF5005]/90 hover:from-[#FF5005]/90 hover:to-[#FF5005] text-white font-extrabold text-xs uppercase tracking-wider shadow-lg shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
            >
              {isSaving ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Enregistrement en cours...</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Publier cette Catégorie & Mettre en Vente</span>
                </>
              )}
            </button>
          </form>
        </div>

        {/* COLONNE DROITE : APERÇU HOLOGRAPHIQUE DU TICKET (5/12) */}
        <div className="lg:col-span-5 space-y-4">
          <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-xs space-y-4 sticky top-24">
            <div className="flex items-center justify-between border-b border-gray-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Eye className="w-4 h-4 text-[#FF5005]" />
                <span>Rendu Holographique du Billet</span>
              </span>
              <span className="text-[10px] bg-emerald-50 text-emerald-600 font-bold px-2 py-0.5 rounded-full">
                Temps Réel
              </span>
            </div>

            {/* CARTE BILLET HOLOGRAPHIQUE */}
            <div className="rounded-3xl overflow-hidden shadow-2xl border border-gray-800 bg-[#0B1727] text-white relative">
              
              {/* Image Bannière Haute (ou dégradé animé si en chargement) */}
              {newCat.aiBackgroundUrl ? (
                <div 
                  className="h-44 bg-cover bg-center relative p-5 flex flex-col justify-between"
                  style={{ backgroundImage: `url(${newCat.aiBackgroundUrl})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-[#0B1727] via-[#0B1727]/40 to-transparent" />
                  
                  <div className="relative z-10 flex justify-between items-start">
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md rounded-full text-[10px] font-black text-[#EFB810] uppercase tracking-wider border border-white/10">
                      {newCat.name || 'Catégorie'}
                    </span>
                    <span className="text-base sm:text-lg font-black text-emerald-400 bg-black/70 backdrop-blur-md px-3 py-0.5 rounded-xl border border-white/10 font-mono">
                      {Number(newCat.price || 0).toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>

                  <div className="relative z-10">
                    <div className="text-lg font-black text-white leading-tight drop-shadow-md">
                      {displayTitle}
                    </div>
                    <div className="text-[11px] text-gray-300 capitalize flex items-center gap-1.5 mt-0.5">
                      <Tag className="w-3 h-3 text-[#FF5005]" />
                      <span>{eventType}</span>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="h-44 bg-gradient-to-r from-white/5 via-white/15 to-white/5 animate-pulse relative p-5 flex flex-col justify-between">
                  <div className="flex justify-between items-start">
                    <div className="h-5 w-24 rounded-full bg-white/10" />
                    <div className="h-6 w-16 rounded-xl bg-white/10" />
                  </div>
                  <div className="space-y-1.5">
                    <div className="h-4 w-1/2 rounded-full bg-white/10" />
                    <div className="h-3 w-1/4 rounded-full bg-white/5" />
                  </div>
                </div>
              )}

              {/* Ligne de perforation */}
              <div className="relative flex items-center justify-between px-2 py-1 bg-[#0B1727]">
                <div className="w-5 h-5 -ml-4 bg-gray-100 rounded-full" />
                <div className="flex-1 border-b-2 border-dashed border-gray-700 mx-3" />
                <div className="w-5 h-5 -mr-4 bg-gray-100 rounded-full" />
              </div>

              {/* Corps bas du ticket : QR Code & Métadonnées */}
              <div className="p-5 bg-[#0B1727] flex items-center justify-between gap-4">
                <div className="space-y-1.5 flex-1">
                  <div className="text-[10px] text-gray-400 uppercase font-mono">Porteur Billet</div>
                  <div className="text-xs font-bold text-white">Alexandre Martin</div>
                  <div className="text-[10px] text-[#FF5005] font-mono font-bold">TKT-84920-LIVE</div>
                  
                  <div className="pt-1 flex flex-wrap gap-1">
                    {newCat.benefits.slice(0, 2).map((b, idx) => (
                      <span key={idx} className="text-[9px] bg-white/10 text-gray-300 px-2 py-0.5 rounded-md flex items-center gap-1">
                        <Check size={9} className="text-emerald-400" />
                        <span>{b}</span>
                      </span>
                    ))}
                  </div>
                </div>

                <div className="p-2 bg-white rounded-2xl shrink-0 shadow-lg">
                  <QrCode className="w-20 h-20 text-[#0B1727]" />
                </div>
              </div>

            </div>

          </div>
        </div>

      </div>

      {/* LISTE DES BILLETS ACTUELLEMENT EN VENTE */}
      <div className="space-y-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between">
          <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
            <Layers className="w-4 h-4 text-[#FF5005]" />
            <span>Billets Actuellement en Vente ({categories.length})</span>
          </h3>
          <span className="text-xs text-gray-500">
            Vous pouvez à tout moment retirer ou supprimer un billet en vente.
          </span>
        </div>

        {loadingList ? (
          <div className="py-8 text-center text-gray-400 text-xs font-semibold">Chargement des billets...</div>
        ) : categories.length === 0 ? (
          <div className="bg-white border border-gray-200 rounded-2xl p-8 text-center text-gray-400 text-xs space-y-2">
            <Ticket className="w-8 h-8 text-gray-300 mx-auto" />
            <p className="font-semibold text-gray-700">Aucun billet en vente pour le moment.</p>
            <p>Utilisez le formulaire ci-dessus pour publier vos premiers tarifs et quotas.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {categories.map((cat) => (
              <div key={cat._id} className="bg-white border border-gray-200/80 rounded-2xl overflow-hidden shadow-xs flex flex-col justify-between hover:shadow-md transition">
                <div 
                  className="h-28 bg-cover bg-center relative p-3.5 flex justify-between items-start"
                  style={{ backgroundImage: `url(${cat.aiBackgroundUrl || ''})` }}
                >
                  <div className="absolute inset-0 bg-gradient-to-t from-gray-900/90 via-gray-900/30 to-transparent" />
                  <span className="relative z-10 px-2.5 py-0.5 bg-black/70 backdrop-blur-md rounded-full text-[10px] font-black text-[#EFB810] uppercase">
                    {cat.name}
                  </span>
                  <span className="relative z-10 text-xs sm:text-sm font-black text-emerald-400 bg-black/80 px-2.5 py-0.5 rounded-lg font-mono">
                    {Number(cat.price).toLocaleString('fr-FR')} FCFA
                  </span>
                </div>

                <div className="p-4 space-y-3 flex-1 flex flex-col justify-between">
                  <div className="space-y-1.5">
                    <div className="flex justify-between text-xs text-gray-500">
                      <span>Jauge : <strong className="text-gray-900 font-mono">{cat.capacity} places</strong></span>
                      <span>Vendus : <strong className="text-[#FF5005] font-mono">{cat.soldCount || 0}</strong></span>
                    </div>
                    {cat.description && (
                      <p className="text-xs text-gray-500 line-clamp-2">{cat.description}</p>
                    )}
                  </div>

                  <div className="pt-3 border-t border-gray-100 flex justify-between items-center">
                    <span className="text-[10px] text-gray-400">
                      Ajouté le {new Date(cat.createdAt).toLocaleDateString('fr-FR')}
                    </span>
                    <button
                      type="button"
                      disabled={deletingId === cat._id}
                      onClick={() => handleDeleteCategory(cat._id, cat.name)}
                      className="inline-flex items-center gap-1 px-2.5 py-1 text-xs text-red-600 bg-red-50 hover:bg-red-100 rounded-lg font-semibold transition cursor-pointer disabled:opacity-50"
                      title="Supprimer ou retirer ce billet de la vente"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                      <span>{deletingId === cat._id ? 'Suppression...' : 'Supprimer'}</span>
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

    </div>
  );
};
