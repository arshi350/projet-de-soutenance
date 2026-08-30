import React from 'react';
import { X, Calendar, Download, ExternalLink } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Modal et Générateur d'export Agenda (Google Calendar, Apple Calendar .ics, Outlook)
 */
export const AddToCalendarModal = ({ isOpen, onClose, event }) => {
  if (!isOpen || !event) return null;

  // Formater les dates pour Google Calendar (format YYYYMMDDTHHmmssZ)
  const formatGoogleDate = (dateStr, timeStr = '00:00') => {
    try {
      const d = new Date(dateStr);
      const [hours, minutes] = (timeStr || '00:00').split(':').map(Number);
      d.setHours(hours || 0, minutes || 0, 0, 0);
      return d.toISOString().replace(/-|:|\.\d+/g, '');
    } catch {
      return '';
    }
  };

  const startDateFormatted = formatGoogleDate(event.DateDebut, event.heureDebut);
  const endDateFormatted = formatGoogleDate(event.DateFin || event.DateDebut, event.heureFin || event.heureDebut);

  const googleCalendarUrl = `https://calendar.google.com/calendar/render?action=TEMPLATE&text=${encodeURIComponent(
    event.titre || ''
  )}&dates=${startDateFormatted}/${endDateFormatted}&details=${encodeURIComponent(
    event.description || ''
  )}&location=${encodeURIComponent(event.lieu || '')}&sf=true&output=xml`;

  const outlookUrl = `https://outlook.live.com/calendar/0/deeplink/compose?subject=${encodeURIComponent(
    event.titre || ''
  )}&startdt=${new Date(event.DateDebut).toISOString()}&enddt=${new Date(
    event.DateFin || event.DateDebut
  ).toISOString()}&body=${encodeURIComponent(event.description || '')}&location=${encodeURIComponent(
    event.lieu || ''
  )}`;

  // Génération et téléchargement du fichier .ics pour Apple Calendar
  const handleDownloadICS = () => {
    const icsContent = [
      'BEGIN:VCALENDAR',
      'VERSION:2.0',
      'PRODID:-//EventPro Billetterie//FR',
      'CALSCALE:GREGORIAN',
      'BEGIN:VEVENT',
      `SUMMARY:${event.titre}`,
      `DESCRIPTION:${(event.description || '').replace(/\n/g, '\\n')}`,
      `LOCATION:${event.lieu || ''}`,
      `DTSTART:${startDateFormatted}`,
      `DTEND:${endDateFormatted}`,
      `STATUS:CONFIRMED`,
      'END:VEVENT',
      'END:VCALENDAR'
    ].join('\r\n');

    const blob = new Blob([icsContent], { type: 'text/calendar;charset=utf-8' });
    const link = document.createElement('a');
    link.href = window.URL.createObjectURL(blob);
    link.setAttribute('download', `${(event.titre || 'evenement').replace(/\s+/g, '_')}.ics`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <AnimatePresence>
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        {/* Backdrop */}
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
          className="absolute inset-0 bg-black/80 backdrop-blur-md"
        />

        {/* Modal Content */}
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 15 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 15 }}
          className="relative bg-[#0E1522] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl text-left z-10"
        >
          <div className="flex items-center justify-between pb-4 border-b border-white/10">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-[#FF5005]/15 border border-[#FF5005]/30 flex items-center justify-center text-[#FF5005]">
                <Calendar size={20} />
              </div>
              <div>
                <h3 className="text-lg font-black text-white">Ajouter à mon agenda</h3>
                <p className="text-xs text-slate-400">Ne manquez pas cet événement</p>
              </div>
            </div>
            <button
              onClick={onClose}
              className="p-2 rounded-xl text-slate-400 hover:text-white hover:bg-white/10 transition cursor-pointer"
            >
              <X size={18} />
            </button>
          </div>

          <div className="space-y-3 pt-6">
            {/* Google Calendar */}
            <a
              href={googleCalendarUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition group text-white cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-blue-500/20 text-blue-400 flex items-center justify-center font-bold text-sm">
                  G
                </div>
                <div>
                  <div className="font-bold text-sm">Google Calendar</div>
                  <div className="text-[11px] text-slate-400">Synchronisation en ligne directe</div>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-[#FF5005] transition" />
            </a>

            {/* Apple Calendar (.ics) */}
            <button
              type="button"
              onClick={handleDownloadICS}
              className="w-full flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition group text-white cursor-pointer text-left"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-purple-500/20 text-purple-400 flex items-center justify-center font-bold text-sm">
                  
                </div>
                <div>
                  <div className="font-bold text-sm">Apple Calendar & iCal</div>
                  <div className="text-[11px] text-slate-400">Télécharger le fichier .ics (iOS / Mac)</div>
                </div>
              </div>
              <Download size={16} className="text-slate-400 group-hover:text-[#FF5005] transition" />
            </button>

            {/* Outlook */}
            <a
              href={outlookUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center justify-between p-4 rounded-2xl bg-white/[0.04] hover:bg-white/[0.08] border border-white/10 transition group text-white cursor-pointer"
            >
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-xl bg-cyan-500/20 text-cyan-400 flex items-center justify-center font-bold text-sm">
                  O
                </div>
                <div>
                  <div className="font-bold text-sm">Outlook & Office 365</div>
                  <div className="text-[11px] text-slate-400">Ajout dans Outlook Web</div>
                </div>
              </div>
              <ExternalLink size={16} className="text-slate-400 group-hover:text-[#FF5005] transition" />
            </a>
          </div>

          <div className="mt-6 pt-4 border-t border-white/10 flex justify-end">
            <button
              onClick={onClose}
              className="px-5 py-2.5 rounded-xl bg-white/10 hover:bg-white/15 text-white font-bold text-xs uppercase tracking-wider transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </motion.div>
      </div>
    </AnimatePresence>
  );
};

export default AddToCalendarModal;
