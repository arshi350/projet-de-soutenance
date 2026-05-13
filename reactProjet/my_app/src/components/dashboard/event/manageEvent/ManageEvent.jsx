import React, { useEffect, useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { Calendar, MapPin, Users, AlertCircle, ArrowLeft, Edit3, Trash2 } from 'lucide-react';
import { useGetUserEvents } from '../../../../hooks/useEvent';
import { useAuthContext } from '../../../../context/AuthContext';

const ManageEvent = () => {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  const { events, loading, error, refetch } = useGetUserEvents(user?._id || user?.id, token, true);
  const [eventData, setEventData] = useState(null);

  useEffect(() => {
    if (!eventId) return;
    const stored = sessionStorage.getItem(`manageEvent_${eventId}`);
    if (stored) {
      try {
        setEventData(JSON.parse(stored));
        return;
      } catch {
        sessionStorage.removeItem(`manageEvent_${eventId}`);
      }
    }

    if (!loading && events.length > 0) {
      const existing = events.find((event) => event._id === eventId || event.id === eventId);
      if (existing) {
        setEventData(existing);
      }
    }
  }, [eventId, events, loading]);

  const formattedEvent = useMemo(() => {
    if (!eventData) return null;
    const date = eventData.DateDebut || eventData.date || eventData.startDate || '';
    const endDate = eventData.DateFin || eventData.endDate || '';
    return {
      ...eventData,
      dateLabel: date ? new Date(date).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date non définie',
      endDateLabel: endDate ? new Date(endDate).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : 'Date non définie',
      confirmed: eventData.confirmedGuests || eventData.participants || eventData.attendees || 0,
      total: eventData.totalGuests || eventData.capacity || eventData.maxAttendees || 0,
    };
  }, [eventData]);

  const handleBack = () => {
    navigate('/dashboard/evenement');
  };

  if (loading && !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="text-center text-slate-600">Chargement de l'événement...</div>
      </div>
    );
  }

  if (error && !eventData) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white shadow-xl rounded-3xl border border-red-100 p-8 text-center">
          <AlertCircle size={40} className="mx-auto mb-4 text-red-500" />
          <h2 className="text-xl font-bold text-slate-900 mb-2">Impossible de charger l'événement</h2>
          <p className="text-slate-500 mb-6">{error}</p>
          <button
            onClick={() => refetch()}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            Réessayer
          </button>
        </div>
      </div>
    );
  }

  if (!formattedEvent) {
    return (
      <div className="min-h-screen flex items-center justify-center px-6 py-16">
        <div className="max-w-md w-full bg-white shadow-xl rounded-3xl border border-slate-200 p-8 text-center">
          <h2 className="text-xl font-bold text-slate-900 mb-4">Événement introuvable</h2>
          <p className="text-slate-500 mb-6">Les informations demandées ne sont pas disponibles dans cet onglet.</p>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 px-5 py-3 rounded-2xl bg-blue-600 text-white font-semibold hover:bg-blue-700 transition"
          >
            <ArrowLeft size={18} /> Retour à la gestion
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-50 px-6 py-10">
      <div className="max-w-6xl mx-auto space-y-8">
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="text-sm uppercase tracking-[0.2em] text-slate-400">Gestion multi-onglets</p>
            <h1 className="text-4xl font-bold text-slate-900">Événement : {formattedEvent.titre }</h1>
            <p className="mt-2 text-sm text-slate-500">Gérez cet événement dans un onglet dédié sans perdre le fil sur vos autres événements.</p>
          </div>
          <button
            onClick={handleBack}
            className="inline-flex items-center gap-2 rounded-2xl bg-slate-900 px-5 py-3 text-white font-semibold hover:bg-slate-800 transition"
          >
            <ArrowLeft size={18} /> Retour au tableau
          </button>
        </div>

        <div className="grid gap-6 lg:grid-cols-[1.25fr,0.9fr]">
          <div className="space-y-6">
            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <span className="inline-flex items-center gap-2 rounded-full bg-blue-50 px-3 py-1 text-sm font-semibold text-blue-700">
                    <Calendar size={16} /> {formattedEvent.categorie || 'Catégorie inconnue'}
                  </span>
                  <h2 className="mt-4 text-3xl font-bold text-slate-900">Détails de l'événement</h2>
                </div>
                <div className="inline-flex items-center gap-3 rounded-3xl bg-slate-100 px-4 py-3 text-sm text-slate-600">
                  <Users size={18} className="text-slate-500" />
                  {formattedEvent.confirmed} confirmés{formattedEvent.total ? ` / ${formattedEvent.total} invités` : ''}
                </div>
              </div>

              <div className="mt-8 grid gap-4 sm:grid-cols-2">
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date de début</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.dateLabel}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Date de fin</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.endDateLabel}</p>
                </div>
                <div className="rounded-3xl bg-slate-50 p-5 sm:col-span-2">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Lieu</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.lieu || 'Lieu non défini'}</p>
                </div>
              </div>

              <div className="mt-8 space-y-4">
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Description</p>
                  <p className="mt-3 text-slate-700 leading-relaxed whitespace-pre-line">{formattedEvent.description || 'Aucune description fournie pour cet événement.'}</p>
                </div>
                <div>
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Informations supplémentaires</p>
                  <div className="mt-3 grid gap-3 sm:grid-cols-2">
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Heure de début</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.heureDebut || 'Non définie'}</p>
                    </div>
                    <div className="rounded-3xl bg-slate-50 p-5">
                      <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Heure de fin</p>
                      <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.heureFin || 'Non définie'}</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
              <div className="flex items-center justify-between gap-4">
                <div>
                  <h3 className="text-xl font-bold text-slate-900">Actions rapide</h3>
                  <p className="text-sm text-slate-500">Gérez cet événement sans perdre le contexte.</p>
                </div>
                <div className="inline-flex items-center rounded-3xl bg-slate-100 px-4 py-2 text-sm text-slate-600">
                  <Edit3 size={18} /> Édition instantanée
                </div>
              </div>

              <div className="mt-6 grid gap-3 sm:grid-cols-3">
                <button className="rounded-3xl border border-blue-200 bg-blue-50 px-5 py-4 text-left text-sm font-semibold text-blue-700 hover:bg-blue-100 transition">
                  Modifier les détails
                </button>
                <button className="rounded-3xl border border-amber-200 bg-amber-50 px-5 py-4 text-left text-sm font-semibold text-amber-700 hover:bg-amber-100 transition">
                  Gérer les invités
                </button>
                <button className="rounded-3xl border border-red-200 bg-red-50 px-5 py-4 text-left text-sm font-semibold text-red-700 hover:bg-red-100 transition">
                  Supprimer l'événement
                </button>
              </div>
            </div>
          </div>

          <aside className="rounded-[2rem] border border-slate-200 bg-white p-8 shadow-sm">
            <div className="flex items-center gap-3 text-slate-900">
              <MapPin size={20} className="text-blue-600" />
              <span className="text-sm font-semibold">Localisation</span>
            </div>
            <p className="mt-4 text-slate-600 leading-relaxed">{formattedEvent.lieu || 'Lieu non défini pour cet événement.'}</p>

            <div className="mt-8 space-y-4">
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Status</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.status || 'Statut non précisé'}</p>
              </div>
              <div className="rounded-3xl bg-slate-50 p-5">
                <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Invités confirmés</p>
                <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.confirmed}</p>
              </div>
              {formattedEvent.total > 0 && (
                <div className="rounded-3xl bg-slate-50 p-5">
                  <p className="text-xs uppercase tracking-[0.18em] text-slate-400">Capacité totale</p>
                  <p className="mt-2 text-lg font-semibold text-slate-900">{formattedEvent.total}</p>
                </div>
              )}
            </div>
          </aside>
        </div>
      </div>
    </div>
  );
};

export default ManageEvent;
