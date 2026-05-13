import React, { useState, useEffect } from 'react';
import { Plus, Calendar, MapPin, Users, BarChart2, Edit3, Loader, AlertCircle, Trash2, CalendarDays, PartyPopper, Music, Briefcase, GraduationCap, Gift, Sparkles, Globe, Trophy, Heart, Coffee, Mic, Film, Camera, Zap } from 'lucide-react';
import { useGetUserEvents, useDeleteEvent } from '../../../hooks/useEvent';
import { useAuthContext } from '../../../context/AuthContext';
import EventForm from './eventForm';

const EventManagement = () => {
  const { user, token } = useAuthContext();
  const [filter, setFilter] = useState('All');
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false)
  
  // Utilisation du hook pour récupérer les événements
  const { events, loading, error, total, refetch } = useGetUserEvents(
    user?._id || user?.id,
    token,
    true
  );
  
  // Utilisation du hook pour la suppression
  const { deleteEventById, loading: deleteLoading, error: deleteError } = useDeleteEvent(
    token,
    (deletedId, response) => {
      console.log('Événement supprimé avec succès:', deletedId);
      refetch();
      setShowDeleteConfirm(null);
    }
  );

  // Rafraîchir les événements quand l'utilisateur change
  useEffect(() => {
    if (user && token) {
      refetch();
    }
  }, [user, token, refetch]);

  // Logique de filtrage des événements
  const filteredEvents = events.filter(event => {
    if (filter === 'All') return true;
    if (filter === 'Active') {
      return event.status === 'en cours'
    }
    if (filter === 'Past') {
      return event.status === 'terminer';
    }
    if (filter === 'Pending') {
      return event.status === 'en attente'
    }
    return true;
  });

  // Options de filtrage
  const filterOptions = [
    { key: 'All', label: 'Tous' },
    { key: 'Active', label: 'Actifs' },
    { key: 'Past', label: 'Passés' },
    { key: 'Pending', label: 'En attente' }
  ];

  // Fonction pour obtenir une icône événementielle basée sur le titre et la description
  const getEventAvatar = (event) => {
    const title = (event.titre || event.title || event.name || '').toLowerCase();
    const description = (event.description || '').toLowerCase();
    const combinedText = title + ' ' + description;
    
    // Catégories d'événements avec leurs icônes et couleurs
    const categories = [
      { keywords: ['gala', 'soirée', 'prestige', 'luxe', 'dîner'], icon: <PartyPopper size={32} />, bgGradient: 'from-purple-500 to-pink-500', color: 'text-purple-100' },
      { keywords: ['conférence', 'séminaire', 'forum', 'congrès', 'tech', 'webinar'], icon: <Briefcase size={32} />, bgGradient: 'from-blue-500 to-indigo-500', color: 'text-blue-100' },
      { keywords: ['concert', 'festival', 'musique', 'dj', 'live'], icon: <Music size={32} />, bgGradient: 'from-red-500 to-orange-500', color: 'text-red-100' },
      { keywords: ['sport', 'match', 'tournoi', 'competition', 'marathon'], icon: <Trophy size={32} />, bgGradient: 'from-green-500 to-emerald-500', color: 'text-green-100' },
      { keywords: ['formation', 'atelier', 'workshop', 'masterclass', 'cours'], icon: <GraduationCap size={32} />, bgGradient: 'from-cyan-500 to-teal-500', color: 'text-cyan-100' },
      { keywords: ['anniversaire', 'fête', 'célébration', 'birthday'], icon: <Gift size={32} />, bgGradient: 'from-pink-500 to-rose-500', color: 'text-pink-100' },
      { keywords: ['corporate', 'entreprise', 'business', 'networking', 'réseautage'], icon: <Globe size={32} />, bgGradient: 'from-slate-500 to-gray-500', color: 'text-slate-100' },
      { keywords: ['mariage', 'wedding', 'noces', 'alliance'], icon: <Heart size={32} />, bgGradient: 'from-red-400 to-pink-400', color: 'text-red-100' },
      { keywords: ['café', 'meeting', 'rencontre', 'coworking'], icon: <Coffee size={32} />, bgGradient: 'from-amber-500 to-yellow-500', color: 'text-amber-100' },
      { keywords: ['spectacle', 'théâtre', 'comédie', 'show'], icon: <Mic size={32} />, bgGradient: 'from-violet-500 to-purple-500', color: 'text-violet-100' },
      { keywords: ['cinéma', 'film', 'projection', 'première'], icon: <Film size={32} />, bgGradient: 'from-indigo-600 to-blue-600', color: 'text-indigo-100' },
      { keywords: ['exposition', 'art', 'galerie', 'vernissage', 'peinture'], icon: <Camera size={32} />, bgGradient: 'from-amber-600 to-orange-600', color: 'text-amber-100' },
      { keywords: ['innovation', 'startup', 'hackathon', 'digital'], icon: <Zap size={32} />, bgGradient: 'from-yellow-500 to-orange-500', color: 'text-yellow-100' }
    ];
    
    // Chercher une catégorie correspondante
    for (const category of categories) {
      if (category.keywords.some(keyword => combinedText.includes(keyword))) {
        return { ...category, isCustom: true };
      }
    }
    
    // Icône par défaut avec thème événementiel
    return {
      icon: <CalendarDays size={32} />,
      bgGradient: 'from-blue-400 to-blue-600',
      color: 'text-blue-100',
      isCustom: false
    };
  };

  // Fonction pour obtenir un emoji aléatoire comme fallback
  const getRandomEmoji = (title) => {
    const emojis = ['🎉', '🎊', '✨', '⭐', '🌟', '💫', '🎈', '🎯', '🏆', '🎭', '🎪', '🎨', '🎬', '📸', '🎵', '🎶', '💼', '🤝', '🌍', '🚀'];
    const index = title.length % emojis.length;
    return emojis[index];
  };

  // Fonction pour gérer la suppression
  const handleDeleteClick = (eventId) => {
    setShowDeleteConfirm(eventId);
  };

  const handleConfirmDelete = async () => {
    if (showDeleteConfirm) {
      await deleteEventById(showDeleteConfirm);
    }
  };

  const handleCancelDelete = () => {
    setShowDeleteConfirm(null);
  };

  const openManageTab = (event) => {
    if (!event) return;
    const eventId = event._id || event.id;
    if (!eventId) return;
    sessionStorage.setItem(`manageEvent_${eventId}`, JSON.stringify(event));
    const manageUrl = `/dashboard/evenement/manage/${eventId}`;
    window.open(manageUrl, '_blank', 'noopener,noreferrer');
  };

  // Fonction pour formater la date
  const formatDate = (dateString) => {
    if (!dateString) return 'Date non définie';
    if (dateString === 'Prochainement') return dateString;
    
    const date = new Date(dateString);
    if (isNaN(date.getTime())) return dateString;
    
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric'
    });
  };

  // Fonction pour formater le statut avec le bon libellé en français
  const getStatusLabel = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active' ) {
      return 'Actif';
    }
    if (statusLower === statusLower === 'terminé') {
      return 'Passé';
    }
    if (statusLower === 'en attente') {
      return 'En attente';
    }
    return status || 'En attente';
  };

  // Fonction pour obtenir les couleurs du statut
  const getStatusColor = (status) => {
    const statusLower = (status || '').toLowerCase();
    if (statusLower === 'active' || statusLower === 'ongoing' || statusLower === 'activé') {
      return { bg: 'bg-green-100', text: 'text-green-600', dot: 'bg-green-500' };
    }
    if (statusLower === 'past' || statusLower === 'completed' || statusLower === 'terminé') {
      return { bg: 'bg-slate-100', text: 'text-slate-600', dot: 'bg-slate-500' };
    }
    if (statusLower === 'pending' || statusLower === 'en attente' || statusLower === 'draft' || statusLower === 'drafts') {
      return { bg: 'bg-amber-100', text: 'text-amber-600', dot: 'bg-amber-500' };
    }
    return { bg: 'bg-gray-100', text: 'text-gray-600', dot: 'bg-gray-500' };
  };

  // Fonction pour formater le nombre d'invités
  const formatGuests = (event) => {
    const confirmed = event.confirmedGuests || event.participants || event.attendees || 0;
    const total = event.totalGuests || event.capacity || event.maxAttendees || 0;
    
    if (total === 0) return `${confirmed} invités`;
    return `${confirmed} / ${total} invités confirmés`;
  };

  // Affichage du chargement
  if (loading && events.length === 0) {
    return (
      <div className="px-29 mt-10 font">
        <div className="flex justify-center items-center h-96">
          <div className="text-center">
            <Loader size={48} className="animate-spin text-blue-600 mx-auto mb-4" />
            <p className="text-slate-600 font-medium">Chargement de vos événements...</p>
          </div>
        </div>
      </div>
    );
  }

  // Affichage de l'erreur
  if (error) {
    return (
      <div className="px-29 mt-10 font">
        <div className="flex justify-center items-center h-96">
          <div className="text-center max-w-md">
            <AlertCircle size={48} className="text-red-500 mx-auto mb-4" />
            <p className="text-red-600 font-bold mb-2">Erreur de chargement</p>
            <p className="text-slate-500 mb-6">{error}</p>
            <button 
              onClick={() => refetch()}
              className="px-6 py-2 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 transition-colors"
            >
              Réessayer
            </button>
          </div>
        </div>
      </div>
    );
  }

  const ModalOpen = () => {
    setIsModalOpen(true)
  }
  const ModalClose = () => {
    setIsModalOpen(false)
  }

  return (
    <div className="px-29 mt-10 font">
      {/* Header Section */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-10 gap-4">
        <div>
          <h1 className="text-4xl font-bold text-slate-900 tracking-tight">Gestion des Événements</h1>
          <p className="text-slate-500 font-semibold mt-1">
            Supervisez et organisez vos événements prestigieux en un coup d'œil.
            {total > 0 && <span className="ml-2 text-blue-600">({total} événements)</span>}
          </p>
        </div>
        
        <div className="flex items-center gap-4 bg-white p-1.5 rounded-2xl shadow-sm border border-slate-100">
          {filterOptions.map((opt) => (
            <button
              key={opt.key}
              onClick={() => setFilter(opt.key)}
              className={`px-6 py-2 rounded-xl text-sm font-bold transition-all ${
                filter === opt.key 
                ? 'bg-blue-600 text-white shadow-md' 
                : 'text-slate-500 hover:bg-slate-100 border-1 border-gray-200 transition duration-300'
              }`}
            >
              {opt.label}
            </button>
          ))}
          <button 
          onClick={ModalOpen}
          className="ml-4 bg-blue-600 text-white px-6 py-2.5 rounded-xl    text-sm font-bold flex items-center gap-2 hover:bg-blue-700 transition-colors shadow-lg shadow-blue-200">
            <Plus size={18} />
            Créer un événement
          </button>
        </div>
      </div>
      {/* formulaire de création d'événement */}
      {isModalOpen && (
        <div onClick={ModalClose} className="modal fixed inset-0 bg-black/20 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
          <div onClick={(e) => e.stopPropagation()} className="modal-content w-full max-w-3xl p-8">
            <EventForm closeModal={ModalClose} />
          </div>
        </div>
      )}
      {/* Aucun événement */}
      {filteredEvents.length === 0 && (
        <div className="text-center py-20 bg-white rounded-3xl border border-slate-100">
          <Calendar size={64} className="text-slate-300 mx-auto mb-4" />
          <h3 className="text-xl font-bold text-slate-700 mb-2">Aucun événement trouvé</h3>
          <p className="text-slate-500">
            {events.length === 0 
              ? "Vous n'avez pas encore créé d'événement." 
              : `Aucun événement ${filter === 'Pending' ? 'en attente' : filter === 'Active' ? 'actif' : filter === 'Past' ? 'passé' : ''}.`}
          </p>
          {events.length === 0 && (
            <button onClick={ModalOpen} className="mt-6 bg-blue-600 text-white px-6 py-2.5 rounded-xl text-sm font-bold flex items-center gap-2 mx-auto hover:bg-blue-700 transition-colors">
              <Plus size={18} />
              Créer votre premier événement
            </button>
          )}
        </div>
      )}

      {/* Events Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {filteredEvents.map((event) => {
          const statusStyle = getStatusColor(event.status);
          const statusLabel = getStatusLabel(event.status);
          const eventTitle = event.titre || event.title || event.name;
          const eventDescription = event.description;
          const eventLocation = event.lieu;
          const eventDate = formatDate(event.date || event.startDate || event.scheduledDate);
          const eventAvatar = getEventAvatar(event);
          const randomEmoji = getRandomEmoji(eventTitle);
          
          return (
            <div key={event.id || event._id} className="bg-white rounded-[2rem] overflow-hidden shadow-sm border border-slate-100 hover:shadow-xl transition-all duration-300 group">
              {/* Avatar Section avec gradient */}
              <div className={`relative h-56 bg-gradient-to-br ${eventAvatar.bgGradient} overflow-hidden flex items-center justify-center`}>
                {/* Pattern de fond décoratif */}
                <div className="absolute inset-0 opacity-10">
                  <div className="absolute top-0 left-0 w-32 h-32 bg-white rounded-full -translate-x-16 -translate-y-16"></div>
                  <div className="absolute bottom-0 right-0 w-40 h-40 bg-white rounded-full translate-x-20 translate-y-20"></div>
                  <div className="absolute top-1/2 left-1/2 w-64 h-64 bg-white rounded-full -translate-x-1/2 -translate-y-1/2 opacity-30"></div>
                </div>
                
                {/* Avatar Central */}
                <div className="relative z-10 flex flex-col items-center justify-center">
                  <div className="bg-white/20 backdrop-blur-md rounded-full p-6 mb-3 shadow-xl border border-white/30">
                    {React.cloneElement(eventAvatar.icon, { 
                      className: `${eventAvatar.color} drop-shadow-lg`,
                      size: 48 
                    })}
                  </div>
                  <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-4 py-2 rounded-full shadow-lg">
                    <span className="text-2xl">{randomEmoji}</span>
                    <span className="text-xs font-bold text-slate-700 uppercase tracking-wide">Événement</span>
                  </div>
                </div>
                
                {/* Status Badge */}
                <div className="absolute top-6 right-6 flex items-center gap-2 bg-white/90 backdrop-blur-md px-4 py-1.5 rounded-full shadow-sm">
                  <div className={`w-2 h-2 rounded-full ${statusStyle.dot}`} />
                  <span className={`text-xs font-bold tracking-wide uppercase ${statusStyle.text}`}>
                    {statusLabel}
                  </span>
                </div>
              </div>

              {/* Content */}
              <div className="p-8">
                <h3 className="text-2xl font-black text-[#017EF7] leading-tight mb-2 line-clamp-2">
                  {eventTitle}
                </h3>
                {eventDescription && (
                  <p className="text-slate-600 text-sm mb-6 line-clamp-2">
                    {eventDescription}
                  </p>
                )}
                <div className="space-y-3 mb-8">
                  <div className="flex items-center gap-3 text-slate-500">
                    <Calendar size={16} className="text-blue-500 shrink-0" />
                    <span className="text-sm font-medium">{eventDate}</span>
                  </div>
                  <div className="flex items-start gap-3 text-slate-500">
                    <MapPin size={16} className="text-blue-500 shrink-0 mt-0.5" />
                    <span className="text-sm font-medium line-clamp-1">{eventLocation}</span>
                  </div>
                  <div className="flex items-center gap-3 text-slate-500">
                    <Users size={16} className="text-blue-500 shrink-0" />
                    <span className="text-sm font-medium">{formatGuests(event)}</span>
                  </div>
                </div>

                {/* Actions */}
                <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-2">
                  <button onClick={() => openManageTab(event)} className="flex-1 bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white font-bold py-2.5 rounded-xl text-sm transition-all shadow-md hover:shadow-lg">
                    Gérer
                  </button>
                  <button className="p-2.5 text-orange-500 hover:bg-orange-50 rounded-xl transition-colors">
                    <BarChart2 size={20} />
                  </button>
                  <button className="p-2.5 text-green-500 hover:bg-green-50 rounded-xl transition-colors">
                    <Edit3 size={20} />
                  </button>
                  <button 
                    onClick={() => handleDeleteClick(event.id || event._id)}
                    className="p-2.5 text-red-500 hover:bg-red-50 rounded-xl transition-colors"
                    disabled={deleteLoading}
                  >
                    <Trash2 size={20} />
                  </button>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* Modal de confirmation de suppression */}
      {showDeleteConfirm && (
        <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50">
          <div className="bg-white rounded-2xl p-8 max-w-md mx-4 shadow-2xl">
            <div className="flex items-center gap-3 mb-4">
              <div className="bg-red-100 p-3 rounded-full">
                <Trash2 size={24} className="text-red-600" />
              </div>
              <h3 className="text-2xl font-bold text-slate-900">Confirmer la suppression</h3>
            </div>
            
            <p className="text-slate-600 mb-6">
              Êtes-vous sûr de vouloir supprimer cet événement ? Cette action est irréversible.
            </p>
            
            {deleteError && (
              <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-xl">
                <p className="text-red-600 text-sm">{deleteError}</p>
              </div>
            )}
            
            <div className="flex gap-3">
              <button
                onClick={handleConfirmDelete}
                disabled={deleteLoading}
                className="flex-1 bg-red-600 hover:bg-red-700 text-white font-bold py-3 rounded-xl transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {deleteLoading ? (
                  <div className="flex items-center justify-center gap-2">
                    <Loader size={18} className="animate-spin" />
                    <span>Suppression...</span>
                  </div>
                ) : (
                  'Supprimer'
                )}
              </button>
              <button
                onClick={handleCancelDelete}
                disabled={deleteLoading}
                className="flex-1 bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold py-3 rounded-xl transition-colors"
              >
                Annuler
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default EventManagement;