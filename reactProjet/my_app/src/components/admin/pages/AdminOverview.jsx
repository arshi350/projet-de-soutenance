import React, { useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Play, TrendingUp, ShieldCheck, AlertOctagon, Server, Filter 
} from 'lucide-react';
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
      icon: <Users size={20} />,
      label: 'Utilisateurs totaux',
      value: stats?.totalUsers ?? '—',
      trend: '+12%',
      color: 'bg-blue-600'
    },
    {
      id: 'totalEvents',
      icon: <Calendar size={20} />,
      label: 'Événements créés',
      value: stats?.totalEvents ?? '—',
      trend: '+8%',
      color: 'bg-orange-500'
    },
    {
      id: 'eventsInProgress',
      icon: <Play size={20} />,
      label: 'Événements en cours',
      value: stats?.eventsInProgress ?? '—',
      trend: '+5',
      color: 'bg-emerald-500'
    },
    {
      id: 'activityRate',
      icon: <TrendingUp size={20} />,
      label: "Taux d'activité",
      value: stats?.activityRate != null ? `${stats.activityRate}%` : '—',
      trend: '+2%',
      color: 'white',
      border: true
    }
  ], [stats]);

  return (
    <div className="min-h-screen bg-gray-50 px-55 py-8 text-slate-800 font-sans">
      <header className="mb-8">
        <h1 className="text-2xl font-bold">Tableau de bord</h1>
        <p className="text-gray-500 text-sm">Vue d'ensemble de la plateforme</p>
      </header>

      {loading && (
        <div className="mb-6 rounded-2xl border border-gray-200 bg-white p-4 text-sm text-gray-600 shadow-sm">
          Chargement des statistiques...
        </div>
      )}

      {error && (
        <div className="mb-6 rounded-2xl border border-red-200 bg-red-50 p-4 text-sm text-red-700 shadow-sm">
          Erreur lors du chargement des statistiques : {error.message || String(error)}
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {topStatCards.map((card) => (
          <StatCard key={card.id} {...card} />
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 mb-8">
        <div className="lg:col-span-4 space-y-4">
          <div className="flex justify-between items-center mb-2">
            <h2 className="font-bold text-lg">Alertes critiques</h2>
            <button className="text-orange-600 text-sm font-medium">Voir tout</button>
          </div>
          <AlertBox 
            icon={<ShieldCheck className="text-orange-700" size={20}/>} 
            title="Validation requise" 
            desc="12 événements en attente de vérification manuelle." 
            color="bg-orange-50 border-orange-100" 
          />
          <AlertBox 
            icon={<AlertOctagon className="text-red-700" size={20}/>} 
            title="Signalement Spam" 
            desc="Signalements critiques sur la 'Soirée X'. Intervention immédiate requise." 
            color="bg-red-50 border-red-100" 
          />
          <AlertBox 
            icon={<Server className="text-blue-700" size={20}/>} 
            title="Status Serveur" 
            desc="Latence élevée détectée sur le nœud de calcul EU-West-1." 
            color="bg-blue-50 border-blue-100" 
          />
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <div className="flex justify-between items-center mb-6">
            <h2 className="font-semibold">Évolution inscriptions</h2>
            <span className="text-xs text-gray-400">30 derniers jours</span>
          </div>
          <div className="h-40 w-full relative">
            <svg viewBox="0 0 100 40" className="w-full h-full">
              <path 
                d="M0 35 Q 20 30, 40 25 T 70 15 T 100 5" 
                fill="none" stroke="#f97316" strokeWidth="1.5" 
              />
              <path 
                d="M0 35 Q 20 30, 40 25 T 70 15 T 100 5 L 100 40 L 0 40 Z" 
                fill="url(#gradient)" opacity="0.2" 
              />
              <defs>
                <linearGradient id="gradient" x1="0" x2="0" y1="0" y2="1">
                  <stop offset="0%" stopColor="#f97316" />
                  <stop offset="100%" stopColor="white" />
                </linearGradient>
              </defs>
            </svg>
          </div>
          <div className="flex justify-between mt-4 text-[10px] text-gray-400 font-medium">
            <span>Sem 1</span><span>Sem 2</span><span>Sem 3</span><span>Sem 4</span>
          </div>
        </div>

        <div className="lg:col-span-4 bg-white p-6 rounded-2xl border border-gray-100 shadow-sm">
          <h2 className="font-semibold mb-6">Répartition événements</h2>
          <div className="flex flex-col items-center">
            <div className="relative flex items-center justify-center mb-6">
              <svg className="w-32 h-32 transform -rotate-90">
                <circle cx="64" cy="64" r="50" stroke="#f3f4f6" strokeWidth="12" fill="transparent" />
                <circle cx="64" cy="64" r="50" stroke="#9a3412" strokeWidth="12" fill="transparent" 
                  strokeDasharray="314" strokeDashoffset="204" strokeLinecap="round" />
              </svg>
              <span className="absolute text-xl font-bold text-slate-700">{stats?.totalEvents ?? '—'}</span>
            </div>
            <div className="grid grid-cols-2 gap-x-8 gap-y-2 text-[11px] font-medium">
              <LegendItem color="bg-orange-800" label="Conf. (35%)" />
              <LegendItem color="bg-blue-600" label="Galas (25%)" />
              <LegendItem color="bg-emerald-400" label="After. (20%)" />
              <LegendItem color="bg-orange-200" label="Web. (15%)" />
            </div>
          </div>
        </div>
      </div>

      <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
        <div className="p-4 bg-gray-50/50 border-b border-gray-100 flex justify-between items-center">
          <h2 className="font-semibold text-sm">Activité récente</h2>
          <button className="flex items-center gap-2 text-xs font-medium text-blue-600">
            <Filter size={14} /> Filtrer
          </button>
        </div>
        <table className="w-full text-left text-sm">
          <thead className="text-[11px] text-gray-400 uppercase bg-gray-50/30">
            <tr>
              <th className="px-6 py-3 font-semibold">Heure</th>
              <th className="px-6 py-3 font-semibold">Type</th>
              <th className="px-6 py-3 font-semibold">Description</th>
              <th className="px-6 py-3 font-semibold">Statut</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-50">
            <TableRow time="10:42" type="Utilisateur" typeColor="bg-blue-100 text-blue-600" desc="Nouvel utilisateur Jean Dupont" status="Confirmé" statusColor="text-emerald-500" dot="bg-emerald-500" />
            <TableRow time="09:35" type="Événement" typeColor="bg-orange-100 text-orange-600" desc='Nouvel événement "Gala Tech 2025"' status="En attente" statusColor="text-orange-500" dot="bg-orange-500" />
            <TableRow time="08:15" type="Signalement" typeColor="bg-red-100 text-red-600" desc='Contenu inapproprié "Soirée X"' status="Urgent" statusColor="text-red-500" isAlert />
            <TableRow time="07:30" type="Paiement" typeColor="bg-emerald-100 text-emerald-600" desc="Paiement reçu 49€ - Invoice #882" status="Succès" statusColor="text-emerald-500" dot="bg-emerald-500" />
          </tbody>
        </table>
        <button className="w-full py-3 text-xs text-gray-400 font-medium hover:bg-gray-50 transition-colors">
          Afficher plus d'activités
        </button>
      </div>
    </div>
  );
};

const StatCard = ({ icon, label, value, trend, color, border, isRating }) => (
  <div className={`${color === 'white' ? 'bg-white' : color} ${border ? 'border border-gray-100' : ''} p-4 rounded-2xl shadow-sm relative overflow-hidden`}>
    <div className={`mb-3 ${color === 'white' ? 'text-blue-600' : 'text-white/80'}`}>
      {icon}
    </div>
    <div className={`text-[10px] uppercase font-bold mb-1 ${color === 'white' ? 'text-gray-400' : 'text-white/70'}`}>
      {label}
    </div>
    <div className={`text-xl font-bold ${color === 'white' ? 'text-slate-800' : 'text-white'}`}>
      {value}
    </div>
    <span className={`absolute top-3 right-3 text-[10px] font-bold px-1.5 py-0.5 rounded-full ${color === 'white' ? (isRating ? 'bg-orange-100 text-orange-600' : 'bg-blue-50 text-blue-500') : 'bg-white/20 text-white'}`}>
      {trend}
    </span>
  </div>
);

const AlertBox = ({ icon, title, desc, color }) => (
  <div className={`${color} border-l-4 p-4 rounded-r-xl flex gap-4 items-start`}>
    <div className="mt-0.5">{icon}</div>
    <div>
      <h4 className="text-sm font-bold text-slate-800">{title}</h4>
      <p className="text-xs text-slate-600 leading-relaxed">{desc}</p>
    </div>
  </div>
);

const LegendItem = ({ color, label }) => (
  <div className="flex items-center gap-2">
    <div className={`w-2 h-2 rounded-full ${color}`}></div>
    <span className="text-gray-500 whitespace-nowrap">{label}</span>
  </div>
);

const TableRow = ({ time, type, typeColor, desc, status, statusColor, dot, isAlert }) => (
  <tr className="hover:bg-gray-50/50 transition-colors">
    <td className="px-6 py-4 text-gray-500 font-medium">{time}</td>
    <td className="px-6 py-4">
      <span className={`${typeColor} text-[10px] font-bold px-2 py-1 rounded-full uppercase`}>{type}</span>
    </td>
    <td className="px-6 py-4 font-semibold text-slate-700">{desc}</td>
    <td className="px-6 py-4">
      <div className={`flex items-center gap-2 text-[11px] font-bold ${statusColor}`}>
        {isAlert ? <span className="text-xs">⚠️</span> : <div className={`w-1.5 h-1.5 rounded-full ${dot}`}></div>}
        {status}
      </div>
    </td>
  </tr>
);

export default AdminOverview;
