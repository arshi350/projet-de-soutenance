import React, { useState } from 'react';
import { X, UserPlus, Mail, Lock, User, Send, AlertCircle, ShieldCheck } from 'lucide-react';
import { createAgent } from '../../services/agentService';

const AddAgentModal = ({ isOpen, onClose, eventId, onAgentAdded }) => {
  const [formData, setFormData] = useState({
    prenom: '',
    nom: '',
    email: '',
    defaultPassword: '',
    sendEmailNow: true
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  if (!isOpen) return null;

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!formData.email || !formData.defaultPassword) {
      setError('Veuillez remplir l\'adresse email et le mot de passe par défaut.');
      return;
    }

    if (formData.defaultPassword.length < 6) {
      setError('Le mot de passe doit contenir au moins 6 caractères.');
      return;
    }

    setLoading(true);
    try {
      const res = await createAgent({
        ...formData,
        eventId
      });

      if (res.success) {
        onAgentAdded(res.agent, res.emailSent);
        onClose();
        setFormData({
          prenom: '',
          nom: '',
          email: '',
          defaultPassword: '',
          sendEmailNow: true
        });
      } else {
        setError(res.message || 'Erreur lors de la création de l\'agent.');
      }
    } catch (err) {
      setError(err.response?.data?.message || err.message || 'Erreur de communication avec le serveur.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-200 text-left">
      <div className="relative w-full max-w-lg bg-white rounded-3xl shadow-2xl border border-gray-200/80 overflow-hidden font-sans text-gray-900">
        
        {/* Ruban Supérieur ARSHI EVENT */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />

        {/* En-tête de la Modal */}
        <div className="px-7 pt-6 pb-4 flex items-center justify-between border-b border-gray-100">
          <div className="flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shadow-xs">
              <UserPlus className="w-5 h-5" />
            </div>
            <div>
              <h2 className="text-base font-extrabold text-gray-900 tracking-tight flex items-center gap-2">
                Nouveau Agent de Scan
              </h2>
              <p className="text-xs text-gray-400">
                Générez instantanément ses accès à l'application mobile.
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={onClose}
            className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Alerte Erreur */}
        {error && (
          <div className="mx-7 mt-4 p-3 rounded-2xl bg-red-50 border border-red-200 text-xs font-semibold text-red-700 flex items-center gap-2">
            <AlertCircle className="w-4 h-4 text-red-500 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Formulaire */}
        <form onSubmit={handleSubmit} className="px-7 py-6 space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                Prénom
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="prenom"
                  value={formData.prenom}
                  onChange={handleChange}
                  placeholder="Jean"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005]/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                Nom
              </label>
              <div className="relative">
                <User className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                <input
                  type="text"
                  name="nom"
                  value={formData.nom}
                  onChange={handleChange}
                  placeholder="Dupont"
                  className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005]/20 transition-all"
                />
              </div>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Adresse Email (Identifiant de connexion) *
            </label>
            <div className="relative">
              <Mail className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="email"
                name="email"
                required
                value={formData.email}
                onChange={handleChange}
                placeholder="agent.scan@exemple.com"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005]/20 transition-all"
              />
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              Mot de passe par défaut *
            </label>
            <div className="relative">
              <Lock className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
              <input
                type="text"
                name="defaultPassword"
                required
                minLength={6}
                value={formData.defaultPassword}
                onChange={handleChange}
                placeholder="Ex: Scan2026Pass"
                className="w-full pl-10 pr-3 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-hidden focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005]/20 transition-all"
              />
            </div>
            <p className="text-[11px] text-gray-400 mt-1">
              L'agent utilisera cet identifiant et ce mot de passe temporaire pour se connecter à l'application mobile.
            </p>
          </div>

          <div className="pt-2">
            <label className="flex items-center gap-3 p-3.5 bg-gray-50 border border-gray-200 rounded-2xl cursor-pointer hover:border-gray-300 transition">
              <input
                type="checkbox"
                name="sendEmailNow"
                checked={formData.sendEmailNow}
                onChange={handleChange}
                className="w-4 h-4 rounded border-gray-300 text-[#FF5005] focus:ring-[#FF5005] accent-[#FF5005]"
              />
              <div className="text-xs">
                <span className="font-extrabold text-gray-900 block">Envoyer les identifiants par mail immédiatement</span>
                <span className="text-gray-400 text-[11px]">Transmet automatiquement les accès à l'adresse de l'agent.</span>
              </div>
            </label>
          </div>

          {/* Pied de page Actions */}
          <div className="pt-4 flex items-center justify-end gap-2 border-t border-gray-100">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Annuler
            </button>
            <button
              type="submit"
              disabled={loading}
              className="inline-flex items-center gap-1.5 px-5 py-2.5 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-black rounded-xl shadow-md shadow-orange-500/25 transition cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <span>Enregistrement...</span>
              ) : (
                <>
                  <Send className="w-3.5 h-3.5" />
                  <span>Enregistrer l'Agent</span>
                </>
              )}
            </button>
          </div>
        </form>

      </div>
    </div>
  );
};

export default AddAgentModal;
