import React from 'react';
import { 
  PieChart as PieIcon, 
  Ticket, 
  Sparkles, 
  CheckCircle2, 
  AlertCircle,
  Layers,
  ArrowRight
} from 'lucide-react';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer
} from 'recharts';

const PALETTE = ['#10b981', '#3b82f6', '#f59e0b', '#8b5cf6', '#ec4899', '#06b6d4'];

export default function CategorySalesBreakdown({ categoryBreakdown = [], totalRevenue = 0 }) {
  const hasCategories = categoryBreakdown && categoryBreakdown.length > 0;

  const pieData = categoryBreakdown.map((cat, idx) => ({
    name: cat.name,
    value: cat.revenue > 0 ? cat.revenue : (cat.soldCount > 0 ? cat.soldCount : 1),
    actualRevenue: cat.revenue,
    soldCount: cat.soldCount,
    color: PALETTE[idx % PALETTE.length]
  }));

  const CustomPieTooltip = ({ active, payload }) => {
    if (active && payload && payload.length) {
      const data = payload[0].payload;
      return (
        <div className="bg-slate-950/95 backdrop-blur-md text-white px-3.5 py-2.5 rounded-2xl shadow-xl border border-slate-800 text-xs space-y-1">
          <div className="font-black text-slate-200">{data.name}</div>
          <div className="text-emerald-400 font-bold">
            Revenus : {Number(data.actualRevenue || 0).toLocaleString('fr-FR')} FCFA
          </div>
          <div className="text-slate-400">
            Ventes : {data.soldCount || 0} place(s)
          </div>
        </div>
      );
    }
    return null;
  };

  return (
    <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs flex flex-col justify-between space-y-6">
      {/* En-tête */}
      <div className="flex items-center justify-between border-b border-gray-100 pb-4">
        <div className="flex items-center gap-3">
          <div className="p-3 bg-blue-50 text-blue-600 rounded-2xl">
            <PieIcon className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-black text-base text-slate-900">
              Répartition par Catégorie de Billet
            </h3>
            <p className="text-xs text-slate-400 font-medium">
              Performance des différents pass et contributions au chiffre d'affaires
            </p>
          </div>
        </div>
        <span className="text-xs font-bold bg-slate-100 text-slate-700 px-3 py-1 rounded-xl">
          {categoryBreakdown.length} catégorie(s)
        </span>
      </div>

      {!hasCategories ? (
        <div className="text-center py-10 space-y-3">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-slate-400 mx-auto">
            <Ticket className="w-6 h-6" />
          </div>
          <p className="text-sm font-bold text-slate-700">Aucune catégorie de billet active</p>
          <p className="text-xs text-slate-400 max-w-xs mx-auto">
            Créez des pass (Standard, VIP, etc.) depuis l'onglet Billetterie pour commencer à suivre leurs ventes.
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-center">
          
          {/* Diagramme Circulaire Donut */}
          <div className="lg:col-span-5 flex flex-col items-center justify-center">
            <div className="h-56 w-full relative flex items-center justify-center">
              <ResponsiveContainer width="100%" height="100%">
                <RechartsPieChart>
                  <Pie
                    data={pieData}
                    cx="50%"
                    cy="50%"
                    innerRadius={55}
                    outerRadius={85}
                    paddingAngle={4}
                    dataKey="value"
                  >
                    {pieData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip content={<CustomPieTooltip />} />
                </RechartsPieChart>
              </ResponsiveContainer>
              
              {/* Texte au centre du Donut */}
              <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                <span className="text-[10px] font-extrabold uppercase text-slate-400 tracking-wider">Total</span>
                <span className="text-base sm:text-lg font-black text-slate-900">
                  {Number(totalRevenue).toLocaleString('fr-FR')} FCFA
                </span>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 text-[11px] font-bold text-slate-600 mt-2">
              {pieData.map((item, idx) => (
                <div key={idx} className="flex items-center gap-1.5">
                  <div className="w-2.5 h-2.5 rounded-full shrink-0" style={{ backgroundColor: item.color }} />
                  <span>{item.name}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Liste détaillée avec barres de progression */}
          <div className="lg:col-span-7 space-y-3.5">
            {categoryBreakdown.map((cat, idx) => {
              const color = PALETTE[idx % PALETTE.length];
              const shareOfRevenue = totalRevenue > 0 ? Math.round((cat.revenue / totalRevenue) * 100) : 0;
              const isSoldOut = cat.availableCount <= 0;

              return (
                <div 
                  key={cat.id || idx}
                  className="bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 rounded-2xl p-4 transition-all duration-200 space-y-2.5"
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-2 min-w-0">
                      <div className="w-3 h-3 rounded-full shrink-0" style={{ backgroundColor: color }} />
                      <h4 className="font-extrabold text-slate-900 text-sm truncate">
                        {cat.name}
                      </h4>
                      <span className="text-xs font-black text-slate-600 bg-white px-2 py-0.5 rounded-lg border border-slate-200 shrink-0">
                        {Number(cat.price).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>

                    <div className="flex items-center gap-2 shrink-0">
                      {isSoldOut ? (
                        <span className="text-[10px] font-black uppercase px-2 py-0.5 bg-rose-50 text-rose-700 border border-rose-200 rounded-full">
                          Sold Out
                        </span>
                      ) : (
                        <span className="text-[10px] font-bold px-2 py-0.5 bg-slate-200/80 text-slate-700 rounded-full">
                          {cat.availableCount} restants
                        </span>
                      )}
                      <span className="font-black text-slate-900 text-sm">
                        {Number(cat.revenue || 0).toLocaleString('fr-FR')} FCFA
                      </span>
                    </div>
                  </div>

                  {/* Barre de jauge de remplissage */}
                  <div className="space-y-1">
                    <div className="w-full bg-slate-200 h-2 rounded-full overflow-hidden">
                      <div 
                        className="h-full rounded-full transition-all duration-700 ease-out"
                        style={{ 
                          width: `${Math.min(100, cat.fillRate)}%`,
                          backgroundColor: color 
                        }}
                      />
                    </div>
                    <div className="flex justify-between text-[11px] text-slate-500 font-medium pt-0.5">
                      <span>
                        <strong className="text-slate-800">{cat.soldCount}</strong> / {cat.capacity} vendus ({cat.fillRate}%)
                      </span>
                      <span>
                        Part de CA : <strong className="text-slate-800">{shareOfRevenue}%</strong>
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

        </div>
      )}
    </div>
  );
}
