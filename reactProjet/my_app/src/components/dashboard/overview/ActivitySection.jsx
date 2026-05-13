import React from 'react';
import { MoreHorizontal, Monitor, Star, Palette, Sparkles, TrendingUp, Calendar, Users, AlertCircle } from 'lucide-react';
import { useGetRecentEvents } from '../../../hooks/useEvent';
import { useCurrentUser } from '../../../hooks/useAuth';

// Mapping des icônes selon le type d'événement ou nom
const getEventIcon = (eventName) => {
  if (!eventName || typeof eventName !== 'string') {
    return { icon: <Calendar size={16} />, iconBg: 'bg-slate-100', color: 'text-slate-600' };
  }
  const name = eventName.toLowerCase();
  if (name.includes('gala') || name.includes('annuel')) {
    return { icon: <Star size={16} />, iconBg: 'bg-amber-50', color: 'text-amber-600' };
  }
  if (name.includes('webinar') || name.includes('ia')) {
    return { icon: <Monitor size={16} />, iconBg: 'bg-blue-50', color: 'text-blue-600' };
  }
  if (name.includes('atelier') || name.includes('design')) {
    return { icon: <Palette size={16} />, iconBg: 'bg-purple-50', color: 'text-purple-600' };
  }
  // Icône par défaut
  return { icon: <Calendar size={16} />, iconBg: 'bg-slate-100', color: 'text-slate-600' };
};

// Calcul du taux de participation
const getParticipationRate = (confirmedGuests, totalGuests) => {
  if (!totalGuests || totalGuests === 0) return 0;
  return Math.round((confirmedGuests / totalGuests) * 100);
};

// Déterminer la couleur de la barre de progression selon le taux
const getProgressColor = (rate) => {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 60) return 'bg-blue-500';
  if (rate >= 40) return 'bg-orange-500';
  return 'bg-red-500';
};



const ActivitySection = () => {
  const { user } = useCurrentUser();
  const userId = user?.id;
  const token = localStorage.getItem('accessToken');
    const { recentEvents, loading, error, refetch } = useGetRecentEvents(userId, token, 5, true);
    //console.log(userId)
  // Formatage de la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  // Si chargement
  if (loading) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-10">
        <div className="flex-[2] bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
              <p className="text-slate-600">Chargement des événements...</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Si erreur
  if (error) {
    return (
      <div className="flex flex-col lg:flex-row gap-8 p-10">
        <div className="flex-[2] bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
          <div className="flex justify-center items-center h-96">
            <div className="text-center">
              <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
              <p className="text-red-600 font-medium mb-2">Erreur de chargement</p>
              <p className="text-slate-500 text-sm mb-4">{error}</p>
              <button 
                onClick={() => refetch()}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg text-sm hover:bg-blue-700 transition-colors"
              >
                Réessayer
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col lg:flex-row gap-8 p-10 font">
      {/* Left Column: Recent Activities Table */}
      <div className="flex-[2] bg-white rounded-3xl p-6 shadow-sm border border-slate-100">
        <div className="flex justify-between items-center mb-8 px-2">
          <h2 className="text-2xl font-bold text-slate-900">Evenements Récents</h2>
          <button className="text-blue-600 font-semibold text-sm hover:underline">Voir tout</button>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-12">
            <Calendar size={48} className="text-slate-300 mx-auto mb-4" />
            <p className="text-slate-500">Aucun événement récent</p>
          </div>
        ) : (
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
              {recentEvents.map((event) => {
                const rate = getParticipationRate(event.confirmedGuests || event.participants || 0, event.totalGuests || event.capacity || 0);
                const progressColor = getProgressColor(rate);
                const { icon, iconBg, color } = getEventIcon(event.name);
                
                return (
                  <tr key={event.id} className="group hover:bg-slate-50/50 transition-colors border-b border-gray-200">
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className={`${iconBg} p-2.5 rounded-xl ${color}`}>
                          {icon}
                        </div>
                        <span className="font-bold text-slate-800 text-sm">{event.titre}</span>
                      </div>
                    </td>
                    <td className="py-5 px-4 text-sm text-slate-600 font-medium">
                      {formatDate(event.date || event.startDate || event.createdAt)}
                    </td>
                    <td className="py-5 px-4 text-sm text-slate-600 font-medium">
                      {(event.confirmedGuests || event.participants || 0)} / {(event.totalGuests || event.capacity || 0)}
                    </td>
                    <td className="py-5 px-4">
                      <div className="flex items-center gap-3">
                        <div className="w-24 h-1.5 bg-slate-100 rounded-full overflow-hidden">
                          <div 
                            className={`h-full ${progressColor}`} 
                            style={{ width: `${rate}%` }} 
                          />
                        </div>
                        <span className={`text-xs font-bold ${rate >= 80 ? 'text-emerald-500' : rate >= 60 ? 'text-blue-500' : rate >= 40 ? 'text-orange-500' : 'text-red-500'}`}>
                          {rate}%
                        </span>
                      </div>
                    </td>
                    <td className="py-5 px-4">
                      <button className="text-slate-400 hover:text-slate-600 transition-colors">
                        <MoreHorizontal size={20} />
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        )}
      </div>

      {/* Right Column: AI Suggestion Sidebar */}
      <div className="flex-1 bg-gradient-to-br from-blue-600 to-blue-800 rounded-3xl p-6 text-white shadow-lg flex flex-col gap-6 relative overflow-hidden">
        {/* Header Suggestion */}
        <div className="flex items-center gap-2 mb-2">
          <Sparkles size={20} className="text-amber-400 fill-amber-400" />
          <h2 className="text-xl font-bold">Suggestion IA</h2>
        </div>

        {/* Action Card - Avec suggestion dynamique */}
        {recentEvents.length > 0 && (
          <div className="bg-white/10 backdrop-blur-md border border-white/20 p-5 rounded-2xl">
            <p className="text-sm leading-relaxed mb-4 text-blue-50 font-medium">
              Souhaitez-vous envoyer un rappel automatique aux absents du {recentEvents[0]?.titre} ?
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
        )}

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