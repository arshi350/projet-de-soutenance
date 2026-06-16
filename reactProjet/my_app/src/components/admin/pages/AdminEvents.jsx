import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  MoreVertical, 
  AlertTriangle, 
  Star, 
  CheckCircle2, 
  UserX,
  Eye,
  EyeOff
} from 'lucide-react';

// Données initiales extraites de image_996bc1.png
const INITIAL_EVENTS = [
  {
    id: 1,
    image: "https://images.unsplash.com/photo-1504384308090-c894fdcc538d?w=100&h=100&fit=crop",
    name: "Gala Tech 2025", 
    organizer: "Jean Dupont", 
    date: "10/05/2025", 
    location: "Paris", 
    attendees: 340, 
    status: "Publié", 
    visibility: "Public",
    featured: false
  },
  {
    id: 2,
    image: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=100&h=100&fit=crop",
    name: "Soirée X", 
    organizer: "Inconnu", 
    organizerColor: "text-red-500",
    date: "15/05/2025", 
    location: "Lyon", 
    attendees: 120, 
    status: "Signalé", 
    visibility: "Public",
    featured: false
  },
  {
    id: 3,
    image: "https://images.unsplash.com/photo-1540575861501-7cf05a4b125a?w=100&h=100&fit=crop",
    name: "Conférence IA", 
    organizer: "Marie Curie", 
    date: "20/05/2025", 
    location: "Paris", 
    attendees: 500, 
    status: "En attente", 
    visibility: "Privé",
    featured: false
  }
];

import { useGetAllEventsAdmin } from '../../../hooks/useEvent';

const AdminEvents = () => {
  // États pour la recherche et le filtrage
  const [events, setEvents] = useState(INITIAL_EVENTS);
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken') || null;
  const { events: fetchedEvents, loading: loadingEvents, error: fetchError, refetch } = useGetAllEventsAdmin(token, true);
  const [currentFilter, setCurrentFilter] = useState("Tous");
  const [searchQuery, setSearchQuery] = useState("");

  // Handler pour changer le statut d'un événement (Modération)
  const handleUpdateStatus = (id, newStatus) => {
    setEvents(prevEvents => 
      prevEvents.map(evt => evt.id === id ? { ...evt, status: newStatus } : evt)
    );
  };

  // Handler pour mettre en avant un événement
  const handleFeatureEvent = (id) => {
    setEvents(prevEvents =>
      prevEvents.map(evt => evt.id === id ? { ...evt, featured: !evt.featured } : evt)
    );
  };

  // Filtrage et recherche combinés en temps réel
  const filteredEvents = useMemo(() => {
    return events.filter(evt => {
      const matchesFilter = currentFilter === "Tous" || evt.status === currentFilter;
      const matchesSearch = 
        evt.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.organizer.toLowerCase().includes(searchQuery.toLowerCase()) ||
        evt.location.toLowerCase().includes(searchQuery.toLowerCase());
      
      return matchesFilter && matchesSearch;
    });
  }, [events, currentFilter, searchQuery]);

  // Convertit les événements backend au format attendu par l'UI
  const mapEventToUI = (evt) => {
    const name = evt.titre || evt.name || 'Untitled';
    const organizer = (evt.userId && (evt.userId.first_name || evt.userId.last_name))
      ? `${evt.userId.first_name || ''} ${evt.userId.last_name || ''}`.trim()
      : (typeof evt.userId === 'string' ? evt.userId : 'Organisateur');
    const date = evt.DateDebut ? new Date(evt.DateDebut).toLocaleDateString() : (evt.date ? new Date(evt.date).toLocaleDateString() : '');
    let image = 'https://via.placeholder.com/100';
    if (evt.image) {
      if (evt.image.startsWith('http')) {
        image = evt.image;
      } else if (evt.image.startsWith('/')) {
        image = `http://localhost:3000${evt.image}`;
      } else {
        image = `http://localhost:3000/uploads/${evt.image}`;
      }
    }
    const attendees = evt.confirmedInvites || evt.totalInvites || 0;
    const statusMap = {
      'en attente': 'En attente',
      'en cours': 'En cours',
      'terminer': 'Terminés'
    };

    return {
      id: evt._id,
      image,
      name,
      organizer,
      date,
      location: evt.lieu || '',
      attendees,
      status: statusMap[evt.status] || (evt.status || 'En attente'),
      visibility: evt.visibility || 'Public',
      featured: evt.featured || false
    };
  };

  // Mettre à jour la liste locale quand les événements admin sont récupérés
  useEffect(() => {
    if (Array.isArray(fetchedEvents) && fetchedEvents.length > 0) {
      setEvents(fetchedEvents.map(mapEventToUI));
    } else if (fetchedEvents && fetchedEvents.events) {
      setEvents(fetchedEvents.events.map(mapEventToUI));
    }
  }, [fetchedEvents]);

  // Compteur dynamique pour la section des alertes (événements encore "Signalés")
  const reportedEvents = useMemo(() => events.filter(evt => evt.status === "Signalé"), [events]);
  const activeAlert = reportedEvents[0]; // On prend le premier événement signalé pour l'affichage détaillé

  return (
    <div className="font min-h-screen bg-gray-100 px-55 py-8 font-sans text-slate-900">
      {/* Header Section */}
      <header className="mb-8">
        <h1 className="text-4xl font-bold tracking-tight mb-1">Événements</h1>
        <p className="text-gray-500 text-lg">Modérez l'ensemble des événements créés</p>
      </header>

      {/* Filters and Search Bar */}
      <div className="flex flex-wrap items-center justify-between gap-4 mb-8 p-4 border border-blue-200 border-dashed rounded-xl">
        <div className="flex flex-wrap gap-2">
          {["Tous", "En attente", "Publiés", "Signalés", "Terminés"].map((label) => (
            <FilterButton 
              key={label}
              label={label} 
              active={currentFilter === label} 
              onClick={() => setCurrentFilter(label)}
            />
          ))}
        </div>
        <div className="relative w-full max-w-md">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
          <input 
            type="text" 
            placeholder="Rechercher un événement, organisateur, lieu..." 
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-2 bg-gray-100 border-none rounded-lg focus:ring-2 focus:ring-blue-500 text-sm outline-none transition-all"
          />
        </div>
      </div>

      {/* Events Table */}
      <div className="mb-12 border border-blue-200 border-dashed rounded-xl overflow-hidden bg-white">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="text-[11px] font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100 bg-gray-50/50">
                <th className="px-6 py-4">Événement</th>
                <th className="px-6 py-4">Organisateur</th>
                <th className="px-6 py-4">Date</th>
                <th className="px-6 py-4 text-center">Lieu</th>
                <th className="px-6 py-4 text-center">Inscrits</th>
                <th className="px-6 py-4 text-center">Statut</th>
                <th className="px-6 py-4 text-center">Visibilité</th>
                <th className="px-6 py-4 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-50">
              {filteredEvents.length > 0 ? (
                filteredEvents.map(evt => (
                  <EventRow 
                    key={evt.id}
                    {...evt}
                  />
                ))
              ) : (
                <tr>
                  <td colSpan="8" className="px-6 py-10 text-center text-gray-400 font-medium">
                    Aucun événement ne correspond à vos critères.
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Alerts and Signalings Section */}
      <div className="p-1 border border-blue-200 border-dashed rounded-xl">
        <div className="flex justify-between items-center mb-6 px-4 pt-4">
          <h2 className="text-xl font-bold flex items-center gap-2">
            <AlertTriangle className="text-red-500" size={24} />
            Alertes et Signalements
          </h2>
          <span className="bg-gray-100 text-gray-600 text-xs font-bold px-3 py-1 rounded-full transition-all">
            {reportedEvents.length} Signalement{reportedEvents.length > 1 ? 's' : ''} en attente
          </span>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 p-4">
          {/* Main Signaling Card (Dynamic) */}
          {activeAlert ? (
            <div className="lg:col-span-2 flex flex-col md:flex-row bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-sm transition-all">
              <img 
                src={activeAlert.image} 
                alt="Event alert" 
                className="w-full md:w-64 object-cover"
              />
              <div className="p-8 flex flex-col justify-between flex-1">
                <div>
                  <div className="flex justify-between items-start mb-4 gap-2">
                    <span className="bg-red-50 text-red-600 text-[10px] font-black uppercase px-3 py-1 rounded-md shrink-0">
                      URGENT : Contenu non conforme
                    </span>
                    <span className="text-gray-500 text-xs font-medium text-right">Signalé par 12 utilisateurs</span>
                  </div>
                  <h3 className="text-2xl font-black mb-4 tracking-tight">Signalement : {activeAlert.name}</h3>
                  <p className="text-gray-600 text-sm leading-relaxed mb-8">
                    L'événement a été signalé pour "publicité mensongère" et "absence d'autorisations légales". 
                    Plusieurs utilisateurs mentionnent un lieu non sécurisé.
                  </p>
                </div>
                
                <div className="flex gap-4">
                  <button 
                    onClick={() => handleUpdateStatus(activeAlert.id, "Terminés")}
                    className="flex-1 bg-red-700 text-white font-bold py-3 px-6 rounded-xl hover:bg-red-800 transition-colors text-sm"
                  >
                    Désactiver l'événement
                  </button>
                  <button 
                    onClick={() => handleUpdateStatus(activeAlert.id, "Publié")}
                    className="flex-1 border border-gray-300 text-gray-700 font-bold py-3 px-6 rounded-xl hover:bg-gray-50 transition-colors text-sm"
                  >
                    Refuser le signalement
                  </button>
                </div>
              </div>
            </div>
          ) : (
            <div className="lg:col-span-2 flex flex-col items-center justify-center bg-gray-50 border border-gray-200 rounded-3xl p-8 text-center text-gray-400">
              <CheckCircle2 size={48} className="text-emerald-500 mb-2" />
              <p className="font-semibold text-slate-700">Tous les signalements ont été traités !</p>
            </div>
          )}

          {/* Quick Moderation Card */}
          <div className="bg-gray-50/50 border border-gray-200 rounded-3xl p-6 flex flex-col justify-between">
            <div>
              <h3 className="text-xs font-bold text-gray-400 uppercase tracking-widest mb-6">MODÉRATION RAPIDE</h3>
              <div className="space-y-3 mb-6">
                
                {/* Action 1: Mettre en avant Gala Tech */}
                <QuickAction 
                  label="Mettre en avant &quot;Gala Tech&quot;" 
                  active={events.find(e => e.id === 1)?.featured}
                  onClick={() => handleFeatureEvent(1)}
                  icon={<Star size={18} className={events.find(e => e.id === 1)?.featured ? "text-amber-500 fill-amber-500" : "text-orange-800"} />} 
                />
                
                {/* Action 2: Valider Conférence IA */}
                <QuickAction 
                  label="Valider &quot;Conférence IA&quot;" 
                  disabled={events.find(e => e.id === 3)?.status === "Publié"}
                  onClick={() => handleUpdateStatus(3, "Publié")}
                  icon={<CheckCircle2 size={18} className={events.find(e => e.id === 3)?.status === "Publié" ? "text-gray-300" : "text-emerald-600"} />} 
                />
                
                {/* Action 3: Bannir l'organisateur de Soirée X */}
                <QuickAction 
                  label="Bannir l'organisateur (Inconnu)" 
                  disabled={events.find(e => e.id === 2)?.status === "Terminés"}
                  onClick={() => handleUpdateStatus(2, "Terminés")}
                  icon={<UserX size={18} className={events.find(e => e.id === 2)?.status === "Terminés" ? "text-gray-300" : "text-red-700"} />} 
                />
                
              </div>
            </div>
            <div className="pt-4 border-t border-gray-200">
              <p className="text-center text-gray-400 text-xs font-medium">
                Historique de modération mis à jour en direct.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

/* --- Sub-components --- */

const FilterButton = ({ label, active = false, onClick }) => (
  <button 
    onClick={onClick}
    className={`px-5 py-1.5 rounded-full text-sm font-bold transition-all duration-200 whitespace-nowrap ${
      active ? 'bg-orange-800 text-white shadow-sm scale-105' : 'bg-gray-200 text-gray-500 hover:bg-gray-300'
    }`}
  >
    {label}
  </button>
);

const EventRow = ({ image, name, organizer, organizerColor = "text-gray-600", date, location, attendees, status, visibility, featured }) => {
  const statusStyles = {
    "Publié": "bg-emerald-50 text-emerald-600",
    "Signalé": "bg-red-50 text-red-600",
    "En attente": "bg-gray-100 text-gray-500",
    "Terminés": "bg-gray-100 text-gray-400 line-through"
  };

  return (
    <tr className="hover:bg-gray-50/50 transition-colors">
      <td className="px-6 py-4">
        <div className="flex items-center gap-4">
          <div className="relative">
            <img src={image} alt={name} className="w-12 h-12 rounded-lg object-cover shadow-sm" />
            {featured && (
              <span className="absolute -top-1 -right-1 bg-amber-500 text-white p-0.5 rounded-full shadow">
                <Star size={10} className="fill-white text-white" />
              </span>
            )}
          </div>
          <span className="font-bold text-slate-800">{name}</span>
        </div>
      </td>
      <td className={`px-6 py-4 font-medium ${organizerColor}`}>{organizer}</td>
      <td className="px-6 py-4 font-medium text-gray-500">{date}</td>
      <td className="px-6 py-4 text-center font-medium text-gray-400">{location}</td>
      <td className="px-6 py-4 text-center font-bold text-slate-700">{attendees}</td>
      <td className="px-6 py-4 text-center">
        <span className={`px-3 py-1 rounded-full text-[10px] font-bold inline-flex items-center gap-1 transition-all ${statusStyles[status] || ""}`}>
          {status === "Signalé" && <AlertTriangle size={12} />}
          {status}
        </span>
      </td>
      <td className="px-6 py-4 text-center font-medium text-gray-500">
        <div className="flex items-center justify-center gap-2 text-xs">
          {visibility === "Public" ? <Eye size={14} className="text-gray-400" /> : <EyeOff size={14} className="text-gray-300" />}
          {visibility}
        </div>
      </td>
      <td className="px-6 py-4 text-center">
        <button className="p-2 hover:bg-gray-100 rounded-full text-gray-500 transition-colors">
          <MoreVertical size={20} />
        </button>
      </td>
    </tr>
  );
};

const QuickAction = ({ label, icon, onClick, disabled, active }) => (
  <button 
    onClick={onClick}
    disabled={disabled}
    className={`w-full flex items-center justify-between bg-white border border-gray-200 p-4 rounded-xl transition-all group select-none
      ${disabled ? 'opacity-50 cursor-not-allowed bg-gray-50' : 'hover:shadow-md active:scale-[0.99]'}
      ${active ? 'border-amber-300 bg-amber-50/20' : ''}
    `}
  >
    <span className={`font-bold text-sm ${disabled ? 'text-gray-400 line-through' : 'text-slate-700'}`}>
      {label}
    </span>
    <span className={`transition-transform ${disabled ? '' : 'group-hover:scale-110'}`}>
      {icon}
    </span>
  </button>
);

export default AdminEvents;
