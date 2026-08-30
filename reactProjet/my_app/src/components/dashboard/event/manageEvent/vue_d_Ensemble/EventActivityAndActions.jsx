import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams, useParams } from 'react-router-dom';
import { History, QrCode, Calendar, MapPin, Users, Info, ShieldCheck, AlertCircle, ArrowRight, Sparkles, Megaphone, CheckCircle2 } from 'lucide-react';
import axios from 'axios';
import { useAuthContext } from '../../../../../context/AuthContext';

const API_BASE = 'http://localhost:3000/api';

const formatDate = (value) => {
  if (!value) return 'À l’instant';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return value;
  return new Intl.DateTimeFormat('fr-FR', {
    hour: '2-digit',
    minute: '2-digit',
    day: '2-digit',
    month: 'short'
  }).format(date);
};

export default function EventActivityAndActions({ eventInfo }) {
  const [searchParams, setSearchParams] = useSearchParams();
  const navigate = useNavigate();
  const { eventId: routeEventId } = useParams();
  const eventId = eventInfo?._id || eventInfo?.id || routeEventId;
  const { token } = useAuthContext();
  const isPublic = eventInfo?.eventType === 'public';

  const [scanStats, setScanStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchRecentScans = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/scan/stats/${eventId}`);
        if (res.data.success) {
          setScanStats(res.data);
        }
      } catch (err) {
        console.warn("Erreur scans récents :", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchRecentScans();
    const interval = setInterval(fetchRecentScans, 15000);
    return () => clearInterval(interval);
  }, [eventId]);

  const recentScans = scanStats?.recentScans || [];

  const handleVoirTout = () => {
    const params = new URLSearchParams(searchParams);
    params.set('tab', 'invites');
    setSearchParams(params, { replace: true });
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans grid grid-cols-1 lg:grid-cols-3 gap-6 text-left">
      
      {/* Journal des Scans d'Entrée en Temps Réel (2 cols) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 lg:col-span-2 flex flex-col justify-between">
        <div>
          <div className="flex items-center justify-between mb-6 border-b border-gray-100 pb-4">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                <History className="w-5 h-5" />
              </div>
              <div>
                <h3 className="text-base font-extrabold text-gray-900">Scans & Contrôles d'Accès Récent</h3>
                <p className="text-xs text-gray-400">Journal en direct des billets validés aux portiques</p>
              </div>
            </div>
            <button onClick={handleVoirTout} className="text-xs font-bold text-[#FF5005] hover:underline cursor-pointer">
              Voir tous les invités
            </button>
          </div>

          {loading && recentScans.length === 0 ? (
            <div className="py-12 text-center text-xs text-gray-400">Synchronisation des entrées en direct...</div>
          ) : recentScans.length === 0 ? (
            <div className="rounded-2xl border border-dashed border-gray-200 bg-gray-50/50 p-8 text-center text-xs text-gray-400">
              Aucun scan enregistré pour le moment. Lancez l'application mobile pour débuter le contrôle.
            </div>
          ) : (
            <div className="space-y-2.5">
              {recentScans.map((scan) => (
                <div
                  key={scan.id}
                  className="flex items-center justify-between p-3.5 rounded-2xl border border-gray-100 bg-gray-50/50 hover:bg-gray-50 transition"
                >
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] font-black text-xs flex items-center justify-center">
                      {scan.name ? scan.name.slice(0, 2).toUpperCase() : 'OK'}
                    </div>
                    <div>
                      <h4 className="font-bold text-xs text-gray-900">{scan.name}</h4>
                      <div className="flex items-center gap-2 text-[10px] text-gray-400">
                        <span className="font-mono">{scan.ticketNumber}</span>
                        <span>•</span>
                        <span className="font-semibold text-[#FF5005]">{scan.category}</span>
                      </div>
                    </div>
                  </div>

                  <div className="text-right">
                    <span className="inline-flex items-center gap-1 text-[10px] font-extrabold text-emerald-600 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-md uppercase">
                      <ShieldCheck className="w-3 h-3" /> Validé
                    </span>
                    <span className="block text-[10px] text-gray-400 mt-0.5">{formatDate(scan.scannedAt)}</span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Raccourcis Rapides & Copilote (1 col) */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 shadow-xs border border-gray-200/80 space-y-5 flex flex-col justify-between">
        <div className="space-y-4">
          <h3 className="text-base font-extrabold text-gray-900 border-b border-gray-100 pb-3">
            Outils & Actions Rapides
          </h3>

          {/* Bouton Marketing IA - Uniquement pour les événements publics */}
          {isPublic && (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('tab', 'marketing');
                setSearchParams(params, { replace: true });
              }}
              className="w-full p-4 rounded-2xl bg-gradient-to-r from-[#0B1727] to-[#1A2C4B] hover:opacity-95 text-white font-bold text-xs shadow-md flex items-center justify-between transition cursor-pointer"
            >
              <div className="flex items-center gap-2.5">
                <Megaphone className="w-4 h-4 text-[#FF5005]" />
                <span>Générateur Marketing IA</span>
              </div>
              <span className="text-[10px] bg-[#FF5005] px-2 py-0.5 rounded-md text-white font-bold flex items-center gap-1">
                <span>Gemini</span>
                <Sparkles size={11} />
              </span>
            </button>
          )}

          <div className="p-4 bg-gray-50 border border-gray-200/80 rounded-2xl space-y-2 text-xs text-gray-600">
            <div className="flex items-center gap-2 font-bold text-gray-900">
              <QrCode className="w-4 h-4 text-[#FF5005]" />
              <span>Application Mobile de Scan</span>
            </div>
            <p className="text-[11px] leading-relaxed text-gray-500">
              Synchronisez vos contrôleurs d'accès avec l'app <strong>mobileAppScann</strong>.
            </p>
            <div className="pt-2 border-t border-gray-200/60">
              <span className="text-[9px] font-bold uppercase text-gray-400 block">Code Événement :</span>
              <span className="text-sm font-black text-gray-900 font-mono tracking-wider">{eventInfo?.EventCode || 'ARSHI2026'}</span>
            </div>
          </div>
        </div>

        <div className="pt-2">
          {eventInfo?.eventType === 'public' ? (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('tab', 'billetterie');
                setSearchParams(params, { replace: true });
              }}
              className="w-full py-3 bg-[#FF5005] hover:bg-[#ff6220] text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-md shadow-orange-500/20 cursor-pointer"
            >
              <span>Billetterie Publique</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => {
                const params = new URLSearchParams(searchParams);
                params.set('tab', 'invites');
                setSearchParams(params, { replace: true });
              }}
              className="w-full py-3 bg-[#0B1727] hover:bg-black text-white rounded-xl text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 transition shadow-sm cursor-pointer"
            >
              <span>Gérer les Invités & RSVP</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          )}
        </div>

      </div>

    </div>
  );
}