import { useState } from 'react';
import { Sparkles, ShieldCheck, Zap, Plus, X, CreditCard, ArrowRight } from 'lucide-react';
import axios from 'axios';
import { toast } from 'react-hot-toast';

const API_BASE = 'http://localhost:3000/api';

export const QuotaUpgradeModal = ({ eventId, currentCapacity, onUpgradeSuccess, onClose }) => {
  const [selectedExtra, setSelectedExtra] = useState(50);
  const [customExtra, setCustomExtra] = useState('');
  const [loading, setLoading] = useState(false);

  const additionalGuests = customExtra ? parseInt(customExtra, 10) || 0 : selectedExtra;
  // Coût au prorata : 15 FCFA par invité par défaut
  const estimatedCost = (additionalGuests * 15).toLocaleString('fr-FR');

  const handleUpgrade = async () => {
    if (additionalGuests <= 0) return;

    try {
      setLoading(true);
      const token = localStorage.getItem('accessToken');
      const res = await axios.post(`${API_BASE}/event/${eventId}/upgrade-quota`, {
        additionalGuests
      }, {
        headers: { Authorization: `Bearer ${token}` }
      });

      if (res.data.success) {
        toast.success(`Jauge étendue avec succès à ${res.data.newCapacity} invités !`);
        if (onUpgradeSuccess) onUpgradeSuccess(res.data.newCapacity);
        onClose();
      }
    } catch (err) {
      console.error("Erreur upgrade quota :", err);
      toast.error(err.response?.data?.message || "Erreur lors de l'extension de jauge.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm animate-fadeIn">
      <div className="bg-slate-900 border border-slate-800 rounded-3xl p-6 sm:p-8 max-w-lg w-full shadow-2xl space-y-6 text-left relative overflow-hidden">
        
        {/* Header */}
        <div className="flex items-center justify-between border-b border-slate-800/80 pb-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-2xl bg-indigo-500/20 text-indigo-400 flex items-center justify-center">
              <Zap className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-black text-white">Augmenter la Capacité</h3>
              <p className="text-xs text-slate-400">Capacité actuelle : <span className="text-white font-bold">{currentCapacity} invités</span></p>
            </div>
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-white p-2 rounded-xl bg-slate-800/50">
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Sélection des packs */}
        <div className="space-y-4">
          <label className="block text-xs font-bold text-slate-300 uppercase tracking-wider">
            Sélectionnez un pack d'extension d'invités :
          </label>
          <div className="grid grid-cols-3 gap-3">
            {[20, 50, 100].map((count) => (
              <button
                key={count}
                type="button"
                onClick={() => { setSelectedExtra(count); setCustomExtra(''); }}
                className={`py-3 px-4 rounded-xl border text-center font-bold transition ${
                  selectedExtra === count && !customExtra
                    ? 'border-indigo-500 bg-indigo-500/20 text-white shadow-lg shadow-indigo-500/20'
                    : 'border-slate-800 bg-slate-950 text-slate-400 hover:border-slate-700'
                }`}
              >
                <div className="text-base font-black">+{count}</div>
                <div className="text-[10px] opacity-70">invités</div>
              </button>
            ))}
          </div>

          <div>
            <label className="block text-xs text-slate-400 mb-1">Ou saisissez un nombre personnalisé :</label>
            <input
              type="number"
              min="1"
              placeholder="Ex: 150"
              value={customExtra}
              onChange={(e) => setCustomExtra(e.target.value)}
              className="w-full bg-slate-950 border border-slate-800 rounded-xl px-4 py-2.5 text-white font-bold text-sm focus:outline-none focus:border-indigo-500"
            />
          </div>

          {/* Récapitulatif calcul prorata */}
          <div className="p-4 bg-slate-950 border border-slate-800 rounded-xl space-y-2">
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Nouvelle capacité totale :</span>
              <span className="font-bold text-white">{currentCapacity + additionalGuests} invités</span>
            </div>
            <div className="flex justify-between text-slate-400 text-xs">
              <span>Tarif unitaire prorata :</span>
              <span className="font-bold text-white">15 FCFA / invité</span>
            </div>
            <div className="border-t border-slate-800 pt-2 flex justify-between items-baseline">
              <span className="font-bold text-white text-sm">Montant de l'Upgrade :</span>
              <span className="text-xl font-black text-indigo-400">{estimatedCost} FCFA</span>
            </div>
          </div>
        </div>

        <div className="flex gap-3 pt-2">
          <button
            type="button"
            onClick={onClose}
            className="flex-1 py-3 bg-slate-800 hover:bg-slate-700 text-slate-300 font-semibold rounded-xl text-xs transition"
          >
            Annuler
          </button>
          <button
            type="button"
            disabled={loading || additionalGuests <= 0}
            onClick={handleUpgrade}
            className="flex-1 py-3 bg-gradient-to-r from-indigo-600 to-violet-600 hover:from-indigo-500 hover:to-violet-500 text-white font-bold rounded-xl text-xs flex items-center justify-center gap-2 shadow-lg shadow-indigo-600/30 transition disabled:opacity-50"
          >
            {loading ? 'Paiement en cours...' : `Payer ${estimatedCost} FCFA & Débloquer`}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuotaUpgradeModal;
