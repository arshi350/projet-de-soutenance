import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, Plus, Download, Upload, Eye, Pencil, Trash2, 
  Send, Bell, ChevronLeft, ChevronRight, CheckSquare, X, Mail, QrCode, ChevronUp
} from 'lucide-react';
import { useParams } from 'react-router-dom';
import { useAuthContext } from '../../../../../context/AuthContext';
import { useGetInvitesByEvent, useDeleteInvite, useUpdateInvite } from '../../../../../hooks/useInvite';
import InviteForm from './inviteForm';

export default function GuestManagement() {
  const { token } = useAuthContext();
  const { eventId } = useParams();

  const { invites, loading, error, refetch } = useGetInvitesByEvent(eventId, token);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [selectedIds, setSelectedIds] = useState([]);
  const [detailsGuest, setDetailsGuest] = useState(null);
  const [editingGuest, setEditingGuest] = useState(null);
  const [editForm, setEditForm] = useState({ nom: '', prenom: '', telephone: '', email: '', status: 'classic' });
  const [isInviteModalOpen, setIsInviteModalOpen] = useState(false);

  const filters = ['Tous', 'Présents', 'Absents', 'Attente'];
  const [currentPage, setCurrentPage] = useState(1);
  const pageSize = 5;

  const { deleteInviteById, loading: deleting, error: deleteError } = useDeleteInvite(token, (inviteId) => {
    setSelectedIds((current) => current.filter((id) => id !== inviteId));
    refetch();
    if (detailsGuest?.id === inviteId || detailsGuest?._id === inviteId) {
      setDetailsGuest(null);
    }
  });

  const { updateInviteById, loading: updating, error: updateError } = useUpdateInvite(token, () => {
    refetch();
    setEditingGuest(null);
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

  // Gestion de la sélection globale (Tout cocher / décocher)
  const handleSelectAll = (e) => {
    if (e.target.checked) {
      setSelectedIds((current) => [
        ...new Set([...current, ...visibleGuestIds])
      ]);
    } else {
      setSelectedIds((current) => current.filter((id) => !visibleGuestIds.includes(id)));
    }
  };

  // Gestion de la sélection individuelle
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
    setEditForm({
      nom: guest.nom || '',
      prenom: guest.prenom || '',
      telephone: guest.telephone || '',
      email: guest.email || '',
      status: guest.status || 'classic'
    });
  };

  const handleDeleteInvite = async (invite) => {
    if (!window.confirm(`Supprimer l'invité ${invite.nom} ${invite.prenom} ? Cette action est irréversible.`)) return;
    await deleteInviteById(invite._id || invite.id);
  };

  const handleSaveEdit = async () => {
    if (!editingGuest) return;

    await updateInviteById(editingGuest._id || editingGuest.id, {
      nom: editForm.nom,
      prenom: editForm.prenom,
      telephone: editForm.telephone,
      email: editForm.email,
      status: editForm.status
    });
  };

  const getStatusLabel = (guest) => {
    if (guest.status) return guest.status.toUpperCase();
    if (guest.isPresent === true) return 'PRÉSENT';
    if (guest.isScanned === true) return 'ABSENT';
    return 'EN ATTENTE';
  };

  const getGuestId = (guest) => guest._id || guest.id;

  return (
    <div className="px-60 p-8 font-sans relative pb-24 font">
      
      {/* --- EN-TÊTE DE PAGE --- */}
      <div className="mb-6">
        <h1 className="text-2xl font-black text-gray-800 tracking-tight">Gestion des Invités</h1>
        <p className="text-xs text-gray-400 mt-1">Gérez et suivez les participants de l'événement Gala Tech en temps réel.</p>
      </div>

      {/* --- BARRE DE FILTRES ET ACTIONS --- */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-gray-100 flex flex-col md:flex-row items-center justify-between gap-4 mb-6">
        
        {/* Partie Gauche : Input + Groupement de filtres */}
        <div className="flex flex-col sm:flex-row items-center gap-3 w-full md:w-auto">
          {/* Input de recherche */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 text-gray-400 absolute left-3 top-1/2 -translate-y-1/2" />
            <input
              type="text"
              placeholder="Rechercher un invité..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2 bg-gray-50/60 border border-gray-200 rounded-xl text-xs font-medium text-gray-700 placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-[#017EF7]/20 focus:border-[#017EF7] transition-all"
            />
          </div>

          {/* Boutons de Filtres d'États */}
          <div className="flex items-center gap-1 p-1 bg-gray-50 border border-gray-200 rounded-xl w-full sm:w-auto overflow-x-auto">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1.5 text-xs font-bold rounded-lg transition-all shrink-0 ${
                    isActive
                      ? 'bg-white text-gray-800 shadow-sm border border-orange-100'
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  {filter}
                </button>
              );
            })}
          </div>
        </div>

        {/* Partie Droite : Actions d'import/export */}
        <div className="flex items-center gap-2.5 w-full md:w-auto justify-end">
          <button
            type="button"
            onClick={() => setIsInviteModalOpen(true)}
            className="bg-[#FF5005] hover:bg-orange-600 text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm transition-all flex items-center gap-1.5"
          >
            <Plus className="w-3.5 h-3.5 stroke-[3]" />
            <span>Ajouter</span>
          </button>
          
          <button className="border border-[#017EF7] text-[#017EF7] hover:bg-blue-50 text-xs font-bold px-4 py-2.5 rounded-xl transition-all flex items-center gap-1.5">
            <Upload className="w-3.5 h-3.5" />
            <span>Importer</span>
          </button>

          <button className="text-gray-500 hover:bg-gray-100 text-xs font-bold px-3 py-2.5 rounded-xl transition-all flex items-center gap-1.5">
            <Download className="w-3.5 h-3.5" />
            <span>Exporter</span>
          </button>
        </div>
      </div>

      {/* --- TABLEAU DES INVITÉS --- */}
      <div className="bg-white rounded-2xl shadow-sm border border-gray-100 overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-orange-100/50 bg-orange-50/10 text-[10px] font-black text-gray-400 uppercase tracking-wider">
                <th className="py-4 px-6 w-12 text-center">
                  <input
                    type="checkbox"
                    checked={allVisibleSelected}
                    onChange={handleSelectAll}
                    className="w-4 h-4 rounded text-[#FF5005] border-gray-300 focus:ring-[#FF5005] accent-[#FF5005]"
                  />
                </th>
                <th className="py-4 px-4">Invité</th>
                <th className="py-4 px-4">Email</th>
                <th className="py-4 px-4">Statut</th>
                <th className="py-4 px-4">QR Code</th>
                <th className="py-4 px-4">Heure Scan</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-orange-100/30">
              {filteredGuests.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-8 text-center text-sm text-gray-500">
                    {loading ? 'Chargement des invités...' : error ? 'Impossible de charger les invités.' : 'Aucun invité trouvé pour cet événement.'}
                  </td>
                </tr>
              ) : (
                paginatedGuests.map((guest) => {
                  const guestId = getGuestId(guest);
                  const isSelected = selectedIds.includes(guestId);
                  const statusLabel = getStatusLabel(guest);
                  return (
                    <tr 
                      key={guestId} 
                      className={`transition-colors duration-150 ${isSelected ? 'bg-orange-50/20' : 'hover:bg-gray-50/50'}`}
                    >
                      {/* Checkbox */}
                      <td className="py-4 px-6 text-center">
                        <input
                          type="checkbox"
                          checked={isSelected}
                          onChange={() => handleSelectRow(guestId)}
                          className="w-4 h-4 rounded text-[#FF5005] border-gray-300 focus:ring-[#FF5005] accent-[#FF5005]"
                        />
                      </td>

                      {/* Identité / Avatar */}
                      <td className="py-4 px-4">
                        <div className="flex items-center gap-3">
                          <div className={`w-8 h-8 rounded-full flex items-center justify-center font-bold text-xs ${guest.avatarBg || 'bg-slate-100 text-slate-700'}`}>
                            {guest.initial || `${guest.nom || ''} ${guest.prenom || ''}`.trim().split(' ').map((part) => part[0]).join('').slice(0, 2).toUpperCase()}
                          </div>
                          <span className="text-xs font-bold text-gray-800">{`${guest.nom || ''} ${guest.prenom || ''}`.trim() || 'Invité inconnu'}</span>
                        </div>
                      </td>

                      {/* Email */}
                      <td className="py-4 px-4 text-xs font-medium text-gray-500">
                        {guest.email || '—'}
                      </td>

                      {/* Statut Badge */}
                      <td className="py-4 px-4">
                        <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-black tracking-wider ${
                          guest.isPresent === true
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-100'
                            : 'bg-orange-50 text-orange-600 border border-orange-100'
                        }`}>
                          <span className={`w-1 h-1 rounded-full ${guest.isPresent === true ? 'bg-emerald-500' : 'bg-orange-500'}`} />
                          {statusLabel}
                        </span>
                      </td>

                      {/* Scanné */}
                      <td className="py-4 px-4 text-xs font-medium">
                        <div className={`flex items-center gap-1.5 ${guest.isScanned ? 'text-emerald-600' : 'text-gray-400'}`}>
                          {guest.isScanned ? <span className="text-emerald-500">✓</span> : <span className="text-gray-400 text-[10px]">⏰</span>}
                          <span>{guest.isScanned ? 'Scanné' : 'Non scanné'}</span>
                        </div>
                      </td>

                      {/* Heure de Scan */}
                      <td className="py-4 px-4 text-xs font-medium text-gray-600">
                        {guest.updatedAt ? new Date(guest.updatedAt).toLocaleString() : guest.createdAt ? new Date(guest.createdAt).toLocaleString() : '-'}
                      </td>

                      {/* Actions Contextuelles */}
                      <td className="py-4 px-6 text-right">
                        <div className="flex items-center justify-end gap-3 text-gray-400">
                          <button onClick={() => handleViewDetails(guest)} className="hover:text-gray-600 transition-colors" title="Voir les détails">
                            <Eye className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleEditInvite(guest)} className="hover:text-gray-600 transition-colors" title="Modifier">
                            <Pencil className="w-4 h-4" />
                          </button>
                          <button onClick={() => handleDeleteInvite(guest)} className="hover:text-red-500 transition-colors" title="Supprimer">
                            <Trash2 className="w-4 h-4 text-red-400" />
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

        {/* --- PANNEAU DÉTAIL / MODIFICATION --- */}
        {(detailsGuest || editingGuest || error || (filteredGuests.length === 0 && !loading)) && (
          <div className="border-t border-gray-100 bg-slate-50 p-6">
            {error && (
              <div className="mb-4 text-sm text-red-600">Erreur : impossible de charger les invités. Veuillez réessayer.</div>
            )}

            {detailsGuest && (
              <div className="space-y-4">
                <h2 className="text-lg font-bold text-gray-900">Détails de l'invité</h2>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Nom</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.nom || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Prénom</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.prenom || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Email</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.email || '—'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Téléphone</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.telephone || '—'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Status invité</div>
                    <div className="text-sm font-bold text-gray-900">{getStatusLabel(detailsGuest)}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Présence</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.isPresent ? 'Présent' : 'Absent'}</div>
                  </div>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Scanné</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.isScanned ? 'Oui' : 'Non'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Dernière mise à jour</div>
                    <div className="text-sm font-bold text-gray-900">{detailsGuest.updatedAt ? new Date(detailsGuest.updatedAt).toLocaleString() : '-'}</div>
                  </div>
                  <div className="rounded-2xl bg-white p-4 shadow-sm border border-gray-100">
                    <div className="text-[10px] uppercase tracking-[0.3em] text-gray-400 mb-2">Invité ID</div>
                    <div className="text-sm font-bold text-gray-900">{getGuestId(detailsGuest)}</div>
                  </div>
                </div>
              </div>
            )}

            {editingGuest && (
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h2 className="text-lg font-bold text-gray-900">Modifier l'invité</h2>
                  <button
                    type="button"
                    onClick={() => setEditingGuest(null)}
                    className="text-xs uppercase tracking-[0.2em] text-gray-500 hover:text-gray-700"
                  >Annuler</button>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Nom</span>
                    <input
                      value={editForm.nom}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, nom: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Prénom</span>
                    <input
                      value={editForm.prenom}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, prenom: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                  </label>
                  <label className="block">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Téléphone</span>
                    <input
                      value={editForm.telephone}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, telephone: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                  </label>
                </div>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <label className="block">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Email</span>
                    <input
                      type="email"
                      value={editForm.email}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, email: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    />
                  </label>
                  <label className="block w-full md:w-1/3">
                    <span className="text-[10px] font-semibold text-gray-500 uppercase">Statut</span>
                    <select
                      value={editForm.status}
                      onChange={(e) => setEditForm((prev) => ({ ...prev, status: e.target.value }))}
                      className="mt-2 w-full rounded-2xl border border-gray-200 bg-white px-3 py-2 text-sm text-gray-900"
                    >
                      <option value="classic">Classic</option>
                      <option value="vip">VIP</option>
                    </select>
                  </label>
                </div>
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleSaveEdit}
                    disabled={updating}
                    className="bg-[#017EF7] text-white text-xs font-bold px-4 py-2.5 rounded-xl shadow-sm hover:bg-blue-600 transition-all"
                  >
                    {updating ? 'Enregistrement...' : 'Enregistrer'}
                  </button>
                  <button
                    type="button"
                    onClick={() => setEditingGuest(null)}
                    className="text-xs font-bold px-4 py-2.5 rounded-xl border border-gray-200 text-gray-600 hover:bg-gray-100 transition-all"
                  >
                    Fermer
                  </button>
                </div>
                {updateError && <p className="text-sm text-red-600">Erreur de mise à jour : {updateError}</p>}
              </div>
            )}
          </div>
        )}

        {/* --- PAGINATION (FOOTER TABLEAU) --- */}
        <div className="bg-gray-50/50 border-t border-gray-100 px-6 py-4 flex flex-col md:flex-row items-center justify-between gap-4 text-xs font-medium text-gray-400">
          <div>
            Affichage de <span className="font-bold text-gray-700">{paginatedGuests.length > 0 ? (currentPageIndex - 1) * pageSize + 1 : 0}</span>
            à <span className="font-bold text-gray-700">{(currentPageIndex - 1) * pageSize + paginatedGuests.length}</span>
            sur <span className="font-bold text-gray-700">{totalGuests}</span> invités
          </div>
          <div className="flex items-center gap-4">
            <span className="text-gray-500">Page <span className="font-bold text-gray-700">{currentPageIndex}</span> sur {totalPages}</span>
            <div className="flex items-center gap-1">
              <button
                onClick={() => setCurrentPage((prev) => Math.max(1, prev - 1))}
                disabled={currentPageIndex === 1}
                className={`p-1.5 border border-gray-200 rounded-lg bg-white transition-all ${currentPageIndex === 1 ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ChevronLeft className="w-4 h-4" />
              </button>
              <button
                onClick={() => setCurrentPage((prev) => Math.min(totalPages, prev + 1))}
                disabled={currentPageIndex === totalPages}
                className={`p-1.5 border border-gray-200 rounded-lg bg-white transition-all ${currentPageIndex === totalPages ? 'text-gray-300 cursor-not-allowed' : 'text-gray-600 hover:bg-gray-50'}`}
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>

      {isInviteModalOpen && (
        <div
          onClick={() => setIsInviteModalOpen(false)}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/30 backdrop-blur-sm px-4 py-6"
        >
          <div onClick={(e) => e.stopPropagation()} className="w-full max-w-3xl">
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

      {/* --- BARRE D'ACTIONS FLOTTANTE (BULK ACTIONS) --- */}
      {selectedIds.length > 0 && (
        <div className="fixed bottom-6 left-1/2 -translate-x-1/2 bg-[#1E293B] shadow-2xl rounded-2xl px-6 py-3.5 flex items-center gap-6 border border-slate-700/50 text-white animate-fade-in z-50">
          {/* Compteur d'éléments sélectionnés */}
          <div className="flex items-center gap-2.5 pr-6 border-r border-slate-700">
            <CheckSquare className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-bold whitespace-nowrap">
              {selectedIds.length} invités sélectionnés
            </span>
          </div>

          {/* Action 1 : Relancer */}
          <button className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <Mail className="w-4 h-4" />
            <span>Relancer</span>
          </button>

          {/* Action 2 : Renvoyer QR */}
          <button className="flex items-center gap-2 text-xs font-bold text-slate-300 hover:text-white transition-colors">
            <QrCode className="w-4 h-4" />
            <span className="whitespace-nowrap">Renvoyer QR</span>
          </button>

          {/* Bouton Actions Combinées */}
          <button className="bg-[#FF5005] text-white text-xs font-bold py-1.5 px-4 rounded-xl shadow-sm hover:bg-orange-600 transition-all flex items-center gap-1">
            <span>Actions</span>
            <ChevronUp className="w-3.5 h-3.5" />
          </button>

          {/* Bouton Annuler / Fermer la sélection */}
          <button 
            onClick={() => setSelectedIds([])}
            className="text-slate-400 hover:text-slate-200 p-0.5 rounded-lg hover:bg-slate-800/60 transition-all"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      )}

    </div>
  );
}