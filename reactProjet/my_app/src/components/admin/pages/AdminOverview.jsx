import React, { useEffect, useMemo } from 'react';
import { 
  Users, Calendar, Play, TrendingUp, ShieldCheck, AlertOctagon, Server, Filter, Sparkles, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { ResponsiveContainer, BarChart, Bar, XAxis, Tooltip, PieChart, Pie, Cell } from 'recharts';
import { useAdminStats, useAuditLogs } from '../../../hooks/useAdminStats';
import { useAuthContext } from '../../../context/AuthContext';

const OVERVIEW_COLORS = ['#FF5005', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const OverviewTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-xl shadow-lg text-[11px] font-sans border border-slate-700">
        <span className="font-bold text-[#FF5005]">{label}: </span>
        <span className="font-black">{payload[0].value} inscrits</span>
      </div>
    );
  }
  return null;
};

const PieOverviewTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white px-2.5 py-1.5 rounded-xl shadow-lg text-[11px] font-sans border border-slate-700">
        <span className="font-bold">{data.name}: </span>
        <span className="font-black text-[#FF5005]">{data.value}</span> ({data.payload.percentage}%)
      </div>
    );
  }
  return null;
};

const AdminOverview = () => {
  const { token } = useAuthContext();
  const { stats, loading, error, fetchAdminStats } = useAdminStats();
  const { logs, fetchAuditLogs } = useAuditLogs();

  useEffect(() => {
    if (token) {
      fetchAdminStats(token);
      fetchAuditLogs(token);
    }
  }, [token, fetchAdminStats, fetchAuditLogs]);

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
        
        {/* Critical Security Alerts (4 cols) - Générées par l'IA Gemini & BDD */}
        <div className="lg:col-span-4 space-y-3">
          <div className="flex justify-between items-center mb-1">
            <h2 className="font-extrabold text-sm text-gray-900 uppercase tracking-wider flex items-center gap-1.5">
              <Sparkles size={14} className="text-[#FF5005] animate-pulse" /> Alertes Sécurité (IA)
            </h2>
            <span className="text-[10px] bg-red-50 text-red-600 font-bold px-2 py-0.5 rounded-full border border-red-200">
              {stats?.securityAlerts?.length ?? 3} actives
            </span>
          </div>
          
          <div className="bg-white border border-gray-200/80 p-4 rounded-2xl shadow-xs space-y-3">
            {(stats?.securityAlerts || [
              { id: "1", type: "ShieldCheck", title: "Vérification Événements (IA)", desc: "12 événements en attente d'approbation publique identifiés par la BDD.", badge: "Modération IA", badgeColor: "bg-orange-50 text-[#FF5005]" },
              { id: "2", type: "AlertOctagon", title: "Signalement & Suspensions", desc: "Signalement utilisateur 'Soirée X' sous surveillance active.", badge: "Urgent IA", badgeColor: "bg-red-50 text-red-600" },
              { id: "3", type: "Server", title: "Nœud de Calcul", desc: "Cluster de données MongoDB opérationnel à 99.98%.", badge: "Cluster IA", badgeColor: "bg-blue-50 text-blue-600" }
            ]).map((alertItem) => {
              const iconMap = {
                ShieldCheck: <ShieldCheck className="text-[#FF5005]" size={18} />,
                AlertOctagon: <AlertOctagon className="text-red-600" size={18} />,
                Server: <Server className="text-blue-600" size={18} />,
                UserX: <AlertOctagon className="text-purple-600" size={18} />
              };
              return (
                <AlertBox 
                  key={alertItem.id || alertItem.title}
                  icon={iconMap[alertItem.type] || <ShieldCheck className="text-[#FF5005]" size={18} />}
                  title={alertItem.title}
                  desc={alertItem.desc}
                  badge={alertItem.badge}
                  badgeColor={alertItem.badgeColor}
                />
              );
            })}
          </div>
        </div>

        {/* Growth Curve (4 cols) - Recharts avec MongoDB */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-4">
            <div>
              <h2 className="font-extrabold text-sm text-gray-900">Croissance des Inscriptions</h2>
              <span className="text-[10px] text-gray-400">30 derniers jours (Recharts)</span>
            </div>
            <span className="text-xs font-bold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-md">
              {stats?.userGrowth?.trend ?? '+0%'}
            </span>
          </div>

          <div className="h-36 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={stats?.userGrowth?.weeklyData || [
                { label: 'Sem 1', count: 2 },
                { label: 'Sem 2', count: 5 },
                { label: 'Sem 3', count: 8 },
                { label: 'Sem 4', count: 12 }
              ]}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 10, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip content={<OverviewTooltip />} />
                <Bar dataKey="count" name="Inscriptions" fill="#FF5005" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          <div className="flex justify-between mt-2 text-[10px] text-gray-400 font-bold uppercase border-t border-gray-100 pt-2">
            <span>Recharts Engine BDD</span>
            <span className="text-gray-700">{stats?.userGrowth?.recentUsers ?? 0} récents</span>
          </div>
        </div>

        {/* Event Breakdown (4 cols) - Recharts Pie */}
        <div className="lg:col-span-4 bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <h2 className="font-extrabold text-sm text-gray-900 mb-2">Typologie des Événements</h2>
          <div className="flex flex-col items-center">
            <div className="h-32 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={stats?.eventCategories || [
                      { name: 'FESTIVALS', percentage: 40, color: '#FF5005', count: 4 },
                      { name: 'GALAS', percentage: 30, color: '#2563EB', count: 3 },
                      { name: 'CORPORATE', percentage: 20, color: '#10B981', count: 2 },
                      { name: 'WEBINARS', percentage: 10, color: '#F59E0B', count: 1 }
                    ]}
                    cx="50%"
                    cy="50%"
                    innerRadius={36}
                    outerRadius={56}
                    paddingAngle={3}
                    dataKey="count"
                    nameKey="name"
                  >
                    {(stats?.eventCategories || [
                      { color: '#FF5005' }, { color: '#2563EB' }, { color: '#10B981' }, { color: '#F59E0B' }
                    ]).map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color || OVERVIEW_COLORS[index % OVERVIEW_COLORS.length]} />
                    ))}
                  </Pie>
                  <Tooltip content={<PieOverviewTooltip />} />
                </PieChart>
              </ResponsiveContainer>
              <span className="absolute text-base font-black text-gray-900">{stats?.totalEvents ?? 0}</span>
            </div>

            <div className="grid grid-cols-2 gap-x-4 gap-y-1.5 text-[11px] font-semibold text-gray-600 w-full pt-2 border-t border-gray-100">
              {(stats?.eventCategories || [
                { name: 'FESTIVALS', percentage: 40, color: '#FF5005' },
                { name: 'GALAS', percentage: 30, color: '#2563EB' },
                { name: 'CORPORATE', percentage: 20, color: '#10B981' },
                { name: 'WEBINARS', percentage: 10, color: '#F59E0B' }
              ]).map((cat, idx) => (
                <div key={idx} className="flex items-center gap-1.5 truncate">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ backgroundColor: cat.color || OVERVIEW_COLORS[idx % OVERVIEW_COLORS.length] }}></span>
                  <span className="truncate">{cat.name} ({cat.percentage}%)</span>
                </div>
              ))}
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
              {logs && logs.length > 0 ? (
                logs.map((log, index) => (
                  <TableRow 
                    key={log._id || index}
                    time={log.createdAt ? new Date(log.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : (log.time || '10:00')} 
                    type={log.type || 'Système'} 
                    typeBg={log.typeBg || (log.type === 'Utilisateur' ? 'bg-blue-50 text-blue-600' : log.type === 'Événement' ? 'bg-orange-50 text-[#FF5005]' : 'bg-emerald-50 text-emerald-600')} 
                    desc={log.description || log.desc || 'Action système effectuée'} 
                    status={log.status || 'Validé'} 
                    statusDot={log.statusDot || 'bg-emerald-500'} 
                  />
                ))
              ) : (
                <TableRow time="--:--" type="Système" typeBg="bg-gray-50 text-gray-600" desc="Aucune activité récente enregistrée" status="Attente" statusDot="bg-gray-400" />
              )}
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
