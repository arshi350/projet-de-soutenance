import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Check, AlertCircle, Save, Sparkles, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../../context/AuthContext';
import { updateUser } from '../../../services/userService';

/**
 * Composant de Paramètres du Profil Utilisateur
 */
export const UserProfileSettings = () => {
  const { user, token, updateUser: updateAuthUser } = useAuthContext();

  const [formData, setFormData] = useState({
    first_name: user?.first_name || '',
    last_name: user?.last_name || '',
    email: user?.email || '',
    phone: user?.phone || '',
    city: user?.city || '',
  });

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);
    setSuccessMessage('');
    setErrorMessage('');

    try {
      const userId = user?._id || user?.id;
      const res = await updateUser(
        userId,
        {
          first_name: formData.first_name.trim(),
          last_name: formData.last_name.trim(),
          phone: formData.phone,
          city: formData.city.trim(),
        },
        token
      );

      // Mettre à jour l'utilisateur dans le contexte local
      const updatedUserInfo = {
        ...user,
        first_name: formData.first_name.trim(),
        last_name: formData.last_name.trim(),
        phone: formData.phone,
        city: formData.city.trim(),
      };
      updateAuthUser(updatedUserInfo);

      setSuccessMessage('Vos informations de profil ont été mises à jour avec succès !');
      setTimeout(() => setSuccessMessage(''), 4000);
    } catch (err) {
      console.error('Erreur updateUser:', err);
      setErrorMessage(err.message || 'Impossible de mettre à jour le profil.');
    } finally {
      setIsSubmitting(false);
    }
  };

  const initials = `${(formData.first_name || 'U')[0] || ''}${(formData.last_name || '')[0] || ''}`.toUpperCase();

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6 text-left font-sans">
      
      {/* Header Profil */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div className="flex items-center gap-4">
          <div className="w-16 h-16 rounded-3xl bg-gradient-to-tr from-[#FF5005] to-[#FF7A00] text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-orange-500/20 shrink-0">
            {initials || 'U'}
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-lg sm:text-xl font-black text-gray-900">
                {formData.first_name} {formData.last_name}
              </h3>
              <span className="px-2.5 py-0.5 bg-orange-500/10 text-[#FF5005] font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-orange-500/20">
                {user?.role === 'admin' ? 'Administrateur' : 'Organisateur VIP'}
              </span>
            </div>
            <p className="text-xs text-gray-400 mt-0.5">
              Membre officiel de la plateforme événementielle
            </p>
          </div>
        </div>
      </div>

      {/* Alertes de confirmation / erreur */}
      {successMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <Check size={16} className="shrink-0" />
          <span>{successMessage}</span>
        </motion.div>
      )}

      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <AlertCircle size={16} className="shrink-0" />
          <span>{errorMessage}</span>
        </motion.div>
      )}

      {/* Formulaire de profil */}
      <form onSubmit={handleSubmit} className="space-y-5">
        
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
          {/* Prénom */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Prénom *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                name="first_name"
                value={formData.first_name}
                onChange={handleChange}
                placeholder="Votre prénom"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Nom */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Nom de famille *
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                name="last_name"
                value={formData.last_name}
                onChange={handleChange}
                placeholder="Votre nom"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Email (Lecture seule / Identifiant) */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Adresse Email (Identifiant de compte)
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                disabled
                value={formData.email}
                className="w-full pl-10 pr-4 py-3 bg-gray-100 border border-gray-200 rounded-2xl text-xs text-gray-500 font-bold cursor-not-allowed select-none"
              />
            </div>
            <span className="text-[10px] text-gray-400 mt-1 block">
              Pour modifier votre adresse email, contactez le support de sécurité.
            </span>
          </div>

          {/* Téléphone */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Numéro de Téléphone *
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                name="phone"
                value={formData.phone}
                onChange={handleChange}
                placeholder="683660987"
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
            </div>
          </div>

          {/* Ville */}
          <div className="sm:col-span-2">
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Ville & Région de Résidence *
            </label>
            <div className="relative">
              <MapPin size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                required
                name="city"
                value={formData.city}
                onChange={handleChange}
                placeholder="Ex: Yaoundé, Paris, Abidjan..."
                className="w-full pl-10 pr-4 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
            </div>
          </div>
        </div>

        {/* Bouton de sauvegarde */}
        <div className="pt-4 flex justify-end">
          <motion.button
            type="submit"
            disabled={isSubmitting}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-7 py-3.5 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5f1b] hover:to-[#ff861b] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isSubmitting ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              <>
                <Save size={16} />
                <span>Enregistrer les modifications</span>
              </>
            )}
          </motion.button>
        </div>

      </form>

    </div>
  );
};

export default UserProfileSettings;
