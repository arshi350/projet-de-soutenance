import React, { useState, useMemo, useEffect, useRef } from 'react';
import { 
  Search, Plus, Download, Upload, Eye, Pencil, Trash2, 
  Send, ChevronLeft, ChevronRight, CheckSquare, X, Mail, Phone, 
  QrCode, ChevronUp, Check, EyeOff, Sparkles, User, ShieldCheck, Zap
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { useParams } from 'react-router-dom';
import { toast, Toaster } from 'react-hot-toast';
import { useAuthContext } from '../../../../../context/AuthContext';
import { useGetInvitesByEvent, useDeleteInvite, useUpdateInvite, useImportInvites } from '../../../../../hooks/useInvite';
import InviteForm from './inviteForm';
import { QuotaUpgradeModal } from './QuotaUpgradeModal';
import { sendInvitations as apiSendInvitations, bulkDeleteInvites } from '../../../../../services/inviteService';

export default function GuestManagement() {
  const { token } = useAuthContext();
  const { eventId } = useParams();

  const { invites, loading, error, refetch } = useGetInvitesByEvent(eventId, token);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsGuest, setDetailsGuest] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', contact: '', status: 'classique' });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);
  const [showSendModal, setShowSendModal] = useState(false);
  const [sendChannels, setSendChannels] = useState({ email: true, whatsapp: true });
  const [sending, setSending] = useState(false);
  const [singleGuestToSend, setSingleGuestToSend] = useState(null);

  const [showImportModal, setShowImportModal] = useState(false);
  const [selectedFile, setSelectedFile] = useState(null);
  const [importResult, setImportResult] = useState(null);
  const fileInputRef = useRef(null);

  const { uploadFile: importFile, loading: importing, error: importError, reset: resetImport } = useImportInvites(token, (data) => {
    setImportResult(data);
    refetch();
    if (data?.importedCount > 0) {
      toast.success(`${data.importedCount} invité(s) importé(s) avec succès !`);
    }
  });

  const handleFileSelect = (e) => {
    if (e.target.files && e.target.files[0]) {
      setSelectedFile(e.target.files[0]);
      setImportResult(null);
    }
  };

  const handleStartImport = async () => {
    if (!selectedFile) return;
    try {
      await importFile(eventId, selectedFile);
    } catch (err) {
      console.error("Erreur d'importation :", err);
    }
  };

  const handleCloseImportModal = () => {
    setShowImportModal(false);
    setSelectedFile(null);
    setImportResult(null);
    resetImport();
  };

  const handleDownloadTemplate = () => {
    const headers = "Nom,Prénom,Email,Téléphone,Statut\n";
    const exampleRow1 = "Dupont,Jean,jean.dupont@example.com,690123456,VIP\n";
    const exampleRow2 = "Kuate,Marie,marie.kuate@example.com,670987654,Classique\n";
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + exampleRow1 + exampleRow2;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", "Modele_Import_Invites.csv");
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const handleExportGuests = () => {
    if (!guestList || guestList.length === 0) {
      toast.error("Aucun invité à exporter.");
      return;
    }
    const headers = "Nom,Prénom,Email,Téléphone,Statut,Présent,Scanné\n";
    const rows = guestList.map(g => 
      `"${g.nom || ''}","${g.prenom || ''}","${g.email || ''}","${g.telephone || ''}","${g.status || 'classique'}","${g.isPresent ? 'Oui' : 'Non'}","${g.isScanned ? 'Oui' : 'Non'}"`
    ).join("\n");
    const csvContent = "data:text/csv;charset=utf-8,\uFEFF" + headers + rows;
    const encodedUri = encodeURI(csvContent);
    const link = document.createElement("a");
    link.setAttribute("href", encodedUri);
    link.setAttribute("download", `Liste_Invites_${eventId}.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  const filters = ['Tous', 'Présents', 'Absents', 'Attente'];
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 8;

  const { deleteInviteById, loading: deleting } = useDeleteInvite(token, (inviteId) => {
    setSelectedIds((current) => current.filter((id) => id !== inviteId));
    refetch();
    if (detailsGuest?.id === inviteId || detailsGuest?._id === inviteId) {
      setDetailsGuest(null);
    }
    toast.success("Invité supprimé avec succès");
  });

  const { updateInviteById, loading: updating, error: updateError } = useUpdateInvite(token, () => {
    refetch();
    setEditingGuest(null);
    toast.success("Invité mis à jour avec succès");
  });

  const guestList = invites || [];

  const filteredGuests = useMemo(() => {
    const query = search.trim().toLowerCase();

    return guestList.filter((guest) => {
      const matchesSearch =
        guest.nom?.toLowerCase().includes(query) ||
        guest.prenom?.toLowerCase().includes(query) ||
        guest.email?.toLowerCase().includes(query) ||
        guest.status?.toLowerCase().includes(query) ||
        guest.telephone?.toLowerCase().includes(query);

      const matchesFilter = (() => {
        if (activeFilter === 'Tous') return true;
        if (activeFilter === 'Présents') return guest.isPresent === true;
        if (activeFilter === 'Absents') return guest.isPresent === false && guest.isScanned === true;
        if (activeFilter === 'Attente') return guest.isScanned === false;
        return true;
      })();

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, guestList]);

  useEffect(() => {
    setCurrentPage(1);
  }, [search, activeFilter]);

  const totalGuests = filteredGuests.length;
  const totalPages = Math.max(1, Math.ceil(totalGuests / pageSize));
  const currentPageIndex = Math.min(currentPage, totalPages);
  const paginatedGuests = useMemo(() => {
    const start = (currentPageIndex - 1) * pageSize;
    return filteredGuests.slice(start, start + pageSize);
  }, [filteredGuests, currentPageIndex]);

  const visibleGuestIds = paginatedGuests.map((guest) => guest._id || guest.id);
  const allVisibleSelected = paginatedGuests.length > 0 && visibleGuestIds.every((id) => selectedIds.includes(id));

  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds((current) => [
        ...new Set([...current, ...visibleGuestIds])
      ]);
    } else {
      setSelectedIds((current) => current.filter((id) => !visibleGuestIds.includes(id)));
    }
  };

  const handleSelectRow = (id) => {
    if (selectedIds.includes(id)) {
      setSelectedIds(selectedIds.filter(item => item !== id));
    } else {
      setSelectedIds([...selectedIds, id]);
    }
  };

  const handleViewDetails = (guest) => {
    setDetailsGuest(guest);
    setEditingGuest(null);
  };

  const handleEditInvite = (guest) => {
    setEditingGuest(guest);
    setDetailsGuest(null);
    const cat = ((guest.status || guest.guestCategory || '').toLowerCase() === 'vip') ? 'vip' : 'classique';
    setEditForm({
      nom: guest.nom || '',
      prenom: guest.prenom || '',
      contact: guest.email || guest.telephone || '',
      status: cat
    });
  };

  const handleDeleteInvite = async (invite) => {
    if (!window.confirm(`Supprimer l'invité ${invite.nom} ${invite.prenom} ? Cette action est irréversible.`)) return;
    await deleteInviteById(invite._id || invite.id);
  };

  const [bulkDeleting, setBulkDeleting] = useState(false);

  const handleBulkDeleteGuests = async () => {
    if (!selectedIds || selectedIds.length === 0) return;

    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement ${selectedIds.length} invité(s) et leurs QR codes associés ? Cette action est irréversible.`)) {
      return;
    }

    try {
      setBulkDeleting(true);
      const res = await bulkDeleteInvites(selectedIds, eventId, token);
      if (res.success) {
        toast.success(`${selectedIds.length} invité(s) supprimé(s) avec succès !`);
        setSelectedIds([]);
        refetch();
      } else {
        toast.error(res.message || "Erreur lors de la suppression groupée");
      }
    } catch (err) {
      console.error("Erreur bulk delete:", err);
      toast.error(err.response?.data?.message || err.message || "Erreur lors de la suppression");
    } finally {
      setBulkDeleting(false);
    }
  };

  const openSendModalForSelected = (singleId = null) => {
    if (singleId) setSingleGuestToSend(singleId);
    setShowSendModal(true);
  };

  const performSend = async () => {
    const channels = [];
    if (sendChannels.email) channels.push('email');
    if (sendChannels.whatsapp) channels.push('whatsapp');
    if (channels.length === 0) return toast.error('Sélectionnez au moins un canal (Email ou WhatsApp)');

    const guestIds = singleGuestToSend ? [singleGuestToSend] : selectedIds;
    if (!guestIds || guestIds.length === 0) return toast.error('Aucun invité sélectionné');

    try {
      setSending(true);
      const res = await apiSendInvitations(eventId, guestIds, channels, token);
      
      if (res && res.success !== false) {
        toast.success(res.message || `${guestIds.length} invitation(s) envoyée(s) avec succès !`);
        setShowSendModal(false);
        setSelectedIds([]);
        setSingleGuestToSend(null);
        refetch();
      } else {
        toast.error(res?.message || "Échec lors de l'envoi des invitations.");
      }
    } catch (err) {
      console.error('Erreur envoi invitations:', err);
      const errorMsg = err.response?.data?.message || err.response?.data?.error || err.message || "Erreur lors de l'envoi des invitations";
      toast.error(errorMsg);
    } finally {
      setSending(false);
    }
  };

  const handleSaveEdit = async () => {
    if (!editingGuest) return;

    const contactVal = (editForm.contact || '').trim();
    let email = undefined;
    let telephone = undefined;

    if (contactVal.includes('@')) {
      email = contactVal.toLowerCase();
    } else if (contactVal) {
      let formattedPhone = contactVal.replace(/[\s\-\+\(\)]/g, '');
      if (formattedPhone.startsWith('237') && formattedPhone.length === 12) {
        formattedPhone = formattedPhone.substring(3);
      }
      telephone = formattedPhone;
    }

    await updateInviteById(editingGuest._id || editingGuest.id, {
      nom: editForm.nom,
      prenom: editForm.prenom,
      contact: contactVal,
      email,
      telephone,
      status: editForm.status
    });
  };

  const getStatusLabel = (guest) => {
    if (!guest) return '—';
    const cat = (guest.status || guest.guestCategory || '').toLowerCase();
    if (cat === 'vip') return 'VIP';
    if (cat === 'classique') return 'CLASSIQUE';
    if (guest.isPresent === true) return 'PRÉSENT';
    if (guest.isScanned === true) return 'ABSENT';
    return 'EN ATTENTE';
  };

  const getGuestId = (guest) => guest._id || guest.id;

  const [maxCapacity, setMaxCapacity] = useState(50);
  const [showUpgradeModal, setShowUpgradeModal] = useState(false);

  useEffect(() => {
    const fetchEventCapacity = async () => {
      try {
        const res = await fetch(`http://localhost:3000/api/event/${eventId}`, {
          headers: { Authorization: `Bearer ${token}` }
        });
        const data = await res.json();
        if (data.event?.pricing?.maxCapacity) {
          setMaxCapacity(data.event.pricing.maxCapacity);
        }
      } catch (e) {
        console.warn("Erreur chargement jauge :", e);
      }
    };
    if (eventId && token) fetchEventCapacity();
  }, [eventId, token]);

  const vipCount = useMemo(() => guestList.filter(g => (g.status || g.guestCategory || '').toLowerCase() === 'vip').length, [guestList]);
  const presentCount = useMemo(() => guestList.filter(g => g.isPresent === true).length, [guestList]);
  const isNearLimit = guestList.length >= maxCapacity;

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans relative pb-28 text-slate-900 text-left">
      <Toaster position="top-center" />
      
      {/* Modal d'upgrade de jauge */}
      {showUpgradeModal && (
        <QuotaUpgradeModal
          eventId={eventId}
          currentCapacity={maxCapacity}
          onUpgradeSuccess={(newCap) => setMaxCapacity(newCap)}
          onClose={() => setShowUpgradeModal(false)}
        />
      )}

      {/* --- EN-TÊTE DE PAGE AVEC STATS --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Répertoire Privé & Protocole
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Gestion des Invités & Badges
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Supervisez les présences, expédiez les passes et contrôlez la jauge d'accueil.
          </p>
        </div>

        {/* 3 Cartes de Statistiques Rapides */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
          
          {/* Card 1: JAUGE */}
          <div className={`bg-white border rounded-2xl px-5 py-3 shadow-xs min-w-[160px] flex flex-col justify-center ${isNearLimit ? 'border-amber-300 bg-amber-50/30' : 'border-gray-200/80'}`}>
            <div className="flex items-center justify-between">
              <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
                JAUGE / QUOTA
              </span>
              <button 
                type="button" 
                onClick={() => setShowUpgradeModal(true)}
                className="text-[9px] font-extrabold text-[#FF5005] hover:underline uppercase cursor-pointer"
              >
                + Upgrade
              </button>
            </div>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-gray-900 leading-none">
                {guestList.length} <span className="text-xs font-bold text-gray-400">/ {maxCapacity}</span>
              </span>
            </div>
          </div>

          {/* Card 2: VIP */}
          <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3 shadow-xs min-w-[110px] flex flex-col justify-center">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              INVITÉS VIP
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#EFB810] leading-none">
                {vipCount}
              </span>
              <span className="text-[9px] font-bold text-[#EFB810] bg-amber-50 border border-amber-200/60 px-2 py-0.5 rounded-md uppercase">
                VIP
              </span>
            </div>
          </div>

          {/* Card 3: PRÉSENTS */}
          <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3 shadow-xs min-w-[110px] flex flex-col justify-center">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              CONFIRMÉS
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 leading-none">
                {presentCount}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md uppercase">
                OK
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* --- BARRE DE RECHERCHE, FILTRES ET ACTIONS --- */}
      <div className="flex flex-col md:flex-row items-stretch md:items-center justify-between gap-4 mb-6">
        
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
            <input
              type="text"
              placeholder="Rechercher un invité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005]/20 transition-all shadow-xs"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer ${
                    isActive
                      ? 'bg-[#FF5005] text-white font-bold shadow-xs'
                      : 'text-gray-500 hover:text-gray-800 font-medium'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Boutons d'Action */}
        <div className="flex items-center gap-2 justify-end">
          {selectedIds.length > 0 ? (
            <>
              <button
                type="button"
                onClick={handleBulkDeleteGuests}
                disabled={bulkDeleting}
                className="bg-red-600 hover:bg-red-700 disabled:opacity-50 text-white text-xs font-bold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>{bulkDeleting ? 'Suppression...' : `Supprimer (${selectedIds.length})`}</span>
              </button>

              <button
                type="button"
                onClick={() => openSendModalForSelected()}
                className="bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
              >
                <Send className="w-3.5 h-3.5" />
                <span>Envoyer ({selectedIds.length})</span>
              </button>
            </>
          ) : (
            <button
              type="button"
              onClick={() => openSendModalForSelected()}
              disabled={guestList.length === 0}
              className="bg-[#0B1727] hover:bg-black disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            >
              <Send className="w-3.5 h-3.5 text-[#FF5005]" />
              <span>Envoyer à tous ({guestList.length})</span>
            </button>
          )}

          <button 
            type="button"
            onClick={() => setShowImportModal(true)}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Upload className="w-3.5 h-3.5 text-gray-500" />
            <span>Importer</span>
          </button>

          <button 
            type="button"
            onClick={handleExportGuests}
            className="bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 text-xs font-semibold px-3.5 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Download className="w-3.5 h-3.5 text-gray-500" />
            <span>Exporter</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter</span>
          </motion.button>
        </div>
      </div>

      {/* --- TABLEAU DES INVITÉS --- */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded border-gray-300 text-[#FF5005] focus:ring-[#FF5005] accent-[#FF5005] cursor-pointer"
                  />
                </th>
                <th className="py-4 px-4">Invité</th>
                <th className="py-4 px-4">Contact</th>
                <th className="py-4 px-4">Rang / Statut</th>
                <th className="py-4 px-4">Contrôle d'Accès</th>
                <th className="py-4 px-4">Horodatage</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-20 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <EyeOff className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 font-semibold">
                        {loading 
                          ? 'Chargement des invités...' 
                          : error 
                          ? 'Impossible de charger les données.' 
                          : 'Aucun invité ne correspond à ces critères.'
                        }
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                paginatedGuests.map((guest) => {
                  const guestId = getGuestId(guest);
                  const isSelected = selectedIds.includes(guestId);
                  const statusLabel = getStatusLabel(guest);
                  const isVip = ((guest.status || guest.guestCategory || '').toLowerCase() === 'vip');
                  
                  return (
                    <tr 
                      key={guestId} 
                      className={`transition-colors ${isSelected ? 'bg-orange-50/30' : 'hover:bg-gray-50/60'}`}
                    >
                      <td className="py-3.5 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(guestId)}
                          className="w-4 h-4 rounded border-gray-300 text-[#FF5005] focus:ring-[#FF5005] accent-[#FF5005] cursor-pointer"
                        />
                      </td>

                      <td className="py-3.5 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center ${
                            isVip ? 'bg-amber-50 text-[#EFB810] border border-amber-200' : 'bg-orange-50 text-[#FF5005] border border-orange-200'
                          }`}>
                            {guest.initial || `${guest.nom || ''} ${guest.prenom || ''}`.trim().split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'IN'}
                          </div>
                          <span className="font-extrabold text-gray-900">
                            {`${guest.nom || ''} ${guest.prenom || ''}`.trim() || 'Invité'}
                          </span>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-semibold text-gray-600">
                        {guest.email ? (
                          <div className="flex items-center gap-1.5 text-blue-600">
                            <Mail className="w-3.5 h-3.5" />
                            <span>{guest.email}</span>
                          </div>
                        ) : guest.telephone ? (
                          <div className="flex items-center gap-1.5 text-emerald-600">
                            <Phone className="w-3.5 h-3.5" />
                            <span>{guest.telephone}</span>
                          </div>
                        ) : (
                          <span className="text-gray-400">—</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider ${
                          isVip
                            ? 'bg-amber-50 text-[#EFB810] border border-amber-200'
                            : guest.isPresent === true
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                            : 'bg-gray-100 text-gray-600'
                        }`}>
                          <span className={`w-1.5 h-1.5 rounded-full ${isVip ? 'bg-[#EFB810]' : guest.isPresent === true ? 'bg-emerald-500' : 'bg-gray-400'}`} />
                          {statusLabel}
                        </span>
                      </td>

                      <td className="py-3.5 px-4 font-medium">
                        <div className={`flex items-center gap-1.5 ${guest.isScanned ? 'text-emerald-600 font-bold' : 'text-gray-400'}`}>
                          {guest.isScanned ? (
                            <>
                              <ShieldCheck className="w-3.5 h-3.5 text-emerald-500" />
                              <span>Scanné</span>
                            </>
                          ) : (
                            <span>Non scanné</span>
                          )}
                        </div>
                      </td>

                      <td className="py-3.5 px-4 text-gray-400 font-medium text-[11px]">
                        {guest.updatedAt ? new Date(guest.updatedAt).toLocaleDateString('fr-FR') : '-'}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-gray-400">
                          <button 
                            onClick={() => handleViewDetails(guest)} 
                            className="hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer" 
                            title="Voir les détails"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button 
                            onClick={() => handleEditInvite(guest)} 
                            className="hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer" 
                            title="Modifier"
                          >
                            <Pencil className="w-3.5 h-3.5" />
                          </button>
                          {(!(guest.emailSent && guest.whatsappSent)) && (
                            <button 
                              onClick={() => openSendModalForSelected(getGuestId(guest))} 
                              className="hover:text-[#FF5005] p-1.5 rounded-lg hover:bg-orange-50 transition cursor-pointer" 
                              title="Envoyer invitation"
                            >
                              <Send className="w-3.5 h-3.5 text-[#FF5005]" />
                            </button>
                          )}
                          <button 
                            onClick={() => handleDeleteInvite(guest)} 
                            className="hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer" 
                            title="Supprimer"
                          >
                            <Trash2 className="w-3.5 h-3.5 text-red-400" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        {/* --- PANNEAU DE DÉTAILS D'UN INVITÉ --- */}
        {detailsGuest && (
          <div className="border-t border-gray-100 bg-gray-50/80 p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <User className="w-4 h-4 text-[#FF5005]" />
                Détails du Porteur de Billet
              </h3>
              <button 
                onClick={() => setDetailsGuest(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Identité</div>
                <div className="font-extrabold text-gray-900">{`${detailsGuest.nom || ''} ${detailsGuest.prenom || ''}`.trim() || '—'}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Contact</div>
                <div className="font-extrabold text-gray-900 truncate">{detailsGuest.email || detailsGuest.telephone || '—'}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Rang</div>
                <div className="font-extrabold text-gray-900">{getStatusLabel(detailsGuest)}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Validation Portique</div>
                <div className="font-extrabold text-gray-900">{detailsGuest.isScanned ? 'Entrée confirmée' : 'En attente de scan'}</div>
              </div>
            </div>
          </div>
        )}

        {/* --- PANNEAU DE MODIFICATION D'UN INVITÉ --- */}
        {editingGuest && (
          <div className="border-t border-gray-100 bg-gray-50/80 p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <Pencil className="w-4 h-4 text-[#FF5005]" />
                Modifier la fiche invité
              </h3>
              <button 
                onClick={() => setEditingGuest(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                Annuler
              </button>
            </div>
            
            <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Nom</label>
                <input
                  type="text"
                  value={editForm.nom}
                  onChange={(e) => setEditForm(p => ({ ...p, nom: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#FF5005]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Prénom</label>
                <input
                  type="text"
                  value={editForm.prenom}
                  onChange={(e) => setEditForm(p => ({ ...p, prenom: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#FF5005]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Contact (Email ou Tél)</label>
                <input
                  type="text"
                  value={editForm.contact}
                  onChange={(e) => setEditForm(p => ({ ...p, contact: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#FF5005]"
                />
              </div>
              <div>
                <label className="block text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-1">Statut</label>
                <select
                  value={editForm.status}
                  onChange={(e) => setEditForm(p => ({ ...p, status: e.target.value }))}
                  className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-900 outline-none focus:border-[#FF5005]"
                >
                  <option value="classique">Classique</option>
                  <option value="vip">VIP</option>
                </select>
              </div>
            </div>

            <div className="flex items-center justify-end gap-2">
              <button
                type="button"
                onClick={() => setEditingGuest(null)}
                className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-200 cursor-pointer"
              >
                Fermer
              </button>
              <button
                type="button"
                onClick={handleSaveEdit}
                disabled={updating}
                className="px-5 py-2 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold rounded-xl shadow-xs transition-all cursor-pointer"
              >
                {updating ? 'Enregistrement...' : 'Enregistrer'}
              </button>
            </div>
          </div>
        )}

        {/* --- PAGINATION (FOOTER DU TABLEAU) --- */}
        <div className="border-t border-gray-100 px-6 py-4 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-gray-400">
          <div>
            Affichage de <span className="text-gray-700 font-bold">{paginatedGuests.length > 0 ? (currentPageIndex - 1) * pageSize + 1 : 0}</span> à <span className="text-gray-700 font-bold">{(currentPageIndex - 1) * pageSize + paginatedGuests.length}</span> sur <span className="text-gray-700 font-bold">{totalGuests}</span> invités
          </div>
          
          <div className="flex items-center gap-3">
            <span>
              Page <span className="text-gray-700 font-bold">{currentPageIndex}</span> sur <span className="text-gray-700 font-bold">{totalPages}</span>
            </span>

            <div className="flex items-center gap-1 border border-gray-200 rounded-lg p-1 bg-white">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPageIndex === 1}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronLeft className="w-3.5 h-3.5" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPageIndex === totalPages}
                className="p-1 rounded-md text-gray-400 hover:text-gray-700 disabled:opacity-30 cursor-pointer"
              >
                <ChevronRight className="w-3.5 h-3.5" />
              </button>
            </div>
          </div>
        </div>

      </div>

      {/* MODAL AJOUT INVITÉ */}
      {isInviteModalOpen && (
        <div
          onClick={() => setIsInviteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md px-4 py-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-lg">
            <InviteForm
              eventId={eventId}
              closeModal={() => setIsInviteModalOpen(false)}
              onSuccess={() => {
                refetch();
              }}
            />
          </div>
        </div>
      )}

      {/* MODAL ENVOI INVITATIONS */}
      {showSendModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-md shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Send className="w-4 h-4 text-[#FF5005]" />
                Expédition des Invitations & QR Codes
              </h3>
              <button 
                onClick={() => { setShowSendModal(false); setSingleGuestToSend(null); }}
                className="text-gray-400 hover:text-gray-600 p-1 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <p className="text-xs text-gray-500 mb-4 leading-relaxed">
              {singleGuestToSend 
                ? "Envoi de l'invitation personnalisée avec QR code cryptographique certifié." 
                : selectedIds.length > 0 
                  ? `Envoi des invitations pour les ${selectedIds.length} invité(s) sélectionné(s).` 
                  : `Envoi automatique à TOUS les ${guestList.length} invités de l'événement.`}
            </p>

            <div className="space-y-2.5 mb-6">
              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
                <input 
                  type="checkbox" 
                  checked={sendChannels.email} 
                  onChange={() => setSendChannels((s) => ({ ...s, email: !s.email }))}
                  className="w-4 h-4 rounded text-[#FF5005] accent-[#FF5005]"
                />
                <Mail className="w-4 h-4 text-blue-600" />
                <span className="text-xs font-bold text-gray-800">Email Officiel avec Pass Numérique</span>
              </label>

              <label className="flex items-center gap-3 p-3.5 rounded-2xl border border-gray-200 hover:bg-gray-50 cursor-pointer transition-all">
                <input 
                  type="checkbox" 
                  checked={sendChannels.whatsapp} 
                  onChange={() => setSendChannels((s) => ({ ...s, whatsapp: !s.whatsapp }))}
                  className="w-4 h-4 rounded text-emerald-500 accent-emerald-500"
                />
                <Phone className="w-4 h-4 text-emerald-500" />
                <span className="text-xs font-bold text-gray-800">WhatsApp / SMS Direct</span>
              </label>
            </div>

            <div className="flex items-center justify-end gap-2.5">
              <button 
                type="button"
                className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer" 
                onClick={() => { setShowSendModal(false); setSingleGuestToSend(null); }}
              >
                Annuler
              </button>
              <button 
                type="button"
                className="px-6 py-2.5 rounded-xl bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold shadow-md shadow-orange-500/25 cursor-pointer disabled:opacity-50 flex items-center gap-2" 
                onClick={performSend} 
                disabled={sending}
              >
                {sending ? 'Expédition en cours...' : 'Lancer les envois'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* MODAL D'IMPORTATION EXCEL / CSV */}
      {showImportModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 w-full max-w-lg shadow-2xl border border-gray-100">
            <div className="flex items-center justify-between pb-4 border-b border-gray-100 mb-4">
              <div className="flex items-center gap-2.5">
                <div className="p-2 bg-orange-50 text-[#FF5005] rounded-xl">
                  <Upload className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-gray-900">Importer des Invités en Masse</h3>
                  <p className="text-[11px] text-gray-400">Formats supportés : Excel (.xlsx, .xls) ou CSV (.csv)</p>
                </div>
              </div>
              <button 
                onClick={handleCloseImportModal}
                className="text-gray-400 hover:text-gray-600 p-1.5 rounded-lg cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            <div className="mb-5 bg-orange-50/50 rounded-2xl p-3.5 flex items-center justify-between border border-orange-200/60">
              <div className="text-xs text-gray-600">
                <span className="font-bold text-gray-900">Modèle prêt à l'emploi</span>
                <br />Téléchargez notre gabarit pré-formaté.
              </div>
              <button
                type="button"
                onClick={handleDownloadTemplate}
                className="text-xs font-bold text-[#FF5005] flex items-center gap-1 shrink-0 bg-white px-3 py-1.5 rounded-xl border border-orange-200 shadow-xs cursor-pointer"
              >
                <Download className="w-3.5 h-3.5" />
                Modèle CSV
              </button>
            </div>

            {!importResult ? (
              <div className="space-y-4">
                <div 
                  onClick={() => fileInputRef.current?.click()}
                  className="border-2 border-dashed border-gray-200 hover:border-[#FF5005] bg-gray-50/50 rounded-2xl p-6 text-center cursor-pointer transition-all flex flex-col items-center justify-center gap-2"
                >
                  <input 
                    type="file" 
                    ref={fileInputRef} 
                    accept=".xlsx, .xls, .csv" 
                    onChange={handleFileSelect} 
                    className="hidden" 
                  />
                  <div className="w-10 h-10 rounded-full bg-orange-50 text-[#FF5005] flex items-center justify-center">
                    <Upload className="w-5 h-5" />
                  </div>
                  {selectedFile ? (
                    <div>
                      <p className="text-xs font-bold text-gray-900">{selectedFile.name}</p>
                      <p className="text-[10px] text-gray-400">{(selectedFile.size / 1024).toFixed(1)} KB</p>
                    </div>
                  ) : (
                    <div>
                      <p className="text-xs font-bold text-gray-700">Cliquez pour importer votre fichier</p>
                      <p className="text-[10px] text-gray-400 mt-0.5">Colonnes : Nom, Prénom, Email, Téléphone, Statut</p>
                    </div>
                  )}
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button 
                    type="button" 
                    onClick={handleCloseImportModal}
                    className="px-4 py-2 rounded-xl text-xs font-bold text-gray-500 hover:bg-gray-100 cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button 
                    type="button" 
                    onClick={handleStartImport}
                    disabled={!selectedFile || importing}
                    className="px-5 py-2.5 rounded-xl bg-[#FF5005] hover:bg-[#ff6220] disabled:opacity-50 text-white text-xs font-bold shadow-md shadow-orange-500/25 transition-all cursor-pointer"
                  >
                    {importing ? 'Importation...' : 'Valider l\'importation'}
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="bg-emerald-50 text-emerald-800 p-4 rounded-2xl border border-emerald-200">
                  <h4 className="font-bold text-xs mb-1 flex items-center gap-1.5">
                    <Check size={14} className="text-emerald-600" />
                    <span>Importation terminée avec succès</span>
                  </h4>
                  <p className="text-xs">
                    <span className="font-bold">{importResult.importedCount || 0}</span> invité(s) ajoutés au répertoire.
                  </p>
                </div>
                <div className="flex justify-end pt-2">
                  <button 
                    type="button" 
                    onClick={handleCloseImportModal}
                    className="px-5 py-2.5 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold rounded-xl shadow-xs cursor-pointer"
                  >
                    Fermer
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      )}

      {/* BARRE D'ACTIONS FLOTTANTE EN BAS (BULK ACTIONS) */}
      <AnimatePresence>
        {selectedIds.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            className="fixed bottom-8 left-1/2 -translate-x-1/2 bg-[#0B1727]/95 backdrop-blur-md shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-5 border border-white/15 text-white z-50"
          >
            <div className="flex items-center gap-2 pr-4 border-r border-white/15">
              <CheckSquare className="w-4 h-4 text-[#FF5005]" />
              <span className="text-xs font-extrabold whitespace-nowrap">
                {selectedIds.length} invité(s) sélectionné(s)
              </span>
            </div>

            <button 
              onClick={() => openSendModalForSelected()}
              className="flex items-center gap-1.5 text-xs font-bold text-gray-200 hover:text-white transition cursor-pointer"
            >
              <Mail className="w-3.5 h-3.5 text-[#FF5005]" />
              <span>Expédier les Pass</span>
            </button>

            <button 
              onClick={() => setSelectedIds([])}
              className="text-gray-400 hover:text-white p-1 rounded-lg hover:bg-white/10 transition cursor-pointer"
              title="Désélectionner tout"
            >
              <X className="w-4 h-4" />
            </button>
          </motion.div>
        )}
      </AnimatePresence>

    </div>
  );
}