import React, { useEffect, useState } from 'react';
import { TrendingUp, Users, Calendar, BarChart3, PieChart as PieIcon } from 'lucide-react';
import { motion } from 'framer-motion';
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  Legend, 
  PieChart, 
  Pie, 
  Cell, 
  AreaChart, 
  Area 
} from 'recharts';
import { useAdminAnalytics } from '../../../hooks/useAdminStats';

const COLORS = ['#FF5005', '#2563EB', '#10B981', '#F59E0B', '#8B5CF6', '#EC4899'];

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs font-sans border border-slate-700">
        <p className="font-extrabold uppercase tracking-wider text-[#FF5005] mb-1">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center justify-between gap-4 py-0.5">
            <span style={{ color: entry.color }} className="font-bold">{entry.name}:</span>
            <span className="font-black">{entry.value}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

const CustomPieTooltip = ({ active, payload }) => {
  if (active && payload && payload.length) {
    const data = payload[0];
    return (
      <div className="bg-slate-900 text-white p-3 rounded-2xl shadow-xl text-xs font-sans border border-slate-700">
        <p className="font-extrabold text-white mb-0.5">{data.name}</p>
        <p className="text-xs text-gray-300">Total : <span className="font-black text-[#FF5005]">{data.value}</span> ({data.payload.percentage}%)</p>
      </div>
    );
  }
  return null;
};

const AdminAnalytics = () => {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const { analytics, loading, fetchAnalytics } = useAdminAnalytics();
  const [period, setPeriod] = useState('30J');

  useEffect(() => {
    if (token) fetchAnalytics(token);
  }, [token, fetchAnalytics]);

  const categories = analytics?.categoryBreakdown || [
    { name: 'FESTIVALS', percentage: 40, count: 18 },
    { name: 'GALAS', percentage: 30, count: 12 },
    { name: 'CORPORATE', percentage: 20, count: 8 },
    { name: 'WEBINARS', percentage: 10, count: 4 }
  ];

  const series = analytics?.growthSeries || [
    { label: 'Sem 1', users: 15, events: 8 },
    { label: 'Sem 2', users: 28, events: 14 },
    { label: 'Sem 3', users: 45, events: 22 },
    { label: 'Sem 4', users: 62, events: 35 }
  ];

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10 font-sans text-slate-900 max-w-7xl mx-auto text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Analytique Avancée (Recharts Engine)
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-0.5">
            Analytique & Tendances Plateforme
          </h1>
          <p className="text-xs text-gray-400 mt-1">Supervision réactive des croissances d'inscriptions et de la typologie des événements.</p>
        </div>

        <div className="flex items-center gap-2 bg-white p-1.5 rounded-2xl border border-gray-200/80 shadow-xs">
          {['7J', '30J', '1 An'].map((p) => (
            <button
              key={p}
              onClick={() => setPeriod(p)}
              className={`px-4 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                period === p
                  ? 'bg-[#FF5005] text-white shadow-xs'
                  : 'text-gray-500 hover:text-gray-900'
              }`}
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* KPI Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 mb-8">
        <motion.div whileHover={{ y: -3 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-2xl bg-blue-50 border border-blue-200 flex items-center justify-center">
              <Users size={20} className="text-blue-600" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              +14.2%
            </span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Croissance Utilisateurs</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{analytics?.totalUsers ?? '—'}</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-2xl bg-orange-50 border border-orange-200 flex items-center justify-center">
              <Calendar size={20} className="text-[#FF5005]" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              +28%
            </span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Événements Totaux</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">{analytics?.totalEvents ?? '—'}</p>
        </motion.div>

        <motion.div whileHover={{ y: -3 }} className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-xs">
          <div className="flex justify-between items-start mb-4">
            <div className="w-11 h-11 rounded-2xl bg-purple-50 border border-purple-200 flex items-center justify-center">
              <TrendingUp size={20} className="text-purple-600" />
            </div>
            <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-600 border border-emerald-200">
              Optimal
            </span>
          </div>
          <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">Taux de Conversion Billet</p>
          <p className="text-3xl font-black text-gray-900 tracking-tight">94.8%</p>
        </motion.div>
      </div>

      {/* Main Charts Row with Recharts */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Recharts Bar/Area Chart (8 cols) */}
        <div className="lg:col-span-8 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="flex justify-between items-center mb-6">
            <div>
              <h2 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
                <BarChart3 size={16} className="text-[#FF5005]" /> Progression Chronologique (Recharts Engine)
              </h2>
              <span className="text-[11px] text-gray-400">Croissance des inscriptions et créations d'événements ({period})</span>
            </div>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%">
              <BarChart data={series} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <XAxis dataKey="label" tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <YAxis tickLine={false} axisLine={false} tick={{ fontSize: 11, fontWeight: 'bold', fill: '#94a3b8' }} />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ fontSize: 12, fontWeight: 'bold', paddingTop: 10 }} />
                <Bar dataKey="users" name="Inscriptions Utilisateurs" fill="#FF5005" radius={[6, 6, 0, 0]} barSize={24} />
                <Bar dataKey="events" name="Créations Événements" fill="#2563EB" radius={[6, 6, 0, 0]} barSize={24} />
              </BarChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Recharts Pie Chart (4 cols) */}
        <div className="lg:col-span-4 bg-white p-6 sm:p-8 rounded-3xl border border-gray-200/80 shadow-xs flex flex-col justify-between">
          <div className="mb-2">
            <h2 className="font-extrabold text-sm text-gray-900 flex items-center gap-2">
              <PieIcon size={16} className="text-purple-600" /> Typologie des Catégories
            </h2>
            <span className="text-[11px] text-gray-400">Répartition Recharts Pie Interactive</span>
          </div>

          <div className="h-52 w-full relative flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={categories}
                  cx="50%"
                  cy="50%"
                  innerRadius={50}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="count"
                  nameKey="name"
                >
                  {categories.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip content={<CustomPieTooltip />} />
              </PieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-1.5 pt-2 border-t border-gray-100">
            {categories.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-[11px] font-semibold">
                <div className="flex items-center gap-2">
                  <span className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }}></span>
                  <span className="text-gray-700">{cat.name}</span>
                </div>
                <span className="font-bold text-gray-900">{cat.percentage}% ({cat.count})</span>
              </div>
            ))}
          </div>
        </div>

      </div>

    </div>
  );
};

export default AdminAnalytics;
