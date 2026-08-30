import React, { useState, useEffect, useMemo } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { 
  Plus, Calendar, MapPin, Users, BarChart2, Edit3, Loader, AlertCircle, 
  Trash2, CalendarDays, PartyPopper, Music, Briefcase, GraduationCap, Gift, 
  Sparkles, Globe, Trophy, Heart, Coffee, Mic, Film, Camera, Zap, ArrowRight,
  Clock, ShieldCheck, Search, LayoutGrid, List, SlidersHorizontal, Share2, 
  Check, ExternalLink, Copy 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetUserEvents, useDeleteEvent } from '../../../hooks/useEvent';
import { useAuthContext } from '../../../context/AuthContext';

/**
 * Hub de Gestion et Catalogue des Événements (eventManagement)
 * Recherche instantanée, filtres dynamiques, tri, bascule grille/liste, cartes 16:9 immersives.
 */
export const EventManagement = () => {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, token } = useAuthContext();

  // États de recherche, filtres, tri et vue
  const [searchTerm, setSearchTerm] = useState('');
  const [filter, setFilter] = useState('All'); // 'All' | 'Active' | 'Pending' | 'Past'
  const [sortBy, setSortBy] = useState('date-desc'); // 'date-desc' | 'date-asc' | 'title-asc'
  const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'table'
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [copiedEventId, setCopiedEventId] = useState(null);

  const { events, loading, error, total, refetch } = useGetUserEvents(
    user?._id || user?.id,
    token,
    true
  );

  const { deleteEventById, loading: deleteLoading } = useDeleteEvent(
    token,
    () => {
      refetch();
      setShowDeleteConfirm(null);
    }
  );

  useEffect(() => {
    if (user && token) {
      refetch();
    }
  }, [user, token, refetch, location.key, location.state]);

  // Compteurs de statuts
  const statusCounts = useMemo(() => {
    const counts = { All: events.length, Active: 0, Pending: 0, Past: 0 };
    events.forEach((ev) => {
      const st = (ev.status || '').toLowerCase();
      if (st === 'en cours' || st === 'active' || st === 'activé') counts.Active += 1;
      else if (st === 'terminer' || st === 'completed' || st === 'terminé') counts.Past += 1;
      else counts.Pending += 1;
    });
    return counts;
  }, [events]);

  // Filtrage et Tri combinés
  const processedEvents = useMemo(() => {
    return events
      .filter((event) => {
        const title = (event.titre || event.title || event.name || '').toLowerCase();
        const description = (event.description || '').toLowerCase();
        const locationStr = (event.lieu || '').toLowerCase();
        const search = searchTerm.toLowerCase().trim();

        // 1. Filtre par recherche
        const matchesSearch = !search || title.includes(search) || description.includes(search) || locationStr.includes(search);

        // 2. Filtre par statut
        const st = (event.status || '').toLowerCase();
        let matchesStatus = true;
        if (filter === 'Active') matchesStatus = st === 'en cours' || st === 'active' || st === 'activé';
        else if (filter === 'Past') matchesStatus = st === 'terminer' || st === 'completed' || st === 'terminé';
        else if (filter === 'Pending') matchesStatus = st === 'en attente' || st === 'pending';

        return matchesSearch && matchesStatus;
      })
      .sort((a, b) => {
        if (sortBy === 'title-asc') {
          return (a.titre || '').localeCompare(b.titre || '');
        }
        const dateA = new Date(a.DateDebut || a.date || 0).getTime();
        const dateB = new Date(b.DateDebut || b.date || 0).getTime();
        if (sortBy === 'date-asc') return dateA - dateB;
        return dateB - dateA;
      });
  }, [events, searchTerm, filter, sortBy]);

  const filterOptions = [
    { key: 'All', label: 'Tous', count: statusCounts.All },
    { key: 'Active', label: 'En cours', count: statusCounts.Active, badgeClass: 'bg-emerald-500/15 text-emerald-600' },
    { key: 'Pending', label: 'À venir / En attente', count: statusCounts.Pending, badgeClass: 'bg-amber-500/15 text-amber-600' },
    { key: 'Past', label: 'Passés', count: statusCounts.Past, badgeClass: 'bg-gray-200 text-gray-600' },
  ];

  const getEventAvatar = (event) => {
    const title = (event.titre || event.title || event.name || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const combinedText = title + ' ' + description;

    const categories = [
      { keywords: ['gala', 'soirée', 'prestige', 'luxe', 'dîner'], icon: <PartyPopper size={28} />, bgGradient: 'from-purple-600 to-pink-600' },
      { keywords: ['conférence', 'séminaire', 'forum', 'congrès', 'tech', 'webinar'], icon: <Briefcase size={28} />, bgGradient: 'from-blue-600 to-indigo-700' },
      { keywords: ['concert', 'festival', 'musique', 'dj', 'live'], icon: <Music size={28} />, bgGradient: 'from-orange-600 to-[#FF5005]' },
      { keywords: ['sport', 'match', 'tournoi', 'competition', 'marathon'], icon: <Trophy size={28} />, bgGradient: 'from-emerald-600 to-teal-700' },
      { keywords: ['formation', 'atelier', 'workshop', 'masterclass'], icon: <GraduationCap size={28} />, bgGradient: 'from-cyan-600 to-blue-700' },
      { keywords: ['anniversaire', 'fête', 'célébration'], icon: <Gift size={28} />, bgGradient: 'from-pink-500 to-rose-600' },
      { keywords: ['mariage', 'wedding', 'noces'], icon: <Heart size={28} />, bgGradient: 'from-rose-500 to-pink-600' },
      { keywords: ['innovation', 'startup', 'hackathon'], icon: <Zap size={28} />, bgGradient: 'from-amber-500 to-orange-600' }
    ];

    for (const category of categories) {
      if (category.keywords.some((keyword) => combinedText.includes(keyword))) {
        return category;
      }
    }

    return {
      icon: <CalendarDays size={28} />,
      bgGradient: 'from-slate-800 to-slate-900',
    };
  };

  const getEventImageUrl = (event) => {
    if (!event) return null;
    const imagePath = event.image;
    if (!imagePath) return null;
    if (imagePath.startsWith('http://') || imagePath.startsWith('https://')) {
      return imagePath;
    }
    if (imagePath.startsWith('/')) {
      return `http://localhost:3000${imagePath}`;
    }
    return `http://localhost:3000/uploads/${imagePath}`;
  };

  const openManageTab = (event) => {
    if (!event) return;
    const eventId = event._id || event.id;
    if (!eventId) return;
    sessionStorage.setItem(`manageEvent_${eventId}`, JSON.stringify(event));
    const manageUrl = `/dashboard/evenement/manage/${eventId}`;
    window.open(manageUrl, '_blank', 'noopener,noreferrer');
  };

  const copyPublicLink = (event) => {
    const eventId = event._id || event.id;
    const isPublic = event.eventType === 'public';
    const publicUrl = isPublic
      ? `${window.location.origin}/event/${eventId}/tickets`
      : `${window.location.origin}/rsvp/${eventId}`;

    navigator.clipboard.writeText(publicUrl);
    setCopiedEventId(eventId);
    setTimeout(() => setCopiedEventId(null), 2500);
  };

  const formatDate = (dateString) => {
    if (!dateString) return 'Date à définir';
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
    });
  };

  const getStatusStyle = (status) => {
    const s = (status || '').toLowerCase();
    if (s === 'en cours' || s === 'active' || s === 'activé') {
      return {
        label: 'En cours',
        badge: 'bg-emerald-50 text-emerald-600 border-emerald-200',
        dot: 'bg-emerald-500',
      };
    }
    if (s === 'terminer' || s === 'completed' || s === 'terminé') {
      return {
        label: 'Terminé',
        badge: 'bg-gray-100 text-gray-600 border-gray-200',
        dot: 'bg-gray-400',
      };
    }
    return {
      label: 'À venir',
      badge: 'bg-amber-50 text-amber-600 border-amber-200',
      dot: 'bg-amber-500',
    };
  };

  if (loading && events.length === 0) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-12 h-12 border-4 border-[#FF5005]/20 border-t-[#FF5005] rounded-full animate-spin" />
        <p className="text-xs font-black uppercase tracking-widest text-gray-400">
          Chargement de votre catalogue d'événements...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-8 font-sans text-left">
      
      {/* ======================================================= */}
      {/* BARRE D'OUTILS ET CONTRÔLES SUPÉRIEURS                 */}
      {/* ======================================================= */}
      <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-xs space-y-5">
        
        {/* Ligne 1 : Titre & Bouton Nouveau */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5005] block">
              Supervision & Billetterie
            </span>
            <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Catalogue des Événements
            </h1>
            <p className="text-xs text-gray-400 mt-0.5">
              Gérez vos invitations privées et vos billetteries publiques certifiées.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.02, boxShadow: '0 10px 25px -5px rgba(255, 80, 5, 0.3)' }}
            whileTap={{ scale: 0.98 }}
            onClick={() => navigate('/dashboard/evenement/create')}
            className="px-6 py-3.5 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5e19] hover:to-[#ff8519] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 flex items-center justify-center gap-2 transition cursor-pointer self-start sm:self-auto"
          >
            <Plus size={16} />
            <span>Créer un Événement</span>
          </motion.button>
        </div>

        {/* Ligne 2 : Barre de Recherche, Filtres & Basculeur de Vue */}
        <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 pt-2 border-t border-gray-50">
          
          {/* Recherche */}
          <div className="relative flex-1 max-w-md">
            <Search size={16} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher par titre, ville, mot-clé..."
              className="w-full pl-10 pr-4 py-2.5 bg-gray-50/80 border border-gray-200/80 rounded-2xl text-xs text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
            />
            {searchTerm && (
              <button
                onClick={() => setSearchTerm('')}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-gray-400 hover:text-gray-600 font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filtres de statut */}
          <div className="flex flex-wrap items-center gap-1.5 p-1 bg-gray-50 rounded-2xl border border-gray-200/60 overflow-x-auto">
            {filterOptions.map((opt) => (
              <button
                key={opt.key}
                type="button"
                onClick={() => setFilter(opt.key)}
                className={`px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                  filter === opt.key
                    ? 'bg-white text-gray-900 shadow-sm border border-gray-200/80 font-black'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                <span>{opt.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    filter === opt.key ? 'bg-orange-500/10 text-[#FF5005]' : 'bg-gray-200 text-gray-600'
                  }`}
                >
                  {opt.count}
                </span>
              </button>
            ))}
          </div>

          {/* Tri & Bascule Grille/Liste */}
          <div className="flex items-center gap-2 self-end lg:self-auto">
            
            {/* Menu de Tri */}
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="px-3 py-2 bg-gray-50 border border-gray-200 rounded-xl text-xs font-bold text-gray-700 focus:outline-none focus:border-[#FF5005] cursor-pointer"
            >
              <option value="date-desc">Plus Récents</option>
              <option value="date-asc">Date Proche</option>
              <option value="title-asc">Titre (A-Z)</option>
            </select>

            {/* Bascule Vue Grille / Table */}
            <div className="flex items-center bg-gray-50 border border-gray-200 rounded-xl p-1">
              <button
                type="button"
                onClick={() => setViewMode('grid')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'grid' ? 'bg-white text-[#FF5005] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Vue en Grille de Cartes"
              >
                <LayoutGrid size={16} />
              </button>
              <button
                type="button"
                onClick={() => setViewMode('table')}
                className={`p-1.5 rounded-lg transition cursor-pointer ${
                  viewMode === 'table' ? 'bg-white text-[#FF5005] shadow-xs' : 'text-gray-400 hover:text-gray-700'
                }`}
                title="Vue en Liste Compacte"
              >
                <List size={16} />
              </button>
            </div>

          </div>

        </div>

      </div>

      {/* ======================================================= */}
      {/* ÉTAT VIDE                                               */}
      {/* ======================================================= */}
      {processedEvents.length === 0 && (
        <div className="bg-white rounded-3xl p-12 sm:p-16 border border-dashed border-gray-200 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-500/10 text-[#FF5005] flex items-center justify-center mx-auto border border-orange-500/20 shadow-sm">
            <Calendar size={32} />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="text-xl font-black text-gray-900">
              {searchTerm ? "Aucun résultat trouvé" : "Aucun événement dans cette section"}
            </h3>
            <p className="text-xs text-gray-400 leading-relaxed">
              {searchTerm
                ? `Aucun événement ne correspond au terme "${searchTerm}". Essayez un autre mot-clé.`
                : "Commencez dès maintenant à créer votre première réception privée ou votre billetterie publique en quelques clics."}
            </p>
          </div>

          <div className="pt-2">
            <button
              onClick={() => navigate('/dashboard/evenement/create')}
              className="px-6 py-3 bg-[#FF5005] hover:bg-[#ff6420] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 inline-flex items-center gap-2 transition cursor-pointer"
            >
              <Plus size={16} />
              <span>Créer mon premier événement</span>
            </button>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* 1. VUE EN GRILLE DE CARTES (GRID VIEW)                  */}
      {/* ======================================================= */}
      {viewMode === 'grid' && processedEvents.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {processedEvents.map((event, index) => {
            const eventId = event._id || event.id;
            const eventTitle = event.titre || event.title || event.name || 'Événement sans titre';
            const eventDesc = event.description;
            const eventLoc = event.lieu || 'Lieu communiqué aux inscrits';
            const eventDate = formatDate(event.DateDebut || event.date);
            const eventImg = getEventImageUrl(event);
            const avatar = getEventAvatar(event);
            const status = getStatusStyle(event.status);
            const isPublic = event.eventType === 'public';

            return (
              <motion.div
                key={eventId}
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.25, delay: index * 0.05 }}
                whileHover={{ y: -5, boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.08)' }}
                className="bg-white rounded-3xl overflow-hidden border border-gray-100 shadow-xs hover:border-gray-200 transition-all flex flex-col justify-between group text-left"
              >
                {/* Couverture Visuelle 16:9 */}
                <div className="relative h-48 bg-gray-900 overflow-hidden flex items-center justify-center">
                  {eventImg ? (
                    <img
                      src={eventImg}
                      alt={eventTitle}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                  ) : (
                    <div className={`w-full h-full bg-gradient-to-br ${avatar.bgGradient} flex items-center justify-center text-white/80 group-hover:scale-110 transition-transform duration-300`}>
                      {avatar.icon}
                    </div>
                  )}

                  {/* Gradient Overlay sombre */}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />

                  {/* Badges Flottants */}
                  <div className="absolute top-3.5 left-3.5 right-3.5 flex items-center justify-between gap-2">
                    {/* Badge Type (Public / Privé) */}
                    <span className="px-3 py-1 bg-black/60 backdrop-blur-md text-white font-extrabold text-[10px] uppercase tracking-wider rounded-full border border-white/20 flex items-center gap-1">
                      {isPublic ? <Globe size={11} className="text-[#FF5005]" /> : <ShieldCheck size={11} className="text-blue-400" />}
                      <span>{isPublic ? 'Billetterie B2C' : 'Privé VIP'}</span>
                    </span>

                    {/* Badge Statut */}
                    <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-md px-3 py-1 rounded-full shadow-xs border border-white/40">
                      <div className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                      <span className="text-[10px] font-black uppercase tracking-wider text-gray-800">
                        {status.label}
                      </span>
                    </div>
                  </div>

                  {/* Horaires et Catégorie en bas de photo */}
                  <div className="absolute bottom-3 left-3.5 right-3.5 flex items-center justify-between text-white text-xs font-bold">
                    <span className="flex items-center gap-1 text-[11px] text-slate-200">
                      <Clock size={12} className="text-[#FF5005]" />
                      {event.heureDebut || '19:00'} - {event.heureFin || '23:30'}
                    </span>
                    {event.categorie && (
                      <span className="text-[10px] uppercase font-extrabold bg-white/20 px-2 py-0.5 rounded-md backdrop-blur-sm">
                        {event.categorie}
                      </span>
                    )}
                  </div>
                </div>

                {/* Corps de la Carte */}
                <div className="p-6 flex-1 flex flex-col justify-between space-y-4">
                  <div className="space-y-2">
                    <h3 className="text-lg font-black text-gray-900 line-clamp-1 group-hover:text-[#FF5005] transition-colors leading-snug">
                      {eventTitle}
                    </h3>
                    {eventDesc && (
                      <p className="text-gray-500 text-xs line-clamp-2 leading-relaxed">
                        {eventDesc}
                      </p>
                    )}

                    <div className="space-y-1.5 pt-2 text-xs text-gray-600 font-medium">
                      <div className="flex items-center gap-2 text-gray-700">
                        <Calendar size={14} className="text-[#FF5005] shrink-0" />
                        <span className="font-bold">{eventDate}</span>
                      </div>
                      <div className="flex items-center gap-2 text-gray-500">
                        <MapPin size={14} className="text-blue-500 shrink-0" />
                        <span className="truncate">{eventLoc}</span>
                      </div>
                    </div>
                  </div>

                  {/* Barre d'actions rapides */}
                  <div className="pt-4 border-t border-gray-100 flex items-center justify-between gap-2">
                    <button
                      onClick={() => openManageTab(event)}
                      className="flex-1 py-2.5 px-4 bg-[#0B1727] hover:bg-[#FF5005] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center justify-center gap-1.5 transition-colors cursor-pointer shadow-xs"
                    >
                      <span>Gérer le Hub</span>
                      <ArrowRight size={14} />
                    </button>

                    {/* Voir la page publique si B2C */}
                    {isPublic && (
                      <Link
                        to={`/event/${eventId}/tickets`}
                        target="_blank"
                        className="p-2.5 text-gray-500 hover:text-[#FF5005] hover:bg-orange-50 rounded-xl transition border border-gray-100 cursor-pointer"
                        title="Ouvrir la billetterie publique en direct"
                      >
                        <ExternalLink size={16} />
                      </Link>
                    )}

                    {/* Copier le lien */}
                    <button
                      onClick={() => copyPublicLink(event)}
                      className="p-2.5 text-gray-500 hover:text-blue-600 hover:bg-blue-50 rounded-xl transition border border-gray-100 cursor-pointer"
                      title="Copier le lien public"
                    >
                      {copiedEventId === eventId ? (
                        <Check size={16} className="text-emerald-500" />
                      ) : (
                        <Copy size={16} />
                      )}
                    </button>

                    {/* Supprimer */}
                    <button
                      onClick={() => setShowDeleteConfirm(eventId)}
                      className="p-2.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-xl transition border border-gray-100 cursor-pointer"
                      title="Supprimer l'événement"
                    >
                      <Trash2 size={16} />
                    </button>
                  </div>
                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* ======================================================= */}
      {/* 2. VUE EN LISTE COMPACTE (TABLE VIEW)                   */}
      {/* ======================================================= */}
      {viewMode === 'table' && processedEvents.length > 0 && (
        <div className="bg-white rounded-3xl border border-gray-100 shadow-xs overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead className="bg-gray-50/80 border-b border-gray-100 text-gray-400 uppercase font-black tracking-wider text-[10px]">
                <tr>
                  <th className="py-4 px-6">Événement</th>
                  <th className="py-4 px-4">Statut</th>
                  <th className="py-4 px-4">Date & Heure</th>
                  <th className="py-4 px-4">Lieu</th>
                  <th className="py-4 px-4">Format</th>
                  <th className="py-4 px-6 text-right">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {processedEvents.map((event) => {
                  const eventId = event._id || event.id;
                  const eventTitle = event.titre || event.title || event.name;
                  const eventDate = formatDate(event.DateDebut || event.date);
                  const eventLoc = event.lieu || 'Lieu communiqué';
                  const status = getStatusStyle(event.status);
                  const isPublic = event.eventType === 'public';

                  return (
                    <tr key={eventId} className="hover:bg-gray-50/50 transition">
                      <td className="py-4 px-6 font-black text-gray-900 text-sm">
                        <div className="flex items-center gap-3">
                          <div className="w-10 h-10 rounded-xl bg-orange-500/10 text-[#FF5005] flex items-center justify-center font-bold shrink-0">
                            {eventTitle[0].toUpperCase()}
                          </div>
                          <div>
                            <span className="block line-clamp-1">{eventTitle}</span>
                            <span className="text-[11px] text-gray-400 font-normal">{event.categorie || 'Général'}</span>
                          </div>
                        </div>
                      </td>
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${status.badge}`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${status.dot}`} />
                          {status.label}
                        </span>
                      </td>
                      <td className="py-4 px-4 text-gray-700 font-bold">
                        <div>{eventDate}</div>
                        <div className="text-[11px] text-gray-400 font-normal">{event.heureDebut || '19:00'}</div>
                      </td>
                      <td className="py-4 px-4 text-gray-600 font-medium max-w-xs truncate">
                        {eventLoc}
                      </td>
                      <td className="py-4 px-4">
                        <span className="text-[11px] font-extrabold text-gray-600 uppercase">
                          {isPublic ? 'Billetterie B2C' : 'Privé VIP'}
                        </span>
                      </td>
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-2">
                          <button
                            onClick={() => openManageTab(event)}
                            className="px-3.5 py-1.5 bg-[#0B1727] hover:bg-[#FF5005] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer"
                          >
                            Gérer
                          </button>
                          <button
                            onClick={() => setShowDeleteConfirm(eventId)}
                            className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================= */}
      {/* MODAL DE CONFIRMATION DE SUPPRESSION                    */}
      {/* ======================================================= */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <motion.div
            initial={{ scale: 0.95, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4"
          >
            <div className="w-14 h-14 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
              <Trash2 size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">Supprimer cet événement ?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Cette action est irréversible. Les invitations et billets associés seront révoqués.
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowDeleteConfirm(null)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={async () => {
                  if (showDeleteConfirm) {
                    await deleteEventById(showDeleteConfirm);
                  }
                }}
                disabled={deleteLoading}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition disabled:opacity-50 cursor-pointer shadow-lg shadow-red-500/20"
              >
                {deleteLoading ? 'Suppression...' : 'Supprimer'}
              </button>
            </div>
          </motion.div>
        </div>
      )}

    </div>
  );
};

export default EventManagement;