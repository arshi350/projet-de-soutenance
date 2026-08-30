import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { AlertTriangle, CheckCircle2, Users, Check, X, Hourglass, QrCode, ShieldAlert, Sparkles, TrendingUp, ShieldCheck } from 'lucide-react';
import axios from 'axios';
import { motion } from 'framer-motion';

const API_BASE = 'http://localhost:3000/api';

export default function EventStats({ eventInfo }) {
  const { eventId: routeEventId } = useParams();
  const eventId = eventInfo?._id || eventInfo?.id || routeEventId;

  const [scanData, setScanData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchScanStats = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/scan/stats/${eventId}`);
        if (res.data.success) {
          setScanData(res.data);
        }
      } catch (err) {
        console.warn("Erreur chargement scan stats :", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchScanStats();
    const interval = setInterval(fetchScanStats, 15000);
    return () => clearInterval(interval);
  }, [eventId]);

  const stats = scanData?.stats || {
    total: eventInfo?.totalInvites || eventInfo?.pricing?.maxCapacity || 0,
    scanned: eventInfo?.confirmedInvites || 0,
    present: eventInfo?.confirmedInvites || 0,
    absent: 0,
    waiting: eventInfo?.totalInvites || 0,
    scanRate: 0,
    presenceRate: 0,
    absenceRate: 0
  };

  const isPublic = eventInfo?.eventType === 'public' || scanData?.eventType === 'public';

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6 font-sans text-left text-slate-900">
      
      {/* SECTION DES ALERTES DE SÉCURITÉ */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        
        {/* Alerte Contrôle d'Accès */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 border-l-4 border-l-amber-500 flex items-start gap-4">
          <div className="p-3 bg-amber-50 text-amber-600 rounded-2xl shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-gray-900">Contrôle d'Accès & Affluence</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              {stats.waiting > 0 
                ? `${stats.waiting} ${isPublic ? 'billet(s)' : 'invité(s)'} n'ont pas encore validé leur pass au portique.`
                : `Tous les ${isPublic ? 'billets vendus' : 'invités'} ont validé leur entrée.`}
            </p>
          </div>
        </div>

        {/* Alerte Sécurité Anti-Fraude */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 border-l-4 border-l-emerald-500 flex items-start gap-4">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl shrink-0">
            <ShieldCheck className="w-5 h-5" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-extrabold text-gray-900">Protocole Cryptographique Anti-Fraude Actif</h4>
            <p className="text-xs text-gray-400 leading-relaxed">
              Validation atomique en temps réel ({stats.scanRate}% de scans effectués). Blocage instantané des doublons QR actif.
            </p>
          </div>
        </div>

      </div>

      {/* CARTES DE STATISTIQUES KPIS */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        
        {/* Carte 1 : Total Billets / Invités */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center justify-between text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Users className="w-4 h-4 text-[#FF5005]" />
              <span>{isPublic ? 'Total Billets' : 'Total Invités'}</span>
            </div>
            <span className="text-[9px] bg-orange-50 text-[#FF5005] px-2 py-0.5 rounded-full font-bold">
              {isPublic ? 'Public' : 'Privé'}
            </span>
          </div>
          <div className="text-3xl font-black text-gray-900 mt-2">
            {stats.total}
          </div>
          <span className="text-[11px] text-gray-400">Jauge enregistrée</span>
        </div>

        {/* Carte 2 : Billets Scannés / Présents */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center justify-between text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <QrCode className="w-4 h-4 text-emerald-500" />
              <span>Entrées Validées</span>
            </div>
            <span className="text-[9px] bg-emerald-50 text-emerald-600 px-2 py-0.5 rounded-full font-bold">
              {stats.presenceRate}%
            </span>
          </div>
          <div className="flex items-baseline gap-2 mt-2">
            <span className="text-3xl font-black text-emerald-600">{stats.scanned}</span>
            <span className="text-xs font-bold text-gray-400">/ {stats.total}</span>
          </div>
          <span className="text-[11px] text-gray-400">Portique d'honneur validé</span>
        </div>

        {/* Carte 3 : Absents / Révoqués */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center justify-between text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <X className="w-4 h-4 text-red-500" />
              <span>Absents / Refusés</span>
            </div>
            <span className="text-[9px] bg-red-50 text-red-600 px-2 py-0.5 rounded-full font-bold">
              {stats.absenceRate}%
            </span>
          </div>
          <div className="text-3xl font-black text-red-600 mt-2">
            {stats.absent}
          </div>
          <span className="text-[11px] text-gray-400">Non-présentés ou refus RSVP</span>
        </div>

        {/* Carte 4 : En Attente */}
        <div className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between min-h-[130px]">
          <div className="flex items-center justify-between text-gray-400 font-extrabold text-[10px] uppercase tracking-wider">
            <div className="flex items-center gap-1.5">
              <Hourglass className="w-4 h-4 text-[#EFB810]" />
              <span>En Attente</span>
            </div>
            <span className="text-[9px] bg-amber-50 text-amber-700 px-2 py-0.5 rounded-full font-bold">
              {stats.total > 0 ? Math.round((stats.waiting / stats.total) * 100) : 0}%
            </span>
          </div>
          <div className="text-3xl font-black text-[#EFB810] mt-2">
            {stats.waiting}
          </div>
          <span className="text-[11px] text-gray-400">Pass en attente de présentation</span>
        </div>

      </div>

    </div>
  );
}