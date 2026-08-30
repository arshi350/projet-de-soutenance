import { 
  MoreHorizontal, Monitor, Star, Palette, Sparkles, 
  TrendingUp, Calendar, Users, AlertCircle, ArrowUpRight, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useGetRecentEvents } from '../../../hooks/useEvent';
import { useCurrentUser } from '../../../hooks/useAuth';
import { Link } from 'react-router-dom';

const getEventIcon = (eventName) => {
  if (!eventName || typeof eventName !== 'string') {
    return { icon: <Calendar size={16} />, iconBg: 'bg-slate-50 text-slate-600 border-slate-200' };
  }
  const name = eventName.toLowerCase();
  if (name.includes('gala') || name.includes('annuel')) {
    return { icon: <Star size={16} />, iconBg: 'bg-amber-50 text-amber-600 border-amber-200' };
  }
  if (name.includes('webinar') || name.includes('ia')) {
    return { icon: <Monitor size={16} />, iconBg: 'bg-blue-50 text-blue-600 border-blue-200' };
  }
  if (name.includes('atelier') || name.includes('design')) {
    return { icon: <Palette size={16} />, iconBg: 'bg-purple-50 text-purple-600 border-purple-200' };
  }
  return { icon: <Calendar size={16} />, iconBg: 'bg-orange-50 text-[#FF5005] border-orange-200' };
};

const getParticipationRate = (confirmedGuests, totalGuests) => {
  if (!totalGuests || totalGuests === 0) return 0;
  return Math.round((confirmedGuests / totalGuests) * 100);
};

const getProgressColor = (rate) => {
  if (rate >= 80) return 'bg-emerald-500';
  if (rate >= 60) return 'bg-[#1E6FD9]';
  if (rate >= 40) return 'bg-[#FF5005]';
  return 'bg-red-500';
};

const ActivitySection = () => {
  const { user } = useCurrentUser();
  const userId = user?.id || user?._id;
  const token = localStorage.getItem('accessToken');
  const { recentEvents, loading, error, refetch } = useGetRecentEvents(userId, token, 5, true);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', { day: 'numeric', month: 'short', year: 'numeric' });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-3xl p-8 border border-gray-200/80 shadow-sm flex items-center justify-center h-72">
        <div className="w-8 h-8 border-3 border-[#FF5005]/20 border-t-[#FF5005] rounded-full animate-spin"></div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 font-sans">
      
      {/* Left Column: Recent Activities Table (8 cols) */}
      <div className="lg:col-span-8 bg-white rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-200/80 text-left">
        <div className="flex justify-between items-center mb-6">
          <div>
            <h2 className="text-xl font-extrabold text-gray-900">Événements Récents</h2>
            <p className="text-xs text-gray-400 mt-0.5">Suivi de la participation et des scans</p>
          </div>
          <Link to="/dashboard/evenement" className="text-xs font-bold text-[#FF5005] hover:underline flex items-center gap-1">
            <span>Tous les événements</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {recentEvents.length === 0 ? (
          <div className="text-center py-12 bg-gray-50/50 rounded-2xl border border-dashed border-gray-200">
            <Calendar size={36} className="text-gray-300 mx-auto mb-2" />
            <p className="text-xs text-gray-500 font-semibold">Aucun événement actif pour le moment.</p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest bg-gray-50/80 border-b border-gray-100">
                  <th className="py-3 px-4 rounded-l-xl">Événement</th>
                  <th className="py-3 px-4">Date</th>
                  <th className="py-3 px-4 text-center">Invités</th>
                  <th className="py-3 px-4 text-center">Taux</th>
                  <th className="py-3 px-4 text-right rounded-r-xl">Action</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {recentEvents.map((event) => {
                  const rate = getParticipationRate(event.confirmedGuests || event.participants || 0, event.totalGuests || event.capacity || 100);
                  const progressColor = getProgressColor(rate);
                  const { icon, iconBg } = getEventIcon(event.name || event.titre);
                  
                  return (
                    <tr key={event.id || event._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-xl border ${iconBg}`}>
                            {icon}
                          </div>
                          <span className="font-bold text-gray-800 text-xs line-clamp-1">{event.titre || event.name}</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-500 font-medium whitespace-nowrap">
                        {formatDate(event.date || event.startDate || event.createdAt)}
                      </td>
                      <td className="py-4 px-4 text-xs text-gray-700 font-semibold text-center whitespace-nowrap">
                        {(event.confirmedGuests || event.participants || 0)} / {(event.totalGuests || event.capacity || 100)}
                      </td>
                      <td className="py-4 px-4 text-center">
                        <div className="flex items-center justify-center gap-2">
                          <div className="w-16 h-1.5 bg-gray-100 rounded-full overflow-hidden">
                            <div className={`h-full ${progressColor} rounded-full`} style={{ width: `${rate}%` }} />
                          </div>
                          <span className="text-[11px] font-bold text-gray-700">{rate}%</span>
                        </div>
                      </td>
                      <td className="py-4 px-4 text-right">
                        <Link 
                          to={`/dashboard/evenement/manage/${event.id || event._id}`}
                          className="text-xs font-bold text-[#FF5005] bg-orange-50 hover:bg-orange-100 px-3 py-1.5 rounded-lg transition"
                        >
                          Gérer
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Right Column: AI Suggestions (4 cols) */}
      <div className="lg:col-span-4 bg-gradient-to-br from-[#0B1727] to-[#1A2C4B] rounded-3xl p-6 sm:p-8 text-white shadow-xl flex flex-col justify-between text-left relative overflow-hidden border border-white/10">
        
        <div>
          <div className="flex items-center gap-2 mb-4">
            <Sparkles size={18} className="text-[#EFB810] fill-[#EFB810]" />
            <h3 className="text-base font-extrabold text-white">Copilote IA Événementiel</h3>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md mb-4">
            <div className="flex items-start gap-2">
              <Zap size={14} className="text-[#EFB810] shrink-0 mt-0.5" />
              <p className="text-xs text-slate-200 leading-relaxed">
                Automatisez les relances WhatsApp pour les 24 invités n'ayant pas encore confirmé leur présence.
              </p>
            </div>
            <button className="mt-3 bg-[#FF5005] hover:bg-[#ff6220] text-white px-3.5 py-1.5 rounded-xl text-[11px] font-bold shadow-sm transition cursor-pointer">
              Activer les relances IA
            </button>
          </div>

          <div className="bg-white/5 border border-white/10 p-4 rounded-2xl backdrop-blur-md">
            <div className="flex items-center gap-2 text-emerald-400 mb-1">
              <TrendingUp size={14} />
              <span className="text-[10px] font-extrabold uppercase tracking-wider">Taux de Remplissage</span>
            </div>
            <p className="text-xs text-slate-300">
              Votre affluence prévisionnelle est supérieure de <strong className="text-white">+18%</strong> par rapport au mois dernier.
            </p>
          </div>
        </div>

        <div className="pt-4 border-t border-white/10 text-[10px] text-gray-400 flex items-center justify-between">
          <span>Modèle IA : Gemini Pro Event</span>
          <span className="text-emerald-400 font-bold">● Opérationnel</span>
        </div>

      </div>

    </div>
  );
};

export default ActivitySection;