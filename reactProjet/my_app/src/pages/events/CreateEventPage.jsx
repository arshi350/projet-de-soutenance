import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  ArrowLeft, Lock, Globe, Sparkles, Calendar, MapPin, 
  Tag, Clock, Users, Mail, MessageSquare, CreditCard, 
  ShieldCheck, Upload, Trash2, CheckCircle2, AlertCircle, 
  ArrowRight, Info, Zap, Image as ImageIcon
} from 'lucide-react';
import { useCurrentUser } from '../../hooks/useAuth';
import { useAddEvent } from '../../hooks/useEvent';
import { useAuthContext } from '../../context/AuthContext';
import { toast, Toaster } from 'react-hot-toast';

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

const CATEGORIES = [
  { id: 'MARIAGE', label: 'Mariage & Réception' },
  { id: 'ANNIVERSAIRE', label: 'Anniversaire & Fête' },
  { id: 'GALA', label: 'Soirée Gala & Prestige' },
  { id: 'CONFERENCE', label: 'Conférence & Séminaire' },
  { id: 'CONCERT', label: 'Concert & Festival' },
  { id: 'AUTRE', label: 'Autre Événement' }
];

export default function CreateEventPage() {
  const navigate = useNavigate();
  const { user } = useCurrentUser();
  const { token } = useAuthContext();
  const userId = user?.id || user?._id;
  const { addNewEvent, loading, error, success, reset } = useAddEvent();

  const initialFormData = {
    eventType: 'private', // 'private' | 'public'
    titre: '',
    description: '',
    DateDebut: '',
    DateFin: '',
    heureDebut: '19:00',
    heureFin: '23:30',
    lieu: '',
    categorie: 'GALA',
    maxCapacity: 50,
    channel: 'email', // 'email' | 'whatsapp' | 'both'
    publicFeeBearer: 'buyer', // 'buyer' | 'organizer'
    coverImage: null
  };

  const [formData, setFormData] = useState(initialFormData);
  const [errors, setErrors] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [touched, setTouched] = useState({});

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Dynamic Real-time Pricing Quote Calculation
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
        if (!value?.trim()) return 'Le titre de l\'événement est obligatoire.';
        if (value.length < 3) return 'Au moins 3 caractères requis.';
        return '';
      case 'description':
        if (!value?.trim()) return 'La description est obligatoire.';
        if (value.length < 10) return 'Au moins 10 caractères requis pour guider vos invités.';
        return '';
      case 'DateDebut':
        if (!value) return 'La date de début est requise.';
        return '';
      case 'heureDebut':
        if (!value) return 'L\'heure de début est requise.';
        return '';
      case 'DateFin':
        if (!value) return 'La date de fin est requise.';
        return '';
      case 'heureFin':
        if (!value) return 'L\'heure de fin est requise.';
        return '';
      case 'lieu':
        if (!value?.trim()) return 'L\'adresse ou le lieu est requis.';
        return '';
      case 'categorie':
        if (!value?.trim()) return 'Veuillez choisir une catégorie.';
        return '';
      case 'maxCapacity':
        if (!value || parseInt(value, 10) < 1) return 'La capacité doit être au moins de 1.';
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
        setErrors(prev => ({ ...prev, coverImage: 'Format JPG, PNG ou WEBP accepté.' }));
        return;
      }
      if (file.size > 10 * 1024 * 1024) {
        setErrors(prev => ({ ...prev, coverImage: 'Taille max 10 Mo autorisée.' }));
        return;
      }
      setFormData(prev => ({ ...prev, coverImage: file }));
      const reader = new FileReader();
      reader.onloadend = () => setImagePreview(reader.result);
      reader.readAsDataURL(file);
      setErrors(prev => ({ ...prev, coverImage: '' }));
    }
  };

  const handleRemoveImage = () => {
    setFormData(prev => ({ ...prev, coverImage: null }));
    setImagePreview(null);
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
        newErrors.DateFin = 'La date de fin doit être postérieure à la date de début.';
      }
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) {
      toast.error('Veuillez remplir correctement tous les champs obligatoires.');
      return;
    }

    try {
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

      const authToken = token || localStorage.getItem('accessToken');
      await addNewEvent(payload, authToken);

      toast.success('🎉 Événement créé avec succès !');
      // Redirection immédiate vers la liste des événements avec rafraîchissement
      setTimeout(() => {
        navigate('/dashboard/evenement', { replace: true, state: { refreshed: true } });
      }, 600);
    } catch (err) {
      console.error('Erreur création événement:', err);
      toast.error(err.response?.data?.message || err.message || 'Erreur lors de la création de l\'événement.');
    }
  };

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 font-sans pb-16">
      <Toaster position="top-right" />

      {/* Top Banner Navigation */}
      <header className="sticky top-0 z-30 bg-white/95 backdrop-blur-md border-b border-gray-200/80 shadow-xs">
        <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
          <div className="flex items-center gap-4">
            <Link
              to="/dashboard/evenement"
              className="w-10 h-10 rounded-2xl bg-gray-100 hover:bg-gray-200/80 text-gray-700 flex items-center justify-center transition-all cursor-pointer shadow-xs"
              title="Retour aux événements"
            >
              <ArrowLeft size={18} />
            </Link>
            <div>
              <div className="flex items-center gap-2">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5005] bg-orange-50 px-2 py-0.5 rounded-md border border-orange-200/60">
                  Studio de Création
                </span>
                <span className="text-xs text-gray-400 font-medium">Thème Clair Prestige</span>
              </div>
              <h1 className="text-lg font-black text-gray-900 tracking-tight">
                Créer un Nouvel Événement
              </h1>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <Link
              to="/dashboard/evenement"
              className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:text-gray-900 hover:bg-gray-100 transition cursor-pointer"
            >
              Annuler
            </Link>
            <button
              onClick={handleSubmit}
              disabled={loading}
              className="px-5 py-2.5 rounded-xl bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-extrabold uppercase tracking-wider flex items-center gap-2 shadow-md shadow-orange-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Création...</span>
              ) : (
                <>
                  <span>Publier l'Événement</span>
                  <ArrowRight size={14} />
                </>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Main Content Layout */}
      <main className="max-w-7xl mx-auto px-6 pt-8">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">

          {/* Formulaire Principal (Col 8) */}
          <form onSubmit={handleSubmit} className="lg:col-span-8 space-y-6 text-left">

            {/* 1. Sélecteur de Type d'Événement (Privé vs Public) */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                    <Sparkles size={16} />
                  </div>
                  <div>
                    <h2 className="text-sm font-extrabold text-gray-900">1. Format & Modèle d'Événement</h2>
                    <p className="text-xs text-gray-400">Choisissez la mécanique d'invitation et d'accès</p>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {/* Option Privée */}
                <div
                  onClick={() => setFormData(prev => ({ ...prev, eventType: 'private', maxCapacity: 50 }))}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    formData.eventType === 'private'
                      ? 'border-[#FF5005] bg-orange-50/30 shadow-md ring-2 ring-[#FF5005]/20'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      formData.eventType === 'private' ? 'bg-[#FF5005] text-white shadow-xs' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Lock size={18} />
                    </div>
                    {formData.eventType === 'private' && (
                      <span className="text-[10px] font-extrabold uppercase bg-[#FF5005] text-white px-2 py-0.5 rounded-full">
                        Sélectionné
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Événement Privé (RSVP)</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Mariages, anniversaires, dîners VIP ou galas fermés. Génération de pass personnalisés et relances automatisées.
                    </p>
                  </div>
                </div>

                {/* Option Publique */}
                <div
                  onClick={() => setFormData(prev => ({ ...prev, eventType: 'public', maxCapacity: 500 }))}
                  className={`p-5 rounded-2xl border-2 transition-all cursor-pointer relative flex flex-col justify-between ${
                    formData.eventType === 'public'
                      ? 'border-[#0B1727] bg-slate-50 shadow-md ring-2 ring-[#0B1727]/20'
                      : 'border-gray-200 hover:border-gray-300 bg-gray-50/50'
                  }`}
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className={`w-10 h-10 rounded-2xl flex items-center justify-center ${
                      formData.eventType === 'public' ? 'bg-[#0B1727] text-white shadow-xs' : 'bg-gray-100 text-gray-500'
                    }`}>
                      <Globe size={18} />
                    </div>
                    {formData.eventType === 'public' && (
                      <span className="text-[10px] font-extrabold uppercase bg-[#0B1727] text-white px-2 py-0.5 rounded-full">
                        Sélectionné
                      </span>
                    )}
                  </div>
                  <div>
                    <h3 className="text-sm font-black text-gray-900">Événement Public (Billetterie)</h3>
                    <p className="text-xs text-gray-500 mt-1 leading-relaxed">
                      Concerts, festivals, salons grand public. Page de vente de billets officielle, Designer IA et campagnes publicitaires.
                    </p>
                  </div>
                </div>
              </div>
            </div>

            {/* 2. Informations Générales */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                  <Calendar size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">2. Titre, Date & Lieu</h2>
                  <p className="text-xs text-gray-400">Renseignez les détails fondamentaux de la réception</p>
                </div>
              </div>

              {/* Titre */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                  Titre officiel de l'événement *
                </label>
                <input
                  type="text"
                  name="titre"
                  value={formData.titre}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('titre')}
                  placeholder="Ex: Gala Annuel de Clôture & Célébration VIP 2026"
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl text-xs font-bold text-gray-900 focus:outline-none transition-all ${
                    errors.titre && touched.titre
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-gray-200 focus:bg-white focus:border-[#FF5005] focus:ring-2 focus:ring-[#FF5005]/15'
                  }`}
                />
                {errors.titre && touched.titre && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.titre}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                  Description & Programme *
                </label>
                <textarea
                  name="description"
                  rows="3"
                  value={formData.description}
                  onChange={handleInputChange}
                  onBlur={() => handleBlur('description')}
                  placeholder="Détaillez le dress code, le déroulement des temps forts et les informations clés pour vos invités..."
                  className={`w-full px-4 py-3 bg-gray-50 border rounded-2xl text-xs text-gray-900 focus:outline-none transition-all leading-relaxed ${
                    errors.description && touched.description
                      ? 'border-red-400 bg-red-50/20'
                      : 'border-gray-200 focus:bg-white focus:border-[#FF5005] focus:ring-2 focus:ring-[#FF5005]/15'
                  }`}
                />
                {errors.description && touched.description && (
                  <p className="text-[11px] text-red-500 font-bold mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {errors.description}
                  </p>
                )}
              </div>

              {/* Dates & Horaires */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Date Début *
                  </label>
                  <input
                    type="date"
                    name="DateDebut"
                    value={formData.DateDebut}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('DateDebut')}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Heure Début *
                  </label>
                  <input
                    type="time"
                    name="heureDebut"
                    value={formData.heureDebut}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Date Fin *
                  </label>
                  <input
                    type="date"
                    name="DateFin"
                    value={formData.DateFin}
                    onChange={handleInputChange}
                    onBlur={() => handleBlur('DateFin')}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                  />
                </div>

                <div>
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-gray-500 mb-1">
                    Heure Fin *
                  </label>
                  <input
                    type="time"
                    name="heureFin"
                    value={formData.heureFin}
                    onChange={handleInputChange}
                    className="w-full px-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                  />
                </div>
              </div>

              {/* Lieu & Catégorie */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                    Lieu ou Salle de Réception *
                  </label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="text"
                      name="lieu"
                      value={formData.lieu}
                      onChange={handleInputChange}
                      onBlur={() => handleBlur('lieu')}
                      placeholder="Ex: Palais des Congrès, 75017 Paris"
                      className="w-full pl-9 pr-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                    Catégorie d'événement *
                  </label>
                  <select
                    name="categorie"
                    value={formData.categorie}
                    onChange={handleInputChange}
                    className="w-full px-3.5 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                  >
                    {CATEGORIES.map(c => (
                      <option key={c.id} value={c.id}>{c.label}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* 3. Paramètres Spécifiques & Capacité */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-5">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                  <Users size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">
                    3. Capacité & Paramètres de Diffusion
                  </h2>
                  <p className="text-xs text-gray-400">
                    {formData.eventType === 'private' ? 'Gestion du quota d\'invités et des canaux RSVP' : 'Gestion de la jauge et des frais de billetterie'}
                  </p>
                </div>
              </div>

              {formData.eventType === 'private' ? (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                      Nombre d'invités maximum (Jauge initiale) *
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      min="1"
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      className="w-full sm:w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 focus:outline-none focus:border-[#FF5005]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                      Canal de diffusion des invitations officielles :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, channel: 'email' }))}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          formData.channel === 'email'
                            ? 'border-[#FF5005] bg-orange-50/40 text-gray-900 shadow-xs ring-1 ring-[#FF5005]'
                            : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Mail size={16} className={formData.channel === 'email' ? 'text-[#FF5005]' : 'text-gray-400'} />
                          <span className="text-[10px] font-bold text-gray-500">15 FCFA / invité</span>
                        </div>
                        <span className="text-xs font-bold">Email Officiel</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, channel: 'whatsapp' }))}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          formData.channel === 'whatsapp'
                            ? 'border-[#10B981] bg-emerald-50/40 text-gray-900 shadow-xs ring-1 ring-[#10B981]'
                            : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <MessageSquare size={16} className={formData.channel === 'whatsapp' ? 'text-[#10B981]' : 'text-gray-400'} />
                          <span className="text-[10px] font-bold text-gray-500">30 FCFA / invité</span>
                        </div>
                        <span className="text-xs font-bold">WhatsApp Direct</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, channel: 'both' }))}
                        className={`p-3 rounded-2xl border text-left transition cursor-pointer flex flex-col justify-between ${
                          formData.channel === 'both'
                            ? 'border-[#0B1727] bg-slate-100 text-gray-900 shadow-xs ring-1 ring-[#0B1727]'
                            : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center justify-between mb-2">
                          <Sparkles size={16} className={formData.channel === 'both' ? 'text-[#0B1727]' : 'text-gray-400'} />
                          <span className="text-[10px] font-bold text-gray-500">45 FCFA / invité</span>
                        </div>
                        <span className="text-xs font-bold">Multi-Canaux (2-en-1)</span>
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="space-y-4">
                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-1.5">
                      Capacité totale de la billetterie (Places) *
                    </label>
                    <input
                      type="number"
                      name="maxCapacity"
                      min="10"
                      value={formData.maxCapacity}
                      onChange={handleInputChange}
                      placeholder="Ex: 1000"
                      className="w-full sm:w-1/2 px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-black text-gray-900 focus:outline-none focus:border-[#FF5005]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-extrabold uppercase tracking-wider text-gray-500 mb-2">
                      Frais de billetterie en ligne (2.5% + 250 FCFA) :
                    </label>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, publicFeeBearer: 'buyer' }))}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                          formData.publicFeeBearer === 'buyer'
                            ? 'border-[#FF5005] bg-orange-50/40 text-gray-900 shadow-xs ring-1 ring-[#FF5005]'
                            : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold">À la charge de l'acheteur</div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Ajoutés au tarif du billet lors du paiement</p>
                      </button>

                      <button
                        type="button"
                        onClick={() => setFormData(prev => ({ ...prev, publicFeeBearer: 'organizer' }))}
                        className={`p-3.5 rounded-2xl border text-left transition cursor-pointer ${
                          formData.publicFeeBearer === 'organizer'
                            ? 'border-[#0B1727] bg-slate-100 text-gray-900 shadow-xs ring-1 ring-[#0B1727]'
                            : 'border-gray-200 bg-gray-50/60 text-gray-600 hover:border-gray-300'
                        }`}
                      >
                        <div className="text-xs font-bold">Déduit de mes gains</div>
                        <p className="text-[11px] text-gray-400 mt-0.5">Prix affiché tout compris pour l'acheteur</p>
                      </button>
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* 4. Affiche / Visuel de Couverture */}
            <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-200 shadow-xs space-y-4">
              <div className="flex items-center gap-2 border-b border-gray-100 pb-3">
                <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                  <ImageIcon size={16} />
                </div>
                <div>
                  <h2 className="text-sm font-extrabold text-gray-900">4. Affiche ou Flyer Officiel</h2>
                  <p className="text-xs text-gray-400">Illustration de l'invitation ou de la billetterie publique (Optionnel)</p>
                </div>
              </div>

              {imagePreview ? (
                <div className="relative rounded-2xl overflow-hidden border border-gray-200 max-h-72 bg-gray-900 flex items-center justify-center group">
                  <img src={imagePreview} alt="Aperçu" className="w-full h-full object-cover max-h-72" />
                  <button
                    type="button"
                    onClick={handleRemoveImage}
                    className="absolute top-4 right-4 p-2 bg-red-600 hover:bg-red-700 text-white rounded-xl shadow-lg transition cursor-pointer"
                    title="Supprimer l'image"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              ) : (
                <label className="border-2 border-dashed border-gray-300 hover:border-[#FF5005] rounded-3xl p-8 flex flex-col items-center justify-center text-center bg-gray-50/60 hover:bg-orange-50/20 transition cursor-pointer">
                  <div className="w-12 h-12 rounded-2xl bg-white border border-gray-200 text-gray-400 flex items-center justify-center mb-3 shadow-xs">
                    <Upload size={20} className="text-[#FF5005]" />
                  </div>
                  <span className="text-xs font-bold text-gray-800">Cliquez pour importer votre affiche</span>
                  <span className="text-[11px] text-gray-400 mt-1">Formats PNG, JPG ou WEBP jusqu'à 10 Mo</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleImageChange}
                    className="hidden"
                  />
                </label>
              )}
            </div>

            {/* CTA Mobile */}
            <div className="lg:hidden pt-4">
              <button
                type="submit"
                disabled={loading}
                className="w-full py-4 bg-[#FF5005] hover:bg-[#ff6220] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2"
              >
                {loading ? 'Création en cours...' : 'Publier et Valider'}
              </button>
            </div>

          </form>

          {/* Panneau Latéral : Devis Dynamique en Temps Réel (Col 4) */}
          <aside className="lg:col-span-4 sticky top-26 space-y-6 text-left">
            
            <div className="bg-white rounded-3xl p-6 sm:p-7 border border-gray-200 shadow-xl relative overflow-hidden">
              
              {/* Header Devis */}
              <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
                <div className="flex items-center gap-2">
                  <div className="w-7 h-7 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                    <CreditCard size={14} />
                  </div>
                  <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                    Devis en Temps Réel
                  </span>
                </div>
                <span className="text-[10px] bg-orange-50 text-[#FF5005] border border-orange-200 font-extrabold px-2 py-0.5 rounded-full">
                  Pay-As-You-Go
                </span>
              </div>

              {/* Lignes de calcul */}
              <div className="space-y-3 text-xs">
                <div className="flex justify-between items-center text-gray-600">
                  <span>Durée estimée :</span>
                  <span className="font-bold text-gray-900">{pricingQuote.days} jour(s)</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span>Base infrastructure ({Number(pricingQuote.baseDaily).toLocaleString('fr-FR')} FCFA/j) :</span>
                  <span className="font-bold text-gray-900">{Number(pricingQuote.baseFee).toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="flex justify-between items-center text-gray-600">
                  <span className="truncate max-w-[170px]">{pricingQuote.channelLabel} :</span>
                  <span className="font-bold text-gray-900">{Number(pricingQuote.channelCost).toLocaleString('fr-FR')} FCFA</span>
                </div>

                <div className="pt-3 border-t border-gray-100 flex justify-between items-baseline">
                  <div>
                    <span className="text-xs font-black text-gray-900 block">Total Activation :</span>
                    <span className="text-[10px] text-gray-400">TTC • Facturation après confirmation</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl font-black text-[#FF5005]">
                      {pricingQuote.total.toLocaleString('fr-FR')} FCFA
                    </span>
                  </div>
                </div>
              </div>

              {/* Formule de transparence */}
              <div className="mt-5 p-3.5 rounded-2xl bg-gray-50 border border-gray-200 text-[11px] text-gray-500 space-y-1">
                <div className="flex items-center gap-1.5 font-bold text-gray-800">
                  <Info size={13} className="text-[#FF5005]" />
                  <span>Calcul transparent :</span>
                </div>
                <p className="font-mono text-[10px] text-gray-600 bg-white p-2 rounded-lg border border-gray-200 mt-1">
                  {formData.eventType === 'public'
                    ? `(${pricingQuote.days} j × 5 000 FCFA) + (${formData.maxCapacity} places × 10 FCFA)`
                    : `(${pricingQuote.days} j × 2 500 FCFA) + (${formData.maxCapacity} invités × coût canal)`}
                </p>
              </div>

              {/* Inclusions garanties */}
              <div className="mt-5 pt-4 border-t border-gray-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-700 font-bold text-[11px]">
                  <ShieldCheck size={14} className="text-emerald-500 shrink-0" />
                  <span>Génération instantanée des QR codes cryptés</span>
                </div>
                <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                  <Zap size={14} className="text-[#FF5005] shrink-0" />
                  <span>Synchronisation avec l'app mobileAppScann</span>
                </div>
                {formData.eventType === 'public' && (
                  <div className="flex items-center gap-2 text-gray-600 text-[11px]">
                    <Sparkles size={14} className="text-[#EFB810] shrink-0" />
                    <span>Accès inclus au Ticket Designer IA Gemini</span>
                  </div>
                )}
              </div>

              {/* Bouton de Soumission Desktop */}
              <button
                type="button"
                onClick={handleSubmit}
                disabled={loading}
                className="mt-6 w-full py-3.5 bg-[#FF5005] hover:bg-[#ff6220] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 transition cursor-pointer flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? (
                  <span>Création en cours...</span>
                ) : (
                  <>
                    <span>Valider & Créer l'Événement</span>
                    <ArrowRight size={14} />
                  </>
                )}
              </button>

            </div>

          </aside>

        </div>
      </main>
    </div>
  );
}
