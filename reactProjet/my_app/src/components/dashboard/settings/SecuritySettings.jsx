import React, { useState } from 'react';
import { 
  ShieldCheck, Lock, KeyRound, Eye, EyeOff, 
  Check, AlertCircle, Smartphone, Laptop, LogOut 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../../context/AuthContext';
import api from '../../../services/api';

/**
 * Composant de Sécurité & Gestion des Mots de Passe
 */
export const SecuritySettings = () => {
  const { user, token } = useAuthContext();

  const [passwords, setPasswords] = useState({
    currentPassword: '',
    newPassword: '',
    confirmPassword: '',
  });

  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [successMessage, setSuccessMessage] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // Calcul de la robustesse du mot de passe
  const getPasswordStrength = (pwd) => {
    if (!pwd) return { score: 0, label: 'Vide', color: 'bg-gray-200' };
    let score = 0;
    if (pwd.length >= 8) score += 1;
    if (/[A-Z]/.test(pwd)) score += 1;
    if (/[0-9]/.test(pwd)) score += 1;
    if (/[^A-Za-z0-9]/.test(pwd)) score += 1;

    switch (score) {
      case 1:
        return { score: 25, label: 'Faible', color: 'bg-red-500' };
      case 2:
        return { score: 50, label: 'Moyen', color: 'bg-amber-500' };
      case 3:
        return { score: 75, label: 'Bon', color: 'bg-blue-500' };
      case 4:
        return { score: 100, label: 'Très Robuste', color: 'bg-emerald-500' };
      default:
        return { score: 10, label: 'Très Faible', color: 'bg-red-400' };
    }
  };

  const strength = getPasswordStrength(passwords.newPassword);

  const handlePasswordSubmit = async (e) => {
    e.preventDefault();
    setSuccessMessage('');
    setErrorMessage('');

    if (passwords.newPassword !== passwords.confirmPassword) {
      setErrorMessage('Le nouveau mot de passe et sa confirmation ne correspondent pas.');
      return;
    }

    if (passwords.newPassword.length < 6) {
      setErrorMessage('Le nouveau mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    try {
      setIsSubmitting(true);
      const res = await api.put(`/updateUser/${user?.id || user?._id}`, {
        password: passwords.newPassword,
      });

      if (res.data.success || res.status === 200) {
        setSuccessMessage('Votre mot de passe a été mis à jour avec succès.');
        setPasswords({ currentPassword: '', newPassword: '', confirmPassword: '' });
        setTimeout(() => setSuccessMessage(''), 4000);
      }
    } catch (err) {
      console.error('Erreur changement mot de passe:', err);
      setErrorMessage(err.response?.data?.message || 'Erreur lors du changement de mot de passe.');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. Changement de mot de passe */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <KeyRound size={20} className="text-[#FF5005]" />
            <span>Modifier mon mot de passe</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Nous vous recommandons d'utiliser un mot de passe unique contenant des lettres, chiffres et symboles.
          </p>
        </div>

        {successMessage && (
          <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <Check size={16} />
            <span>{successMessage}</span>
          </div>
        )}

        {errorMessage && (
          <div className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2">
            <AlertCircle size={16} />
            <span>{errorMessage}</span>
          </div>
        )}

        <form onSubmit={handlePasswordSubmit} className="space-y-5 max-w-xl">
          
          {/* Ancien mot de passe */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Mot de passe actuel
            </label>
            <div className="relative">
              <input
                type={showCurrent ? 'text' : 'password'}
                required
                value={passwords.currentPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, currentPassword: e.target.value }))}
                placeholder="••••••••••••"
                className="w-full pl-4 pr-11 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowCurrent(!showCurrent)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showCurrent ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          {/* Nouveau mot de passe */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showNew ? 'text' : 'password'}
                required
                value={passwords.newPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, newPassword: e.target.value }))}
                placeholder="Au moins 8 caractères recommandés"
                className="w-full pl-4 pr-11 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowNew(!showNew)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showNew ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>

            {/* Jauge de force */}
            {passwords.newPassword && (
              <div className="mt-2 space-y-1">
                <div className="flex justify-between items-center text-[10px] font-bold text-gray-500">
                  <span>Robustesse : {strength.label}</span>
                  <span>{strength.score}%</span>
                </div>
                <div className="w-full h-1.5 bg-gray-100 rounded-full overflow-hidden">
                  <div
                    className={`h-full transition-all duration-300 ${strength.color}`}
                    style={{ width: `${strength.score}%` }}
                  />
                </div>
              </div>
            )}
          </div>

          {/* Confirmer nouveau mot de passe */}
          <div>
            <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
              Confirmez le nouveau mot de passe
            </label>
            <div className="relative">
              <input
                type={showConfirm ? 'text' : 'password'}
                required
                value={passwords.confirmPassword}
                onChange={(e) => setPasswords((p) => ({ ...p, confirmPassword: e.target.value }))}
                placeholder="Répétez le nouveau mot de passe"
                className="w-full pl-4 pr-11 py-3 bg-gray-50/80 border border-gray-200 rounded-2xl text-xs text-gray-900 font-bold focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
              />
              <button
                type="button"
                onClick={() => setShowConfirm(!showConfirm)}
                className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 cursor-pointer"
              >
                {showConfirm ? <EyeOff size={16} /> : <Eye size={16} />}
              </button>
            </div>
          </div>

          <div className="pt-2">
            <motion.button
              type="submit"
              disabled={isSubmitting}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="px-6 py-3 bg-[#0B1727] hover:bg-[#FF5005] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer flex items-center gap-2"
            >
              {isSubmitting ? 'Mise à jour...' : 'Mettre à jour le mot de passe'}
            </motion.button>
          </div>

        </form>
      </div>

      {/* 2. Sessions Actives */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-5">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <ShieldCheck size={20} className="text-emerald-500" />
            <span>Appareils & Sessions Actives</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Consultez les appareils actuellement connectés à votre compte organisateur.
          </p>
        </div>

        <div className="space-y-3">
          <div className="p-4 rounded-2xl bg-gray-50 border border-gray-100 flex items-center justify-between">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
                <Laptop size={20} />
              </div>
              <div>
                <p className="text-xs font-bold text-gray-900">Session Actuelle (Navigateur Web)</p>
                <p className="text-[10px] text-emerald-600 font-bold flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
                  En ligne maintenant
                </p>
              </div>
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-emerald-100 text-emerald-800 rounded-full">
              Cet appareil
            </span>
          </div>
        </div>
      </div>

    </div>
  );
};

export default SecuritySettings;
