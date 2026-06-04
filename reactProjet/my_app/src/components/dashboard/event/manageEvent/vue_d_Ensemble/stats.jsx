import React from 'react';
import { AlertTriangle, CheckCircle2, Users, Check, X, Hourglass } from 'lucide-react';

const safeNumber = (value) => (typeof value === 'number' && !Number.isNaN(value) ? value : 0);

export default function EventStats({ eventInfo }) {
  const event = eventInfo ?? {};
  const confirmed = safeNumber(event.confirmedGuests || event.participants || event.attendees || 0);
  const total = safeNumber(eventInfo.totalGuests || eventInfo.capacity || eventInfo.maxAttendees || 0);
  const present = safeNumber(eventInfo.attendees || confirmed);
  const absent = total > present ? total - present : 0;
  const waiting = safeNumber(eventInfo.pendingGuests || eventInfo.waitingGuests || Math.max(confirmed - present, 0));
  const presenceRate = total > 0 ? Math.round((present / total) * 100) : 0;
  const absenceRate = total > 0 ? Math.round((absent / total) * 100) : 0;

  const alertPending = waiting > 0 ? `${waiting} invité${waiting > 1 ? 's' : ''} n'ont pas encore scanné leur QR Code.` : 'Tous les invités ont scanné leur QR Code pour le moment.';
  const performanceText = total > 0 ? `Taux de présence actuel (${presenceRate}%)` : 'Statistiques de présence indisponibles.';

  return (
    <div className="px-60 font p-6 space-y-6 font-sans">
      
      {/* --- SECTION DES ALERTES (TOP) --- */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        
        {/* Alerte : Attention requise */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-[4px] border-[#A83A14] flex items-start gap-4">
          <div className="p-2 bg-[#FDF2E9] text-[#A83A14] rounded-lg shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-800">Attention requise</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {alertPending} Relance possible via l'onglet Invitations.
            </p>
          </div>
        </div>

        {/* Alerte : Performance optimale */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-[4px] border-[#10B981] flex items-start gap-4">
          <div className="p-2 bg-[#E6F4EA] text-[#10B981] rounded-lg shrink-0">
            <CheckCircle2 className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-bold text-gray-800">Performance optimale</h4>
            <p className="text-xs text-gray-500 leading-relaxed">
              {performanceText}
            </p>
          </div>
        </div>

      </div>

      {/* --- SECTION DES STATISTIQUES (BOTTOM) --- */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Carte : Total Invités */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-[4px] border-[#017EF7] flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[11px] tracking-wider uppercase">
            <Users className="w-3.5 h-3.5 text-red-400" /> {/* Remplacé subtilement selon le petit emoji du design */}
            <span>Total Invités</span>
          </div>
          <div className="text-3xl font-extrabold text-[#017EF7] mt-2">
            {total}
          </div>
        </div>

        {/* Carte : Présents */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-[4px] border-[#10B981] flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[11px] tracking-wider uppercase">
            <div className="bg-green-100 p-0.5 rounded text-green-700">
              <Check className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Présents</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#10B981]">{present}</span>
            <span className="text-xs font-semibold text-gray-500">({presenceRate}%)</span>
          </div>
        </div>

        {/* Carte : Absents */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-[4px] border-[#EF4444] flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[11px] tracking-wider uppercase">
            <div className="bg-red-100 p-0.5 rounded text-red-600">
              <X className="w-3 h-3 stroke-[3]" />
            </div>
            <span>Absents</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#EF4444]">{absent}</span>
            <span className="text-xs font-semibold text-gray-500">({absenceRate}%)</span>
          </div>
        </div>

        {/* Carte : En Attente */}
        <div className="bg-white rounded-xl p-5 shadow-sm border-l-[4px] border-[#F59E0B] flex flex-col justify-between min-h-[110px]">
          <div className="flex items-center gap-1.5 text-gray-500 font-bold text-[11px] tracking-wider uppercase">
            <Hourglass className="w-3.5 h-3.5 text-amber-500" />
            <span>En attente</span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-extrabold text-[#F59E0B]">{waiting}</span>
            <span className="text-xs font-semibold text-gray-500">{total > 0 ? `(${Math.round((waiting / total) * 100)}%)` : '(0%)'}</span>
          </div>
        </div>

      </div>

    </div>
  );
}