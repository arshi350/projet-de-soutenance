import { useState, useEffect, useMemo } from 'react';
import { useCurrentUser } from '../../../hooks/useAuth';
import { useAddEvent } from '../../../hooks/useEvent';
import { 
  Type, FileText, Calendar, MapPin, Shapes, 
  Image as ImageIcon, Upload, LayoutList, AlertCircle,
  CheckCircle, XCircle, Lock, Globe, Mail, MessageSquare, 
  Sparkles, CreditCard, ShieldCheck, Zap, ArrowRight
} from 'lucide-react';

const PRICING_CONSTANTS = {
  PRIVATE: {
    BASE_DAILY: 2500,
    EMAIL_COST: 15,
    WHATSAPP_COST: 30,
    BOTH_COST: 45
  },
  PUBLIC: {
    BASE_DAILY: 5000,
    CAPACITY_COST: 10
  }
};

const EventForm = ({ closeModal }) => {
  const { user } = useCurrentUser();
  const userId = user?.id;
  const { addNewEvent, loading, error, success, reset } = useAddEvent();
  
  const initialFormdata = {
    eventType: 'private', // 'private' | 'public'
    titre: "", 
    description: '', 
    DateDebut: '', 
    DateFin: '', 
    heureDebut: '', 
    heureFin: '', 
    lieu: '', 
    categorie: '',
    maxCapacity: 50,
    channel: 'email', // 'email' | 'whatsapp' | 'both'
    publicFeeBearer: 'buyer', // 'buyer' | 'organizer'
    coverImage: null
  };
  
  const [formData, setFormData] = useState(initialFormdata);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (success) {
      setFormData(initialFormdata);
      setImagePreview(null);
      setTouched({});
      const timer = setTimeout(() => {
        closeModal();
      }, 2000);
      return () => clearTimeout(timer);
    }
  }, [success, closeModal]);

  // Calcul dynamique de la tarification en temps réel (formule new.md)
  const pricingQuote = useMemo(() => {
    let days = 1;
    if (formData.DateDebut && formData.DateFin) {
      const start = new Date(formData.DateDebut);
      const end = new Date(formData.DateFin);
      const diff = Math.max(0, end.getTime() - start.getTime());
      days = Math.max(1, Math.ceil(diff / (1000 * 60 * 60 * 24)) || 1);
    }

    if (formData.eventType === 'public') {
      const baseFee = days * PRICING_CONSTANTS.PUBLIC.BASE_DAILY;
      const capacity = Math.max(10, parseInt(formData.maxCapacity, 10) || 10);
      const capacityFee = capacity * PRICING_CONSTANTS.PUBLIC.CAPACITY_COST;
      const total = baseFee + capacityFee;
      return {
        days,
        baseDaily: PRICING_CONSTANTS.PUBLIC.BASE_DAILY,
        baseFee,
        channelLabel: `Jauge de ${capacity} places`,
        channelCost: capacityFee,
        total: Number(total.toFixed(2))
      };
    } else {
      const baseFee = days * PRICING_CONSTANTS.PRIVATE.BASE_DAILY;
      const guests = Math.max(1, parseInt(formData.maxCapacity, 10) || 1);
      let unitCost = PRICING_CONSTANTS.PRIVATE.EMAIL_COST;
      let channelLabel = 'Invitations E-mail';
      if (formData.channel === 'whatsapp') {
        unitCost = PRICING_CONSTANTS.PRIVATE.WHATSAPP_COST;
        channelLabel = 'Invitations WhatsApp';
      } else if (formData.channel === 'both') {
        unitCost = PRICING_CONSTANTS.PRIVATE.BOTH_COST;
        channelLabel = 'Email + WhatsApp';
      }
      const channelCost = guests * unitCost;
      const total = baseFee + channelCost;
      return {
        days,
        baseDaily: PRICING_CONSTANTS.PRIVATE.BASE_DAILY,
        baseFee,
        channelLabel: `${channelLabel} (${guests} invités)`,
        channelCost,
        total: Number(total.toFixed(2))
      };
    }
  }, [formData.eventType, formData.DateDebut, formData.DateFin, formData.maxCapacity, formData.channel]);

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const handleBlur = (fieldName) => {
    setTouched(prev => ({ ...prev, [fieldName]: true }));
    const fieldError = validateField(fieldName, formData[fieldName]);
    if (fieldError) {
      setErrors(prev => ({ ...prev, [fieldName]: fieldError }));
    }
  };

  const validateField = (name, value) => {
    switch (name) {
      case 'titre':
        if (!value?.trim()) return 'Le titre est requis';
        if (value.length < 3) return 'Au moins 3 caractères requis';
        return '';
      case 'description':
        if (!value?.trim()) return 'La description est requise';
        if (value.length < 10) return 'Au moins 10 caractères requis';
        return '';
      case 'DateDebut':
        if (!value) return 'La date de début est requise';
        return '';
      case 'heureDebut':
        if (!value) return 'L\'heure de début est requise';
        return '';
      case 'DateFin':
        if (!value) return 'La date de fin est requise';
        return '';
      case 'heureFin':
        if (!value) return 'L\'heure de fin est requise';
        return '';
      case 'lieu':
        if (!value?.trim()) return 'Le lieu est requis';
        return '';
      case 'categorie':
        if (!value?.trim()) return 'La catégorie est requise';
        return '';
      case 'maxCapacity':
        if (!value || parseInt(value, 10) < 1) return 'La jauge doit être supérieure à 0';
        return '';
      default:
        return '';
    }
  };

  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/webp'];
      if (!allowedTypes.includes(file.type)) {
        setErrors(prev => ({ ...prev, coverImage: 'Format PNG, JPG ou WEBP requis' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImage: 'Max 10MB' }));
        return;
      }
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
    }
  };

  const buildFormData = () => {
    const payload = new FormData();
    payload.append('eventType', formData.eventType);
    payload.append('titre', formData.titre);
    payload.append('description', formData.description);
    payload.append('DateDebut', formData.DateDebut);
    payload.append('DateFin', formData.DateFin);
    payload.append('heureDebut', formData.heureDebut);
    payload.append('heureFin', formData.heureFin);
    payload.append('lieu', formData.lieu);
    payload.append('categorie', formData.categorie);
    payload.append('maxCapacity', formData.maxCapacity);
    payload.append('channel', formData.channel);
    payload.append('publicFeeBearer', formData.publicFeeBearer);
    if (userId) payload.append('userId', userId);
    if (formData.coverImage) {
      payload.append('image', formData.coverImage);
    }
    return payload;
  };

  const validateForm = () => {
    const newErrors = {};
    ['titre', 'description', 'DateDebut', 'DateFin', 'heureDebut', 'heureFin', 'lieu', 'categorie', 'maxCapacity'].forEach(key => {
      const err = validateField(key, formData[key]);
      if (err) newErrors[key] = err;
    });

    if (formData.DateDebut && formData.DateFin) {
      const start = new Date(`${formData.DateDebut}T${formData.heureDebut || '00:00'}`);
      const end = new Date(`${formData.DateFin}T${formData.heureFin || '00:00'}`);
      if (end <= start) {
        newErrors.DateFin = 'La fin doit être postérieure au début';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      const formDataToSend = buildFormData();
      const token = localStorage.getItem('accessToken');
      await addNewEvent(formDataToSend, token);
    } catch (err) {
      console.error('Erreur lors de la création:', err);
    }
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-slate-950/80 backdrop-blur-md flex items-center justify-center p-4">
      <div className="bg-slate-900 border border-slate-800 rounded-2xl w-full max-w-5xl overflow-hidden shadow-2xl flex flex-col max-h-[90vh]">
        
        {/* Header Modal */}
        <div className="px-8 py-5 border-b border-slate-800 flex justify-between items-center bg-slate-900/50">
          <div>
            <span className="text-xs font-bold text-indigo-400 tracking-wider uppercase flex items-center gap-1.5 mb-1">
              <Sparkles className="w-3.5 h-3.5" /> Création d'événement v2.0
            </span>
            <h2 className="text-xl font-bold text-white">Créer un nouvel événement</h2>
          </div>
          <button 
            type="button" 
            onClick={closeModal}
            className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition"
          >
            <XCircle className="w-6 h-6" />
          </button>
        </div>

        {/* Content Body Grid */}
        <div className="flex-1 overflow-y-auto p-8 grid grid-cols-1 lg:grid-cols-12 gap-8">
          
          {/* Main Form (Col 7/12) */}
          <form onSubmit={handleSubmit} className="lg:col-span-7 space-y-6">
            
            {/* Step 0: Event Type Selector */}
            <div>
              <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-2.5">
                Type d'événement
              </label>
              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, eventType: 'private', maxCapacity: 50 }))}
                  className={`p-4 rounded-xl border text-left transition flex flex-col gap-2 ${
                    formData.eventType === 'private'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Lock className={`w-5 h-5 ${formData.eventType === 'private' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {formData.eventType === 'private' && <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full">Actif</span>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Événement Privé</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Mariages, anniversaires, listes d'invités clos & RSVP.</p>
                  </div>
                </button>

                <button
                  type="button"
                  onClick={() => setFormData(prev => ({ ...prev, eventType: 'public', maxCapacity: 500 }))}
                  className={`p-4 rounded-xl border text-left transition flex flex-col gap-2 ${
                    formData.eventType === 'public'
                      ? 'border-indigo-500 bg-indigo-500/10 text-white shadow-lg shadow-indigo-500/10'
                      : 'border-slate-800 bg-slate-950/40 text-slate-400 hover:border-slate-700'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <Globe className={`w-5 h-5 ${formData.eventType === 'public' ? 'text-indigo-400' : 'text-slate-500'}`} />
                    {formData.eventType === 'public' && <span className="text-[10px] bg-indigo-500 text-white font-bold px-2 py-0.5 rounded-full">Actif</span>}
                  </div>
                  <div>
                    <h4 className="font-semibold text-sm text-white">Événement Public</h4>
                    <p className="text-xs text-slate-400 mt-0.5">Concerts, salons, billetterie en ligne & Designer IA.</p>
                  </div>
                </button>
              </div>
            </div>

            {/* General Info */}
            <div className="space-y-4">
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Titre de l'événement *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('titre')}
                  placeholder="Ex: Soirée Gala Annuelle 2026"
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {errors.titre && <p className="text-red-400 text-xs mt-1">{errors.titre}</p>}
              </div>

              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Description *
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  placeholder="Détails du programme, consignes d'accès..."
                  className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white placeholder-slate-500 focus:outline-none focus:border-indigo-500"
                />
                {errors.description && <p className="text-red-400 text-xs mt-1">{errors.description}</p>}
              </div>

              {/* Dates & Times */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Date Début *</label>
                  <input
                    type="date"
                    name="DateDebut"
                    value={formData.DateDebut}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Heure Début *</label>
                  <input
                    type="time"
                    name="heureDebut"
                    value={formData.heureDebut}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Date Fin *</label>
                  <input
                    type="date"
                    name="DateFin"
                    value={formData.DateFin}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Heure Fin *</label>
                  <input
                    type="time"
                    name="heureFin"
                    value={formData.heureFin}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
              </div>

              {/* Location & Category */}
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Lieu *</label>
                  <input
                    type="text"
                    name="lieu"
                    value={formData.lieu}
                    onChange={handleInputChange}
                    placeholder="Ex: Palais des Congrès, Paris"
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">Catégorie *</label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    className="w-full bg-slate-950 border border-slate-800 rounded-xl px-3 py-2 text-white focus:outline-none focus:border-indigo-500 text-sm"
                  >
                    <option value="">Sélectionner</option>
                    <option value="CONFERENCE">Conférence</option>
                    <option value="MARIAGE">Mariage</option>
                    <option value="ANNIVERSAIRE">Anniversaire</option>
                    <option value="CONCERT">Concert / Festival</option>
                    <option value="AUTRE">Autre</option>
                  </select>
                </div>
              </div>

              {/* Specific Config based on Event Type */}
              {formData.eventType === 'private' ? (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Zap className="w-4 h-4 text-indigo-400" /> Paramètres d'invitation Privée
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Nombre maximum d'invités (Jauge) *</label>
                    <input
                      type="number"
                      name="maxCapacity"
                      min="1"
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-sm"
                    />
                  </div>

                  {/* Channel Toggle Buttons (Formula toggle from new.md) */}
                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Canal de diffusion des invitations :</label>
                    <div className="grid grid-cols-3 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, channel: 'email' }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          formData.channel === 'email'
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <Mail className="w-3.5 h-3.5" /> E-mail (15 FCFA)
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, channel: 'whatsapp' }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          formData.channel === 'whatsapp'
                            ? 'bg-emerald-600 border-emerald-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        <MessageSquare className="w-3.5 h-3.5" /> WhatsApp (30 FCFA)
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, channel: 'both' }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold flex items-center justify-center gap-1.5 transition ${
                          formData.channel === 'both'
                            ? 'bg-violet-600 border-violet-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400 hover:border-slate-700'
                        }`}
                      >
                        Les deux (45 FCFA)
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="p-4 bg-slate-950/60 border border-slate-800 rounded-xl space-y-4">
                  <div className="flex items-center justify-between">
                    <span className="text-xs font-bold text-slate-300 uppercase tracking-wider flex items-center gap-1.5">
                      <Globe className="w-4 h-4 text-indigo-400" /> Paramètres Billetterie Publique
                    </span>
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1">Capacité Maximale de la Jauge (Places) *</label>
                    <input
                      type="number"
                      name="maxCapacity"
                      min="10"
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      placeholder="Ex: 1000"
                      className="w-full bg-slate-900 border border-slate-700 rounded-lg px-3 py-2 text-white font-semibold text-sm"
                    />
                  </div>

                  <div>
                    <label className="block text-xs text-slate-400 mb-1.5">Prise en charge des frais de billetterie (2.5% + 250 FCFA) :</label>
                    <div className="grid grid-cols-2 gap-2">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, publicFeeBearer: 'buyer' }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                          formData.publicFeeBearer === 'buyer'
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        À la charge de l'acheteur
                      </button>
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, publicFeeBearer: 'organizer' }))}
                        className={`py-2 px-3 rounded-lg border text-xs font-semibold transition ${
                          formData.publicFeeBearer === 'organizer'
                            ? 'bg-indigo-600 border-indigo-500 text-white'
                            : 'bg-slate-900 border-slate-800 text-slate-400'
                        }`}
                      >
                        Déduit de mes gains
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Cover Image */}
              <div>
                <label className="block text-xs font-semibold uppercase tracking-wider text-slate-400 mb-1.5">
                  Affiche de couverture (Optionnel)
                </label>
                <input
                  type="file"
                  accept="image/*"
                  onChange={handleImageChange}
                  className="w-full text-xs text-slate-400 file:mr-3 file:py-2 file:px-4 file:rounded-lg file:border-0 file:text-xs file:font-semibold file:bg-slate-800 file:text-white hover:file:bg-slate-700 cursor-pointer"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full py-3.5 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl shadow-lg shadow-indigo-600/30 flex items-center justify-center gap-2 transition disabled:opacity-50"
            >
              {loading ? (
                <span>Création en cours...</span>
              ) : (
                <>
                  <span>Créer et Accéder à la Facturation</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

          {/* Dynamic Pricing Side-Panel (Col 5/12) */}
          <div className="lg:col-span-5 flex flex-col gap-5">
            <div className="bg-slate-950 border border-slate-800/80 rounded-2xl p-6 shadow-xl relative overflow-hidden flex-1 flex flex-col justify-between">
              
              <div className="absolute top-0 right-0 w-32 h-32 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

              <div>
                <div className="flex items-center justify-between mb-4 border-b border-slate-800 pb-3">
                  <span className="text-xs font-bold text-indigo-400 uppercase tracking-wider flex items-center gap-1.5">
                    <CreditCard className="w-4 h-4" /> Devis Dynamique en Temps Réel
                  </span>
                  <span className="text-[10px] bg-slate-800 text-slate-300 font-mono px-2 py-0.5 rounded">
                    Pay-As-You-Go
                  </span>
                </div>

                <div className="space-y-3.5 text-sm">
                  <div className="flex justify-between items-center text-slate-400">
                    <span>Durée de l'événement :</span>
                    <span className="font-semibold text-white">{pricingQuote.days} jour(s)</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>Tarif infrastructure base :</span>
                    <span className="font-semibold text-white">{Number(pricingQuote.baseFee).toLocaleString('fr-FR')} FCFA</span>
                  </div>

                  <div className="flex justify-between items-center text-slate-400">
                    <span>{pricingQuote.channelLabel} :</span>
                    <span className="font-semibold text-white">{Number(pricingQuote.channelCost).toLocaleString('fr-FR')} FCFA</span>
                  </div>

                  <div className="border-t border-slate-800/80 pt-3.5 mt-2 flex justify-between items-baseline">
                    <span className="font-bold text-white text-base">Total Activation :</span>
                    <div className="text-right">
                      <span className="text-2xl font-black text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-violet-400">
                        {pricingQuote.total.toLocaleString('fr-FR')} FCFA
                      </span>
                      <span className="block text-[10px] text-slate-500">TTC</span>
                    </div>
                  </div>
                </div>

                {/* Formule rappel */}
                <div className="mt-5 p-3 rounded-xl bg-slate-900/60 border border-slate-800 text-[11px] text-slate-400 space-y-1">
                  <p className="font-semibold text-slate-300">Formule appliquée :</p>
                  <code className="text-indigo-300 font-mono block">
                    {formData.eventType === 'public' 
                      ? `(${pricingQuote.days} j * 5 000 FCFA) + (${formData.maxCapacity} places * 10 FCFA)` 
                      : `(${pricingQuote.days} j * 2 500 FCFA) + (${formData.maxCapacity} inv * coût canal)`}
                  </code>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-slate-800/80 space-y-2">
                <div className="flex items-center gap-2 text-xs text-emerald-400">
                  <ShieldCheck className="w-4 h-4 shrink-0" />
                  <span>Activation immédiate du scanner et des envois</span>
                </div>
                {formData.eventType === 'public' && (
                  <div className="flex items-center gap-2 text-xs text-indigo-400">
                    <Sparkles className="w-4 h-4 shrink-0" />
                    <span>Accès inclus au Ticket Designer IA & Billetterie</span>
                  </div>
                )}
              </div>
            </div>
          </div>

        </div>

      </div>
    </div>
  );
};

export default EventForm;