import React, { useState } from 'react';
import { 
  Calendar, Clock, MapPin, Users, Share2, 
  Check, Navigation, ExternalLink, Sparkles 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Barre d'informations rapides (Quick Stats / Meta)
 * Affiche la date, l'heure, le lieu avec ouverture de carte, et la jauge de participants.
 */
export const QuickInfoBar = ({ 
  event, 
  onOpenCalendar,
  totalAvailableTickets = null,
  totalCapacity = null 
}) => {
  const [copied, setCopied] = useState(false);

  if (!event) return null;

  const formatDate = (dateStr) => {
    try {
      const d = new Date(dateStr);
      return d.toLocaleDateString('fr-FR', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      });
    } catch {
      return dateStr || '';
    }
  };

  const handleShare = async () => {
    const url = window.location.href;
    if (navigator.share) {
      try {
        await navigator.share({
          title: event.titre,
          text: `Découvrez la billetterie officielle pour ${event.titre} !`,
          url: url
        });
        return;
      } catch {
        // Fallback copier dans le presse-papier
      }
    }

    try {
      await navigator.clipboard.writeText(url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      // Ignorer
    }
  };

  const googleMapsUrl = `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(event.lieu || '')}`;

  return (
    <div className="bg-[#0E1522]/95 border border-white/10 backdrop-blur-xl rounded-3xl p-6 shadow-2xl">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 items-center">
        
        {/* 1. Date & Ajout Calendrier */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-[#FF5005]/15 border border-[#FF5005]/30 flex items-center justify-center text-[#FF5005] shrink-0">
            <Calendar size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Date de l'événement
            </span>
            <p className="font-black text-sm text-white capitalize leading-tight">
              {formatDate(event.DateDebut)}
            </p>
            <button
              type="button"
              onClick={onOpenCalendar}
              className="text-[11px] font-bold text-[#FF5005] hover:text-[#ff7438] flex items-center gap-1 transition cursor-pointer pt-0.5"
            >
              + Ajouter à l'agenda
            </button>
          </div>
        </div>

        {/* 2. Horaires */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/15 border border-amber-500/30 flex items-center justify-center text-amber-400 shrink-0">
            <Clock size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Horaires d'ouverture
            </span>
            <p className="font-black text-sm text-white leading-tight">
              {event.heureDebut || '19:00'} — {event.heureFin || '23:30'}
            </p>
            <span className="text-[11px] text-slate-400 font-medium block">
              Fuseau horaire local (UTC+1)
            </span>
          </div>
        </div>

        {/* 3. Lieu & Maps */}
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/15 border border-emerald-500/30 flex items-center justify-center text-emerald-400 shrink-0">
            <MapPin size={22} />
          </div>
          <div className="space-y-1">
            <span className="text-[11px] font-extrabold uppercase tracking-wider text-slate-400 block">
              Lieu & Accès
            </span>
            <p className="font-black text-sm text-white line-clamp-1 leading-tight" title={event.lieu}>
              {event.lieu || 'Lieu communiqué aux inscrits'}
            </p>
            <a
              href={googleMapsUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[11px] font-bold text-emerald-400 hover:text-emerald-300 flex items-center gap-1 transition cursor-pointer pt-0.5"
            >
              <Navigation size={12} />
              Voir l'itinéraire Maps
            </a>
          </div>
        </div>

        {/* 4. Boutons d'Action & Partage */}
        <div className="flex items-center justify-between lg:justify-end gap-3 pt-4 md:pt-0 border-t md:border-t-0 border-white/10">
          <button
            type="button"
            onClick={handleShare}
            className="flex-1 lg:flex-initial px-4 py-3 bg-white/[0.06] hover:bg-white/[0.12] border border-white/15 rounded-2xl text-xs font-extrabold uppercase tracking-wider text-white flex items-center justify-center gap-2 transition cursor-pointer active:scale-95"
          >
            {copied ? (
              <>
                <Check size={16} className="text-emerald-400" />
                <span>Lien Copié !</span>
              </>
            ) : (
              <>
                <Share2 size={16} className="text-slate-300" />
                <span>Partager</span>
              </>
            )}
          </button>
        </div>

      </div>
    </div>
  );
};

export default QuickInfoBar;
