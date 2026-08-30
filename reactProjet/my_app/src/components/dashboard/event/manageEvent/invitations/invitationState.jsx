import React, { useMemo, useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  Loader2, 
  CheckCircle, 
  XCircle, 
  QrCode, 
  Mail, 
  Phone, 
  Send, 
  RefreshCw, 
  Search, 
  Clock, 
  Trash2, 
  CheckSquare, 
  Square, 
  Check, 
  X, 
  Sparkles, 
  ShieldCheck, 
  Crown,
  Eye,
  Share2,
  ExternalLink,
  Layers,
  ArrowRight,
  AlertCircle
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { useAuthContext } from '../../../../../context/AuthContext';
import { useCreateInvitations } from '../../../../../hooks/useInvitation';
import { useGetInvitations } from '../../../../../hooks/useGetInvitations';
import { useQrCodes } from '../../../../../hooks/useQrCode';
import { useGetTemplate } from '../../../../../hooks/useTemplates';
import { useGetInvitesByEvent } from '../../../../../hooks/useInvite';
import { 
  sendInvitations as sendInvitationsApi,
  deleteInvitation as apiDeleteInvitation,
  bulkDeleteInvitations as apiBulkDeleteInvitations
} from '../../../../../services/invitationService';
import { generateSingleQrCodeApi } from '../../../../../services/qrCodeService';
import AiInvitationModal from './AiInvitationModal';
import AiEmailConciergeModal from './AiEmailConciergeModal';

export default function InvitationState({ eventInfo, eventId: propEventId }) {
  const [activeFilter, setActiveFilter] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [visibleCount, setVisibleCount] = useState(12);
  
  const [selectedInviteIds, setSelectedInviteIds] = useState([]);
  const [deleting, setDeleting] = useState(false);
  const [generatingSingleQrId, setGeneratingSingleQrId] = useState(null);
  const [sendingSingleId, setSendingSingleId] = useState(null);
  const [previewQrModal, setPreviewQrModal] = useState(null);

  const [customMessage, setCustomMessage] = useState('');
  const [showAiModal, setShowAiModal] = useState(false);
  const [showEmailConciergeModal, setShowEmailConciergeModal] = useState(false);
  const [showLoadingModal, setShowLoadingModal] = useState(false);
  const [loadingModalConfig, setLoadingModalConfig] = useState({
    title: '',
    subtitle: '',
    progress: 0,
    status: 'loading',
    message: '',
  });
  
  const { eventId: routeEventId } = useParams();
  const [searchParams] = useSearchParams();
  const selectedTemplateId = searchParams.get('templateId');
  const { token } = useAuthContext();
  const eventId = eventInfo?._id || eventInfo?.id || propEventId || routeEventId;

  // Hooks Backend
  const { template: selectedTemplate } = useGetTemplate(selectedTemplateId, token);
  const { createInvitations, loading: creatingInvitations } = useCreateInvitations(token);
  const [sendingInvitations, setSendingInvitations] = useState(false);
  
  const { 
    qrCodes, 
    hasQrCodes, 
    loading: qrLoading, 
    fetchQrCodes,
    generateQrCodes, 
    generating: qrGenerating 
  } = useQrCodes(eventId, token);
  
  const { 
    invitations: fetchedInvitations, 
    loading: invitationsLoading, 
    refetch: refetchInvitations 
  } = useGetInvitations(eventId, token, Boolean(eventId));

  const {
    invites: fetchedGuests,
    loading: guestsLoading,
    refetch: refetchGuests
  } = useGetInvitesByEvent(eventId, token, Boolean(eventId));

  // Fusionner les données des invités et des invitations pour une vision complète
  const guestCardsList = useMemo(() => {
    // Base principale : les invités enregistrés
    const guests = Array.isArray(fetchedGuests) && fetchedGuests.length > 0 ? fetchedGuests : [];
    const invitations = Array.isArray(fetchedInvitations) && fetchedInvitations.length > 0 ? fetchedInvitations : [];

    // Si on a des invitations mais pas d'invités chargés, utiliser les invitations comme base
    if (guests.length === 0 && invitations.length > 0) {
      return invitations.map(inv => {
        const qrMatch = qrCodes.find(q => q.inviteId === inv.inviteId || q.inviteId === inv._id);
        const qrImage = inv.qrCodeImage || qrMatch?.qrCodeData || qrMatch?.url;
        return {
          _id: inv._id,
          inviteId: inv.inviteId || inv._id,
          nom: inv.nom,
          prenom: inv.prenom,
          email: inv.inviteeEmail,
          telephone: inv.invitePhone,
          status: inv.guestStatus || 'classique',
          rsvpStatus: inv.rsvpStatus || inv.status || 'en attente',
          hasQrCode: Boolean(qrImage),
          qrCodeUrl: qrImage,
          hasInvitation: true,
          emailSent: inv.emailSent,
          emailSentAt: inv.emailSentAt,
          whatsappSent: inv.whatsappSent,
          invitationDoc: inv
        };
      });
    }

    // Mapper les invités avec leurs éventuels QR codes et invitations
    return guests.map(guest => {
      const gId = (guest._id || guest.id)?.toString();
      const invMatch = invitations.find(i => (i.inviteId || i._id)?.toString() === gId);
      const qrMatch = qrCodes.find(q => q.inviteId?.toString() === gId || q.invite?._id?.toString() === gId);
      
      const qrImage = invMatch?.qrCodeImage || (qrMatch?.qrCodeData ? `data:image/png;base64,${qrMatch.qrCodeData}` : null) || qrMatch?.url || null;
      const hasQr = Boolean(qrImage) || guest.isScanned;
      const hasInv = Boolean(invMatch);

      return {
        _id: invMatch?._id || gId,
        inviteId: gId,
        nom: guest.nom,
        prenom: guest.prenom,
        email: guest.email || invMatch?.inviteeEmail || '',
        telephone: guest.telephone || invMatch?.invitePhone || '',
        status: (guest.status || invMatch?.guestStatus || 'classique').toLowerCase(),
        rsvpStatus: invMatch?.rsvpStatus || invMatch?.status || (guest.isPresent ? 'confirmé' : 'en attente'),
        hasQrCode: hasQr,
        qrCodeUrl: qrImage,
        hasInvitation: hasInv,
        emailSent: Boolean(invMatch?.emailSent),
        emailSentAt: invMatch?.emailSentAt,
        whatsappSent: Boolean(invMatch?.whatsappSent),
        invitationDoc: invMatch
      };
    });
  }, [fetchedGuests, fetchedInvitations, qrCodes]);

  // Filtrage
  const filteredGuests = useMemo(() => {
    return guestCardsList.filter(item => {
      const typeStatus = (item.status || '').toLowerCase();
      const rsvp = (item.rsvpStatus || '').toLowerCase();
      
      let matchesFilter = true;
      if (activeFilter === 'VIP') matchesFilter = typeStatus === 'vip';
      else if (activeFilter === 'Pending') matchesFilter = rsvp.includes('attente');
      else if (activeFilter === 'Confirmed') matchesFilter = rsvp.includes('confirm') || rsvp.includes('présent');
      else if (activeFilter === 'Declined') matchesFilter = rsvp.includes('refus') || rsvp.includes('absent');
      else if (activeFilter === 'MissingQR') matchesFilter = !item.hasQrCode;
      else if (activeFilter === 'ReadyToSend') matchesFilter = item.hasInvitation && !item.emailSent;

      if (!matchesFilter) return false;

      const search = searchQuery.toLowerCase().trim();
      if (!search) return true;

      const fullName = `${item.prenom || ''} ${item.nom || ''}`.toLowerCase();
      const email = (item.email || '').toLowerCase();
      const phone = (item.telephone || '').toLowerCase();

      return fullName.includes(search) || email.includes(search) || phone.includes(search);
    });
  }, [guestCardsList, activeFilter, searchQuery]);

  const eventName = eventInfo?.titre || eventInfo?.title || eventInfo?.name || 'cet événement privé';
  const totalCount = guestCardsList.length;
  const qrReadyCount = guestCardsList.filter(g => g.hasQrCode).length;
  const invitationsReadyCount = guestCardsList.filter(g => g.hasInvitation).length;
  const sentCount = guestCardsList.filter(g => g.emailSent || g.whatsappSent).length;
  const confirmedCount = guestCardsList.filter(g => (g.rsvpStatus || '').includes('confirm')).length;

  const allFilteredIds = useMemo(() => filteredGuests.map(i => i.inviteId || i._id).filter(Boolean), [filteredGuests]);
  const isAllFilteredSelected = allFilteredIds.length > 0 && allFilteredIds.every(id => selectedInviteIds.includes(id));

  const handleToggleSelect = (id) => {
    if (!id) return;
    setSelectedInviteIds(prev => 
      prev.includes(id) ? prev.filter(item => item !== id) : [...prev, id]
    );
  };

  const handleSelectAllFiltered = () => {
    if (isAllFilteredSelected) {
      setSelectedInviteIds([]);
    } else {
      setSelectedInviteIds(allFilteredIds);
    }
  };

  // 1. GÉNÉRER LE QR CODE (Unitaire)
  const handleGenerateSingleQr = async (guest) => {
    const inviteId = guest.inviteId || guest._id;
    if (!inviteId) return;

    try {
      setGeneratingSingleQrId(inviteId);
      const res = await generateSingleQrCodeApi(inviteId, token);
      toast.success(res.message || `QR Code généré pour ${guest.prenom} ${guest.nom} !`);
      if (fetchQrCodes) fetchQrCodes();
      if (refetchInvitations) refetchInvitations();
      if (refetchGuests) refetchGuests();
    } catch (err) {
      console.error("Erreur génération QR code :", err);
      toast.error("Erreur lors de la génération du QR Code.");
    } finally {
      setGeneratingSingleQrId(null);
    }
  };

  // 2. GÉNÉRER TOUS LES QR CODES
  const handleGenerateAllQrCodes = async () => {
    try {
      setShowLoadingModal(true);
      setLoadingModalConfig({
        title: 'Génération des QR Codes...',
        subtitle: 'Cryptage sécurisé pour tous vos invités',
        progress: 40,
        status: 'loading',
        message: 'Génération en cours...',
      });

      await generateQrCodes();
      
      setLoadingModalConfig({
        title: 'QR Codes Générés !',
        subtitle: 'Tous les QR codes sont prêts.',
        progress: 100,
        status: 'success',
        message: 'Vous pouvez maintenant générer les invitations.',
      });

      setTimeout(() => setShowLoadingModal(false), 1200);
      if (fetchQrCodes) fetchQrCodes();
      if (refetchGuests) refetchGuests();
      if (refetchInvitations) refetchInvitations();
    } catch (err) {
      setShowLoadingModal(false);
      toast.error("Erreur lors de la génération groupée des QR codes.");
    }
  };

  // 3. GÉNÉRER LES INVITATIONS (Toutes ou pour les QR codes prêts)
  const handleGenerateAllInvitations = async () => {
    if (!eventId) return;
    try {
      setShowLoadingModal(true);
      setLoadingModalConfig({
        title: 'Génération des Invitations...',
        subtitle: 'Création des passes numériques personnalisés',
        progress: 30,
        status: 'loading',
        message: 'Application du design et des accès...',
      });

      const templateImage = selectedTemplate?.image || null;
      await createInvitations(eventId, customMessage || 'Invitation VIP Officielle', selectedTemplateId, templateImage);

      setLoadingModalConfig({
        title: 'Invitations Prêtes !',
        subtitle: 'Toutes les cartes d\'invitation sont finalisées.',
        progress: 100,
        status: 'success',
        message: 'Vous pouvez désormais les envoyer à vos invités.',
      });

      setTimeout(() => setShowLoadingModal(false), 1200);
      if (refetchInvitations) refetchInvitations();
      if (refetchGuests) refetchGuests();
    } catch (err) {
      setLoadingModalConfig({
        title: 'Erreur',
        subtitle: 'Une erreur est survenue lors de la création.',
        progress: 100,
        status: 'error',
        message: err.message || 'Erreur inconnue',
      });
    }
  };

  // 4. ENVOYER L'INVITATION (Unitaire)
  const handleSendSingleInvitation = async (guest) => {
    const inviteId = guest.inviteId || guest._id;
    if (!inviteId) return;

    try {
      setSendingSingleId(inviteId);
      const res = await sendInvitationsApi(eventId, [inviteId], ['email', 'whatsapp'], token);
      if (res && res.success !== false) {
        toast.success(`Invitation envoyée à ${guest.prenom} ${guest.nom} !`);
        if (refetchInvitations) refetchInvitations();
      } else {
        toast.error(res?.message || "Échec de l'envoi.");
      }
    } catch (err) {
      console.error("Erreur d'envoi invité :", err);
      toast.error("Erreur lors de l'envoi de l'invitation.");
    } finally {
      setSendingSingleId(null);
    }
  };

  // 5. ENVOYER TOUTES LES INVITATIONS
  const handleSendAllInvitations = async () => {
    if (!eventId || totalCount === 0) {
      toast.error("Aucune invitation disponible pour l'envoi.");
      return;
    }

    const targetIds = selectedInviteIds.length > 0 ? selectedInviteIds : guestCardsList.map(g => g.inviteId || g._id);

    try {
      setSendingInvitations(true);
      const res = await sendInvitationsApi(eventId, targetIds, ['email', 'whatsapp'], token);
      if (res && res.success !== false) {
        toast.success(`🎉 ${targetIds.length} invitation(s) expédiée(s) avec succès !`);
        setSelectedInviteIds([]);
        if (refetchInvitations) refetchInvitations();
      } else {
        toast.error(res?.message || "Échec de l'envoi.");
      }
    } catch (err) {
      console.error("Erreur envoi groupé :", err);
      toast.error("Erreur lors de l'envoi des invitations.");
    } finally {
      setSendingInvitations(false);
    }
  };

  // SUPPRIMER UNE INVITATION
  const handleDeleteSingle = async (guest) => {
    const id = guest.invitationDoc?._id || guest._id;
    const name = `${guest.prenom || ''} ${guest.nom || ''}`.trim() || 'cet invité';
    if (!window.confirm(`Supprimer définitivement l'invitation de ${name} ?`)) return;

    try {
      setDeleting(true);
      await apiDeleteInvitation(id, token);
      toast.success(`Invitation de ${name} supprimée`);
      setSelectedInviteIds(prev => prev.filter(item => item !== guest.inviteId && item !== id));
      if (refetchInvitations) refetchInvitations();
      if (refetchGuests) refetchGuests();
    } catch (err) {
      console.error("Erreur suppression invitation :", err);
      toast.error("Erreur lors de la suppression.");
    } finally {
      setDeleting(false);
    }
  };

  // SUPPRIMER LES SÉLECTIONNÉS
  const handleDeleteSelected = async () => {
    if (selectedInviteIds.length === 0) return;
    if (!window.confirm(`Supprimer définitivement les ${selectedInviteIds.length} invitation(s) sélectionnée(s) ?`)) return;

    try {
      setDeleting(true);
      await apiBulkDeleteInvitations(selectedInviteIds, eventId, token);
      toast.success(`${selectedInviteIds.length} invitation(s) supprimée(s) !`);
      setSelectedInviteIds([]);
      if (refetchInvitations) refetchInvitations();
      if (refetchGuests) refetchGuests();
    } catch (err) {
      toast.error("Erreur lors de la suppression groupée.");
    } finally {
      setDeleting(false);
    }
  };

  // KPIS
  const kpiData = [
    {
      id: 1,
      title: "Invités Enregistrés",
      value: `${totalCount}`,
      trend: `${invitationsReadyCount} pass généré(s)`,
      progress: totalCount > 0 ? (invitationsReadyCount / totalCount) * 100 : 0,
      textColor: "text-gray-900",
      barColor: "bg-[#FF5005]",
      icon: <Mail className="w-4 h-4 text-[#FF5005]" />
    },
    {
      id: 2,
      title: "QR Codes Prêts",
      value: `${qrReadyCount} / ${totalCount}`,
      trend: qrReadyCount === totalCount && totalCount > 0 ? "100% Cryptés" : `${totalCount - qrReadyCount} en attente`,
      progress: totalCount > 0 ? (qrReadyCount / totalCount) * 100 : 0,
      textColor: "text-[#EFB810]",
      barColor: "bg-[#EFB810]",
      icon: <QrCode className="w-4 h-4 text-[#EFB810]" />
    },
    {
      id: 3,
      title: "Confirmations RSVP",
      value: `${confirmedCount}`,
      trend: `${sentCount} invitation(s) expédiée(s)`,
      progress: totalCount > 0 ? (confirmedCount / totalCount) * 100 : 0,
      textColor: "text-emerald-600",
      barColor: "bg-emerald-500",
      icon: <CheckCircle className="w-4 h-4 text-emerald-500" />
    }
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans text-slate-900 text-left space-y-6">
      <Toaster position="top-center" />

      {/* --- KPI GRID --- */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
        {kpiData.map((kpi) => (
          <div
            key={kpi.id}
            className="bg-white rounded-3xl p-6 shadow-xs border border-gray-200/80 flex flex-col justify-between h-[140px]"
          >
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                {kpi.icon}
                <p className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">{kpi.title}</p>
              </div>
              <p className={`text-3xl font-black tracking-tight ${kpi.textColor}`}>{kpi.value}</p>
              <p className="text-xs text-gray-400 font-medium">{kpi.trend}</p>
            </div>
            <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden mt-2">
              <div className={`h-full ${kpi.barColor} rounded-full transition-all duration-500`} style={{ width: `${kpi.progress}%` }} />
            </div>
          </div>
        ))}
      </div>

      {/* --- EN-TÊTE PRINCIPAL & ACTIONS GLOBALES --- */}
      <div className="bg-white border border-gray-200/80 p-6 rounded-3xl shadow-xs flex flex-col lg:flex-row lg:items-center justify-between gap-4">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Cartes d'Invitations Protocolaire
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-0.5">
            Gestion & Envois des Invitations
          </h1>
          <p className="text-xs text-gray-500 mt-1">
            Générez les QR codes, créez les passes d'invitation et envoyez-les directement par Email & WhatsApp.
          </p>
        </div>

        {/* Boutons d'Action Globaux par Étapes */}
        <div className="flex flex-wrap items-center gap-2">
          {/* Étape 1 : Générer les QR Codes */}
          <button
            type="button"
            onClick={handleGenerateAllQrCodes}
            disabled={qrGenerating || totalCount === 0}
            className="px-3.5 py-2 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <QrCode className={`w-3.5 h-3.5 ${qrGenerating ? 'animate-spin' : ''}`} />
            <span>{qrGenerating ? 'Génération QR...' : '1. Générer Tous les QR Codes'}</span>
          </button>

          {/* Étape 2 : Générer les Invitations */}
          <button
            type="button"
            onClick={handleGenerateAllInvitations}
            disabled={creatingInvitations || totalCount === 0}
            className="px-3.5 py-2 bg-[#0B1727] hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
          >
            <Sparkles className={`w-3.5 h-3.5 text-[#FF5005] ${creatingInvitations ? 'animate-spin' : ''}`} />
            <span>{creatingInvitations ? 'Création en cours...' : '2. Générer les Invitations'}</span>
          </button>

          {/* Étape 3 : Tout Envoyer */}
          <button
            type="button"
            onClick={handleSendAllInvitations}
            disabled={sendingInvitations || totalCount === 0}
            className="px-4 py-2 bg-gradient-to-r from-[#FF5005] to-[#FF5005]/90 hover:from-[#FF5005]/90 hover:to-[#FF5005] text-white rounded-xl text-xs font-black uppercase tracking-wider transition flex items-center gap-1.5 shadow-md shadow-orange-500/20 cursor-pointer disabled:opacity-50"
          >
            <Send className={`w-3.5 h-3.5 ${sendingInvitations ? 'animate-bounce' : ''}`} />
            <span>{sendingInvitations ? 'Expédition en cours...' : '3. Tout Envoyer (Email & WhatsApp)'}</span>
          </button>
        </div>
      </div>

      {/* --- BARRE DE RECHERCHE, FILTRES ET SÉLECTION --- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4">
        
        <div className="flex flex-wrap items-center gap-3">
          {/* Recherche */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => { setSearchQuery(e.target.value); setVisibleCount(12); }}
              placeholder="Rechercher un invité..."
              className="w-full pl-10 pr-4 py-2 text-xs bg-white border border-gray-200 rounded-xl focus:outline-none focus:border-[#FF5005] shadow-xs"
            />
          </div>

          {/* Filtres */}
          <div className="bg-white border border-gray-200 p-1 rounded-xl flex flex-wrap gap-1 items-center shadow-xs">
            {[
              { id: 'All', label: 'Tous' },
              { id: 'VIP', label: 'VIP' },
              { id: 'Confirmed', label: 'Confirmés' },
              { id: 'Pending', label: 'En attente' },
              { id: 'MissingQR', label: 'QR Manquant' },
              { id: 'ReadyToSend', label: 'Prêts à envoyer' }
            ].map((filter) => (
              <button
                key={filter.id}
                onClick={() => { setActiveFilter(filter.id); setVisibleCount(12); }}
                className={`px-3 py-1 text-xs font-bold rounded-lg transition-all cursor-pointer ${
                  activeFilter === filter.id
                    ? 'bg-[#FF5005] text-white shadow-xs'
                    : 'text-gray-500 hover:text-gray-900'
                }`}
              >
                {filter.label}
              </button>
            ))}
          </div>
        </div>

        {/* Sélection groupée & Rédacteur IA */}
        <div className="flex items-center gap-2 justify-end">
          <button
            onClick={handleSelectAllFiltered}
            className="text-xs font-bold text-gray-700 hover:text-[#FF5005] bg-white border border-gray-200 px-3 py-2 rounded-xl flex items-center gap-1.5 cursor-pointer shadow-xs"
          >
            {isAllFilteredSelected ? <CheckSquare className="w-4 h-4 text-[#FF5005]" /> : <Square className="w-4 h-4 text-gray-400" />}
            <span>{isAllFilteredSelected ? 'Tout désélectionner' : 'Tout sélectionner'}</span>
          </button>

          {selectedInviteIds.length > 0 && (
            <button
              onClick={handleDeleteSelected}
              disabled={deleting}
              className="px-3 py-2 bg-red-50 text-red-600 border border-red-200 rounded-xl text-xs font-bold flex items-center gap-1 cursor-pointer"
            >
              <Trash2 className="w-3.5 h-3.5" />
              <span>Supprimer ({selectedInviteIds.length})</span>
            </button>
          )}

          <button
            type="button"
            onClick={() => setShowAiModal(true)}
            className="px-3.5 py-2 bg-white hover:bg-gray-50 border border-gray-200 text-gray-800 rounded-xl text-xs font-bold shadow-xs transition flex items-center gap-1.5 cursor-pointer"
          >
            <Sparkles className="w-3.5 h-3.5 text-[#FF5005]" />
            <span>Rédacteur IA</span>
          </button>
        </div>
      </div>

      {/* --- GRILLE DES CARTES D'INVITATION (CARDS) --- */}
      {invitationsLoading || guestsLoading ? (
        <div className="py-20 text-center text-gray-400 text-xs flex flex-col items-center justify-center space-y-2">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5005]" />
          <span>Chargement de vos cartes d'invitations...</span>
        </div>
      ) : filteredGuests.length === 0 ? (
        <div className="bg-white border border-gray-200 rounded-3xl p-12 text-center text-gray-400 text-xs space-y-3">
          <Mail className="w-10 h-10 text-gray-300 mx-auto" />
          <p className="font-bold text-gray-700 text-sm">Aucune invitation trouvée</p>
          <p>Ajoutez vos premiers invités dans l'onglet « Invités » pour générer leurs cartes et QR codes.</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {filteredGuests.slice(0, visibleCount).map((guest) => {
            const id = guest.inviteId || guest._id;
            const isSelected = selectedInviteIds.includes(id);
            const isVip = guest.status === 'vip';
            const fullName = `${guest.prenom || ''} ${guest.nom || ''}`.trim() || 'Invité';
            const isConfirmed = (guest.rsvpStatus || '').includes('confirm') || (guest.rsvpStatus || '').includes('présent');
            const isDeclined = (guest.rsvpStatus || '').includes('refus') || (guest.rsvpStatus || '').includes('absent');

            return (
              <motion.div
                key={id}
                layout
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`bg-white border rounded-3xl p-5 shadow-xs flex flex-col justify-between transition-all duration-200 hover:shadow-md ${
                  isSelected ? 'border-[#FF5005] ring-2 ring-[#FF5005]/20 bg-orange-50/10' : 'border-gray-200/90'
                }`}
              >
                {/* HAUT DE CARTE : BADGES & SÉLECTION */}
                <div className="flex items-start justify-between gap-3 pb-3 border-b border-gray-100">
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={isSelected}
                      onChange={() => handleToggleSelect(id)}
                      className="w-4 h-4 rounded text-[#FF5005] accent-[#FF5005] cursor-pointer mt-0.5"
                    />
                    <div className="flex flex-wrap gap-1.5">
                      <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                        isVip ? 'bg-amber-50 text-[#EFB810] border border-amber-200' : 'bg-gray-100 text-gray-700'
                      }`}>
                        {isVip && <Crown size={10} className="text-[#EFB810]" />}
                        <span>{isVip ? 'VIP' : 'CLASSIQUE'}</span>
                      </span>

                      <span className={`inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[9px] font-bold ${
                        isConfirmed 
                          ? 'bg-emerald-50 text-emerald-700 border border-emerald-200' 
                          : isDeclined 
                          ? 'bg-rose-50 text-rose-700 border border-rose-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}>
                        {isConfirmed ? <Check size={10} /> : isDeclined ? <X size={10} /> : <Clock size={10} />}
                        <span>{isConfirmed ? 'Confirmé' : isDeclined ? 'Décliné' : 'En attente'}</span>
                      </span>
                    </div>
                  </div>

                  <button
                    type="button"
                    onClick={() => handleDeleteSingle(guest)}
                    className="p-1.5 text-gray-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition cursor-pointer"
                    title="Supprimer cette invitation"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>

                {/* CORPS DE CARTE : INFOS INVITÉ & BLOC QR CODE */}
                <div className="py-4 space-y-4 flex-1">
                  
                  {/* Identité Invité */}
                  <div className="flex items-center gap-3">
                    <div className={`w-11 h-11 rounded-2xl font-black text-sm flex items-center justify-center shrink-0 ${
                      isVip ? 'bg-gradient-to-tr from-amber-100 to-amber-50 text-[#EFB810] border border-amber-300' : 'bg-orange-50 text-[#FF5005] border border-orange-200'
                    }`}>
                      {fullName.split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase() || 'IN'}
                    </div>

                    <div className="min-w-0 flex-1">
                      <h4 className="text-sm font-black text-gray-900 truncate leading-tight">{fullName}</h4>
                      
                      <div className="space-y-0.5 mt-1 text-[11px] text-gray-500">
                        {guest.email && (
                          <div className="flex items-center gap-1.5 text-gray-600 truncate">
                            <Mail className="w-3 h-3 text-blue-500 shrink-0" />
                            <span className="truncate">{guest.email}</span>
                          </div>
                        )}
                        {guest.telephone && (
                          <div className="flex items-center gap-1.5 text-gray-600 truncate">
                            <Phone className="w-3 h-3 text-emerald-500 shrink-0" />
                            <span>{guest.telephone}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* VISUEL QR CODE OU PLACEHOLDER DE GÉNÉRATION */}
                  <div className="p-3 bg-gray-50/80 rounded-2xl border border-gray-200/70 flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3 min-w-0">
                      {guest.hasQrCode ? (
                        <div 
                          onClick={() => setPreviewQrModal(guest)}
                          className="w-14 h-14 bg-white p-1 rounded-xl border border-gray-200 shadow-xs shrink-0 cursor-pointer hover:border-[#FF5005] transition flex items-center justify-center"
                          title="Cliquez pour agrandir le QR Code"
                        >
                          {guest.qrCodeUrl ? (
                            <img src={guest.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
                          ) : (
                            <QrCode className="w-8 h-8 text-gray-800" />
                          )}
                        </div>
                      ) : (
                        <div className="w-14 h-14 rounded-xl border-2 border-dashed border-gray-300 flex items-center justify-center shrink-0 bg-white">
                          <QrCode className="w-6 h-6 text-gray-400" />
                        </div>
                      )}

                      <div className="min-w-0">
                        <div className="text-xs font-bold text-gray-800 flex items-center gap-1">
                          {guest.hasQrCode ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                              <span className="truncate text-emerald-700">QR Code Certifié</span>
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5 text-amber-500 shrink-0" />
                              <span className="truncate text-amber-700">QR Code en attente</span>
                            </>
                          )}
                        </div>

                        <p className="text-[10px] text-gray-400 truncate mt-0.5">
                          {guest.emailSent 
                            ? `Envoyé par Email` 
                            : guest.hasInvitation 
                            ? `Pass prêt à l'envoi` 
                            : guest.hasQrCode 
                            ? `Invitation à finaliser` 
                            : `Génération requise`}
                        </p>
                      </div>
                    </div>

                    {guest.hasQrCode && (
                      <button
                        type="button"
                        onClick={() => setPreviewQrModal(guest)}
                        className="p-1.5 text-gray-400 hover:text-gray-900 bg-white rounded-lg border border-gray-200 shadow-2xs transition cursor-pointer"
                        title="Aperçu"
                      >
                        <Eye size={13} />
                      </button>
                    )}
                  </div>

                </div>

                {/* BAS DE CARTE : BOUTON D'ACTION DYNAMIQUE SELON L'ÉTAT */}
                <div className="pt-3 border-t border-gray-100">
                  
                  {/* ÉTAT 1 : QR CODE NON GÉNÉRÉ */}
                  {!guest.hasQrCode ? (
                    <button
                      type="button"
                      disabled={generatingSingleQrId === id}
                      onClick={() => handleGenerateSingleQr(guest)}
                      className="w-full py-2.5 px-3 bg-amber-500 hover:bg-amber-600 text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <QrCode className={`w-3.5 h-3.5 ${generatingSingleQrId === id ? 'animate-spin' : ''}`} />
                      <span>{generatingSingleQrId === id ? 'Génération du QR Code...' : 'Générer le QR Code'}</span>
                    </button>
                  ) : !guest.hasInvitation ? (
                    /* ÉTAT 2 : QR CODE PRÊT, INVITATION NON GÉNÉRÉE */
                    <button
                      type="button"
                      onClick={handleGenerateAllInvitations}
                      disabled={creatingInvitations}
                      className="w-full py-2.5 px-3 bg-[#0B1727] hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 shadow-xs cursor-pointer disabled:opacity-50"
                    >
                      <Sparkles className="w-3.5 h-3.5 text-[#FF5005]" />
                      <span>Générer l'Invitation</span>
                    </button>
                  ) : (
                    /* ÉTAT 3 : QR CODE & INVITATION PRÊTS -> BOUTON D'ENVOI */
                    <div className="flex gap-2">
                      <button
                        type="button"
                        disabled={sendingSingleId === id}
                        onClick={() => handleSendSingleInvitation(guest)}
                        className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold transition flex items-center justify-center gap-1.5 cursor-pointer disabled:opacity-50 ${
                          guest.emailSent 
                            ? 'bg-emerald-50 text-emerald-700 hover:bg-emerald-100 border border-emerald-200' 
                            : 'bg-[#FF5005] hover:bg-[#ff6220] text-white shadow-xs'
                        }`}
                      >
                        <Send className={`w-3 h-3 ${sendingSingleId === id ? 'animate-bounce' : ''}`} />
                        <span>
                          {sendingSingleId === id 
                            ? 'Envoi en cours...' 
                            : guest.emailSent 
                            ? 'Renvoyer l\'invitation' 
                            : 'Envoyer l\'invitation'}
                        </span>
                      </button>
                    </div>
                  )}

                </div>
              </motion.div>
            );
          })}
        </div>
      )}

      {/* BOUTON CHARGER PLUS */}
      {filteredGuests.length > visibleCount && (
        <div className="text-center pt-4">
          <button
            onClick={() => setVisibleCount(prev => prev + 12)}
            className="px-6 py-2.5 bg-white border border-gray-200 text-gray-700 rounded-xl text-xs font-bold hover:bg-gray-50 transition cursor-pointer shadow-xs"
          >
            Afficher plus d'invitations ({filteredGuests.length - visibleCount} restantes)
          </button>
        </div>
      )}

      {/* MODAL APERÇU DU QR CODE */}
      {previewQrModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4" onClick={() => setPreviewQrModal(null)}>
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl border border-gray-200 text-center space-y-4" onClick={e => e.stopPropagation()}>
            <div className="flex justify-between items-center border-b border-gray-100 pb-3">
              <span className="text-xs font-black uppercase tracking-wider text-gray-900">Pass Numérique</span>
              <button onClick={() => setPreviewQrModal(null)} className="p-1 text-gray-400 hover:text-gray-900 rounded-lg cursor-pointer">
                <X size={16} />
              </button>
            </div>

            <div className="w-48 h-48 mx-auto bg-white p-3 rounded-2xl border border-gray-200 shadow-md flex items-center justify-center">
              {previewQrModal.qrCodeUrl ? (
                <img src={previewQrModal.qrCodeUrl} alt="QR Code" className="w-full h-full object-contain" />
              ) : (
                <QrCode className="w-32 h-32 text-gray-800" />
              )}
            </div>

            <div>
              <h3 className="text-base font-black text-gray-900">{previewQrModal.prenom} {previewQrModal.nom}</h3>
              <p className="text-xs text-gray-400">{previewQrModal.email || previewQrModal.telephone}</p>
              <span className="inline-block mt-2 px-3 py-1 bg-amber-50 border border-amber-200 text-[#EFB810] text-[10px] font-extrabold uppercase rounded-full">
                {previewQrModal.status === 'vip' ? 'VIP Privilège' : 'Accès Standard'}
              </span>
            </div>

            <button
              onClick={() => setPreviewQrModal(null)}
              className="w-full py-2 bg-gray-900 hover:bg-black text-white text-xs font-bold rounded-xl transition cursor-pointer"
            >
              Fermer
            </button>
          </div>
        </div>
      )}

      {/* MODALS IA */}
      <AiInvitationModal
        isOpen={showAiModal}
        onClose={() => setShowAiModal(false)}
        onApplyMessage={(msg) => setCustomMessage(msg)}
        eventData={eventInfo}
        token={token}
      />

      <AiEmailConciergeModal
        isOpen={showEmailConciergeModal}
        onClose={() => setShowEmailConciergeModal(false)}
        onApplyEmailText={(body) => setCustomMessage(body)}
        eventData={eventInfo}
        token={token}
      />

    </div>
  );
}