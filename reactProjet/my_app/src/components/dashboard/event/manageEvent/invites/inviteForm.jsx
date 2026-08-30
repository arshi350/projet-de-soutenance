import React, { useState, useEffect } from 'react';
import { useAuthContext } from '../../../../../context/AuthContext';
import { useAddInvite } from '../../../../../hooks/useInvite';
import { 
  X, 
  User, 
  Mail, 
  Phone, 
  Sparkles, 
  CheckCircle2, 
  XCircle, 
  ShieldCheck, 
  Crown, 
  ArrowRight,
  PlusCircle,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'react-hot-toast';

export default function InviteForm({ eventId, closeModal, onSuccess }) {
  const { token } = useAuthContext();
  const { addNewInvite, loading, error, success, reset } = useAddInvite(token);

  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    contact: '',
    status: 'classique'
  });

  const [addAnother, setAddAnother] = useState(false);
  const [focusedField, setFocusedField] = useState(null);
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  useEffect(() => {
    if (success) {
      toast.success(`${formData.prenom || 'Invité'} a été enregistré avec succès !`);
      
      if (onSuccess) {
        onSuccess();
      }

      if (addAnother) {
        setFormData({ nom: '', prenom: '', contact: '', status: 'classique' });
        setErrors({});
        setTouched({});
        reset();
      } else {
        const timer = setTimeout(() => {
          closeModal();
        }, 500);
        return () => clearTimeout(timer);
      }
    }
  }, [success, addAnother, closeModal, onSuccess, reset, formData.prenom]);

  const validateField = (name, value) => {
    switch (name) {
      case 'nom':
        if (!value.trim()) return 'Le nom est requis';
        if (value.trim().length < 2) return 'Au moins 2 caractères requis';
        return '';
      case 'prenom':
        if (!value.trim()) return 'Le prénom est requis';
        if (value.trim().length < 2) return 'Au moins 2 caractères requis';
        return '';
      case 'contact':
        if (!value.trim()) return 'Un e-mail ou un mobile est requis';
        const cleanVal = value.trim();
        if (cleanVal.includes('@')) {
          const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
          if (!emailRegex.test(cleanVal)) return 'Adresse e-mail invalide';
        } else {
          const formattedPhone = cleanVal.replace(/[\s\-\+\(\)]/g, '');
          if (formattedPhone.length < 8) return 'Numéro de mobile incomplet';
        }
        return '';
      case 'status':
        if (!value) return 'Sélectionnez un rang';
        return '';
      default:
        return '';
    }
  };

  const validateForm = () => {
    const newErrors = {};
    ['nom', 'prenom', 'contact', 'status'].forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  const handleBlur = (e) => {
    const { name } = e.target;
    setFocusedField(null);
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  const handleFocus = (name) => {
    setFocusedField(name);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setTouched({ nom: true, prenom: true, contact: true, status: true });

    if (!validateForm()) return;

    const contactVal = formData.contact.trim();
    let email = undefined;
    let telephone = undefined;

    if (contactVal.includes('@')) {
      email = contactVal.toLowerCase();
    } else {
      let formattedPhone = contactVal.replace(/[\s\-\+\(\)]/g, '');
      if (formattedPhone.startsWith('237') && formattedPhone.length === 12) {
        formattedPhone = formattedPhone.substring(3);
      }
      telephone = formattedPhone;
    }

    const invitePayload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      contact: contactVal,
      email,
      telephone,
      status: formData.status,
      idEvent: eventId
    };

    try {
      await addNewInvite(invitePayload);
    } catch (submitError) {
      console.error("Erreur enregistrement:", submitError);
    }
  };

  return (
    <div className="w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden font-sans text-left">
      
      {/* Ruban Supérieur ARSHI EVENT */}
      <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />

      {/* En-tête de la Modal */}
      <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
        <div className="flex items-center gap-3.5">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
              Ajouter un Invité
            </h2>
            <p className="text-xs text-gray-400">
              Générez instantanément son pass numérique officiel.
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={closeModal}
          className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
        >
          <X className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="mx-7 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
          <XCircle className="w-4 h-4 text-red-500 shrink-0" />
          <span>{typeof error === 'string' ? error : error?.message || 'Erreur lors de l\'enregistrement.'}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
        
        {/* Nom & Prénom */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Prénom *
            </label>
            <input
              type="text"
              name="prenom"
              value={formData.prenom}
              onChange={handleChange}
              onFocus={() => handleFocus('prenom')}
              onBlur={handleBlur}
              placeholder="Ex: Alexandre"
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-900 focus:outline-none transition-all ${
                errors.prenom && touched.prenom
                  ? 'border-red-400 bg-red-50/30'
                  : focusedField === 'prenom'
                  ? 'border-[#FF5005] bg-white ring-2 ring-[#FF5005]/15'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.prenom && touched.prenom && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.prenom}</p>
            )}
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Nom *
            </label>
            <input
              type="text"
              name="nom"
              value={formData.nom}
              onChange={handleChange}
              onFocus={() => handleFocus('nom')}
              onBlur={handleBlur}
              placeholder="Ex: Dumas"
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-900 focus:outline-none transition-all ${
                errors.nom && touched.nom
                  ? 'border-red-400 bg-red-50/30'
                  : focusedField === 'nom'
                  ? 'border-[#FF5005] bg-white ring-2 ring-[#FF5005]/15'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={loading}
            />
            {errors.nom && touched.nom && (
              <p className="text-[10px] text-red-500 font-bold mt-1">{errors.nom}</p>
            )}
          </div>
        </div>

        {/* Contact unique (Email ou Mobile) */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
            Canal de contact (Email ou Mobile WhatsApp) *
          </label>
          <div className="relative">
            <input
              type="text"
              name="contact"
              value={formData.contact}
              onChange={handleChange}
              onFocus={() => handleFocus('contact')}
              onBlur={handleBlur}
              placeholder="Ex: alexandre@domaine.com ou +33 6 12 34 56 78"
              className={`w-full px-4 py-2.5 bg-gray-50 border rounded-xl text-xs font-bold text-gray-900 focus:outline-none transition-all ${
                errors.contact && touched.contact
                  ? 'border-red-400 bg-red-50/30'
                  : focusedField === 'contact'
                  ? 'border-[#FF5005] bg-white ring-2 ring-[#FF5005]/15'
                  : 'border-gray-200 hover:border-gray-300'
              }`}
              disabled={loading}
            />
          </div>
          {errors.contact && touched.contact && (
            <p className="text-[10px] text-red-500 font-bold mt-1">{errors.contact}</p>
          )}
        </div>

        {/* Sélection du Rang (Classique vs VIP) */}
        <div>
          <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
            Catégorie du Pass d'Accès
          </label>
          <div className="grid grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: 'classique' }))}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                formData.status === 'classique'
                  ? 'border-[#FF5005] bg-orange-50/40 text-gray-900 shadow-xs ring-1 ring-[#FF5005]'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold">Invité Classique</span>
                <User size={14} className={formData.status === 'classique' ? 'text-[#FF5005]' : 'text-gray-400'} />
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">Accès standard à l'événement</p>
            </button>

            <button
              type="button"
              onClick={() => setFormData(prev => ({ ...prev, status: 'vip' }))}
              className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                formData.status === 'vip'
                  ? 'border-[#EFB810] bg-amber-50/40 text-gray-900 shadow-xs ring-1 ring-[#EFB810]'
                  : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
              }`}
            >
              <div className="flex items-center justify-between mb-1">
                <span className="text-xs font-extrabold text-[#EFB810]">Privilège VIP</span>
                <Crown size={14} className="text-[#EFB810]" />
              </div>
              <p className="text-[10px] text-gray-400 leading-tight">Accès coupe-file & salon d'honneur</p>
            </button>
          </div>
        </div>

        {/* Option Ajouter un autre invité */}
        <div className="pt-2 flex items-center justify-between border-t border-gray-100">
          <label className="flex items-center gap-2 text-xs font-semibold text-gray-600 cursor-pointer">
            <input
              type="checkbox"
              checked={addAnother}
              onChange={(e) => setAddAnother(e.target.checked)}
              className="w-4 h-4 rounded text-[#FF5005] accent-[#FF5005] cursor-pointer"
            />
            <span>Ajouter un autre invité après</span>
          </label>

          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={closeModal}
              className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
            >
              Annuler
            </button>

            <motion.button
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.03 } : {}}
              whileTap={!loading ? { scale: 0.97 } : {}}
              className="px-6 py-2.5 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold uppercase tracking-wider rounded-xl shadow-md shadow-orange-500/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
            >
              {loading ? (
                <span>Génération du pass...</span>
              ) : (
                <>
                  <span>Enregistrer l'invité</span>
                  <ArrowRight size={14} />
                </>
              )}
            </motion.button>
          </div>
        </div>

      </form>

    </div>
  );
}