import React, { useEffect, useState, useMemo } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { 
  Calendar, MapPin, Users, AlertCircle, ArrowLeft, 
  Save, Check, Trash2, ShieldCheck, Sparkles, Clock, 
  Globe, Lock, Sliders, Bell, AlertTriangle, Eye, Upload 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useGetUserEvents } from '../../../../hooks/useEvent';
import { useAuthContext } from '../../../../context/AuthContext';
import { updateEvent } from '../../../../services/eventService';

/**
 * Paramètres Avancés d'un Événement Spécifique
 * Éditeur d'événement, quotas, règles d'accès, rappels automatiques et zone de danger.
 */
export function Event_parameter({ eventInfo: propEventInfo }) {
  const { eventId } = useParams();
  const navigate = useNavigate();
  const { user, token } = useAuthContext();
  const { events, loading, error, refetch } = useGetUserEvents(user?._id || user?.id, token, true);

  const [eventData, setEventData] = useState(propEventInfo || null);
  const [activeTab, setActiveTab] = useState('general'); // 'general' | 'access' | 'security' | 'danger'
  const [isSaving, setIsSaving] = useState(false);
  const [saveSuccess, setSaveSuccess] = useState('');
  const [saveError, setSaveError] = useState('');
  const [showDeleteModal, setShowDeleteModal] = useState(false);

  // Formulaire d'édition de l'événement
  const [form, setForm] = useState({
    titre: '',
    description: '',
    categorie: 'Autre',
    eventType: 'private',
    DateDebut: '',
    DateFin: '',
    heureDebut: '19:00',
    heureFin: '23:30',
    lieu: '',
    totalGuests: 100,
    status: 'en cours',
    rsvpDeadline: '',
    allowPlusOne: true,
    autoReminderWhatsapp: true,
    uniqueScanCheck: true,
  });

  // Synchronisation des données
  useEffect(() => {
    if (propEventInfo) {
      setEventData(propEventInfo);
      return;
    }

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
      const existing = events.find((ev) => ev._id === eventId || ev.id === eventId);
      if (existing) {
        setEventData(existing);
      }
    }
  }, [eventId, events, loading, propEventInfo]);

  useEffect(() => {
    if (eventData) {
      setForm({
        titre: eventData.titre || eventData.title || eventData.name || '',
        description: eventData.description || '',
        categorie: eventData.categorie || 'Autre',
        eventType: eventData.eventType || 'private',
        DateDebut: eventData.DateDebut ? new Date(eventData.DateDebut).toISOString().split('T')[0] : '',
        DateFin: eventData.DateFin ? new Date(eventData.DateFin).toISOString().split('T')[0] : '',
        heureDebut: eventData.heureDebut || '19:00',
        heureFin: eventData.heureFin || '23:30',
        lieu: eventData.lieu || '',
        totalGuests: eventData.totalGuests || eventData.capacity || 100,
        status: eventData.status || 'en cours',
        rsvpDeadline: eventData.rsvpDeadline || '',
        allowPlusOne: eventData.allowPlusOne ?? true,
        autoReminderWhatsapp: eventData.autoReminderWhatsapp ?? true,
        uniqueScanCheck: eventData.uniqueScanCheck ?? true,
      });
    }
  }, [eventData]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setForm((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
  };

  const handleSaveSettings = async (e) => {
    if (e) e.preventDefault();
    setIsSaving(true);
    setSaveSuccess('');
    setSaveError('');

    try {
      const targetId = eventData?._id || eventData?.id || eventId;
      const res = await updateEvent(targetId, form, token);

      setSaveSuccess("Paramètres de l'événement enregistrés avec succès !");
      sessionStorage.setItem(`manageEvent_${targetId}`, JSON.stringify({ ...eventData, ...form }));
      refetch();
      setTimeout(() => setSaveSuccess(''), 4000);
    } catch (err) {
      console.error('Erreur updateEvent:', err);
      setSaveError(err.message || "Erreur lors de la sauvegarde de l'événement.");
    } finally {
      setIsSaving(false);
    }
  };

  const tabs = [
    { id: 'general', label: 'Général & Horaires', icon: Calendar },
    { id: 'access', label: 'Quotas & Jauge RSVP', icon: Users },
    { id: 'security', label: 'Contrôle & Sécurité', icon: ShieldCheck },
    { id: 'danger', label: 'Zone de Danger', icon: AlertTriangle },
  ];

  if (!eventData && loading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center space-y-4">
        <div className="w-10 h-10 border-4 border-[#FF5005]/20 border-t-[#FF5005] rounded-full animate-spin" />
        <p className="text-xs font-bold uppercase tracking-wider text-gray-400">
          Chargement des paramètres...
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-6 font-sans text-left text-gray-900">
      
      {/* Barre de navigation des sous-onglets */}
      <div className="flex flex-wrap items-center gap-2 border-b border-gray-100 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#0B1727] text-white shadow-sm'
                  : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
              }`}
            >
              <Icon size={16} className={isActive ? 'text-[#FF5005]' : ''} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Messages d'alerte */}
      {saveSuccess && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <Check size={16} />
          <span>{saveSuccess}</span>
        </motion.div>
      )}

      {saveError && (
        <motion.div
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-4 bg-red-50 border border-red-200 text-red-700 text-xs font-bold rounded-2xl flex items-center gap-2"
        >
          <AlertCircle size={16} />
          <span>{saveError}</span>
        </motion.div>
      )}

      {/* Formulaire Principal */}
      <form onSubmit={handleSaveSettings} className="space-y-6">
        
        {/* ======================================================== */}
        {/* 1. ONGLET GÉNÉRAL & HORAIRES                             */}
        {/* ======================================================== */}
        {activeTab === 'general' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Informations & Coordonnées de l'Événement</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Modifiez le titre public, la description détaillée et la localisation de la réception.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              {/* Titre */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Titre de l'Événement *
                </label>
                <input
                  type="text"
                  required
                  name="titre"
                  value={form.titre}
                  onChange={handleInputChange}
                  placeholder="Ex: Gala Annuel de Prestige"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005] focus:bg-white transition"
                />
              </div>

              {/* Catégorie */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Catégorie
                </label>
                <select
                  name="categorie"
                  value={form.categorie}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005] cursor-pointer"
                >
                  <option value="Gala / Soirée">Gala / Soirée</option>
                  <option value="Conférence / Tech">Conférence / Tech</option>
                  <option value="Concert / Festival">Concert / Festival</option>
                  <option value="Mariage / Réception">Mariage / Réception</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>

              {/* Statut de l'événement */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Statut de Diffusion
                </label>
                <select
                  name="status"
                  value={form.status}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005] cursor-pointer"
                >
                  <option value="en cours">Actif / En cours</option>
                  <option value="en attente">En attente / Planifié</option>
                  <option value="terminer">Terminé</option>
                </select>
              </div>

              {/* Dates */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Date de Début *
                </label>
                <input
                  type="date"
                  required
                  name="DateDebut"
                  value={form.DateDebut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Date de Fin
                </label>
                <input
                  type="date"
                  name="DateFin"
                  value={form.DateFin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
              </div>

              {/* Horaires */}
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Heure d'Ouverture / Accueil
                </label>
                <input
                  type="time"
                  name="heureDebut"
                  value={form.heureDebut}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Heure de Clôture
                </label>
                <input
                  type="time"
                  name="heureFin"
                  value={form.heureFin}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
              </div>

              {/* Lieu */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Lieu & Adresse *
                </label>
                <input
                  type="text"
                  required
                  name="lieu"
                  value={form.lieu}
                  onChange={handleInputChange}
                  placeholder="Ex: Hôtel Hilton, Salle Ballroom, Paris"
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
              </div>

              {/* Description */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Description & Programme
                </label>
                <textarea
                  rows={4}
                  name="description"
                  value={form.description}
                  onChange={handleInputChange}
                  placeholder="Détails, dress code, intervenants..."
                  className="w-full p-4 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-medium text-gray-900 focus:outline-none focus:border-[#FF5005] leading-relaxed"
                />
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 2. ONGLET QUOTAS & JAUGE RSVP                            */}
        {/* ======================================================== */}
        {activeTab === 'access' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Capacité, Jauge & Inscriptions RSVP</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Régulez le flux des participants et automatisez les dates limites de réponse.
              </p>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
              
              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Jauge Maximale (Nombre de places total)
                </label>
                <input
                  type="number"
                  name="totalGuests"
                  value={form.totalGuests}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
                <span className="text-[10px] text-gray-400 mt-1 block">
                  Une fois ce quota atteint, les nouvelles réservations seront bloquées.
                </span>
              </div>

              <div>
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Format de l'Événement
                </label>
                <select
                  name="eventType"
                  value={form.eventType}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005] cursor-pointer"
                >
                  <option value="private">Privé VIP (Sur invitation)</option>
                  <option value="public">Public (Billetterie en ligne ouverte)</option>
                </select>
              </div>

              {/* Date limite RSVP */}
              <div className="sm:col-span-2">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700 mb-1.5">
                  Date Limite de Réponse (RSVP Deadline)
                </label>
                <input
                  type="date"
                  name="rsvpDeadline"
                  value={form.rsvpDeadline}
                  onChange={handleInputChange}
                  className="w-full px-4 py-3 bg-gray-50 border border-gray-200 rounded-2xl text-xs font-bold text-gray-900 focus:outline-none focus:border-[#FF5005]"
                />
              </div>

              {/* Checkboxes options */}
              <div className="sm:col-span-2 space-y-3 pt-2">
                <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
                  <input
                    type="checkbox"
                    name="allowPlusOne"
                    checked={form.allowPlusOne}
                    onChange={handleInputChange}
                    className="w-4 h-4 text-[#FF5005] rounded focus:ring-0 cursor-pointer"
                  />
                  <div>
                    <span className="text-xs font-bold text-gray-900 block">Autoriser les accompagnateurs (+1)</span>
                    <span className="text-[10px] text-gray-400">Permet à un invité de renseigner le nom de son accompagnateur.</span>
                  </div>
                </label>
              </div>

            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 3. ONGLET CONTRÔLE & SÉCURITÉ                            */}
        {/* ======================================================== */}
        {activeTab === 'security' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-gray-900">Sécurité des Billets & Rappels Automatiques</h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Paramétrez la validation cryptographique des QR Codes et les messages de rappel.
              </p>
            </div>

            <div className="space-y-4">
              <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="uniqueScanCheck"
                  checked={form.uniqueScanCheck}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FF5005] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Contrôle Anti-Replay (Scan Unique)</span>
                  <span className="text-[10px] text-gray-400">
                    Chaque QR Code ne peut être validé qu'une seule fois à l'entrée pour éviter les fraudes.
                  </span>
                </div>
              </label>

              <label className="flex items-center gap-3 p-4 rounded-2xl bg-gray-50 border border-gray-100 cursor-pointer">
                <input
                  type="checkbox"
                  name="autoReminderWhatsapp"
                  checked={form.autoReminderWhatsapp}
                  onChange={handleInputChange}
                  className="w-4 h-4 text-[#FF5005] rounded focus:ring-0 cursor-pointer"
                />
                <div>
                  <span className="text-xs font-bold text-gray-900 block">Rappel Automatique WhatsApp & Email J-1</span>
                  <span className="text-[10px] text-gray-400">
                    Envoie un rappel 24 heures avant l'événement avec le billet et l'itinéraire direct.
                  </span>
                </div>
              </label>
            </div>
          </div>
        )}

        {/* ======================================================== */}
        {/* 4. ONGLET ZONE DE DANGER                                 */}
        {/* ======================================================== */}
        {activeTab === 'danger' && (
          <div className="bg-white rounded-3xl p-6 sm:p-8 border border-red-100 shadow-xs space-y-6">
            <div>
              <h3 className="text-lg font-black text-red-600 flex items-center gap-2">
                <AlertTriangle size={20} />
                <span>Zone Critique de l'Événement</span>
              </h3>
              <p className="text-xs text-gray-400 mt-0.5">
                Actions irréversibles relatives à cet événement et à ses billets associés.
              </p>
            </div>

            <div className="p-5 rounded-2xl bg-red-50/50 border border-red-200/60 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div>
                <h4 className="text-xs font-black text-red-900">Supprimer définitivement l'événement</h4>
                <p className="text-[11px] text-red-700 mt-0.5">
                  Cette action révoquera immédiatement tous les billets, invitations et QR Codes émis.
                </p>
              </div>

              <button
                type="button"
                onClick={() => setShowDeleteModal(true)}
                className="px-5 py-2.5 bg-red-600 hover:bg-red-700 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
              >
                Supprimer
              </button>
            </div>
          </div>
        )}

        {/* Bouton d'Enregistrement Global */}
        <div className="pt-2 flex justify-end">
          <motion.button
            type="submit"
            disabled={isSaving}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            className="px-7 py-3.5 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5f1b] hover:to-[#ff861b] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-lg shadow-orange-500/25 flex items-center gap-2 transition disabled:opacity-50 cursor-pointer"
          >
            {isSaving ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Enregistrement...</span>
              </div>
            ) : (
              <>
                <Save size={16} />
                <span>Enregistrer les paramètres</span>
              </>
            )}
          </motion.button>
        </div>

      </form>

    </div>
  );
}

export default Event_parameter;
