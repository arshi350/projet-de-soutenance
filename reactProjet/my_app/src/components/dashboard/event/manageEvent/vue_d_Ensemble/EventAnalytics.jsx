import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { TrendingUp, PieChart as PieIcon, Layers, Sparkles, Clock, QrCode } from 'lucide-react';
import axios from 'axios';
import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

const API_BASE = 'http://localhost:3000/api';
const COLORS = ['#FF5005', '#EFB810', '#10B981', '#0B1727', '#8B5CF6'];

export default function EventAnalytics({ eventInfo }) {
  const { eventId: routeEventId } = useParams();
  const eventId = eventInfo?._id || eventInfo?.id || routeEventId;

  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchAnalytics = async () => {
      if (!eventId) return;
      try {
        setLoading(true);
        const res = await axios.get(`${API_BASE}/scan/stats/${eventId}`);
        if (res.data.success) {
          setAnalyticsData(res.data);
        }
      } catch (err) {
        console.warn("Erreur chargement analytique :", err.message);
      } finally {
        setLoading(false);
      }
    };

    fetchAnalytics();
    const interval = setInterval(fetchAnalytics, 20000);
    return () => clearInterval(interval);
  }, [eventId]);

  const timelineData = analyticsData?.timeline || [
    { time: '08h00', presence: 0 },
    { time: '12h00', presence: 0 },
    { time: '16h00', presence: 0 },
    { time: '20h00', presence: 0 }
  ];

  const categoryDistribution = analyticsData?.categoryDistribution || [
    { name: 'Standard', total: 10, scanned: 0 },
    { name: 'VIP', total: 5, scanned: 0 }
  ];

  const pieData = categoryDistribution.map(c => ({
    name: c.name,
    value: c.total || 1
  }));

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-2 font-sans space-y-6 text-left text-slate-900">
      
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        
        {/* Flux Temporel des Scans */}
        <div className="lg:col-span-8 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-orange-50 text-[#FF5005] rounded-2xl">
                <TrendingUp className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Flux des Scans d'Entrée en Temps Réel</h3>
                <p className="text-xs text-gray-400">Passages certifiés par tranche horaire</p>
              </div>
            </div>
            <span className="text-xs font-mono font-bold text-[#FF5005] bg-orange-50 border border-orange-200/60 px-3 py-1 rounded-xl">
              Live Monitoring
            </span>
          </div>

          <div className="h-64 w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={200}>
              <AreaChart data={timelineData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                <defs>
                  <linearGradient id="scanGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#FF5005" stopOpacity={0.4} />
                    <stop offset="95%" stopColor="#FF5005" stopOpacity={0.0} />
                  </linearGradient>
                </defs>
                <XAxis dataKey="time" stroke="#94a3b8" fontSize={11} tickLine={false} />
                <YAxis stroke="#94a3b8" fontSize={11} tickLine={false} allowDecimals={false} />
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1727', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`${value} scan(s)`, 'Validations']}
                />
                <Area type="monotone" dataKey="presence" stroke="#FF5005" strokeWidth={3} fillOpacity={1} fill="url(#scanGradient)" />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Répartition par Catégorie de Billets */}
        <div className="lg:col-span-4 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between">
          <div className="flex items-center justify-between border-b border-gray-100 pb-4 mb-4">
            <div className="flex items-center gap-3">
              <div className="p-2.5 bg-amber-50 text-[#EFB810] rounded-2xl">
                <PieIcon className="w-5 h-5" />
              </div>
              <div>
                <h3 className="font-extrabold text-sm text-gray-900">Répartition Pass</h3>
                <p className="text-xs text-gray-400">Paliers de billets</p>
              </div>
            </div>
          </div>

          <div className="h-52 w-full flex items-center justify-center">
            <ResponsiveContainer width="100%" height="100%" minWidth={0} minHeight={180}>
              <RechartsPieChart>
                <Pie
                  data={pieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={45}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {pieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                  ))}
                </Pie>
                <Tooltip 
                  contentStyle={{ backgroundColor: '#0B1727', borderRadius: '14px', border: 'none', color: '#fff', fontSize: '12px' }}
                  formatter={(value) => [`${value} billet(s)`, 'Quota']}
                />
              </RechartsPieChart>
            </ResponsiveContainer>
          </div>

          <div className="space-y-2 border-t border-gray-100 pt-3">
            {categoryDistribution.map((cat, idx) => (
              <div key={idx} className="flex justify-between items-center text-xs">
                <div className="flex items-center gap-2">
                  <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: COLORS[idx % COLORS.length] }} />
                  <span className="font-bold text-gray-800">{cat.name}</span>
                </div>
                <span className="font-extrabold text-gray-900">
                  {cat.scanned || 0} / {cat.total} scannés
                </span>
              </div>
            ))}
          </div>

        </div>

      </div>

    </div>
  );
}
