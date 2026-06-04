import { useState, useEffect } from 'react';
import { useAuthContext } from '../../../../../context/AuthContext';
import { useAddInvite } from '../../../../../hooks/useInvite';
import { XCircle, CheckCircle, UserPlus, Mail, Phone, User } from 'lucide-react';

export default function InviteForm({ eventId, closeModal, onSuccess }) {
  const { token } = useAuthContext();
  const { addNewInvite, loading, error, success, reset } = useAddInvite(token);
  const [formData, setFormData] = useState({
    nom: '',
    prenom: '',
    telephone: '',
    email: '',
    status: 'classique'
  });
  const [errors, setErrors] = useState({});
  const [touched, setTouched] = useState({});

  // Nettoyage du state du hook lors du démontage
  useEffect(() => {
    return () => {
      reset();
    };
  }, [reset]);

  // Gestion du succès
  useEffect(() => {
    if (success) {
      // Réinitialisation du formulaire
      setFormData({ nom: '', prenom: '', telephone: '', email: '', status: 'classique' });
      setErrors({});
      setTouched({});
      
      // Fermeture automatique après 1.5 secondes
      const timer = setTimeout(() => {
        if (onSuccess) {
          onSuccess();
        }
        closeModal();
      }, 1500);
      
      return () => clearTimeout(timer);
    }
  }, [success, closeModal, onSuccess]);

  // Validation des champs
  const validateField = (name, value) => {
    switch (name) {
      case 'nom':
        if (!value.trim()) return 'Le nom est requis';
        if (value.trim().length < 2) return 'Le nom doit contenir au moins 2 caractères';
        return '';
      case 'prenom':
        if (!value.trim()) return 'Le prénom est requis';
        if (value.trim().length < 2) return 'Le prénom doit contenir au moins 2 caractères';
        return '';
      case 'telephone':
        if (!value.trim()) return 'Le téléphone est requis';
        const phoneRegex = /^6[25789]\d{7}$/;
        if (!phoneRegex.test(value.replace(/\s/g, ''))) {
          return 'Numéro de téléphone invalide. Exemple : 683660987';
        }
        return '';
      case 'email':
        if (!value.trim()) return 'L\'email est requis';
        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(value)) return 'Email invalide (ex: nom@domaine.com)';
        return '';
      case 'status':
        if (!value) return 'Le statut est requis';
        return '';
      default:
        return '';
    }
  };

  // Validation complète du formulaire
  const validateForm = () => {
    const newErrors = {};
    const fields = ['nom', 'prenom', 'telephone', 'email', 'status'];
    
    fields.forEach(field => {
      const error = validateField(field, formData[field]);
      if (error) newErrors[field] = error;
    });
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Gestion des changements de champs
  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
    
    // Validation en temps réel si le champ a déjà été touché
    if (touched[name]) {
      const error = validateField(name, value);
      setErrors(prev => ({ ...prev, [name]: error }));
    }
  };

  // Gestion du blur des champs
  const handleBlur = (e) => {
    const { name } = e.target;
    setTouched(prev => ({ ...prev, [name]: true }));
    const error = validateField(name, formData[name]);
    setErrors(prev => ({ ...prev, [name]: error }));
  };

  // Soumission du formulaire
  const handleSubmit = async (e) => {
    e.preventDefault();
    
    // Marquer tous les champs comme touchés
    const allTouched = {};
    Object.keys(formData).forEach(key => {
      allTouched[key] = true;
    });
    setTouched(allTouched);
    
    // Validation finale
    if (!validateForm()) return;

    // Construction du payload et ajout de l'ID de l'événement au backend
    const invitePayload = {
      nom: formData.nom.trim(),
      prenom: formData.prenom.trim(),
      telephone: formData.telephone.trim(),
      email: formData.email.trim().toLowerCase(),
      status: formData.status,
      idEvent: eventId,
      eventId: eventId
    };

    if (!eventId) {
      setErrors((prev) => ({
        ...prev,
        api: 'ID de l’événement manquant.',
      }));
      return;
    }

    try {
      await addNewInvite(invitePayload);
    } catch (submitError) {
      console.error('Erreur lors de l\'ajout de l\'invité:', submitError, invitePayload);
    }
    closeModal();
  };

  return (
    <div className="relative h-auto max-h-[90vh] w-full max-w-2xl overflow-y-auto rounded-3xl bg-white p-6 shadow-2xl border border-slate-200">
      {/* En-tête */}
      <div className="mb-6 flex items-center justify-between gap-3">
        <div>
          <h2 className="text-2xl font-bold text-slate-900 flex items-center gap-2">
            <UserPlus className="w-6 h-6 text-[#017EF7]" />
            Ajouter un invité
          </h2>
          <p className="text-sm text-slate-500 mt-1">
            Remplissez les informations ci-dessous pour enregistrer un nouvel invité
          </p>
        </div>
        <button
          type="button"
          onClick={closeModal}
          className="rounded-full border border-slate-200 bg-slate-50 p-2 text-slate-500 hover:bg-slate-100 transition-colors"
          aria-label="Fermer"
        >
          ✕
        </button>
      </div>

      {/* Message de succès */}
      {success && (
        <div className="mb-4 rounded-2xl bg-emerald-50 border border-emerald-200 px-4 py-3 text-sm text-emerald-700 flex items-center gap-2 animate-in fade-in duration-300">
          <CheckCircle size={18} className="flex-shrink-0" />
          <span>Invitant ajouté avec succès ! Redirection en cours...</span>
        </div>
      )}

      {/* Message d'erreur */}
      {error && (
        <div className="mb-4 rounded-2xl bg-red-50 border border-red-200 px-4 py-3 text-sm text-red-700 flex items-center gap-2">
          <XCircle size={18} className="flex-shrink-0" />
          <span>{typeof error === 'string' ? error : error?.message || 'Une erreur est survenue lors de l\'ajout de l\'invité. Veuillez réessayer.'}</span>
        </div>
      )}

      {/* Formulaire */}
      <form onSubmit={handleSubmit} className="space-y-5">
        {/* Nom et Prénom */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Nom *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="nom"
                value={formData.nom}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Dupont"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-[#017EF7] focus:ring-2 focus:ring-[#017EF7]/20 transition-all"
                disabled={loading}
              />
            </div>
            {touched.nom && errors.nom && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <XCircle size={12} />
                {errors.nom}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Prénom *
            </label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="prenom"
                value={formData.prenom}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="Jean"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-[#017EF7] focus:ring-2 focus:ring-[#017EF7]/20 transition-all"
                disabled={loading}
              />
            </div>
            {touched.prenom && errors.prenom && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <XCircle size={12} />
                {errors.prenom}
              </p>
            )}
          </div>
        </div>

        {/* Téléphone et Email */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Téléphone *
            </label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="telephone"
                value={formData.telephone}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="0612345678"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-[#017EF7] focus:ring-2 focus:ring-[#017EF7]/20 transition-all"
                disabled={loading}
              />
            </div>
            {touched.telephone && errors.telephone && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <XCircle size={12} />
                {errors.telephone}
              </p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-slate-700 mb-2">
              Email *
            </label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
              <input
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
                onBlur={handleBlur}
                placeholder="jean.dupont@email.com"
                className="w-full rounded-2xl border border-slate-200 bg-slate-50 pl-10 pr-4 py-3 text-sm text-slate-900 outline-none focus:border-[#017EF7] focus:ring-2 focus:ring-[#017EF7]/20 transition-all"
                disabled={loading}
              />
            </div>
            {touched.email && errors.email && (
              <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
                <XCircle size={12} />
                {errors.email}
              </p>
            )}
          </div>
        </div>

        {/* Statut */}
        <div>
          <label className="block text-sm font-medium text-slate-700 mb-2">
            Statut *
          </label>
          <select
            name="status"
            value={formData.status}
            onChange={handleChange}
            onBlur={handleBlur}
            className="w-full rounded-2xl border border-slate-200 bg-slate-50 px-4 py-3 text-sm text-slate-900 outline-none focus:border-[#017EF7] focus:ring-2 focus:ring-[#017EF7]/20 transition-all"
            disabled={loading}
          >
            <option value="classic">Classic</option>
            <option value="vip">VIP</option>
          </select>
          {touched.status && errors.status && (
            <p className="mt-1 text-xs text-red-600 flex items-center gap-1">
              <XCircle size={12} />
              {errors.status}
            </p>
          )}
        </div>

        {/* Actions */}
        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end pt-4 border-t border-slate-200">
          <button
            type="button"
            onClick={closeModal}
            className="rounded-2xl border border-slate-200 bg-white px-6 py-3 text-sm font-semibold text-slate-700 transition-all hover:bg-slate-50 hover:border-slate-300"
            disabled={loading}
          >
            Annuler
          </button>
          <button
            type="submit"
            disabled={loading}
            className="rounded-2xl bg-[#017EF7] px-6 py-3 text-sm font-semibold text-white transition-all hover:bg-blue-600 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-60 flex items-center justify-center gap-2"
          >
            {loading ? (
              <>
                <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
                Envoi en cours...
              </>
            ) : (
              'Enregistrer l\'invité'
            )}
          </button>
        </div>

        {/* Note des champs obligatoires */}
        <p className="text-xs text-slate-400 text-center">
          * Champs obligatoires
        </p>
      </form>
    </div>
  );
}