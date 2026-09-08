import React, { useEffect, useState, useMemo } from 'react';
import { useParams } from 'react-router-dom';
import { 
  Users, Plus, Search, Mail, Key, CheckCircle2, 
  Clock, Trash2, QrCode, ShieldCheck, RefreshCw, Eye, Send, X, AlertCircle
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { getAgentsByEvent, sendAgentCredentials, sendEventCodeToAgents, deleteAgent } from '../../../services/agentService';
import AddAgentModal from '../../../components/events/AddAgentModal';

const AgentsTab = ({ eventInfo }) => {
  const { eventId: routeEventId } = useParams();
  const eventId = eventInfo?._id || eventInfo?.id || routeEventId;

  const [agents, setAgents] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [activeFilter, setActiveFilter] = useState('Tous');
  const [detailsAgent, setDetailsAgent] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [sendingCodeLoading, setSendingCodeLoading] = useState(false);
  const [actionLoadingId, setActionLoadingId] = useState(null);

  const fetchAgents = async () => {
    if (!eventId) return;
    setLoading(true);
    try {
      const data = await getAgentsByEvent(eventId);
      if (data.success) {
        setAgents(data.agents || []);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || err.message || 'Erreur lors du chargement des agents.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchAgents();
  }, [eventId]);

  const handleAgentAdded = (newAgent, emailSent) => {
    setAgents((prev) => [newAgent, ...prev]);
    toast.success(
      emailSent
        ? `Agent ${newAgent.email} créé et identifiants envoyés par email !`
        : `Agent ${newAgent.email} créé avec succès !`
    );
  };

  const handleSendCredentials = async (agentId) => {
    setActionLoadingId(agentId);
    try {
      const res = await sendAgentCredentials(agentId);
      if (res.success) {
        toast.success(res.message || 'Identifiants réexpédiés avec succès.');
        fetchAgents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Échec de l\'envoi des identifiants.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const handleSendEventCodeToAll = async () => {
    if (agents.length === 0) {
      toast.error('Aucun agent n\'est encore enregistré pour cet événement.');
      return;
    }
    setSendingCodeLoading(true);
    try {
      const res = await sendEventCodeToAgents(eventId);
      if (res.success) {
        toast.success(res.message);
        fetchAgents();
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi du code d\'événement.');
    } finally {
      setSendingCodeLoading(false);
    }
  };

  const handleDeleteAgent = async (agentId, email) => {
    if (!window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement l'agent ${email} ?`)) return;

    setActionLoadingId(agentId);
    try {
      const res = await deleteAgent(agentId);
      if (res.success) {
        setAgents((prev) => prev.filter((a) => a._id !== agentId));
        if (detailsAgent?._id === agentId) setDetailsAgent(null);
        toast.success(`Agent ${email} supprimé avec succès.`);
      }
    } catch (err) {
      toast.error(err.response?.data?.message || 'Erreur lors de la suppression.');
    } finally {
      setActionLoadingId(null);
    }
  };

  const filters = ['Tous', 'Sécurisés', 'Mot de passe par défaut', 'Code envoyé'];

  const filteredAgents = useMemo(() => {
    const query = search.trim().toLowerCase();

    return agents.filter((agent) => {
      const matchesSearch =
        agent.email?.toLowerCase().includes(query) ||
        agent.nom?.toLowerCase().includes(query) ||
        agent.prenom?.toLowerCase().includes(query);

      const matchesFilter = (() => {
        if (activeFilter === 'Tous') return true;
        if (activeFilter === 'Sécurisés') return agent.isPasswordChanged === true;
        if (activeFilter === 'Mot de passe par défaut') return agent.isPasswordChanged === false;
        if (activeFilter === 'Code envoyé') return Boolean(agent.eventCodeSentAt);
        return true;
      })();

      return matchesSearch && matchesFilter;
    });
  }, [search, activeFilter, agents]);

  const eventCode = eventInfo?.EventCode || 'Code Généré';
  const securedCount = useMemo(() => agents.filter((a) => a.isPasswordChanged).length, [agents]);
  const sentCredentialsCount = useMemo(() => agents.filter((a) => a.credentialsSentAt).length, [agents]);

  return (
    <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 font-sans relative pb-28 text-slate-900 text-left">
      <Toaster position="top-center" />

      {/* --- EN-TÊTE DE PAGE AVEC STATS --- */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Répertoire & Accès Contrôleurs
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Gestion des Agents de Scan
          </h1>
          <p className="text-xs text-gray-400 mt-1">
            Supervisez les contrôleurs d'accès autorisés, expédiez les pass mobiles et sécurisez l'événement.
          </p>
        </div>

        {/* 3 Cartes de Statistiques Rapides */}
        <div className="flex items-center gap-3 overflow-x-auto pb-1 sm:pb-0">
          
          {/* Card 1: TOTAL AGENTS */}
          <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3 shadow-xs min-w-[140px] flex flex-col justify-center">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              TOTAL AGENTS
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-gray-900 leading-none">
                {agents.length}
              </span>
              <span className="text-[9px] font-bold text-gray-500 bg-gray-100 border border-gray-200 px-2 py-0.5 rounded-md uppercase">
                ACTIFS
              </span>
            </div>
          </div>

          {/* Card 2: SÉCURITÉ OK */}
          <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3 shadow-xs min-w-[140px] flex flex-col justify-center">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              MOT DE PASSE MODIFIÉ
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-emerald-600 leading-none">
                {securedCount}
              </span>
              <span className="text-[9px] font-bold text-emerald-600 bg-emerald-50 border border-emerald-200/60 px-2 py-0.5 rounded-md uppercase">
                OK
              </span>
            </div>
          </div>

          {/* Card 3: ACCÈS ENVOYÉS */}
          <div className="bg-white border border-gray-200/80 rounded-2xl px-5 py-3 shadow-xs min-w-[140px] flex flex-col justify-center">
            <span className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">
              ACCÈS EXPÉDIÉS
            </span>
            <div className="flex items-center gap-2 mt-0.5">
              <span className="text-2xl font-black text-[#FF5005] leading-none">
                {sentCredentialsCount}
              </span>
              <span className="text-[9px] font-bold text-[#FF5005] bg-orange-50 border border-orange-200/60 px-2 py-0.5 rounded-md uppercase">
                MAIL
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
              placeholder="Rechercher un agent..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-10 pr-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-medium text-gray-800 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005]/20 transition-all shadow-xs"
            />
          </div>

          {/* Filtres */}
          <div className="flex items-center gap-1 bg-white p-1 rounded-xl border border-gray-200 shadow-xs overflow-x-auto">
            {filters.map((filter) => {
              const isActive = activeFilter === filter;
              return (
                <button
                  key={filter}
                  onClick={() => setActiveFilter(filter)}
                  className={`px-3 py-1 text-xs rounded-lg transition-all cursor-pointer whitespace-nowrap ${
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
          <button
            type="button"
            onClick={handleSendEventCodeToAll}
            disabled={sendingCodeLoading || agents.length === 0}
            className="bg-[#0B1727] hover:bg-black disabled:opacity-40 text-white text-xs font-bold px-4 py-2 rounded-xl shadow-xs transition-all flex items-center gap-1.5 cursor-pointer"
            title="Envoyer automatiquement le code d'événement par email à tous les agents"
          >
            {sendingCodeLoading ? (
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#FF5005]" />
            ) : (
              <QrCode className="w-3.5 h-3.5 text-[#FF5005]" />
            )}
            <span>Envoyer le Code Événement ({eventCode})</span>
          </button>

          <motion.button
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            type="button"
            onClick={() => setIsModalOpen(true)}
            className="bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold px-4 py-2 rounded-xl shadow-md shadow-orange-500/25 transition-all flex items-center gap-1.5 cursor-pointer"
          >
            <Plus className="w-3.5 h-3.5" />
            <span>Ajouter un Agent</span>
          </motion.button>
        </div>
      </div>

      {/* --- TABLEAU DES AGENTS --- */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-gray-50/60 text-[10px] font-extrabold text-gray-400 uppercase tracking-widest">
                <th className="py-4 px-6">Agent</th>
                <th className="py-4 px-4">Mot de Passe par Défaut</th>
                <th className="py-4 px-4">Statut Sécurité</th>
                <th className="py-4 px-4">Accès Mail</th>
                <th className="py-4 px-4">Code Événement</th>
                <th className="py-4 px-6 text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100 text-xs">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center gap-2">
                      <RefreshCw className="w-6 h-6 animate-spin text-[#FF5005]" />
                      <span className="text-xs text-gray-400 font-semibold">Chargement du répertoire des agents...</span>
                    </div>
                  </td>
                </tr>
              ) : filteredAgents.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-16 text-center">
                    <div className="flex flex-col items-center justify-center">
                      <Users className="w-8 h-8 text-gray-300 mb-2" />
                      <p className="text-xs text-gray-400 font-semibold">
                        {search || activeFilter !== 'Tous'
                          ? 'Aucun agent ne correspond à vos critères.'
                          : 'Aucun agent de scan enregistré pour cet événement.'}
                      </p>
                    </div>
                  </td>
                </tr>
              ) : (
                filteredAgents.map((agent) => {
                  const nameStr = `${agent.prenom || ''} ${agent.nom || ''}`.trim() || 'Agent de Scan';
                  const initials = nameStr.split(' ').map((p) => p[0]).join('').slice(0, 2).toUpperCase() || 'AG';

                  return (
                    <tr key={agent._id} className="hover:bg-gray-50/60 transition-colors">
                      <td className="py-3.5 px-6">
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-xl font-black text-xs flex items-center justify-center bg-orange-50 text-[#FF5005] border border-orange-200">
                            {initials}
                          </div>
                          <div>
                            <div className="font-extrabold text-gray-900">{nameStr}</div>
                            <div className="text-gray-400 text-[11px] font-mono">{agent.email}</div>
                          </div>
                        </div>
                      </td>

                      <td className="py-3.5 px-4 font-mono font-bold">
                        {agent.isPasswordChanged ? (
                          <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-[10px] font-extrabold bg-gray-100 text-gray-600 border border-gray-200">
                            <ShieldCheck className="w-3 h-3 text-emerald-600" />
                            •••••••• (Crypté)
                          </span>
                        ) : (
                          <span className="text-[#FF5005]">{agent.defaultPassword}</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {agent.isPasswordChanged ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-emerald-50 text-emerald-600 border border-emerald-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                            Seul l'agent le possède
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[9px] font-extrabold uppercase tracking-wider bg-amber-50 text-[#EFB810] border border-amber-200">
                            <span className="w-1.5 h-1.5 rounded-full bg-[#EFB810]" />
                            Mot de passe par défaut
                          </span>
                        )}
                      </td>

                      <td className="py-3.5 px-4 text-gray-500 font-medium">
                        {agent.credentialsSentAt ? (
                          <span className="text-gray-700 text-[11px] font-semibold">
                            Envoyé le {new Date(agent.credentialsSentAt).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Non envoyé</span>
                        )}
                      </td>

                      <td className="py-3.5 px-4">
                        {agent.eventCodeSentAt ? (
                          <span className="text-emerald-600 font-bold text-[11px]">
                            Envoyé le {new Date(agent.eventCodeSentAt).toLocaleDateString('fr-FR')}
                          </span>
                        ) : (
                          <span className="text-gray-400 text-[11px] italic">Non envoyé</span>
                        )}
                      </td>

                      <td className="py-3.5 px-6 text-right">
                        <div className="flex items-center justify-end gap-1.5 text-gray-400">
                          <button
                            onClick={() => setDetailsAgent(agent)}
                            className="hover:text-gray-900 p-1.5 rounded-lg hover:bg-gray-100 transition cursor-pointer"
                            title="Consulter les détails"
                          >
                            <Eye className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleSendCredentials(agent._id)}
                            disabled={actionLoadingId === agent._id || agent.isPasswordChanged}
                            className={`p-1.5 rounded-lg transition cursor-pointer ${
                              agent.isPasswordChanged
                                ? 'opacity-30 cursor-not-allowed text-gray-300'
                                : 'hover:text-[#FF5005] hover:bg-orange-50 text-[#FF5005]'
                            }`}
                            title={
                              agent.isPasswordChanged
                                ? 'Mot de passe personnalisé et crypté par l\'agent (seul l\'agent le connaît)'
                                : 'Renvoyer les identifiants par mail'
                            }
                          >
                            <Mail className="w-3.5 h-3.5" />
                          </button>
                          <button
                            onClick={() => handleDeleteAgent(agent._id, agent.email)}
                            disabled={actionLoadingId === agent._id}
                            className="hover:text-red-600 p-1.5 rounded-lg hover:bg-red-50 transition cursor-pointer"
                            title="Supprimer cet agent"
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

        {/* --- PANNEAU DE DÉTAILS D'UN AGENT DE SCAN --- */}
        {detailsAgent && (
          <div className="border-t border-gray-100 bg-gray-50/80 p-6 animate-fadeIn">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-gray-900 flex items-center gap-2">
                <ShieldCheck className="w-4 h-4 text-[#FF5005]" />
                Détails du Contrôleur de Scan
              </h3>
              <button 
                onClick={() => setDetailsAgent(null)}
                className="text-xs font-bold text-gray-400 hover:text-gray-700 cursor-pointer"
              >
                Fermer
              </button>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs">
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Identité</div>
                <div className="font-extrabold text-gray-900">{`${detailsAgent.prenom || ''} ${detailsAgent.nom || ''}`.trim() || 'Agent'}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Email de Connexion</div>
                <div className="font-extrabold text-gray-900 truncate">{detailsAgent.email}</div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Mot de Passe & Sécurité</div>
                <div className="font-extrabold text-gray-900">
                  {detailsAgent.isPasswordChanged
                    ? '•••••••• (Crypté - Seul l\'agent le possède)'
                    : detailsAgent.defaultPassword}
                </div>
              </div>
              <div className="bg-white p-3 rounded-2xl border border-gray-200/80">
                <div className="text-[9px] font-bold text-gray-400 uppercase tracking-wider mb-0.5">Envoi Code Événement</div>
                <div className="font-extrabold text-gray-900">{detailsAgent.eventCodeSentAt ? 'Envoyé par email' : 'Non expédié'}</div>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Modal d'ajout d'agent */}
      <AddAgentModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        eventId={eventId}
        onAgentAdded={handleAgentAdded}
      />
    </div>
  );
};

export default AgentsTab;
