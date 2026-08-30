import React, { useState, useEffect } from 'react';
import { 
  BarChart3, Plus, Copy, Check, Trash2, Power, Eye, 
  HelpCircle, Star, MessageSquare, AlertCircle, RefreshCw, 
  ExternalLink, Share2, Sparkles, PieChart, CheckCircle2,
  TrendingUp, Users, ArrowUpRight, Flame, Layers, Clock,
  Utensils, Music, Palette, Car, Wand2
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { pollApi } from '../../../services/pollApi';

const POLL_OBJECTIVES = [
  {
    id: 'repas_et_allergies',
    title: 'Restauration & Régimes',
    icon: Utensils,
    desc: 'Allergies, régimes végé/végan, sans gluten, préférences de cocktails'
  },
  {
    id: 'musique_et_ambiance',
    title: 'Musique & Ambiance',
    icon: Music,
    desc: 'Styles préférés, suggestions de titres pour le DJ, animations favorites'
  },
  {
    id: 'attentes_et_themes',
    title: 'Thèmes & Dress-Code',
    icon: Palette,
    desc: 'Préférences de dress-code, choix des thématiques, activités souhaitées'
  },
  {
    id: 'logistique_et_transports',
    title: 'Logistique & Accès',
    icon: Car,
    desc: 'Besoins de navettes, parking, covoiturage ou accès PMR'
  }
];

export default function PollsTab({ eventInfo }) {
  const eventId = eventInfo?._id || eventInfo?.id;
  const [polls, setPolls] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedPoll, setSelectedPoll] = useState(null);
  const [pollDetails, setPollDetails] = useState(null);
  const [loadingDetails, setLoadingDetails] = useState(false);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showAiGeneratorModal, setShowAiGeneratorModal] = useState(false);
  const [generatingAi, setGeneratingAi] = useState(false);
  const [selectedObjective, setSelectedObjective] = useState('repas_et_allergies');
  const [customAiInstructions, setCustomAiInstructions] = useState('');
  const [copiedId, setCopiedId] = useState(null);

  // État du formulaire
  const [formData, setFormData] = useState({
    title: '',
    description: '',
    timingType: 'pre_event',
    isAnonymous: false,
    showLiveResults: true,
    questions: [
      {
        id: `q_${Date.now()}_0`,
        title: '',
        type: 'single_choice',
        isRequired: true,
        options: [
          { id: `opt_${Date.now()}_0_0`, text: '' },
          { id: `opt_${Date.now()}_0_1`, text: '' },
        ],
      },
    ],
  });

  const loadPolls = async () => {
    if (!eventId) return;
    try {
      setLoading(true);
      const res = await pollApi.getPollsByEvent(eventId);
      if (res.success) {
        setPolls(res.data || []);
        if (res.data && res.data.length > 0 && !selectedPoll) {
          loadDetails(res.data[0]._id);
        }
      }
    } catch (err) {
      console.error('Erreur chargement sondages:', err);
      toast.error('Impossible de charger les sondages.');
    } finally {
      setLoading(false);
    }
  };

  const loadDetails = async (pollId) => {
    try {
      setLoadingDetails(true);
      setSelectedPoll(pollId);
      const res = await pollApi.getPollDetails(pollId);
      if (res.success) {
        setPollDetails(res.data);
      }
    } catch (err) {
      console.error('Erreur détails sondage:', err);
    } finally {
      setLoadingDetails(false);
    }
  };

  useEffect(() => {
    loadPolls();
  }, [eventId]);

  const handleCopyLink = (pollId) => {
    const url = `${window.location.origin}/poll/${pollId}`;
    navigator.clipboard.writeText(url);
    setCopiedId(pollId);
    toast.success('Lien public du sondage copié !');
    setTimeout(() => setCopiedId(null), 2500);
  };

  const handleToggleStatus = async (pollId, currentStatus) => {
    try {
      const newStatus = currentStatus === 'active' ? 'closed' : 'active';
      await pollApi.updateStatus(pollId, newStatus);
      toast.success(newStatus === 'active' ? 'Sondage réactivé' : 'Sondage clôturé');
      loadPolls();
      if (selectedPoll === pollId) {
        loadDetails(pollId);
      }
    } catch (err) {
      console.error('Erreur changement statut:', err);
      toast.error('Erreur lors de la mise à jour du statut.');
    }
  };

  const handleDelete = async (pollId) => {
    if (!window.confirm('Voulez-vous supprimer définitivement ce sondage ?')) return;
    try {
      await pollApi.deletePoll(pollId);
      toast.success('Sondage supprimé avec succès.');
      if (selectedPoll === pollId) {
        setSelectedPoll(null);
        setPollDetails(null);
      }
      loadPolls();
    } catch (err) {
      console.error('Erreur suppression:', err);
      toast.error('Erreur lors de la suppression.');
    }
  };

  // Génération intelligente par IA Gemini
  const handleGeneratePollWithAi = async () => {
    try {
      setGeneratingAi(true);
      const res = await pollApi.generateAiPoll({
        eventId,
        pollObjective: selectedObjective,
        customInstructions: customAiInstructions,
      });

      if (res.success && res.data) {
        setFormData({
          title: res.data.title || `Sondage Pré-Événement`,
          description: res.data.description || 'Merci de prendre quelques secondes pour nous aider à préparer votre accueil.',
          timingType: 'pre_event',
          isAnonymous: res.data.isAnonymous || false,
          showLiveResults: res.data.showLiveResults || false,
          questions: res.data.questions || [],
        });
        setShowAiGeneratorModal(false);
        setShowCreateModal(true);
        toast.success('Questions générées par l\'IA avec succès !');
      }
    } catch (err) {
      console.error('Erreur génération IA:', err);
      toast.error('Impossible de générer le sondage avec Gemini IA.');
    } finally {
      setGeneratingAi(false);
    }
  };

  // Création & Publication
  const handleCreatePollSubmit = async (e) => {
    if (e) e.preventDefault();
    if (!formData.title.trim()) {
      toast.error('Veuillez renseigner le titre du sondage');
      return;
    }

    try {
      await pollApi.createPoll({
        ...formData,
        eventId,
        timingType: 'pre_event',
      });
      toast.success('Sondage pré-événement publié avec succès !');
      setShowCreateModal(false);
      loadPolls();
    } catch (err) {
      console.error('Erreur publication sondage:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la publication du sondage');
    }
  };

  // Formulaire Helpers
  const addQuestion = () => {
    const qIndex = formData.questions.length;
    setFormData({
      ...formData,
      questions: [
        ...formData.questions,
        {
          id: `q_${Date.now()}_${qIndex}`,
          title: '',
          type: 'single_choice',
          isRequired: true,
          options: [
            { id: `opt_${Date.now()}_${qIndex}_0`, text: '' },
            { id: `opt_${Date.now()}_${qIndex}_1`, text: '' },
          ],
        },
      ],
    });
  };

  const removeQuestion = (index) => {
    if (formData.questions.length <= 1) return;
    const nextQ = formData.questions.filter((_, i) => i !== index);
    setFormData({ ...formData, questions: nextQ });
  };

  const updateQuestion = (index, field, value) => {
    const nextQ = [...formData.questions];
    nextQ[index][field] = value;
    setFormData({ ...formData, questions: nextQ });
  };

  const addOption = (qIndex) => {
    const nextQ = [...formData.questions];
    const optIndex = nextQ[qIndex].options.length;
    nextQ[qIndex].options.push({
      id: `opt_${Date.now()}_${qIndex}_${optIndex}`,
      text: '',
    });
    setFormData({ ...formData, questions: nextQ });
  };

  const removeOption = (qIndex, optIndex) => {
    const nextQ = [...formData.questions];
    if (nextQ[qIndex].options.length <= 2) return;
    nextQ[qIndex].options = nextQ[qIndex].options.filter((_, i) => i !== optIndex);
    setFormData({ ...formData, questions: nextQ });
  };

  const updateOptionText = (qIndex, optIndex, text) => {
    const nextQ = [...formData.questions];
    nextQ[qIndex].options[optIndex].text = text;
    setFormData({ ...formData, questions: nextQ });
  };

  const totalVotesAcrossAll = polls.reduce((acc, p) => acc + (p.totalVotesCount || 0), 0);
  const activePollsCount = polls.filter((p) => p.status === 'active').length;

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen font-sans">
      <Toaster position="top-right" />

      {/* Header Banner - Charte ArshiEvent */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200/80 p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-50 text-[#FF5005] border border-orange-200/60">
              <Sparkles className="w-3.5 h-3.5" />
              Sondages Pré-Événement par IA
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Anticipez les besoins de vos invités avant le jour J
            </h2>
            <p className="text-sm text-gray-500 font-medium max-w-2xl">
              Consultez vos participants en amont (régimes alimentaires, musique, logistique) pour leur garantir une expérience sur-mesure inoubliable.
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-3">
            <button
              onClick={() => setShowAiGeneratorModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-[#FF5005] hover:bg-[#e04500] text-white px-6 py-3.5 rounded-2xl font-bold text-sm shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
            >
              <Wand2 className="w-4 h-4" />
              Générer avec l'IA Gemini
            </button>
            <button
              onClick={() => setShowCreateModal(true)}
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-700 px-5 py-3.5 rounded-2xl font-bold text-sm transition-all cursor-pointer"
            >
              <Plus className="w-4 h-4" />
              Création Manuelle
            </button>
          </div>
        </div>

        {/* Mini KPI Bar */}
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mt-6 pt-6 border-t border-gray-100">
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Sondages Préparatoires</span>
            <div className="text-xl font-black text-gray-900 mt-0.5">{polls.length}</div>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">En Cours de Collecte</span>
            <div className="text-xl font-black text-emerald-600 mt-0.5">{activePollsCount}</div>
          </div>
          <div>
            <span className="text-xs font-bold text-gray-400 uppercase tracking-wider">Réponses Reçues</span>
            <div className="text-xl font-black text-[#FF5005] mt-0.5">{totalVotesAcrossAll}</div>
          </div>
        </div>
      </div>

      {/* Grille principale */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8">
        {/* Colonne Gauche : Liste des sondages */}
        <div className="lg:col-span-5 space-y-4">
          <div className="flex items-center justify-between px-1">
            <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
              Sondages Pré-Événement ({polls.length})
            </h3>
            <button
              onClick={loadPolls}
              className="p-2 text-gray-400 hover:text-gray-700 hover:bg-white rounded-xl border border-transparent hover:border-gray-200 transition-all cursor-pointer"
              title="Rafraîchir"
            >
              <RefreshCw className={`w-4 h-4 ${loading ? 'animate-spin' : ''}`} />
            </button>
          </div>

          {loading ? (
            <div className="space-y-3">
              {[1, 2, 3].map((n) => (
                <div key={n} className="h-28 bg-white rounded-2xl border border-gray-100 animate-pulse" />
              ))}
            </div>
          ) : polls.length === 0 ? (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5005] flex items-center justify-center mx-auto">
                <BarChart3 className="w-6 h-6" />
              </div>
              <h4 className="font-bold text-gray-900 text-sm">Aucun sondage pré-événement actif</h4>
              <p className="text-xs text-gray-400 max-w-xs mx-auto">
                Laissez l'IA concevoir un questionnaire ciblé sur les repas, la musique ou les attentes de vos invités.
              </p>
              <button
                onClick={() => setShowAiGeneratorModal(true)}
                className="mt-2 text-xs font-bold bg-[#FF5005] hover:bg-[#e04500] text-white px-5 py-2.5 rounded-xl transition-all cursor-pointer inline-flex items-center gap-1.5"
              >
                <Sparkles className="w-3.5 h-3.5" />
                Générer un sondage par IA
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {polls.map((poll) => {
                const isSelected = selectedPoll === poll._id;
                const isActive = poll.status === 'active';

                return (
                  <motion.div
                    key={poll._id}
                    onClick={() => loadDetails(poll._id)}
                    whileHover={{ scale: 1.01 }}
                    className={`p-5 rounded-2xl border transition-all cursor-pointer relative bg-white ${
                      isSelected
                        ? 'border-[#FF5005] ring-2 ring-[#FF5005]/10 shadow-sm'
                        : 'border-gray-200/80 hover:border-gray-300 shadow-xs'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-3">
                      <span
                        className={`inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                          isActive
                            ? 'bg-emerald-50 text-emerald-600 border border-emerald-200/60'
                            : 'bg-gray-100 text-gray-600 border border-gray-200/60'
                        }`}
                      >
                        <span className={`w-1.5 h-1.5 rounded-full ${isActive ? 'bg-emerald-500 animate-pulse' : 'bg-gray-400'}`} />
                        {isActive ? 'Collecte Ouverte' : 'Clôturé'}
                      </span>
                      <span className="text-[11px] font-bold text-gray-400">
                        {poll.questions?.length || 0} question(s)
                      </span>
                    </div>

                    <h4 className="font-bold text-gray-900 mt-2.5 text-sm line-clamp-1">
                      {poll.title}
                    </h4>
                    {poll.description && (
                      <p className="text-xs text-gray-500 line-clamp-1 mt-0.5 font-medium">{poll.description}</p>
                    )}

                    <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-100 text-xs">
                      <span className="font-bold text-gray-600 flex items-center gap-1">
                        <Users className="w-3.5 h-3.5 text-[#FF5005]" />
                        {poll.totalVotesCount || 0} réponse(s)
                      </span>

                      <div className="flex items-center gap-1" onClick={(e) => e.stopPropagation()}>
                        <button
                          onClick={() => handleCopyLink(poll._id)}
                          className="p-2 text-gray-400 hover:text-[#FF5005] hover:bg-orange-50 rounded-xl transition-colors cursor-pointer"
                          title="Copier le lien public"
                        >
                          {copiedId === poll._id ? <Check className="w-3.5 h-3.5 text-emerald-500" /> : <Copy className="w-3.5 h-3.5" />}
                        </button>
                        <button
                          onClick={() => handleToggleStatus(poll._id, poll.status)}
                          className="p-2 text-gray-400 hover:text-amber-600 hover:bg-amber-50 rounded-xl transition-colors cursor-pointer"
                          title={isActive ? 'Clôturer la collecte' : 'Réactiver'}
                        >
                          <Power className="w-3.5 h-3.5" />
                        </button>
                        <button
                          onClick={() => handleDelete(poll._id)}
                          className="p-2 text-gray-400 hover:text-rose-600 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                          title="Supprimer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </div>
                  </motion.div>
                );
              })}
            </div>
          )}
        </div>

        {/* Colonne Droite : Visualisation & Réponses des invités */}
        <div className="lg:col-span-7">
          {loadingDetails ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs">
              <RefreshCw className="w-8 h-8 text-[#FF5005] animate-spin mx-auto mb-3" />
              <p className="text-sm font-bold text-gray-600">Chargement des réponses...</p>
            </div>
          ) : !pollDetails ? (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-12 text-center shadow-xs space-y-3">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 text-gray-400 flex items-center justify-center mx-auto">
                <PieChart className="w-7 h-7" />
              </div>
              <h4 className="text-base font-black text-gray-900">Sélectionnez un sondage</h4>
              <p className="text-xs text-gray-400 max-w-sm mx-auto font-medium">
                Consultez les régimes déclarés, choix de musique et demandes spécifiques de vos participants.
              </p>
            </div>
          ) : (
            <div className="bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs space-y-6">
              {/* Entête du sondage */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="space-y-1">
                  <div className="flex items-center gap-2">
                    <h3 className="text-lg sm:text-xl font-black text-gray-900 tracking-tight">
                      {pollDetails.poll.title}
                    </h3>
                    <span
                      className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                        pollDetails.poll.status === 'active'
                          ? 'bg-emerald-50 text-emerald-600 border border-emerald-200'
                          : 'bg-gray-100 text-gray-600'
                      }`}
                    >
                      {pollDetails.poll.status === 'active' ? 'Ouvert' : 'Clôturé'}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 font-medium">
                    {pollDetails.totalVotes} participant(s) ayant répondu avant l'événement
                  </p>
                </div>

                <div className="flex items-center gap-2">
                  <a
                    href={`/poll/${pollDetails.poll._id}`}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-gray-100 hover:bg-gray-200 text-gray-700 px-3.5 py-2 rounded-xl transition-all"
                  >
                    <ExternalLink className="w-3.5 h-3.5" />
                    Tester le lien
                  </a>
                  <button
                    onClick={() => handleCopyLink(pollDetails.poll._id)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold bg-[#FF5005] hover:bg-[#e04500] text-white px-4 py-2 rounded-xl shadow-xs transition-all cursor-pointer"
                  >
                    <Share2 className="w-3.5 h-3.5" />
                    Partager aux Invités
                  </button>
                </div>
              </div>

              {/* Analyse des questions */}
              <div className="space-y-6">
                {pollDetails.analytics?.map((item, idx) => (
                  <div
                    key={item.questionId || idx}
                    className="bg-gray-50/70 p-5 rounded-2xl border border-gray-200/60 space-y-4"
                  >
                    <div className="flex items-center justify-between">
                      <h4 className="font-bold text-sm text-gray-900 flex items-center gap-2">
                        <span className="w-6 h-6 rounded-xl bg-orange-100 text-[#FF5005] flex items-center justify-center text-xs font-black">
                          {idx + 1}
                        </span>
                        {item.title}
                      </h4>
                      <span className="text-xs font-bold text-gray-400">
                        {item.totalAnswers} réponse(s)
                      </span>
                    </div>

                    {(item.type === 'single_choice' || item.type === 'multiple_choice') && (
                      <div className="space-y-2.5 pt-1">
                        {item.optionsDistribution?.map((opt) => (
                          <div key={opt.id} className="space-y-1.5">
                            <div className="flex items-center justify-between text-xs font-bold text-gray-700">
                              <span>{opt.text}</span>
                              <span className="text-[#FF5005]">
                                {opt.count} ({opt.percentage}%)
                              </span>
                            </div>
                            <div className="w-full h-3 bg-gray-200/70 rounded-full overflow-hidden">
                              <motion.div
                                initial={{ width: 0 }}
                                animate={{ width: `${opt.percentage}%` }}
                                transition={{ duration: 0.6, ease: 'easeOut' }}
                                className="h-full bg-[#FF5005] rounded-full"
                              />
                            </div>
                          </div>
                        ))}
                      </div>
                    )}

                    {item.type === 'star_rating' && (
                      <div className="flex items-center gap-6 pt-2">
                        <div className="text-center p-4 bg-white rounded-2xl border border-gray-200/80 shadow-xs">
                          <div className="text-3xl font-black text-[#FF5005]">{item.averageRating}</div>
                          <div className="flex items-center justify-center text-amber-400 mt-1">
                            {[1, 2, 3, 4, 5].map((s) => (
                              <Star
                                key={s}
                                className={`w-3.5 h-3.5 ${
                                  s <= Math.round(item.averageRating) ? 'fill-amber-400' : 'text-gray-200'
                                }`}
                              />
                            ))}
                          </div>
                          <span className="text-[10px] font-bold text-gray-400 uppercase tracking-wider mt-1 block">
                            Moyenne / 5
                          </span>
                        </div>
                        <div className="flex-1 space-y-1.5">
                          {[5, 4, 3, 2, 1].map((star) => {
                            const count = item.distribution?.[star] || 0;
                            const pct = item.totalAnswers > 0 ? Math.round((count / item.totalAnswers) * 100) : 0;
                            return (
                              <div key={star} className="flex items-center gap-2 text-xs font-bold text-gray-600">
                                <span className="w-4">{star}★</span>
                                <div className="flex-1 h-2.5 bg-gray-200/70 rounded-full overflow-hidden">
                                  <div className="h-full bg-amber-400 rounded-full" style={{ width: `${pct}%` }} />
                                </div>
                                <span className="w-6 text-right text-gray-400">{count}</span>
                              </div>
                            );
                          })}
                        </div>
                      </div>
                    )}

                    {item.type === 'free_text' && (
                      <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                        {item.responses?.length === 0 ? (
                          <p className="text-xs text-gray-400 italic">Aucun retour textuel pour le moment.</p>
                        ) : (
                          item.responses.map((resp, rIdx) => (
                            <div
                              key={rIdx}
                              className="p-3 bg-white rounded-xl border border-gray-200/60 text-xs text-gray-700"
                            >
                              <div className="flex items-center justify-between text-[10px] font-bold text-gray-400 mb-1">
                                <span>{resp.voterName}</span>
                                <span>{new Date(resp.date).toLocaleTimeString('fr-FR', { hour: '2-digit', minute: '2-digit' })}</span>
                              </div>
                              <p className="font-semibold text-gray-900">"{resp.text}"</p>
                            </div>
                          ))
                        )}
                      </div>
                    )}
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal Générateur IA Gemini */}
      <AnimatePresence>
        {showAiGeneratorModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Générateur de Sondage Pré-Événement par IA
                  </h3>
                </div>
                <button
                  onClick={() => setShowAiGeneratorModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <div className="space-y-4">
                <label className="block text-xs font-black uppercase tracking-wider text-gray-700">
                  Quel est l'objectif principal de consultation des invités ?
                </label>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  {POLL_OBJECTIVES.map((obj) => {
                    const isSelected = selectedObjective === obj.id;
                    const Icon = obj.icon;
                    return (
                      <div
                        key={obj.id}
                        onClick={() => setSelectedObjective(obj.id)}
                        className={`p-4 rounded-2xl border transition-all cursor-pointer flex flex-col justify-between space-y-2 ${
                          isSelected
                            ? 'bg-orange-50/80 border-[#FF5005] ring-2 ring-[#FF5005]/20 shadow-xs'
                            : 'bg-gray-50 border-gray-200/80 hover:border-gray-300'
                        }`}
                      >
                        <div className="flex items-center gap-2.5">
                          <div className={`p-2 rounded-xl ${isSelected ? 'bg-[#FF5005] text-white' : 'bg-white text-gray-600 border border-gray-200'}`}>
                            <Icon className="w-4 h-4" />
                          </div>
                          <span className={`text-xs font-black ${isSelected ? 'text-[#FF5005]' : 'text-gray-900'}`}>
                            {obj.title}
                          </span>
                        </div>
                        <p className="text-[11px] text-gray-500 font-medium leading-relaxed">
                          {obj.desc}
                        </p>
                      </div>
                    );
                  })}
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1 mt-2">
                    Précisions ou demandes spécifiques pour l'IA (optionnel)
                  </label>
                  <input
                    type="text"
                    placeholder="Ex: Soirée cocktail dinatoire haut de gamme, proposer du champagne et vins bios..."
                    value={customAiInstructions}
                    onChange={(e) => setCustomAiInstructions(e.target.value)}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs font-medium focus:outline-none focus:border-[#FF5005] focus:bg-white"
                  />
                </div>
              </div>

              <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => setShowAiGeneratorModal(false)}
                  className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                >
                  Annuler
                </button>
                <button
                  type="button"
                  onClick={handleGeneratePollWithAi}
                  disabled={generatingAi}
                  className="px-6 py-2.5 text-sm font-bold bg-[#FF5005] hover:bg-[#e04500] text-white rounded-xl shadow-xs transition-all flex items-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  <Wand2 className="w-4 h-4" />
                  {generatingAi ? 'Conception en cours...' : 'Générer & Prévisualiser'}
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

      {/* Modal Création / Édition Manuelle & Publication */}
      <AnimatePresence>
        {showCreateModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-gray-900/60 backdrop-blur-xs">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl border border-gray-100 p-6 sm:p-8 space-y-6"
            >
              <div className="flex items-center justify-between border-b border-gray-100 pb-4">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 rounded-xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                    <Sparkles className="w-4 h-4" />
                  </div>
                  <h3 className="text-lg font-black text-gray-900 tracking-tight">
                    Sondage Pré-Événement (Préparation des Invités)
                  </h3>
                </div>
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 flex items-center justify-center text-sm font-bold cursor-pointer"
                >
                  ✕
                </button>
              </div>

              <form onSubmit={handleCreatePollSubmit} className="space-y-5">
                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Titre du sondage *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="Ex: Vos préférences pour préparer votre soirée..."
                    value={formData.title}
                    onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-bold text-gray-900 focus:outline-none focus:border-[#FF5005] focus:bg-white"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                    Introduction bienveillante pour les invités
                  </label>
                  <textarea
                    rows="2"
                    placeholder="Expliquez en 1 phrase l'intérêt de ce sondage..."
                    value={formData.description}
                    onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2 text-sm font-medium focus:outline-none focus:border-[#FF5005] focus:bg-white"
                  />
                </div>

                {/* Questions */}
                <div className="space-y-4 pt-2">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                    <span className="text-xs font-black uppercase tracking-wider text-gray-900">
                      Questions ({formData.questions.length})
                    </span>
                    <button
                      type="button"
                      onClick={addQuestion}
                      className="text-xs text-[#FF5005] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" /> Ajouter une question
                    </button>
                  </div>

                  {formData.questions.map((q, qIdx) => (
                    <div
                      key={q.id}
                      className="p-5 bg-gray-50 rounded-2xl border border-gray-200/60 space-y-3"
                    >
                      <div className="flex items-center justify-between">
                        <span className="text-xs font-black text-[#FF5005] uppercase">Question {qIdx + 1}</span>
                        {formData.questions.length > 1 && (
                          <button
                            type="button"
                            onClick={() => removeQuestion(qIdx)}
                            className="text-rose-500 hover:text-rose-600 text-xs font-bold cursor-pointer"
                          >
                            Supprimer
                          </button>
                        )}
                      </div>

                      <input
                        type="text"
                        required
                        placeholder="Intitulé de la question..."
                        value={q.title}
                        onChange={(e) => updateQuestion(qIdx, 'title', e.target.value)}
                        className="w-full bg-white border border-gray-200 rounded-xl px-4 py-2 text-sm font-bold text-gray-900"
                      />

                      <div className="w-full sm:w-1/2">
                        <label className="block text-[11px] font-bold text-gray-400 uppercase mb-1">Type de réponse</label>
                        <select
                          value={q.type}
                          onChange={(e) => updateQuestion(qIdx, 'type', e.target.value)}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 text-xs font-semibold text-gray-700"
                        >
                          <option value="single_choice">🔘 Choix Unique</option>
                          <option value="multiple_choice">☑️ Choix Multiple</option>
                          <option value="star_rating">⭐ Notation Étoiles</option>
                          <option value="free_text">✍️ Réponse Libre</option>
                        </select>
                      </div>

                      {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                        <div className="space-y-2 pt-2">
                          <label className="block text-[11px] font-bold text-gray-400 uppercase">
                            Options de réponse
                          </label>
                          {q.options.map((opt, optIdx) => (
                            <div key={opt.id} className="flex items-center gap-2">
                              <input
                                type="text"
                                required
                                placeholder={`Option ${optIdx + 1}`}
                                value={opt.text}
                                onChange={(e) => updateOptionText(qIdx, optIdx, e.target.value)}
                                className="flex-1 bg-white border border-gray-200 rounded-xl px-3 py-1.5 text-xs font-medium"
                              />
                              {q.options.length > 2 && (
                                <button
                                  type="button"
                                  onClick={() => removeOption(qIdx, optIdx)}
                                  className="text-gray-400 hover:text-rose-500 text-xs px-1 cursor-pointer"
                                >
                                  ✕
                                </button>
                              )}
                            </div>
                          ))}
                          <button
                            type="button"
                            onClick={() => addOption(qIdx)}
                            className="text-xs text-[#FF5005] font-bold hover:underline flex items-center gap-1 mt-1 cursor-pointer"
                          >
                            + Ajouter une option
                          </button>
                        </div>
                      )}
                    </div>
                  ))}
                </div>

                <div className="flex items-center justify-end gap-3 pt-4 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => setShowCreateModal(false)}
                    className="px-5 py-2.5 text-sm font-bold text-gray-600 hover:bg-gray-100 rounded-xl cursor-pointer"
                  >
                    Annuler
                  </button>
                  <button
                    type="submit"
                    className="px-6 py-2.5 text-sm font-bold bg-[#FF5005] hover:bg-[#e04500] text-white rounded-xl shadow-xs cursor-pointer"
                  >
                    Publier le Sondage Pré-Événement
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
