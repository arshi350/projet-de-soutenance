import React from 'react';
import { MoreHorizontal, Monitor, Star, Palette, Sparkles, TrendingUp } from 'lucide-react';

const ActivitySection = () => {
  const activities = [
    { id: 1, name: 'Gala annuel', date: '12 Nov 2023', guests: '850 / 920', rate: 92, color: 'bg-emerald-500', icon: <Star className="text-amber-600" size={16} />, iconBg: 'bg-amber-50' },
    { id: 2, name: 'Webinar IA', date: '15 Nov 2023', guests: '420 / 550', rate: 76, color: 'bg-orange-500', icon: <Monitor className="text-blue-600" size={16} />, iconBg: 'bg-blue-50' },
    { id: 3, name: 'Atelier Design', date: '18 Nov 2023', guests: '45 / 50', rate: 90, color: 'bg-emerald-500', icon: <Palette className="text-purple-600" size={16} />, iconBg: 'bg-purple-50' },
  ];

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-10 font ">
      {/* Left Column: Recent Activities Table */}
      <div className="flex-[2] bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl font-bold text-slate-900">Activités Récentes</h2>
          <button className="text-blue-600 font-semibold text-sm hover:underline">Voir tout</button>
        </div>

        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="text-[11px] font-bold text-slate-400 uppercase tracking-widest bg-slate-50/50">
              <th className="py-4 px-4 rounded-l-xl">Événement</th>
              <th className="py-4 px-4">Date</th>
              <th className="py-4 px-4">Invités</th>
              <th className="py-4 px-4">Taux</th>
              <th className="py-4 px-4 rounded-r-xl">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-50">
            {activities.map((item) => (
              <tr key={item.id} className="group hover:bg-slate-50/50 transition-colors border-b border-gray-200">
                <td className="py-5 px-4">
                  <div className="flex items-center gap-3">
                    <div className={`${item.iconBg} p-2.5 rounded-xl`}>{item.icon}</div>
                    <span className="font-bold text-slate-800 text-sm">{item.name}</span>
                  </div>
                </td>
                <td className="py-5 px-4 text-sm text-slate-600 font-medium">{item.date}</td>
                <td className="py-5 px-4 text-sm text-slate-600 font-medium">{item.guests}</td>
                <td className="py-5 px-4">
                  <div className="flex items-center gap-3">
                    <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                      <div className={`h-full ${item.color}`} style={{ width: `${item.rate}%` }} />
                    </div>
                    <span className={`text-xs font-bold ${item.rate > 80 ? 'text-emerald-500' : 'text-orange-500'}`}>
                      {item.rate}%
                    </span>
                  </div>
                </td>
                <td className="py-5 px-4">
                  <button className="text-slate-400 hover:text-slate-600 transition-colors">
                    <MoreHorizontal size={20} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Right Column: AI Suggestion Sidebar */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg flex flex-col gap-6 relative overflow-hidden">
        {/* Header Suggestion */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-amber-400 fill-amber-400" />
          <h2 className="text-xl font-bold">Suggestion IA</h2>
        </div>

        {/* Action Card */}
        <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
          <p className="text-sm leading-relaxed mb-4 text-blue-50 font-medium">
            Souhaitez-vous envoyer un rappel automatique aux absents du Webinar IA ?
          </p>
          <div className="flex gap-3">
            <button className="bg-white text-blue-700 px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-50 transition-colors">
              Confirmer
            </button>
            <button className="bg-blue-500/30 text-white px-4 py-2 rounded-lg text-xs font-bold hover:bg-blue-500/50 transition-colors">
              Plus tard
            </button>
          </div>
        </div>

        {/* Predictive Analysis Card */}
        <div className="bg-slate-900/20 backdrop-blur-md border border-white/10 p-5 rounded-2xl">
          <div className="flex items-center gap-2 mb-2 text-blue-200">
            <TrendingUp size={16} />
            <span className="text-xs font-bold uppercase tracking-wider">Analyse prédictive</span>
          </div>
          <p className="text-[13px] leading-relaxed text-blue-50">
            <span className="font-bold text-white">+15%</span> de participants prévus la semaine prochaine par rapport à la moyenne du mois.
          </p>
        </div>

        {/* Active Assistant Bottom Bar */}
        <div className="mt-auto bg-slate-950/40 p-3 rounded-2xl flex items-center gap-3 border border-white/5">
          <div className="w-10 h-10 rounded-lg overflow-hidden bg-slate-800 shrink-0 border border-white/10">
            <img 
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Xavier" 
              alt="Assistant" 
              className="w-full h-full object-cover"
            />
          </div>
          <div className="overflow-hidden">
            <p className="text-[10px] font-bold text-blue-300 uppercase tracking-tighter">Assistant Actif</p>
            <p className="text-[11px] text-white/80 truncate italic">Analyse du trafic en temps réel...</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ActivitySection;