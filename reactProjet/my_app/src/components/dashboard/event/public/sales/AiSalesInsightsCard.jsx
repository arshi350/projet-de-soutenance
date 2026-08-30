import React from 'react';
import { 
  Sparkles, 
  TrendingUp, 
  Zap, 
  AlertCircle, 
  CheckCircle2, 
  Share2, 
  ArrowUpRight,
  Flame,
  Lightbulb
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function AiSalesInsightsCard({ aiInsights = {}, eventInfo = {}, onNavigateMarketing }) {
  const {
    healthScore = 50,
    summary = '',
    tips = []
  } = aiInsights;

  const getHealthBadge = (score) => {
    if (score >= 80) {
      return {
        label: 'Excellente Performance',
        bg: 'bg-emerald-50 text-emerald-700 border-emerald-200',
        scoreColor: 'text-emerald-500'
      };
    }
    if (score >= 50) {
      return {
        label: 'Dynamique Positive',
        bg: 'bg-blue-50 text-blue-700 border-blue-200',
        scoreColor: 'text-blue-500'
      };
    }
    return {
      label: 'Optimisation Recommandée',
      bg: 'bg-amber-50 text-amber-700 border-amber-200',
      scoreColor: 'text-amber-500'
    };
  };

  const badgeInfo = getHealthBadge(healthScore);

  return (
    <div className="relative overflow-hidden bg-gradient-to-br from-slate-900 via-slate-900 to-indigo-950 text-white rounded-3xl p-6 sm:p-8 shadow-xl border border-slate-800 space-y-6">
      {/* Halo lumineux IA en arrière-plan */}
      <div className="absolute top-0 right-0 w-80 h-80 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />

      {/* En-tête */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-slate-800 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-gradient-to-tr from-indigo-500 to-purple-500 rounded-2xl text-white shadow-md">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="font-black text-base text-white">
                Smart Sales AI Insights & Diagnostic
              </h3>
              <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/30">
                Gemini 2.5 Pro
              </span>
            </div>
            <p className="text-xs text-slate-400 font-medium">
              Analyse automatisée des flux de réservation et recommandations prédictives
            </p>
          </div>
        </div>

        {/* Score de santé de la billetterie */}
        <div className="flex items-center gap-3 bg-slate-800/80 backdrop-blur-md px-4 py-2.5 rounded-2xl border border-slate-700/80 self-start sm:self-auto">
          <div className="text-right">
            <div className="text-[10px] uppercase font-bold text-slate-400">Score Billetterie</div>
            <div className={`text-base font-black ${badgeInfo.scoreColor}`}>{healthScore} / 100</div>
          </div>
          <div className="w-9 h-9 rounded-xl bg-slate-700/50 flex items-center justify-center text-amber-400">
            <Flame className="w-5 h-5" />
          </div>
        </div>
      </div>

      {/* Résumé exécutif */}
      {summary && (
        <div className="p-4 bg-slate-800/50 rounded-2xl border border-slate-700/50 text-xs sm:text-sm text-slate-200 leading-relaxed flex items-start gap-3">
          <Lightbulb className="w-5 h-5 text-amber-400 shrink-0 mt-0.5" />
          <div>
            <strong className="text-white">Synthèse IA :</strong> {summary}
          </div>
        </div>
      )}

      {/* Cartes de conseils IA */}
      {tips && tips.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {tips.map((tip, idx) => {
            const isSuccess = tip.level === 'success';
            const isWarning = tip.level === 'warning';
            return (
              <motion.div
                key={idx}
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ duration: 0.3, delay: idx * 0.05 }}
                className="bg-slate-800/60 backdrop-blur-md border border-slate-700/70 hover:border-indigo-500/50 p-5 rounded-2xl transition-all duration-200 flex flex-col justify-between space-y-3"
              >
                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    {isSuccess ? (
                      <CheckCircle2 className="w-4 h-4 text-emerald-400 shrink-0" />
                    ) : isWarning ? (
                      <AlertCircle className="w-4 h-4 text-amber-400 shrink-0" />
                    ) : (
                      <Zap className="w-4 h-4 text-indigo-400 shrink-0" />
                    )}
                    <h4 className="font-extrabold text-white text-xs">
                      {tip.title}
                    </h4>
                  </div>
                  <p className="text-slate-300 text-xs leading-relaxed">
                    {tip.message}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>
      ) : (
        <div className="text-xs text-slate-400 text-center py-2">
          Aucun avertissement particulier. La billetterie est prête à recevoir les réservations.
        </div>
      )}
    </div>
  );
}
