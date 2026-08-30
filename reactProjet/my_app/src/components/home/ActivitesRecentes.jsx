import React, { useMemo } from 'react';
import { Eye, Wine, GraduationCap, Scissors, Loader, AlertCircle, ArrowUpRight, CheckCircle2 } from 'lucide-react';
import { useGetRecentEvent } from '../../hooks/useEvent';
import { Link } from 'react-router-dom';

const ActivitesRecentes = () => {
  const token = localStorage.getItem('accessToken');
  const { recentEvent, loading, error } = useGetRecentEvent(token, true);

  const formatDate = (dateString) => {
    if (!dateString) return 'Date à définir';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const getIconAndColor = (categorie) => {
    const cat = (categorie || '').toLowerCase();
    if (cat.includes('gala') || cat.includes('soirée')) {
      return { icon: <Wine size={16} />, color: 'bg-orange-50 text-[#FF5005] border-orange-200' };
    }
    if (cat.includes('conférence') || cat.includes('webinar') || cat.includes('formation')) {
      return { icon: <GraduationCap size={16} />, color: 'bg-blue-50 text-blue-600 border-blue-200' };
    }
    if (cat.includes('afterwork') || cat.includes('réunion')) {
      return { icon: <Scissors size={16} />, color: 'bg-purple-50 text-purple-600 border-purple-200' };
    }
    return { icon: <Wine size={16} />, color: 'bg-slate-50 text-slate-600 border-slate-200' };
  };

  const eventsArray = useMemo(() => {
    if (!recentEvent) return [];
    if (Array.isArray(recentEvent)) return recentEvent;
    if (Array.isArray(recentEvent.events)) return recentEvent.events;
    if (Array.isArray(recentEvent.data)) return recentEvent.data;
    return [recentEvent];
  }, [recentEvent]);

  if (loading) {
    return (
      <div className="py-16 px-6 relative z-10">
        <div className="max-w-7xl mx-auto flex justify-center items-center h-48 bg-white rounded-3xl border border-gray-200/80 shadow-sm">
          <Loader size={36} className="animate-spin text-[#FF5005]" />
        </div>
      </div>
    );
  }

  if (error) {
    return null; // Dégradation gracieuse sur la landing page si pas d'événements publics récents
  }

  return (
    <section className="py-14 px-5 md:px-10 lg:px-16 relative z-10 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        
        {/* Header */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-4 mb-6">
          <div>
            <span className="text-[9px] font-extrabold uppercase tracking-widest text-[#FF5005]">
              Activité de la communauté
            </span>
            <h2 className="text-xl sm:text-2xl font-extrabold text-gray-900 mt-0.5">
              Événements récents en direct
            </h2>
          </div>
          <Link to="/login" className="text-xs font-bold text-[#FF5005] hover:text-orange-600 flex items-center gap-1">
            <span>Accéder à mon espace</span>
            <ArrowUpRight size={14} />
          </Link>
        </div>

        {/* Table Container */}
        <div className="bg-white rounded-2xl shadow-sm border border-gray-200/80 overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse">
              <thead>
                <tr className="bg-gray-50/80 text-gray-400 text-[9px] font-extrabold uppercase tracking-wider border-b border-gray-100">
                  <th className="px-5 py-3">Événement</th>
                  <th className="px-5 py-3">Date</th>
                  <th className="px-5 py-3 text-center">Invités</th>
                  <th className="px-5 py-3 text-center">Présents</th>
                  <th className="px-5 py-3 text-center">Taux</th>
                  <th className="px-5 py-3 text-right">Statut</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {eventsArray.length > 0 ? (
                  eventsArray.map((event) => {
                    const { icon, color } = getIconAndColor(event.categorie);
                    const eventTitle = event.titre || event.title || 'Événement Exclusif';
                    const eventDate = formatDate(event.DateDebut || event.date || event.startDate);
                    const invites = event.confirmedGuests || event.participants || 120;
                    const presents = event.attendees || invites || 98;
                    const taux = invites > 0 ? Math.round((presents / invites) * 100) : 85;

                    return (
                      <tr key={event.id || event._id} className="hover:bg-gray-50/80 transition-colors">
                        <td className="px-6 py-4">
                          <div className="flex items-center gap-3">
                            <div className={`p-2 rounded-xl border ${color}`}>
                              {icon}
                            </div>
                            <span className="font-bold text-gray-900 text-sm line-clamp-1">{eventTitle}</span>
                          </div>
                        </td>
                        <td className="px-6 py-4 text-xs font-medium text-gray-500">{eventDate}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-gray-700 text-center">{invites}</td>
                        <td className="px-6 py-4 text-xs font-semibold text-emerald-600 text-center">{presents}</td>
                        <td className="px-6 py-4 text-center">
                          <span className={`px-2.5 py-1 rounded-full text-[11px] font-bold ${
                            taux > 80 ? 'bg-emerald-50 text-emerald-600 border border-emerald-200' : 'bg-orange-50 text-[#FF5005] border border-orange-200'
                          }`}>
                            {taux}%
                          </span>
                        </td>
                        <td className="px-6 py-4 text-right">
                          <span className="inline-flex items-center gap-1.5 text-xs font-bold text-emerald-600">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                            Terminé
                          </span>
                        </td>
                      </tr>
                    );
                  })
                ) : (
                  <tr>
                    <td colSpan="6" className="px-6 py-10 text-center text-gray-400 text-sm">
                      Rejoignez ARSHI EVENT pour créer votre premier événement.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </section>
  );
};

export default ActivitesRecentes;