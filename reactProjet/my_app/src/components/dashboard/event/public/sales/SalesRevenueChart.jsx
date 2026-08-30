import React, { useState } from 'react';
import { 
  TrendingUp, 
  DollarSign, 
  Ticket, 
  Calendar, 
  BarChart3, 
  Layers,
  Sparkles
} from 'lucide-react';
import {
  AreaChart,
  Area,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  CartesianGrid
} from 'recharts';

export default function SalesRevenueChart({ salesTimeline = [], totalRevenue = 0, totalSold = 0 }) {
  const [chartMode, setChartMode] = useState('revenue'); // 'revenue' | 'tickets' | 'cumulative'

  const hasData = salesTimeline && salesTimeline.length > 0;

  // Données de secours d'illustration si aucune vente n'est encore enregistrée
  const displayData = hasData ? salesTimeline : [
    { formattedDate: 'J-7', revenue: 0, ticketsCount: 0, cumulativeRevenue: 0, cumulativeTickets: 0 },
    { formattedDate: 'J-5', revenue: 0, ticketsCount: 0, cumulativeRevenue: 0, cumulativeTickets: 0 },
    { formattedDate: 'J-3', revenue: 0, ticketsCount: 0, cumulativeRevenue: 0, cumulativeTickets: 0 },
    { formattedDate: "Aujourd'hui", revenue: 0, ticketsCount: 0, cumulativeRevenue: 0, cumulativeTickets: 0 }
  ];

  const getMetricKey = () => {
    switch (chartMode) {
      case 'tickets':
        return 'ticketsCount';
      case 'cumulative':
        return 'cumulativeRevenue';
      default:
        return 'revenue';
    }
  };

  const getMetricLabel = () => {
    switch (chartMode) {
      case 'tickets':
        return 'Billets vendus';
      case 'cumulative':
        return 'Revenus cumulés (FCFA)';
      default:
        return 'Chiffre d’affaires journalier (FCFA)';
    }
  };

  const getStrokeColor = () => {
    switch (chartMode) {
      case 'tickets':
        return '#3b82f6';
      case 'cumulative':
        return '#8b5cf6';
      default:
        return '#10b981';
    }
  };

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white px-4 py-3 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1.5 min-w-[170px]">
          <div className="font-bold text-slate-300 flex items-center gap-1.5 pb-1 border-b border-slate-800">
            <Calendar className="w-3.5 h-3.5 text-slate-400" />
            <span>{data.formattedDate || data.date || label}</span>
          </div>
          <div className="flex justify-between items-center text-emerald-400 font-bold">
            <span>Revenus du jour :</span>
            <span>{Number(data.revenue || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
          <div className="flex justify-between items-center text-blue-400 font-bold">
            <span>Billets vendus :</span>
            <span>{data.ticketsCount || 0} place(s)</span>
          </div>
          <div className="flex justify-between items-center text-purple-300 text-[11px] pt-1 border-t border-slate-800/80">
            <span>Total cumulé :</span>
            <span>{Number(data.cumulativeRevenue || 0).toLocaleString('fr-FR')} FCFA</span>
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
      {/* En-tête du graphique avec sélecteur de mode */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-emerald-50 text-emerald-600 rounded-2xl">
            <TrendingUp className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900 flex items-center gap-2">
              Dynamique & Évolution des Ventes
              {hasData && (
                <span className="text-[10px] font-extrabold uppercase px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200/80 rounded-full">
                  Temps Réel
                </span>
              )}
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Suivi chronologique des recettes et du volume d'inscriptions
            </p>
          </div>
        </div>

        {/* Boutons de sélection */}
        <div className="flex items-center bg-slate-100 p-1 rounded-2xl text-xs font-bold text-slate-600 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => setChartMode('revenue')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              chartMode === 'revenue' 
                ? 'bg-white text-emerald-700 shadow-xs font-black' 
                : 'hover:text-slate-900'
            }`}
          >
            <DollarSign className="w-3.5 h-3.5" />
            Revenus (FCFA)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('tickets')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              chartMode === 'tickets' 
                ? 'bg-white text-blue-700 shadow-xs font-black' 
                : 'hover:text-slate-900'
            }`}
          >
            <Ticket className="w-3.5 h-3.5" />
            Volume (Places)
          </button>
          <button
            type="button"
            onClick={() => setChartMode('cumulative')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl transition-all ${
              chartMode === 'cumulative' 
                ? 'bg-white text-purple-700 shadow-xs font-black' 
                : 'hover:text-slate-900'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            Cumul Total
          </button>
        </div>
      </div>

      {/* Zone du graphique */}
      <div className="relative h-72 sm:h-80 w-full">
        {!hasData && (
          <div className="absolute inset-0 z-10 flex flex-col items-center justify-center bg-white/70 backdrop-blur-[2px] rounded-2xl text-center p-6">
            <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mb-3">
              <BarChart3 className="w-6 h-6" />
            </div>
            <h4 className="font-bold text-slate-800 text-sm">En attente des premières réservations</h4>
            <p className="text-xs text-slate-400 max-w-sm mt-1">
              Dès qu'un participant achètera une place via votre lien public, la courbe d'évolution et les pics de ventes s'afficheront ici en direct.
            </p>
          </div>
        )}

        <ResponsiveContainer width="100%" height="100%">
          <AreaChart data={displayData} margin={{ top: 15, right: 15, left: -10, bottom: 0 }}>
            <defs>
              <linearGradient id="chartGradient" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor={getStrokeColor()} stopOpacity={0.35} />
                <stop offset="95%" stopColor={getStrokeColor()} stopOpacity={0.0} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#f1f5f9" />
            <XAxis 
              dataKey="formattedDate" 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={{ stroke: '#f1f5f9' }}
            />
            <YAxis 
              stroke="#94a3b8" 
              fontSize={11} 
              tickLine={false} 
              axisLine={false}
              allowDecimals={false}
              tickFormatter={(v) => chartMode === 'tickets' ? v : `${v} F`}
            />
            <Tooltip content={<CustomTooltip />} />
            <Area
              type="monotone"
              dataKey={getMetricKey()}
              name={getMetricLabel()}
              stroke={getStrokeColor()}
              strokeWidth={3}
              fillOpacity={1}
              fill="url(#chartGradient)"
              activeDot={{ r: 6, fill: getStrokeColor(), stroke: '#fff', strokeWidth: 2 }}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>

      {/* Résumé en bas de graphique */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 pt-4 border-t border-slate-100 text-xs">
        <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Revenu Total Encaissé</span>
          <span className="font-black text-emerald-600 text-sm">
            {Number(totalRevenue).toLocaleString('fr-FR')} FCFA
          </span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Places Confirmées</span>
          <span className="font-black text-blue-600 text-sm">
            {totalSold} billet(s)
          </span>
        </div>
        <div className="bg-slate-50 rounded-2xl p-3.5 flex items-center justify-between">
          <span className="text-slate-500 font-medium">Affichage actif</span>
          <span className="font-bold text-slate-800 text-sm capitalize">
            {getMetricLabel()}
          </span>
        </div>
      </div>
    </div>
  );
}
