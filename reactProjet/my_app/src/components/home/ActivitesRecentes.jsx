import React, { useMemo } from 'react';
import { Eye, Wine, GraduationCap, Scissors, Loader, AlertCircle } from 'lucide-react';
import { useGetRecentEvent } from '../../hooks/useEvent';

const ActivitesRecentes = () => {
  const token = localStorage.getItem('accessToken');
  const { recentEvent, loading, error } = useGetRecentEvent(token, true);

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour obtenir une icône basée sur la catégorie
  const getIconAndColor = (categorie) => {
    const cat = (categorie || '').toLowerCase();
    if (cat.includes('gala') || cat.includes('soirée')) {
      return { icon: <Wine size={18} />, color: 'bg-orange-100 text-orange-600' };
    }
    if (cat.includes('conférence') || cat.includes('webinar') || cat.includes('formation')) {
      return { icon: <GraduationCap size={18} />, color: 'bg-blue-50 text-blue-600' };
    }
    if (cat.includes('afterwork') || cat.includes('réunion')) {
      return { icon: <Scissors size={18} />, color: 'bg-red-100 text-red-500' };
    }
    return { icon: <Wine size={18} />, color: 'bg-slate-100 text-slate-600' };
  };

  // Convertir recentEvent en tableau s'il est un objet unique ou s'il contient un tableau
  const eventsArray = useMemo(() => {
    if (!recentEvent) return [];
    if (Array.isArray(recentEvent)) return recentEvent;
    if (Array.isArray(recentEvent.events)) return recentEvent.events;
    if (Array.isArray(recentEvent.data)) return recentEvent.data;
    return [recentEvent];
  }, [recentEvent]);

  if (loading) {
    return (
      <div className="p-8 relative z-10">
        <div className="w-[82%] mx-auto">
          <div className="flex justify-center items-center h-64">
            <Loader size={48} className="animate-spin text-blue-600" />
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 relative z-10">
        <div className="w-[82%] mx-auto">
          <div className="flex items-center gap-3 p-4 bg-red-50 border border-red-200 rounded-xl">
            <AlertCircle size={24} className="text-red-600" />
            <div>
              <p className="font-semibold text-red-700">Erreur de chargement</p>
              <p className="text-red-600 text-sm">{error}</p>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="p-8 relative z-10 ">
      <div className="w-[82%] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-700">Activités Récentes</h2>
            <p className="text-gray-500 text-sm mt-1">
              Vue d'ensemble de vos derniers événements terminés ou en cours.
            </p>
          </div>
          <a href="#" className="text-blue-500 text-sm font-semibold hover:underline">
            Voir tout l'historique
          </a>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Événement</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-center">Invités</th>
                <th className="px-6 py-4 font-semibold text-center">Présents</th>
                <th className="px-6 py-4 font-semibold text-center">Taux</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {eventsArray.length > 0 ? (
                eventsArray.map((event) => {
                  const { icon, color } = getIconAndColor(event.categorie);
                  const eventTitle = event.titre || event.title || 'Événement sans titre';
                  const eventDate = formatDate(event.DateDebut || event.date || event.startDate);
                  const invites = event.confirmedGuests || event.participants || 0;
                  const presents = event.attendees || invites || 0;
                  const taux = invites > 0 ? Math.round((presents / invites) * 100) : 0;

                  return (
                    <tr key={event.id || event._id} className="bg-white hover:bg-gray-50 transition-colors">
                      <td className="px-6 py-4">
                        <div className="flex items-center gap-3">
                          <div className={`p-2 rounded-lg ${color}`}>
                            {icon}
                          </div>
                          <span className="font-bold text-gray-800 text-sm line-clamp-1">{eventTitle}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-sm text-gray-600">{eventDate}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{invites}</td>
                      <td className="px-6 py-4 text-sm text-gray-600 text-center">{presents}</td>
                      <td className="px-6 py-4 text-center">
                        <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                          taux > 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-400'
                        }`}>
                          {taux}%
                        </span>
                      </td>
                      <td className="px-6 py-4 text-right">
                        <button className="text-yellow-700 hover:text-yellow-800 transition-colors">
                          <Eye size={20} />
                        </button>
                      </td>
                    </tr>
                  );
                })
              ) : (
                <tr>
                  <td colSpan="6" className="px-6 py-12 text-center text-gray-500">
                    Aucun événement récent trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivitesRecentes;