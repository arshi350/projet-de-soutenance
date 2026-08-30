import React, { useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Play, TrendingUp, ShieldCheck, AlertOctagon, Server, Filter, Sparkles, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAdminStats } from '../../../hooks/useAdminStats';
import { useAuthContext } from '../../../context/AuthContext';

const AdminOverview = () => {
  const { token } = useAuthContext();
  const { stats, loading, error, fetchAdminStats } = useAdminStats();

  useEffect(() => {
    if (token) {
      fetchAdminStats(token);
    }
  }, [token, fetchAdminStats]);

  const topStatCards = useMemo(() => [
    {
      id: 'totalUsers',
      icon: <Users size={20} className="text-blue-600" />,
      label: 'Utilisateurs Totaux',
      value: stats?.totalUsers ?? '—',
      trend: '+12%',
      trendColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-blue-50 border-blue-200',
    },
    {
      id: 'totalEvents',
      icon: <Calendar size={20} className="text-[#FF5005]" />,
      label: 'Événements Créés',
      value: stats?.totalEvents ?? '—',
      trend: '+8%',
      trendColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-orange-50 border-orange-200',
    },
    {
      id: 'eventsInProgress',
      icon: <Play size={20} className="text-emerald-600" />,
      label: 'Événements en cours',
      value: stats?.eventsInProgress ?? '—',
      trend: 'Actifs',
      trendColor: 'text-orange-500 bg-orange-50 border-orange-200',
      iconBg: 'bg-emerald-50 border-emerald-200',
    },
    {
      id: 'activityRate',
      icon: <TrendingUp size={20} className="text-purple-600" />,
      label: "Taux d'activité Global",
      value: stats?.activityRate != null ? `${stats.activityRate}%` : '89.4%',
      trend: '+2.4%',
      trendColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      iconBg: 'bg-purple-50 border-purple-200',
    }
  ], [stats]);

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10 font-sans text-slate-900 max-w-7xl mx-auto">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8 text-left">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Administration Globale
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-0.5">
            Tableau de Bord Super Admin
          </h1>
          <p className="text-xs text-gray-400 mt-1">Supervision macroscopique des activités et de la sécurité.</p>
        </div>

        <div className="flex items-center gap-2 bg-white px-3.5 py-1.5 rounded-full border border-gray-200/80 shadow-xs">
          <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
          <span className="text-xs font-bold text-gray-700">Cluster Opérationnel</span>
        </div>
      </div>

      {loading && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-xs font-bold text-gray-500 shadow-xs flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-[#FF5005] border-t-transparent rounded-full animate-spin" />
          <span>Synchronisation des métriques en temps réel...</span>
        </div>
      )}

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {topStatCards.map((card) => (
          <motion.div 
            key={card.id}
            whileHover={{ y: -3 }}
            className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs text-left"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${card.iconBg}`}>
                {card.icon}
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${card.trendColor}`}>
                {card.trend}
              </span>
            </div>
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{card.label}</p>
              <p className="text-3xl font-black text-gray-900 tracking-tight">{card.value}</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Middle Section: Alerts & Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8 text-left">
        
        {/* Critical Alerts (4 cols) */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider">Alertes Système</h2>
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">
              3 actives
            </span>
          </div>
          
          <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-xs space-y-3">
            <AlertBox 
              icon={<ShieldCheck className="text-[#FF5005]" size={18}/>} 
              title="Vérification Manuelle" 
              desc="12 événements en attente d'approbation publique." 
              badge="Modération"
              badgeColor="bg-orange-50 text-[#FF5005]"
            />
            <AlertBox 
              icon={<AlertOctagon className="text-red-600" size={18}/>} 
              title="Signalement Spam" 
              desc="Signalement utilisateur sur 'Soirée X'." 
              badge="Urgent"
              badgeColor="bg-red-50 text-red-600"
            />
            <AlertBox 
              icon={<Server className="text-blue-600" size={18}/>} 
              title="Nœud de Calcul" 
              desc="EU-West-1 opérationnel à 99.98%." 
              badge="Serveur"
              badgeColor="bg-blue-50 text-blue-600"
            />
          </div>
        </div>

        {/* Growth Curve (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-extrabold text-sm text-gray-900">Croissance des Inscriptions</h2>
              <span className="text-[10px] text-gray-400">30 derniers jours</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">+24.5%</span>
          </div>
          <div className="h-36 w-full relative">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path 
                d="M0 35 Q 20 30, 40 25 T 70 15 T 100 5" 
                fill="none" stroke="#FF5005" strokeWidth="2.5" strokeLinecap="round"
              />
              <path 
                d="M0 35 Q 20 30, 40 25 T 70 15 T 100 5 L 100 40 L 0 40 Z" 
                fill="url(#gradientOrange)" opacity="0.15" 
              />
              <defs>
                <linearGradient id="gradientOrange" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#FF5005" />
                  <stop offset="100%" stopColor="transparent" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase">
            <span>Sem 1</span><span>Sem 2</span><span>Sem 3</span><span>Sem 4</span>
          </div>
        </div>

        {/* Event Breakdown (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <h2 className="font-extrabold text-sm text-gray-900 mb-4">Typologie des Événements</h2>
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center mb-4">
              <svg className="w-28 h-28 transform -rotate-90">
                <circle cx="56" cy="56" r="44" stroke="#f3f4f6" strokeWidth="10" fill="transparent" />
                <circle cx="56" cy="56" r="44" stroke="#FF5005" strokeWidth="10" fill="transparent" 
                  strokeDasharray="276" strokeDashoffset="120" strokeLinecap="round" />
              </svg>
              <span className="absolute text-xl font-black text-gray-900">{stats?.totalEvents ?? '42'}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-6 gap-y-1.5 text-[11px] font-semibold text-gray-600">
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-[#FF5005]"></span>
                <span>Festivals (40%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-blue-600"></span>
                <span>Galas (30%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500"></span>
                <span>Corporate (20%)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-amber-400"></span>
                <span>Webinars (10%)</span>
              </div>
            </div>
          </div>
        </div>

      </div>

      {/* Activity Table */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden text-left">
        <div className="p-5 border-b border-gray-100 flex justify-between items-center bg-gray-50/50">
          <div>
            <h2 className="font-extrabold text-sm text-gray-900">Journal d'Audit & Activité Récente</h2>
            <p className="text-[11px] text-gray-400">Flux d'événements plateforme en direct</p>
          </div>
          <button className="flex items-center gap-1.5 text-xs font-bold text-[#FF5005] bg-orange-50 px-3 py-1.5 rounded-xl border border-orange-200 cursor-pointer">
            <Filter size={12} /> Filtrer
          </button>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-left text-xs">
            <thead className="text-[10px] text-gray-400 uppercase tracking-widest bg-gray-50/80 border-b border-gray-100">
              <tr>
                <th className="px-6 py-3.5 font-bold">Heure</th>
                <th className="px-6 py-3.5 font-bold">Type</th>
                <th className="px-6 py-3.5 font-bold">Détails</th>
                <th className="px-6 py-3.5 font-bold text-right">Statut</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              <TableRow time="10:42" type="Utilisateur" typeBg="bg-blue-50 text-blue-600" desc="Nouvel organisateur enregistré : Tech Events SAS" status="Validé" statusDot="bg-emerald-500" />
              <TableRow time="09:35" type="Billetterie" typeBg="bg-orange-50 text-[#FF5005]" desc='Billetterie créée : "Gala Prestige 2026"' status="En ligne" statusDot="bg-emerald-500" />
              <TableRow time="08:15" type="Signalement" typeBg="bg-red-50 text-red-600" desc='Signalement pour vérification : "Soirée X"' status="En examen" statusDot="bg-orange-500" />
              <TableRow time="07:30" type="Paiement" typeBg="bg-emerald-50 text-emerald-600" desc="Abonnement souscrit : Plan VIP 49 000 FCFA" status="Réussi" statusDot="bg-emerald-500" />
            </tbody>
          </table>
        </div>
      </div>

    </div>
  );
};

const AlertBox = ({ icon, title, desc, badge, badgeColor }) => (
  <div className="p-3 bg-gray-50 border border-gray-100 rounded-2xl flex items-start gap-3">
    <div className="mt-0.5">{icon}</div>
    <div className="flex-1">
      <div className="flex justify-between items-center">
        <h4 className="text-xs font-bold text-gray-900">{title}</h4>
        <span className={`text-[9px] font-extrabold uppercase px-2 py-0.5 rounded-full ${badgeColor}`}>
          {badge}
        </span>
      </div>
      <p className="text-[11px] text-gray-500 mt-0.5 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const TableRow = ({ time, type, typeBg, desc, status, statusDot }) => (
  <tr className="hover:bg-gray-50/60 transition-colors">
    <td className="px-6 py-3.5 text-gray-400 font-mono text-[11px]">{time}</td>
    <td className="px-6 py-3.5">
      <span className={`${typeBg} text-[10px] font-extrabold px-2.5 py-1 rounded-lg uppercase tracking-wide`}>{type}</span>
    </td>
    <td className="px-6 py-3.5 font-semibold text-gray-800">{desc}</td>
    <td className="px-6 py-3.5 text-right">
      <div className="inline-flex items-center gap-1.5 text-[11px] font-bold text-gray-700">
        <div className={`w-1.5 h-1.5 rounded-full ${statusDot}`}></div>
        <span>{status}</span>
      </div>
    </td>
  </tr>
);

export default AdminOverview;
