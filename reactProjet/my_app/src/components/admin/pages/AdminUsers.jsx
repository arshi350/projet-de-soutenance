import React, { useState, useMemo, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Download, 
  Eye,
  EyeOff,
  ChevronLeft, 
  ChevronRight, 
  Edit3, 
  ShieldCheck, 
  Award, 
  Ban,
  Trash2,
  AlertTriangle,
  X,
  Loader2
} from 'lucide-react';
import { useGetAllUsers } from '../../../hooks/useUsers';
import { deleteUser } from '../../../services/userService';

const AdminUsers = () => {
  // Récupération des utilisateurs depuis l'API
  const token = localStorage.getItem('accessToken');
  const { users: fetchedUsers, loading, error, total, refetch } = useGetAllUsers(token);

  // États de l'application
  const [users, setUsers] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");

  const [currentFilter, setCurrentFilter] = useState("Tous");
  const [selectedUserId, setSelectedUserId] = useState(null); // Aucun utilisateur sélectionné par défaut
  const [userToDelete, setUserToDelete] = useState(null);
  const [isDeleting, setIsDeleting] = useState(false);

  useEffect(() => {
    const mappedUsers = (fetchedUsers || []).map((user) => {
      const name = user.first_name && user.last_name
        ? `${user.first_name} ${user.last_name}`
        : user.email || 'Utilisateur';
      const initials = name
        .split(' ')
        .filter(Boolean)
        .map((part) => part[0])
        .slice(0, 2)
        .join('')
        .toUpperCase();
      const joinDate = user.date
        ? new Date(user.date).toLocaleDateString('fr-FR', { month: 'short', year: 'numeric' })
        : '—';

      return {
        id: user._id || user.id,
        initials: initials || 'U',
        name,
        email: user.email || '—',
        phone: user.phone ? user.phone.toString() : '—',
        role: user.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'User',
        plan: user.plan || 'STANDARD',
        eventsCount: user.eventsCount || 0,
        ticketsCount: user.ticketsCount || 0,
        status: user.suspended ? 'Suspendu' : 'Actif',
        lastLogin: user.lastLogin || '—',
        joinDate,
        price: user.price || (user.plan === 'PREMIUM' ? '29 900 FCFA/mois' : '0 FCFA/mois'),
        history: user.history || []
      };
    });

    setUsers(mappedUsers);
  }, [fetchedUsers]);

  // Récupération de l'utilisateur actuellement sélectionné à droite
  const selectedUser = useMemo(() => {
    if (!selectedUserId) return null;
    return users.find(u => u.id === selectedUserId);
  }, [users, selectedUserId]);

  // Logique de filtrage et de recherche combinée
  const filteredUsers = useMemo(() => {
    return users.filter(user => {
      // Filtrage par bouton d'état
      const matchesFilter = 
        currentFilter === "Tous" ||
        (currentFilter === "Actifs" && user.status === "Actif") ||
        (currentFilter === "Suspendus" && user.status === "Suspendu") ||
        (currentFilter === "Premium" && user.plan === "PREMIUM") ||
        (currentFilter === "En attente" && user.status === "En attente");

      // Filtrage par barre de recherche (nom, email, téléphone)
      const matchesSearch = 
        user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
        user.phone.includes(searchQuery);

      return matchesFilter && matchesSearch;
    });
  }, [users, currentFilter, searchQuery]);

  // --- ACTIONS DE MODÉRATION API REELLES ---
  const handlePromoteAdmin = async (id) => {
    try {
      const { updateUserRoleApi } = await import('../../../services/userService');
      await updateUserRoleApi(id, 'admin', token);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, role: "Admin" } : u));
      if (refetch) refetch();
    } catch (err) {
      alert(err.message || 'Erreur lors de la promotion en admin');
    }
  };

  const handleGoPremium = async (id) => {
    try {
      const { updateUserPlanApi } = await import('../../../services/userService');
      await updateUserPlanApi(id, 'PREMIUM', token);
      setUsers(prev => prev.map(u => u.id === id ? { ...u, plan: "PREMIUM", price: "29 900 FCFA/mois" } : u));
      if (refetch) refetch();
    } catch (err) {
      alert(err.message || 'Erreur lors du changement de forfait');
    }
  };

  const handleSuspendUser = async (id, currentStatus) => {
    try {
      const { suspendUser, unsuspendUser } = await import('../../../services/userService');
      if (currentStatus === 'Suspendu') {
        await unsuspendUser(id, token);
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "Actif" } : u));
      } else {
        await suspendUser(id, token, 'Suspension par modérateur');
        setUsers(prev => prev.map(u => u.id === id ? { ...u, status: "Suspendu" } : u));
      }
      if (refetch) refetch();
    } catch (err) {
      alert(err.message || 'Erreur lors de la modification de suspension');
    }
  };

  const handleConfirmDeleteUser = async () => {
    if (!userToDelete) return;
    setIsDeleting(true);
    try {
      await deleteUser(userToDelete.id, token);
      setUsers(prev => prev.filter(u => u.id !== userToDelete.id));
      if (selectedUserId === userToDelete.id) {
        setSelectedUserId(null);
      }
      setUserToDelete(null);
      alert('Utilisateur et toutes ses données associées ont été définitivement supprimés de la base de données.');
      if (refetch) refetch();
    } catch (err) {
      alert(err.message || "Erreur lors de la suppression définitive de l'utilisateur");
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className="min-h-screen font bg-gray-100 py-6 md:py-8 md:px-50 font-sans text-slate-900">
      
      {/* Title */}
      <div className="mb-6">
        <h1 className="text-3xl font-bold tracking-tight text-slate-900">Utilisateurs</h1>
        <p className="text-gray-500 text-sm mt-1">Gérez tous les comptes de la plateforme</p>
      </div>

      {/* Main Grid Layout */}
      <div className={`grid grid-cols-1 ${selectedUser ? 'xl:grid-cols-12' : 'xl:grid-cols-1'} gap-6 items-start`}>
        
        {/* --- LEFT: TABLE AND FILTERS --- */}
        <div className={`${selectedUser ? 'xl:col-span-8' : 'xl:col-span-1 mx-auto w-full'} space-y-4`}>
          
          {/* Toolbar Control Pack */}
          <div className="bg-gray-50 p-4 rounded-2xl  border-1 border-blue-200 border-dashed flex flex-wrap items-center justify-between gap-3">
            
            {/* Search Input */}
            <div className="relative w-full sm:w-80">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16} />
              <input 
                type="text" 
                placeholder="Rechercher un utilisateur..." 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full pl-9 pr-4 py-2 bg-gray-50 border border-gray-200 rounded-full text-xs outline-none focus:ring-1 focus:ring-blue-500 focus:bg-white transition-all"
              />
            </div>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-1.5">
              {["Tous", "Actifs", "Suspendus", "En attente", "Premium"].map((tab) => (
                <button
                  key={tab}
                  onClick={() => setCurrentFilter(tab)}
                  className={`px-5 py-2 rounded-full text-sm font-bold transition-all ${
                    currentFilter === tab 
                      ? 'bg-[#b63e00] text-white' 
                      : 'bg-gray-200 text-gray-600 hover:bg-gray-300'
                  }`}
                >
                  {tab}
                </button>
              ))}
            </div>

            {/* Action Group Buttons */}
            <div className="flex items-center gap-2 ml-auto sm:ml-0">
              <button className="flex items-center gap-1 bg-blue-600 text-white text-sm font-bold px-5 py-2 rounded-xl cursor-pointer hover:bg-blue-700 transition-colors">
                <Plus size={14} /> Ajouter un admin 
              </button>
              <button className="flex items-center gap-1 border border-gray-300 text-gray-600 cursor-pointer text-sm font-bold px-5 py-2 rounded-lg hover:bg-gray-100 transition-colors bg-white">
                <Download size={14} /> Exporter CSV
              </button>
            </div>
          </div>

          {/* Table Container */}
          <div className="bg-gray-50 rounded-xl  border-1 border-blue-200 border-dashed overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="text-[10px] font-bold text-gray-400 uppercase tracking-wider border-b border-gray-200 bg-gray-100">
                    <th className="px-6 py-4">Utilisateur</th>
                    <th className="px-6 py-4">Rôle / Plan</th>
                    <th className="px-6 py-4 text-center">Événements</th>
                    <th className="px-6 py-4 text-center">Statut</th>
                    <th className="px-6 py-4">Dernière Connexion</th>
                    <th className="px-6 py-4 text-center"></th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 ">
                  {loading ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-blue-600">
                        Chargement des utilisateurs...
                      </td>
                    </tr>
                  ) : error ? (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-red-600">
                        Erreur : {error}
                      </td>
                    </tr>
                  ) : filteredUsers.length > 0 ? (
                    filteredUsers.map((user) => (
                      <tr 
                        key={user.id} 
                        onClick={() => setSelectedUserId(user.id)}
                        className={`cursor-pointer transition-colors ${
                          selectedUserId === user.id ? 'bg-orange-50/40' : 'hover:bg-gray-100'
                        }`}
                      >
                        {/* Profile Identity Cell */}
                        <td className="px-6 py-3.5">
                          <div className="flex items-center gap-3">
                            <div className={`w-9 h-9 rounded-full font-bold text-xs flex items-center justify-center shrink-0 ${
                              user.id === 1 ? 'bg-orange-100 text-orange-800' :
                              user.id === 2 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
                            }`}>
                              {user.initials}
                            </div>
                            <div className="flex flex-col">
                              <span className="font-bold text-slate-800 text-sm leading-tight">{user.name}</span>
                              <span className="text-gray-400 text-xs">{user.email}</span>
                              <span className="text-gray-400 text-[11px] font-medium">{user.phone}</span>
                            </div>
                          </div>
                        </td>

                        {/* Role Plan Badge Cell */}
                        <td className="px-6 py-3.5">
                          <div className="flex flex-col gap-1 items-start">
                            <span className="text-xs font-semibold text-slate-700">{user.role}</span>
                            <span className={`text-[9px] font-black tracking-wider px-1.5 py-0.5 rounded ${
                              user.plan === 'PREMIUM' ? 'bg-blue-100 text-blue-700' :
                              user.plan === 'STANDARD' ? 'bg-gray-100 text-gray-600' : 'bg-gray-200/70 text-gray-400'
                            }`}>
                              {user.plan}
                            </span>
                          </div>
                        </td>

                        {/* Events Total Counter */}
                        <td className="px-6 py-3.5 text-center font-bold text-slate-700 text-sm">
                          {user.eventsCount}
                        </td>

                        {/* Status Capsule Tag */}
                        <td className="px-6 py-3.5 text-center">
                          <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold ${
                            user.status === 'Actif' ? 'bg-emerald-50 text-emerald-600' : 'bg-red-50 text-red-500'
                          }`}>
                            <span className={`w-1.5 h-1.5 rounded-full ${user.status === 'Actif' ? 'bg-emerald-500' : 'bg-red-500'}`} />
                            {user.status}
                          </span>
                        </td>

                        {/* Last Connection Timestamp */}
                        <td className="px-6 py-3.5 text-xs font-medium text-gray-500">
                          {user.lastLogin}
                        </td>

                        {/* Actions (View + Delete) */}
                        <td className="px-6 py-3.5 text-center" onClick={(e) => e.stopPropagation()}>
                          <div className="flex items-center justify-center gap-1">
                            <button 
                              onClick={() => setSelectedUserId(selectedUserId === user.id ? null : user.id)}
                              className="p-1.5 hover:bg-gray-200 rounded-full text-gray-400 hover:text-slate-600 transition-colors"
                              title="Afficher les détails"
                            >
                              {selectedUserId === user.id ? <EyeOff size={16} /> : <Eye size={16} />}
                            </button>
                            <button 
                              onClick={() => setUserToDelete(user)}
                              className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-600 transition-colors"
                              title="Supprimer définitivement cet utilisateur"
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))
                  ) : (
                    <tr>
                      <td colSpan="6" className="px-6 py-10 text-center text-sm font-medium text-gray-400">
                        Aucun utilisateur trouvé correspond aux filtres actuels.
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>

            {/* Pagination Controls Table Footer */}
            <div className="p-4 border-t border-gray-100 bg-white flex items-center justify-between text-xs font-medium text-gray-500">
              <span>Affichage de 1-{filteredUsers.length} sur {users.length} utilisateurs</span>
              <div className="flex gap-1">
                <button className="p-1 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>
                  <ChevronLeft size={16} />
                </button>
                <button className="p-1 bg-white border border-gray-200 rounded hover:bg-gray-50 text-gray-400 disabled:opacity-50" disabled>
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          </div>
        </div>

        {/* --- RIGHT: DYNAMIC DETAILS SIDE PANEL --- */}
        {selectedUser && (
        <div className="xl:col-span-4 bg-white border border-gray-200 rounded-2xl shadow-sm p-6 relative">
          
          {/* Edit Absolute Badge Component */}
          <button className="absolute top-6 right-6 text-orange-700 hover:bg-orange-50 p-1.5 rounded-lg transition-colors">
            <Edit3 size={18} />
          </button>

          {/* User Heading Label Block */}
          <h2 className="font-bold text-lg text-slate-900 mb-6">Détails utilisateur</h2>

          {/* Profile Identity Bubble Center */}
          <div className="flex flex-col items-center text-center border-b border-gray-100 pb-6 mb-6">
            <div className={`w-20 h-20 rounded-full font-bold text-2xl flex items-center justify-center shadow-inner mb-4 ${
              selectedUser.id === 1 ? 'bg-orange-100 text-orange-800' :
              selectedUser.id === 2 ? 'bg-blue-100 text-blue-800' : 'bg-amber-100 text-amber-800'
            }`}>
              {selectedUser.initials}
            </div>
            <h3 className="text-xl font-bold text-slate-800 leading-tight">{selectedUser.name}</h3>
            <p className="text-gray-400 text-xs mt-1">Membre depuis {selectedUser.joinDate}</p>
          </div>

          {/* Premium Subscription Dynamic Display Container */}
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">ABONNEMENT</h4>
            <div className="bg-blue-50/50 border border-blue-100 p-4 rounded-xl flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <span className="p-1.5 bg-blue-600 text-white rounded-lg">
                  <Award size={16} />
                </span>
                <span className="text-blue-900 font-bold text-sm">
                  {selectedUser.plan === 'PREMIUM' ? 'Premium Plus' : selectedUser.plan === 'STANDARD' ? 'Standard Pro' : 'Free Tier'}
                </span>
              </div>
              <span className="text-xs font-black text-blue-900">{selectedUser.price}</span>
            </div>
          </div>

          {/* Embedded Internal Statistics Layout Counters */}
          <div className="mb-6">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-2">STATISTIQUES</h4>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl text-center">
                <div className="text-xl font-black text-slate-800">{selectedUser.eventsCount}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">ÉVÉNEMENTS</div>
              </div>
              <div className="bg-gray-50/80 border border-gray-100 p-3 rounded-xl text-center">
                <div className="text-xl font-black text-slate-800">{selectedUser.ticketsCount}</div>
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wide mt-0.5">BILLETS</div>
              </div>
            </div>
          </div>

          {/* User Specific Live Logging Action History */}
          <div className="mb-8">
            <h4 className="text-[10px] font-black uppercase text-gray-400 tracking-wider mb-3">HISTORIQUE RÉCENT</h4>
            <div className="space-y-3">
              {selectedUser.history.map((log) => (
                <div key={log.id} className="flex items-center justify-between text-xs font-medium">
                  <div className="flex items-center gap-2">
                    <span className={`w-2 h-2 rounded-full ${
                      log.type === 'success' ? 'bg-orange-700' : log.type === 'error' ? 'bg-red-500' : 'bg-blue-500'
                    }`} />
                    <span className="text-slate-700">{log.label}</span>
                  </div>
                  <span className="text-gray-400 text-[11px] font-semibold">{log.time}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Responsive Layout Action Control Buttons */}
          <div className="space-y-2 pt-2 border-t border-gray-100">
            <button 
              onClick={() => handlePromoteAdmin(selectedUser.id)}
              disabled={selectedUser.role === 'Admin'}
              className="w-full flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-slate-700 font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <ShieldCheck size={14} /> Promouvoir Admin
            </button>
            
            <button 
              onClick={() => handleGoPremium(selectedUser.id)}
              disabled={selectedUser.plan === 'PREMIUM'}
              className="w-full flex items-center justify-center gap-2 bg-[#b63e00] hover:bg-[#963300] text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Award size={14} /> Passer Premium
            </button>
            
            <button 
              onClick={() => handleSuspendUser(selectedUser.id)}
              disabled={selectedUser.status === 'Suspendu'}
              className="w-full flex items-center justify-center gap-2 border border-red-200 hover:bg-red-50 text-red-600 font-bold py-2.5 rounded-xl text-xs transition-colors disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
            >
              <Ban size={14} /> Suspendre le compte
            </button>

            <button 
              onClick={() => setUserToDelete(selectedUser)}
              className="w-full flex items-center justify-center gap-2 bg-red-600 hover:bg-red-700 text-white font-bold py-2.5 rounded-xl text-xs transition-colors shadow-sm cursor-pointer"
            >
              <Trash2 size={14} /> Supprimer définitivement de la base
            </button>
          </div>

        </div>
        )}
      </div>

      {/* --- MODALE DE CONFIRMATION DE SUPPRESSION DÉFINITIVE --- */}
      {userToDelete && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/60 backdrop-blur-xs animate-in fade-in duration-150">
          <div className="relative w-full max-w-md bg-white rounded-3xl shadow-2xl border border-gray-200 overflow-hidden font-sans text-gray-900 text-left">
            <div className="h-1.5 w-full bg-red-600" />
            
            <div className="p-6">
              <div className="flex items-center justify-between mb-4">
                <div className="w-12 h-12 rounded-2xl bg-red-50 border border-red-200 text-red-600 flex items-center justify-center">
                  <AlertTriangle size={24} />
                </div>
                <button
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="w-8 h-8 rounded-full flex items-center justify-center text-gray-400 hover:text-gray-700 hover:bg-gray-100 transition cursor-pointer"
                >
                  <X size={18} />
                </button>
              </div>

              <h3 className="text-lg font-black text-gray-900 tracking-tight">
                Supprimer définitivement l'utilisateur ?
              </h3>
              
              <p className="text-xs text-gray-500 mt-2 leading-relaxed">
                Vous êtes sur le point de supprimer le compte de <strong className="text-gray-900">{userToDelete.name}</strong> ({userToDelete.email}).
              </p>

              <div className="mt-4 p-3.5 bg-red-50/70 border border-red-200/80 rounded-2xl text-xs text-red-800 space-y-1.5">
                <div className="font-bold flex items-center gap-1.5 text-red-900">
                  <AlertTriangle size={14} /> Action irréversible :
                </div>
                <ul className="list-disc list-inside text-[11px] text-red-700 space-y-1">
                  <li>Le compte utilisateur sera détruit.</li>
                  <li>Tous ses <strong>événements créés</strong> ({userToDelete.eventsCount || 0}) seront supprimés.</li>
                  <li>Tous les <strong>invités, QR codes et billets</strong> seront purgés.</li>
                  <li>Tous les <strong>agents de scan</strong> associés seront supprimés.</li>
                </ul>
              </div>

              <div className="mt-6 flex items-center justify-end gap-2.5">
                <button
                  type="button"
                  onClick={() => setUserToDelete(null)}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-gray-600 bg-gray-100 hover:bg-gray-200 transition cursor-pointer disabled:opacity-50"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleConfirmDeleteUser}
                  disabled={isDeleting}
                  className="px-4 py-2.5 rounded-xl text-xs font-bold text-white bg-red-600 hover:bg-red-700 shadow-md shadow-red-500/20 transition cursor-pointer flex items-center gap-1.5 disabled:opacity-50"
                >
                  {isDeleting ? (
                    <>
                      <Loader2 size={14} className="animate-spin" />
                      <span>Suppression en cours...</span>
                    </>
                  ) : (
                    <>
                      <Trash2 size={14} />
                      <span>Confirmer la suppression</span>
                    </>
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
