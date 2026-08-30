import React, { useState } from 'react';
import { apiProcessEmailConciergeAI } from '../../../../../services/aiService';
import { toast } from 'react-hot-toast';
import { motion } from 'framer-motion';
import { Mail, X, Check, Copy, Sparkles, Send, MessageSquare } from 'lucide-react';

const EMAIL_SCENARIOS = [
  { 
    id: 'GUEST_REPLY', 
    label: 'Répondre à une interrogation', 
    desc: 'Clarification sur le parking, vestiaire, dress code, accompagnants.' 
  },
  { 
    id: 'REMINDER_J1', 
    label: 'Rappel d\'anticipation (J-1)', 
    desc: 'Email courtois rappelant la date, l\'adresse et le pass QR code.' 
  },
  { 
    id: 'VIP_ACCESS_INFO', 
    label: 'Protocole & Privilèges VIP', 
    desc: 'Instructions d\'accueil personnalisé, coupe-file et salon dédié.' 
  },
  { 
    id: 'THANK_YOU_POST_EVENT', 
    label: 'Remerciements & Galerie Photo', 
    desc: 'Message chaleureux post-événement avec rétrospective.' 
  },
  { 
    id: 'CUSTOM', 
    label: 'Message sur-mesure', 
    desc: 'Directives libres pour une communication protocolaire unique.' 
  }
];

export default function AiEmailConciergeModal({ isOpen, onClose, onApplyEmailText, eventData = {}, token }) {
  const [selectedScenario, setSelectedScenario] = useState('GUEST_REPLY');
  const [guestName, setGuestName] = useState('');
  const [guestStatus, setGuestStatus] = useState('classique');
  const [guestQuestion, setGuestQuestion] = useState('');
  const [customInstructions, setCustomInstructions] = useState('');
  const [loading, setLoading] = useState(false);
  const [conciergeResult, setConciergeResult] = useState(null);

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const payload = {
        eventId: eventData._id || eventData.id,
        emailType: selectedScenario,
        guestName: guestName.trim() || 'Invité(e)',
        guestStatus,
        guestQuestion: guestQuestion.trim(),
        customInstructions: customInstructions.trim(),
      };

      const res = await apiProcessEmailConciergeAI(payload, token);
      if (res.success && res.data) {
        setConciergeResult(res.data);
        toast.success('Email rédigé par le Concierge IA !');
      } else {
        toast.error(res.message || 'Erreur lors du traitement.');
      }
    } catch (err) {
      console.error('Erreur Concierge Email:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la génération.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = () => {
    if (!conciergeResult) return;
    const fullText = `Objet : ${conciergeResult.emailSubject}\n\n${conciergeResult.emailBody}`;
    navigator.clipboard.writeText(fullText);
    toast.success('Email copié dans le presse-papier !');
  };

  const handleApply = () => {
    if (!conciergeResult || !conciergeResult.emailBody) return;
    if (onApplyEmailText) {
      onApplyEmailText(conciergeResult.emailBody, conciergeResult.emailSubject);
    }
    toast.success('Email appliqué à l\'espace d\'expédition !');
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left font-sans border border-gray-200"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />
        
        {/* En-tête */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shadow-xs">
              <Mail size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Concierge Email & Relations Invités IA
              </h3>
              <p className="text-xs text-gray-400">
                Assistance rédactionnelle contextuelle
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
          
          {/* Sélection du scénario */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
              1. Type d'email à concevoir
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
              {EMAIL_SCENARIOS.map((sc) => {
                const isSelected = selectedScenario === sc.id;
                return (
                  <button
                    key={sc.id}
                    type="button"
                    onClick={() => setSelectedScenario(sc.id)}
                    className={`p-3 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5005] bg-orange-50/40 shadow-xs ring-1 ring-[#FF5005]'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-600'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-[#FF5005]' : 'text-gray-800'}`}>
                      {sc.label}
                    </div>
                    <div className="text-[11px] text-gray-400 mt-0.5 leading-tight">
                      {sc.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Destinataire & Statut */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                2. Destinataire
              </label>
              <input
                type="text"
                value={guestName}
                onChange={(e) => setGuestName(e.target.value)}
                placeholder="Ex: M. Dupont, Mme. Kuate..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-bold text-gray-800 focus:outline-none focus:border-[#FF5005]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                Rang
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
          </div>

          {/* Question si scénario GUEST_REPLY */}
          {selectedScenario === 'GUEST_REPLY' && (
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                3. Question posée par l'invité
              </label>
              <textarea
                value={guestQuestion}
                onChange={(e) => setGuestQuestion(e.target.value)}
                rows={2}
                placeholder="Ex: Le parking est-il inclus ? Puis-je venir avec un invité supplémentaire ?"
                className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF5005]"
              />
            </div>
          )}

          {/* Consignes */}
          <div>
            <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
              {selectedScenario === 'GUEST_REPLY' ? '4. Précisions pour la réponse' : '3. Consignes & Instructions'}
            </label>
            <input
              type="text"
              value={customInstructions}
              onChange={(e) => setCustomInstructions(e.target.value)}
              placeholder="Ex: Confirmer le vestiaire gratuit, insister sur le dress code cocktail..."
              className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs font-medium text-gray-800 focus:outline-none focus:border-[#FF5005]"
            />
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
              <span>Rédaction de l'email en cours...</span>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Rédiger l'email avec le Concierge IA</span>
              </>
            )}
          </button>

          {/* Résultat */}
          {conciergeResult && (
            <div className="mt-4 p-4 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-3 animate-fadeIn">
              <div className="flex items-center justify-between border-b border-orange-200 pb-2">
                <span className="text-xs font-extrabold text-gray-900">
                  Objet : {conciergeResult.emailSubject}
                </span>
                <button 
                  onClick={handleCopy}
                  className="text-[11px] text-[#FF5005] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                >
                  <Copy size={12} />
                  Copier
                </button>
              </div>

              <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-52 overflow-y-auto font-sans">
                {conciergeResult.emailBody}
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
            disabled={!conciergeResult}
            className={`px-6 py-2.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-xs cursor-pointer ${
              conciergeResult
                ? 'bg-emerald-600 hover:bg-emerald-500 text-white'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            Appliquer cet email
          </button>
        </div>

      </motion.div>
    </div>
  );
}
