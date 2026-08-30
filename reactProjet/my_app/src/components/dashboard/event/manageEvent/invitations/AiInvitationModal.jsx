import React, { useState } from 'react';
import { apiGenerateInvitationAI } from '../../../../../services/aiService';
import { toast } from 'react-hot-toast';
import { motion, AnimatePresence } from 'framer-motion';
import { Sparkles, X, Check, ArrowRight, Crown, MessageSquare, Send } from 'lucide-react';

const TONE_OPTIONS = [
  { id: 'luxe', label: 'Luxe & Prestigieux', description: 'Vocabulaire raffiné, protocolaire et distinction absolue.' },
  { id: 'chaleureux', label: 'Chaleureux & Convivial', description: 'Bienveillant, convivial et touchant.' },
  { id: 'festif', label: 'Festif & Énergique', description: 'Dynamique, enthousiaste et rythmé.' },
  { id: 'pro', label: 'Professionnel & B2B', description: 'Sobre, clair et courtois pour les événements corporate.' }
];

export default function AiInvitationModal({ isOpen, onClose, onApplyText, eventData = {}, token }) {
  const [selectedTone, setSelectedTone] = useState(TONE_OPTIONS[0].label);
  const [guestStatus, setGuestStatus] = useState('classique');
  const [customDetails, setCustomDetails] = useState('');
  const [loading, setLoading] = useState(false);
  const [generatedResult, setGeneratedResult] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const payload = {
        eventId: eventData._id || eventData.id,
        eventTitle: eventData.titre || eventData.title || 'Événement',
        eventType: eventData.typeEvenement || eventData.category || 'Soirée',
        guestStatus,
        tone: selectedTone,
        details: customDetails,
      };

      const res = await apiGenerateInvitationAI(payload, token);
      if (res.success && res.data) {
        setGeneratedResult(res.data);
        toast.success('Message rédigé avec succès par Gemini IA !');
      } else {
        toast.error(res.message || 'Erreur de génération');
      }
    } catch (err) {
      console.error('Erreur génération IA:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la génération avec l\'IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleApply = () => {
    if (!generatedResult || !generatedResult.fullInvitation) return;
    if (onApplyText) {
      onApplyText(generatedResult.fullInvitation, generatedResult.subject);
    }
    toast.success('Texte appliqué avec succès !');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left font-sans border border-gray-200"
      >
        {/* En-tête ARSHI EVENT */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />
        
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shadow-xs">
              <Sparkles size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Rédacteur d'Invitations IA
              </h3>
              <p className="text-xs text-gray-400">
                Génération personnalisée assistée par Gemini Pro Event
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Sélection du style */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
              1. Tonalité de l'invitation
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {TONE_OPTIONS.map((t) => {
                const isSelected = selectedTone === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.label)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5005] bg-orange-50/40 shadow-xs ring-1 ring-[#FF5005]'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-[#FF5005]' : 'text-gray-800'}`}>
                      {t.label}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {t.description}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Type d'accès et détails */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                2. Rang de l'invité
              </label>
              <select
                value={guestStatus}
                onChange={(e) => setGuestStatus(e.target.value)}
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FF5005]"
              >
                <option value="classique">Invité Classique</option>
                <option value="vip">Invité VIP (Privilège)</option>
              </select>
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                3. Consignes particulières (Optionnel)
              </label>
              <input
                type="text"
                value={customDetails}
                onChange={(e) => setCustomDetails(e.target.value)}
                placeholder="Ex: Tenue de soirée exigée, vestiaire privé..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF5005]"
              />
            </div>
          </div>

          {/* Bouton de génération */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              loading
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-[#FF5005] hover:bg-[#ff6220] text-white shadow-orange-500/25'
            }`}
          >
            {loading ? (
              <span>Rédaction par l'IA en cours...</span>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Rédiger le message avec l'IA</span>
              </>
            )}
          </button>

          {/* Résultat */}
          {generatedResult && (
            <div className="mt-4 p-4 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-2 animate-fadeIn">
              <div className="flex items-center justify-between">
                <span className="text-[10px] font-extrabold text-[#FF5005] uppercase tracking-wider">
                  Proposition Rédigée
                </span>
                {generatedResult.subject && (
                  <span className="text-[10px] bg-white border border-orange-200 text-gray-700 px-2 py-0.5 rounded-md font-mono">
                    Objet : {generatedResult.subject}
                  </span>
                )}
              </div>

              <div className="bg-white p-3.5 rounded-xl border border-gray-200 text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-48 overflow-y-auto font-sans">
                {generatedResult.fullInvitation}
              </div>
            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Fermer
          </button>

          <button
            type="button"
            onClick={handleApply}
            disabled={!generatedResult}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
              generatedResult
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Appliquer ce texte
          </button>
        </div>

      </motion.div>
    </div>
  );
}
