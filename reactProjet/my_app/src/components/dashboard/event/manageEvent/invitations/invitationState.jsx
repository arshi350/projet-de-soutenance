import React from 'react';
import { TrendingUp, Minus, AlertCircle } from 'lucide-react';

export default function InvitationState() {
  const kpiData = [
    {
      id: 1,
      title: "Taux d'ouverture",
      value: "78%",
      trend: "+12%",
      trendType: "positive",
      progress: 78,
      borderColor: "border-[#FF5005]", // Ton orange personnalisé
      textColor: "text-[#FF5005]",
      barColor: "bg-[#FF5005]"
    },
    {
      id: 2,
      title: "Taux clic QR",
      value: "65%",
      trend: "Stable",
      trendType: "stable",
      progress: 65,
      borderColor: "border-[#017EF7]", // Ton bleu personnalisé
      textColor: "text-[#017EF7]",
      barColor: "bg-[#017EF7]"
    },
    {
      id: 3,
      title: "Taux de rebond",
      value: "2%",
      trend: "Seuil critique: 5%",
      trendType: "critical",
      progress: 5, // Barre très fine / début de jauge comme sur le design
      borderColor: "border-[#EF4444]",
      textColor: "text-[#EF4444]",
      barColor: "bg-[#EF4444]"
    }
  ];

  return (
    <div className="px-60 font p-6 grid grid-cols-1 md:grid-cols-3 gap-6 font-sans">
      {kpiData.map((kpi) => (
        <div
          key={kpi.id}
          className={`bg-white rounded-xl p-5 shadow-sm border-l-[4px] ${kpi.borderColor} flex flex-col justify-between h-[120px]`}
        >
          {/* Top : Titre et indicateurs numériques */}
          <div className="space-y-1">
            <h4 className="text-[10px] font-black text-gray-400 uppercase tracking-wider">
              {kpi.title}
            </h4>
            
            <div className="flex items-baseline gap-2">
              {/* Valeur principale */}
              <span className={`text-2xl font-black tracking-tight ${kpi.textColor}`}>
                {kpi.value}
              </span>

              {/* Badge de tendance / Contexte */}
              {kpi.trendType === 'positive' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-[#10B981]">
                  <TrendingUp className="w-3 h-3 stroke-[2.5]" />
                  {kpi.trend}
                </span>
              )}

              {kpi.trendType === 'stable' && (
                <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-emerald-600">
                  {kpi.trend}
                </span>
              )}

              {kpi.trendType === 'critical' && (
                <span className="inline-flex items-center gap-1 text-[10px] font-bold text-red-500/90">
                  {kpi.trend}
                </span>
              )}
            </div>
          </div>

          {/* Bottom : Barre de progression */}
          <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
            <div 
              className={`h-full ${kpi.barColor} rounded-full transition-all duration-500`}
              style={{ width: `${kpi.progress}%` }}
            />
          </div>

        </div>
      ))}
    </div>
  );
}