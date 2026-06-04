import React from 'react';
import { TrendingUp, PieChart, ChevronDown } from 'lucide-react';
import { 
  AreaChart, 
  Area, 
  XAxis, 
  YAxis, 
  Tooltip, 
  ResponsiveContainer,
  ReferenceDot,
  PieChart as RechartsPieChart,
  Pie,
  Cell
} from 'recharts';

// --- DONNÉES SIMULÉES ---
const lineData = [
  { time: '19h00', presence: 40 },
  { time: '', presence: 50 },
  { time: '20h00', presence: 110 },
  { time: '', presence: 180 },
  { time: '21h00', presence: 312 }, // Peak
  { time: '', presence: 200 },
  { time: '22h00', presence: 120 },
  { time: '', presence: 55 },
  { time: '23h00', presence: 40 },
];

const pieData = [
  { name: 'Présents', value: 92, color: '#10B981' }, // Vert
  { name: 'Absents', value: 5, color: '#EF4444' },   // Rouge
  { name: 'Attente', value: 3, color: '#F59E0B' },   // Orange/Ambre
];

export default function EventAnalytics() {
  return (
    <div className="px-60 font p-6 grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* --- GRAPHIC 1 : PRÉSENCE DANS LE TEMPS (Prend 2 colonnes sur grand écran) --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col justify-between">
        {/* Header du graphique */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-[#FF5005]" />
            <h3 className="text-base font-bold text-gray-800">Présence dans le temps</h3>
          </div>
          
          {/* Dropdown Filtre */}
          <button className="flex items-center gap-2 px-3 py-1.5 border border-gray-200 rounded-lg text-xs font-medium text-gray-500 hover:bg-gray-50 transition-all">
            <span>Aujourd'hui</span>
            <ChevronDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Zone de la courbe */}
        <div className="w-full h-64 relative">
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={lineData} margin={{ top: 30, right: 10, left: 10, bottom: 0 }}>
              <defs>
                {/* Dégradé sous la courbe orange */}
                <linearGradient id="colorPresence" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#FF5005" stopOpacity={0.2}/>
                  <stop offset="95%" stopColor="#FF5005" stopOpacity={0.0}/>
                </linearGradient>
              </defs>
              
              <XAxis 
                dataKey="time" 
                axisLine={false}
                tickLine={false}
                tick={{ fontSize: 11, fill: '#94A3B8' }}
                interval={0}
              />
              {/* YAxis masqué pour correspondre au design épuré */}
              <YAxis hide={true} domain={[0, 350]} />
              
              <Tooltip 
                cursor={{ stroke: '#E2E8F0', strokeWidth: 1, strokeDasharray: '4 4' }}
                content={({ active, payload }) => {
                  if (active && payload && payload.length) {
                    return (
                      <div className="bg-gray-900 text-white text-xs px-2.5 py-1.5 rounded shadow-md font-semibold">
                        {payload[0].value} présents
                      </div>
                    );
                  }
                  return null;
                }}
              />

              {/* Rendu de la ligne de zone */}
              <Area 
                type="monotone" 
                dataKey="presence" 
                stroke="#FF5005" 
                strokeWidth={2.5} 
                fillOpacity={1} 
                fill="url(#colorPresence)" 
              />

              {/* Point personnalisé pour le "Peak 20h15" (Index 4 du tableau de données) */}
              <ReferenceDot
                x="21h00" // Aligné sur la data
                y={312}
                r={6}
                fill="#FF5005"
                stroke="#FFF"
                strokeWidth={3}
                label={{
                  value: 'Peak 20h15',
                  position: 'top',
                  offset: 12,
                  fill: '#1E293B',
                  fontSize: 12,
                  fontWeight: 'bold'
                }}
              />
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </div>

      {/* --- GRAPHIC 2 : RÉPARTITION STATUTS (Prend 1 colonne) --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 flex flex-col justify-between">
        {/* Header du graphique */}
        <div className="flex items-center gap-2 mb-4">
          <PieChart className="w-5 h-5 text-blue-600" />
          <h3 className="text-base font-bold text-gray-800">Répartition statuts</h3>
        </div>

        {/* Zone Donut Chart */}
        <div className="w-full h-48 relative flex items-center justify-center">
          <ResponsiveContainer width="100%" height="100%">
            <RechartsPieChart>
              <Pie
                data={pieData}
                cx="50%"
                cy="50%"
                innerRadius={65}
                outerRadius={80}
                startAngle={90}
                endAngle={-270}
                paddingAngle={0}
                dataKey="value"
              >
                {pieData.map((entry, index) => (
                  <Cell key={`cell-${index}`} fill={entry.color} cornerRadius={index === 0 ? 10 : 0} />
                ))}
              </Pie>
            </RechartsPieChart>
          </ResponsiveContainer>

          {/* Indicateur Central de Total */}
          <div className="absolute text-center flex flex-col items-center justify-center">
            <span className="text-3xl font-extrabold text-gray-800 tracking-tight">340</span>
            <span className="text-[10px] font-bold text-gray-400 tracking-wider uppercase">Total</span>
          </div>
        </div>

        {/* Légendes personnalisées en bas */}
        <div className="grid grid-cols-2 gap-x-4 gap-y-2 mt-4 pt-4 border-t border-gray-50">
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#10B981] shrink-0"></span>
            <span>92% Présents</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700">
            <span className="w-2.5 h-2.5 rounded-full bg-[#EF4444] shrink-0"></span>
            <span>5% Absents</span>
          </div>
          <div className="flex items-center gap-2 text-xs font-medium text-gray-700 col-span-2">
            <span className="w-2.5 h-2.5 rounded-full bg-[#F59E0B] shrink-0"></span>
            <span>3% Attente</span>
          </div>
        </div>
      </div>

    </div>
  );
}