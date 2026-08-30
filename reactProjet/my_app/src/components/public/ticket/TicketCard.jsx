import React from 'react';
import { Check, Sparkles, AlertCircle, Users, Zap, Shield } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Composant de Carte de Billet Skeuomorphique Réaliste
 * Dispose d'une découpe crantée (notches), d'une ligne de perforation en pointillés,
 * d'une tranche latérale contrastée et d'un sélecteur de quantité interactif.
 */
export const TicketCard = ({
  category,
  quantity = 0,
  onQuantityChange,
  currency = 'FCFA'
}) => {
  const isSoldOut = category.isSoldOut || category.availableCount <= 0;
  const isSelected = quantity > 0;
  const isUrgent = !isSoldOut && category.availableCount <= 10;

  // Tranche de couleur thématique selon la catégorie
  const getThemeColor = () => {
    const name = (category.name || '').toLowerCase();
    if (name.includes('vip') || name.includes('gold') || name.includes('premium')) {
      return {
        accent: '#EFB810',
        badgeBg: 'bg-amber-500/15',
        badgeText: 'text-amber-300',
        badgeBorder: 'border-amber-500/30',
        stripe: 'from-amber-500 to-amber-300',
        glow: 'shadow-amber-500/10'
      };
    }
    if (name.includes('early') || name.includes('promo') || name.includes('flash')) {
      return {
        accent: '#FF5005',
        badgeBg: 'bg-orange-500/15',
        badgeText: 'text-orange-400',
        badgeBorder: 'border-orange-500/30',
        stripe: 'from-[#FF5005] to-[#FF7A00]',
        glow: 'shadow-orange-500/15'
      };
    }
    if (name.includes('backstage') || name.includes('artiste') || name.includes('pass')) {
      return {
        accent: '#8B5CF6',
        badgeBg: 'bg-purple-500/15',
        badgeText: 'text-purple-300',
        badgeBorder: 'border-purple-500/30',
        stripe: 'from-purple-500 to-indigo-500',
        glow: 'shadow-purple-500/15'
      };
    }
    return {
      accent: '#017EF7',
      badgeBg: 'bg-blue-500/15',
      badgeText: 'text-blue-300',
      badgeBorder: 'border-blue-500/30',
      stripe: 'from-[#017EF7] to-[#00F0FF]',
      glow: 'shadow-blue-500/10'
    };
  };

  const theme = getThemeColor();

  return (
    <motion.div
      initial={{ opacity: 0, y: 15 }}
      animate={{ opacity: 1, y: 0 }}
      whileHover={!isSoldOut ? { scale: 1.01 } : {}}
      transition={{ duration: 0.2 }}
      className={`relative rounded-3xl overflow-hidden border transition-all duration-300 ${
        isSoldOut
          ? 'bg-[#121826]/60 border-white/5 opacity-60 grayscale-[0.8]'
          : isSelected
          ? 'bg-[#151D2F] border-[#FF5005] shadow-xl shadow-[#FF5005]/10 scale-[1.01]'
          : 'bg-[#111726]/90 border-white/10 hover:border-white/20 hover:bg-[#151D2F]/90 shadow-lg'
      }`}
    >
      {/* Tranche de couleur verticale sur le bord gauche (accent ticket) */}
      <div className={`absolute left-0 top-0 bottom-0 w-2.5 bg-gradient-to-b ${theme.stripe}`} />

      {/* Contenu de la carte */}
      <div className="pl-6 pr-6 py-6 flex flex-col md:flex-row justify-between gap-6">
        
        {/* Partie Gauche : Infos Ticket */}
        <div className="flex-1 space-y-3">
          <div className="flex flex-wrap items-center gap-2">
            <span className={`text-[11px] font-extrabold uppercase px-3 py-1 rounded-full border ${theme.badgeBg} ${theme.badgeText} ${theme.badgeBorder}`}>
              {category.name || 'Billet Standard'}
            </span>

            {isSoldOut ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-rose-500/20 text-rose-300 border border-rose-500/30">
                Épuisé
              </span>
            ) : isUrgent ? (
              <span className="text-[10px] font-bold uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/30 flex items-center gap-1 animate-pulse">
                <Sparkles size={10} />
                Plus que {category.availableCount} restant(s) !
              </span>
            ) : null}
          </div>

          <p className="text-xs text-slate-300 leading-relaxed max-w-xl">
            {category.description || "Accès standard à l'événement. Inclut l'entrée générale et l'accès à toutes les zones publiques."}
          </p>

          {/* Avantages inclus */}
          {category.perks && category.perks.length > 0 && (
            <div className="flex flex-wrap gap-2 pt-1">
              {category.perks.map((perk, idx) => (
                <span key={idx} className="text-[11px] font-medium text-slate-300 bg-white/5 border border-white/10 px-2.5 py-1 rounded-xl flex items-center gap-1.5">
                  <Check size={12} className="text-emerald-400" />
                  {perk}
                </span>
              ))}
            </div>
          )}
        </div>

        {/* Ligne de perforation verticale pour écran large */}
        <div className="hidden md:flex flex-col items-center justify-between relative px-2">
          {/* Encoche haute (notch) */}
          <div className="w-5 h-5 bg-[#0A0D14] rounded-full -mt-9 border border-white/10" />
          {/* Ligne pointillée */}
          <div className="w-[1px] h-full border-r-2 border-dashed border-white/20 my-1" />
          {/* Encoche basse (notch) */}
          <div className="w-5 h-5 bg-[#0A0D14] rounded-full -mb-9 border border-white/10" />
        </div>

        {/* Partie Droite : Prix & Contrôles Quantité */}
        <div className="flex sm:flex-col items-center md:items-end justify-between gap-4 md:min-w-[180px] pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
          
          <div className="text-left md:text-right">
            <div className="flex items-baseline md:justify-end gap-1">
              <span className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                {category.price === 0 ? "Gratuit" : `${category.price.toLocaleString('fr-FR')}`}
              </span>
              {category.price > 0 && (
                <span className="text-sm sm:text-base font-bold text-[#FF5005]">{currency}</span>
              )}
            </div>
            <span className="text-[11px] text-slate-400 font-medium block">
              TVA et frais inclus
            </span>
          </div>

          {/* Sélecteur de quantité */}
          <div className="flex items-center gap-2 bg-[#090D16] border border-white/15 rounded-2xl p-1.5 shadow-inner">
            <button
              type="button"
              disabled={isSoldOut || quantity <= 0}
              onClick={() => onQuantityChange(category.id, -1, category.availableCount)}
              aria-label="Diminuer la quantité"
              className="w-9 h-9 rounded-xl bg-white/5 hover:bg-white/10 text-white font-bold text-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95"
            >
              -
            </button>

            <span className="w-8 text-center font-black text-base text-white select-none">
              {quantity}
            </span>

            <button
              type="button"
              disabled={isSoldOut || quantity >= (category.availableCount || 10)}
              onClick={() => onQuantityChange(category.id, 1, category.availableCount)}
              aria-label="Augmenter la quantité"
              className="w-9 h-9 rounded-xl bg-[#FF5005] hover:bg-[#ff6724] text-white font-bold text-lg flex items-center justify-center transition disabled:opacity-30 disabled:cursor-not-allowed cursor-pointer active:scale-95 shadow-lg shadow-orange-500/25"
            >
              +
            </button>
          </div>

        </div>

      </div>

      {/* Code-barres décoratif en bas du ticket */}
      <div className="px-6 py-2 bg-black/30 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span className="tracking-widest uppercase opacity-70">REF: {category.id.slice(-8).toUpperCase()}</span>
        <div className="flex items-center gap-1 opacity-40">
          <span className="inline-block w-1.5 h-3 bg-white" />
          <span className="inline-block w-0.5 h-3 bg-white" />
          <span className="inline-block w-2 h-3 bg-white" />
          <span className="inline-block w-1 h-3 bg-white" />
          <span className="inline-block w-3 h-3 bg-white" />
          <span className="inline-block w-0.5 h-3 bg-white" />
          <span className="inline-block w-1.5 h-3 bg-white" />
        </div>
        <span className="tracking-widest uppercase opacity-70">SECURITY EMBEDDED</span>
      </div>

    </motion.div>
  );
};

export default TicketCard;
