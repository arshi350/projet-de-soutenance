import React from 'react';
import { 
  Download, QrCode, Ticket, CheckCircle2, 
  Calendar, MapPin, Printer, Share2, Sparkles, User 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Carte E-Ticket Officielle Post-Achat avec QR Code sécurisé
 */
export const ETicketCard = ({
  ticket,
  event,
  apiBaseUrl = 'http://localhost:3000/api'
}) => {
  if (!ticket || !event) return null;

  const downloadPdfUrl = `${apiBaseUrl}/public/tickets/download/${ticket.qrCodeToken}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.96 }}
      animate={{ opacity: 1, scale: 1 }}
      className="bg-[#0E1522] border border-white/15 rounded-3xl overflow-hidden shadow-2xl relative text-left"
    >
      {/* Header décoratif avec dégradé */}
      <div className="h-2 bg-gradient-to-r from-[#FF5005] via-amber-400 to-[#FF3366]" />

      <div className="p-6 sm:p-8 flex flex-col lg:flex-row items-center justify-between gap-8">
        
        {/* Encoche demi-cercle séparatrice */}
        <div className="hidden lg:block absolute left-[65%] top-0 -translate-y-1/2 w-8 h-8 bg-[#090D16] border-b border-white/15 rounded-full" />
        <div className="hidden lg:block absolute left-[65%] bottom-0 translate-y-1/2 w-8 h-8 bg-[#090D16] border-t border-white/15 rounded-full" />

        {/* Partie Gauche : Détails de l'Événement et du Titulaire */}
        <div className="flex-1 space-y-5">
          
          <div className="flex flex-wrap items-center gap-2.5">
            <span className="px-3.5 py-1 bg-[#FF5005]/20 text-[#FF5005] font-extrabold text-xs uppercase tracking-wider rounded-full border border-[#FF5005]/30">
              {ticket.categoryName || 'Pass Officiel'}
            </span>
            <span className="font-mono text-xs text-slate-400">
              N° {ticket.ticketNumber}
            </span>
          </div>

          <h3 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
            {event.titre}
          </h3>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 text-xs">
            <div className="flex items-center gap-2.5 text-slate-300">
              <User size={16} className="text-[#FF5005] shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Titulaire</span>
                <span className="font-bold text-white text-sm">{ticket.buyerName}</span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300">
              <Calendar size={16} className="text-amber-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Date & Heure</span>
                <span className="font-bold text-white">
                  {new Date(event.DateDebut).toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' })} • {event.heureDebut}
                </span>
              </div>
            </div>

            <div className="flex items-center gap-2.5 text-slate-300 sm:col-span-2">
              <MapPin size={16} className="text-emerald-400 shrink-0" />
              <div>
                <span className="text-slate-400 block text-[10px] uppercase font-bold">Lieu d'accès</span>
                <span className="font-bold text-white line-clamp-1">{event.lieu}</span>
              </div>
            </div>
          </div>

          <div className="pt-2 flex flex-wrap items-center gap-3">
            <a
              href={downloadPdfUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="px-5 py-2.5 bg-[#FF5005] hover:bg-[#ff6420] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer"
            >
              <Download size={14} />
              <span>Télécharger le PDF</span>
            </a>

            <button
              type="button"
              onClick={handlePrint}
              className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center gap-2 transition cursor-pointer"
            >
              <Printer size={14} />
              <span>Imprimer</span>
            </button>
          </div>

        </div>

        {/* Ligne pointillée de découpe */}
        <div className="hidden lg:block w-px self-stretch border-r-2 border-dashed border-white/15 mx-4" />

        {/* Partie Droite : QR Code Haute Résolution */}
        <div className="flex flex-col items-center justify-center p-4 bg-white/[0.03] border border-white/10 rounded-2xl min-w-[200px] text-center space-y-3">
          {ticket.qrCodeImage ? (
            <div className="bg-white p-3 rounded-2xl shadow-xl">
              <img
                src={ticket.qrCodeImage}
                alt="QR Code d'accès sécurisé"
                className="w-36 h-36 object-contain"
              />
            </div>
          ) : (
            <div className="w-36 h-36 bg-white/10 rounded-2xl flex items-center justify-center text-slate-400">
              <QrCode size={48} />
            </div>
          )}

          <div className="space-y-0.5">
            <span className="text-[10px] font-black uppercase tracking-wider text-emerald-400 flex items-center justify-center gap-1">
              <CheckCircle2 size={12} /> Billet Certifié
            </span>
            <span className="text-[9px] text-slate-400 font-mono block">
              Scannage direct sur smartphone
            </span>
          </div>
        </div>

      </div>

      {/* Footer sécurité */}
      <div className="px-8 py-2.5 bg-black/40 border-t border-white/5 flex items-center justify-between text-[10px] text-slate-400 font-mono">
        <span>AUTHENTICATED BY SMART EVENT PROTOCOL</span>
        <span>STATUS: ACTIVE & VALID</span>
      </div>
    </motion.div>
  );
};

export default ETicketCard;
