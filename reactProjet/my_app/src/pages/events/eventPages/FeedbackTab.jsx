import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { 
  Sparkles, Star, MessageSquareQuote, TrendingUp, ThumbsUp, 
  ThumbsDown, AlertTriangle, Lightbulb, RefreshCw, Share2, 
  Check, ExternalLink, ShieldCheck, HeartHandshake, FileText, ArrowRight,
  PieChart as PieIcon, Award, Flame, Users, Calendar, Mail, User, CheckCircle2,
  BarChart3, Filter, Search, Download, FileSpreadsheet, Lock, Globe, Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { feedbackApi } from '../../../services/feedbackApi';
import {
  PieChart as RechartsPieChart,
  Pie,
  Cell,
  Tooltip,
  ResponsiveContainer,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid
} from 'recharts';

const NPS_COLORS = {
  promoters: '#10b981', // Émeraude
  passives: '#f59e0b',  // Ambre
  detractors: '#f43f5e' // Rose
};

export default function FeedbackTab({ eventInfo }) {
  const eventId = eventInfo?._id || eventInfo?.id;
  const isPrivate = eventInfo?.eventType !== 'public';
  const totalInvited = eventInfo?.totalGuests || eventInfo?.totalInvites || eventInfo?.confirmedGuests || 0;

  const [stats, setStats] = useState(null);
  const [aiReport, setAiReport] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [generatingReport, setGeneratingReport] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);

  // Recherche et filtres
  const [searchTerm, setSearchTerm] = useState('');
  const [filterNps, setFilterNps] = useState('ALL'); // 'ALL' | 'PROMOTERS' | 'PASSIVES' | 'DETRACTORS'
  const [sortBy, setSortBy] = useState('recent'); // 'recent' | 'highest' | 'lowest'

  const loadData = useCallback(async (isSilent = false) => {
    if (!eventId) return;
    try {
      if (!isSilent) setLoading(true);
      else setRefreshing(true);

      const [resStats, resReport] = await Promise.all([
        feedbackApi.getStats(eventId),
        feedbackApi.getSavedAiReport(eventId).catch(() => ({ success: false }))
      ]);

      if (resStats?.success) {
        setStats(resStats.data);
      }

      if (resReport?.success && resReport.data) {
        setAiReport(resReport.data);
      }
    } catch (err) {
      console.error('Erreur chargement feedback temps réel:', err);
      if (!isSilent) {
        toast.error('Impossible de charger les retours de satisfaction depuis la base.');
      }
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId]);

  useEffect(() => {
    loadData(false);
    // Polling temps réel toutes les 15 secondes pour récupérer les nouveaux avis en BD
    const interval = setInterval(() => {
      loadData(true);
    }, 15000);

    return () => clearInterval(interval);
  }, [loadData]);

  const handleGenerateAiReport = async () => {
    try {
      setGeneratingReport(true);
      const res = await feedbackApi.generateAiReport(eventId);
      if (res?.success && res.data) {
        setAiReport(res.data);
        toast.success('Rapport exécutif IA généré avec succès à partir des avis réels !');
      }
    } catch (err) {
      console.error('Erreur génération rapport IA:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la génération de l\'analyse IA.');
    } finally {
      setGeneratingReport(false);
    }
  };

  const publicFeedbackUrl = `${window.location.origin}/event/${eventId}/feedback`;

  const handleCopyPublicFeedbackLink = () => {
    navigator.clipboard.writeText(publicFeedbackUrl);
    setCopiedLink(true);
    toast.success('Lien du questionnaire copié dans le presse-papier !');
    setTimeout(() => setCopiedLink(false), 2500);
  };

  const handleOpenTestForm = () => {
    window.open(publicFeedbackUrl, '_blank', 'noopener,noreferrer');
  };

  // Téléchargement CSV des retours
  const handleExportCSV = () => {
    if (!stats?.feedbacks || stats.feedbacks.length === 0) {
      toast.error("Aucun avis à exporter.");
      return;
    }

    const headers = [
      "Date de Soumission",
      "Nom du Participant",
      "Email",
      "Score NPS (/10)",
      "Organisation (/5)",
      "Accueil (/5)",
      "Ambiance (/5)",
      "Contenu & Restauration (/5)",
      "Points Forts",
      "Axes d'Amélioration",
      "Commentaire Général"
    ];

    const rows = stats.feedbacks.map((fb) => {
      const dateStr = fb.submittedAt ? new Date(fb.submittedAt).toLocaleString('fr-FR') : '';
      return [
        `"${dateStr}"`,
        `"${(fb.guestName || 'Anonyme').replace(/"/g, '""')}"`,
        `"${fb.guestEmail || ''}"`,
        `"${fb.npsScore || 0}"`,
        `"${fb.criteriaRatings?.organisation || 5}"`,
        `"${fb.criteriaRatings?.accueil || 5}"`,
        `"${fb.criteriaRatings?.ambiance || 5}"`,
        `"${fb.criteriaRatings?.restaurationContenu || 5}"`,
        `"${(fb.likedMost || '').replace(/"/g, '""')}"`,
        `"${(fb.improvementsNeeded || '').replace(/"/g, '""')}"`,
        `"${(fb.generalComment || '').replace(/"/g, '""')}"`
      ].join(';');
    });

    const csvContent = '\uFEFF' + [headers.join(';'), ...rows].join('\r\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = window.URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `retours_satisfaction_${(eventInfo?.titre || 'evenement').replace(/[^a-zA-Z0-9_-]/g, '_')}_${Date.now()}.csv`);
    document.body.appendChild(link);
    link.click();
    link.parentNode.removeChild(link);
    window.URL.revokeObjectURL(url);
    toast.success("Fichier CSV des retours téléchargé !");
  };

  const totalReviews = stats?.total || 0;
  const averageNps = stats?.averageNps || 0;
  const feedbacksList = stats?.feedbacks || [];
  const criteria = stats?.criteriaAverages || { organisation: 0, accueil: 0, ambiance: 0, restaurationContenu: 0 };
  const npsCategory = stats?.npsCategory || { promotersPercent: 0, passivesPercent: 0, detractorsPercent: 0 };

  // Calcul du taux de satisfaction global (sur 100%)
  const globalSatisfactionRate = useMemo(() => {
    if (totalReviews === 0) return 0;
    const avgScore = (
      (criteria.organisation || 0) +
      (criteria.accueil || 0) +
      (criteria.ambiance || 0) +
      (criteria.restaurationContenu || 0)
    ) / 4;
    return Math.round((avgScore / 5) * 100);
  }, [totalReviews, criteria]);

  // Taux de participation au feedback
  const feedbackParticipationRate = useMemo(() => {
    if (!totalInvited || totalInvited === 0) return null;
    return Math.min(100, Math.round((totalReviews / totalInvited) * 100));
  }, [totalReviews, totalInvited]);

  // Données pour le graphique Donut NPS
  const npsDonutData = useMemo(() => {
    const promotersCount = feedbacksList.filter(f => f.npsScore >= 9).length;
    const passivesCount = feedbacksList.filter(f => f.npsScore >= 7 && f.npsScore <= 8).length;
    const detractorsCount = feedbacksList.filter(f => f.npsScore < 7).length;

    return [
      { name: 'Promoteurs (9-10)', count: promotersCount, percent: npsCategory.promotersPercent, color: NPS_COLORS.promoters },
      { name: 'Passifs (7-8)', count: passivesCount, percent: npsCategory.passivesPercent, color: NPS_COLORS.passives },
      { name: 'Détracteurs (1-6)', count: detractorsCount, percent: npsCategory.detractorsPercent, color: NPS_COLORS.detractors }
    ];
  }, [feedbacksList, npsCategory]);

  // Données pour le bar chart des critères
  const criteriaBarData = useMemo(() => {
    return [
      { name: 'Organisation', note: criteria.organisation || 0, max: 5 },
      { name: 'Accueil & Scan', note: criteria.accueil || 0, max: 5 },
      { name: 'Ambiance & Déroulement', note: criteria.ambiance || 0, max: 5 },
      { name: 'Contenu & Restauration', note: criteria.restaurationContenu || 0, max: 5 }
    ];
  }, [criteria]);

  // Filtrage et tri de la liste des avis
  const filteredFeedbacks = useMemo(() => {
    return feedbacksList
      .filter((fb) => {
        // Filtre par catégorie NPS
        if (filterNps === 'PROMOTERS' && fb.npsScore < 9) return false;
        if (filterNps === 'PASSIVES' && (fb.npsScore < 7 || fb.npsScore > 8)) return false;
        if (filterNps === 'DETRACTORS' && fb.npsScore >= 7) return false;

        // Recherche textuelle
        if (searchTerm.trim()) {
          const q = searchTerm.toLowerCase().trim();
          const matchName = (fb.guestName || '').toLowerCase().includes(q);
          const matchEmail = (fb.guestEmail || '').toLowerCase().includes(q);
          const matchLiked = (fb.likedMost || '').toLowerCase().includes(q);
          const matchImp = (fb.improvementsNeeded || '').toLowerCase().includes(q);
          const matchComm = (fb.generalComment || '').toLowerCase().includes(q);
          return matchName || matchEmail || matchLiked || matchImp || matchComm;
        }
        return true;
      })
      .sort((a, b) => {
        if (sortBy === 'highest') return b.npsScore - a.npsScore;
        if (sortBy === 'lowest') return a.npsScore - b.npsScore;
        return new Date(b.submittedAt) - new Date(a.submittedAt);
      });
  }, [feedbacksList, filterNps, searchTerm, sortBy]);

  return (
    <div className="p-6 sm:p-8 max-w-7xl mx-auto space-y-8 bg-gray-50/50 min-h-screen font-sans text-slate-900">
      <Toaster position="top-right" />

      {/* Header Banner - Charte ArshiEvent */}
      <div className="relative overflow-hidden bg-white rounded-3xl border border-gray-200/80 p-6 sm:p-8 shadow-xs">
        <div className="absolute top-0 right-0 w-96 h-96 bg-gradient-to-br from-orange-100/40 via-amber-50/20 to-transparent rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
          <div className="space-y-2">
            <div className="flex items-center gap-2">
              <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-[11px] font-black uppercase tracking-wider bg-orange-50 text-[#FF5005] border border-orange-200/60">
                <HeartHandshake className="w-3.5 h-3.5" />
                Feedback & Avis en Temps Réel (Base de Données)
              </span>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase bg-slate-100 text-slate-700 border border-slate-200">
                {isPrivate ? <Lock className="w-3 h-3 text-slate-500" /> : <Globe className="w-3 h-3 text-blue-500" />}
                {isPrivate ? 'Événement Privé' : 'Événement Public'}
              </span>
            </div>
            <h2 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
              Statistiques & Retours de Satisfaction Post-Événement
            </h2>
            <p className="text-xs sm:text-sm text-gray-500 font-medium max-w-2xl">
              Consultez en direct les évaluations réelles enregistrées dans MongoDB, analysez les scores par critère et générez une synthèse stratégique avec Gemini.
            </p>
          </div>

          {/* Actions & Boutons d'accès */}
          <div className="flex flex-wrap items-center gap-3">
            {/* Bouton de test du formulaire */}
            <button
              type="button"
              onClick={handleOpenTestForm}
              className="inline-flex items-center justify-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-5 py-3 rounded-2xl font-black text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer"
              title="Ouvrir le formulaire public dans un nouvel onglet pour tester la soumission"
            >
              <ExternalLink className="w-4 h-4" />
              Tester le formulaire
            </button>

            {/* Bouton Copier le lien */}
            <button
              type="button"
              onClick={handleCopyPublicFeedbackLink}
              className="inline-flex items-center justify-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 px-4 py-3 rounded-2xl font-bold text-xs transition-all cursor-pointer border border-gray-200/80"
            >
              {copiedLink ? <Check className="w-4 h-4 text-emerald-600" /> : <Share2 className="w-4 h-4" />}
              {copiedLink ? 'Lien copié !' : 'Partager le lien'}
            </button>

            {/* Bouton Actualiser */}
            <button
              type="button"
              onClick={() => loadData(false)}
              disabled={refreshing}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition border border-gray-200/80 cursor-pointer"
              title="Actualiser les données depuis la base de données"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin text-[#FF5005]' : ''}`} />
            </button>

            {/* Bouton Synthèse IA */}
            <button
              type="button"
              onClick={handleGenerateAiReport}
              disabled={generatingReport || totalReviews === 0}
              className="inline-flex items-center justify-center gap-2 bg-[#FF5005] hover:bg-[#e04500] text-white px-5 py-3 rounded-2xl font-bold text-xs shadow-sm transition-all hover:scale-[1.02] active:scale-[0.98] cursor-pointer disabled:opacity-50 disabled:scale-100"
            >
              <Sparkles className="w-4 h-4" />
              {generatingReport ? 'Analyse Gemini...' : 'Générer Synthèse IA'}
            </button>
          </div>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 animate-pulse">
          {[1, 2, 3, 4].map((n) => (
            <div key={n} className="h-32 bg-white rounded-3xl border border-gray-100" />
          ))}
        </div>
      ) : totalReviews === 0 ? (
        /* État vide lorsque la BD ne contient pas encore d'avis */
        <div className="bg-white border border-gray-200/80 rounded-3xl p-10 sm:p-16 text-center space-y-4 shadow-xs">
          <div className="w-16 h-16 rounded-3xl bg-orange-50 text-[#FF5005] flex items-center justify-center mx-auto border border-orange-100">
            <MessageSquareQuote className="w-8 h-8" />
          </div>
          <div className="space-y-1 max-w-md mx-auto">
            <h3 className="font-black text-gray-900 text-lg">Aucun avis enregistré en base pour le moment</h3>
            <p className="text-xs text-gray-500 font-medium leading-relaxed">
              Votre base de données est prête à recevoir les évaluations des participants. Vous pouvez tester le formulaire dès maintenant en soumettant un premier retour.
            </p>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 pt-3">
            <button
              type="button"
              onClick={handleOpenTestForm}
              className="inline-flex items-center gap-2 bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white font-black text-xs px-6 py-3.5 rounded-2xl shadow-sm transition-all hover:scale-105 cursor-pointer"
            >
              <ExternalLink className="w-4 h-4" />
              Tester le formulaire maintenant
            </button>
            <button
              type="button"
              onClick={handleCopyPublicFeedbackLink}
              className="inline-flex items-center gap-2 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold text-xs px-5 py-3.5 rounded-2xl transition-all cursor-pointer border border-gray-200"
            >
              <Share2 className="w-4 h-4" />
              Copier le lien du questionnaire
            </button>
          </div>
        </div>
      ) : (
        /* Affichage des données et graphiques statistiques réels de la BD */
        <div className="space-y-8">
          
          {/* 1. Cartes KPIs Statistiques Complètes */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
            {/* Carte 1 : Score NPS Moyen */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
                <span>Score NPS Moyen</span>
                <Award className="w-4 h-4 text-[#FF5005]" />
              </div>
              <div className="text-3xl font-black text-gray-900">
                {averageNps} <span className="text-sm font-normal text-gray-400">/ 10</span>
              </div>
              <div className="flex items-center gap-2 text-[11px] font-bold pt-1">
                <span className="text-emerald-600">{npsCategory.promotersPercent || 0}% Promoteurs</span>
                <span className="text-gray-300">•</span>
                <span className="text-rose-500">{npsCategory.detractorsPercent || 0}% Détracteurs</span>
              </div>
            </div>

            {/* Carte 2 : Satisfaction Globale */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
                <span>Satisfaction Globale</span>
                <ThumbsUp className="w-4 h-4 text-emerald-500" />
              </div>
              <div className="text-3xl font-black text-emerald-600">
                {globalSatisfactionRate}%
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Moyenne pondérée des 4 critères</p>
            </div>

            {/* Carte 3 : Avis Reçus & Participation */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
                <span>Avis Recueillis</span>
                <Users className="w-4 h-4 text-blue-500" />
              </div>
              <div className="text-3xl font-black text-gray-900">
                {totalReviews}
              </div>
              <p className="text-[11px] text-gray-500 font-medium">
                {feedbackParticipationRate !== null 
                  ? `${feedbackParticipationRate}% des invités enregistrés (${totalInvited})`
                  : 'Évaluations enregistrées en base'}
              </p>
            </div>

            {/* Carte 4 : Organisation & Logistique */}
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 shadow-xs space-y-2 flex flex-col justify-between">
              <div className="flex items-center justify-between text-gray-400 text-xs font-bold uppercase tracking-wider">
                <span>Note Organisation</span>
                <Star className="w-4 h-4 text-amber-400 fill-amber-400" />
              </div>
              <div className="text-3xl font-black text-gray-900">
                {criteria.organisation || 0} <span className="text-sm font-normal text-gray-400">/ 5</span>
              </div>
              <p className="text-[11px] text-gray-500 font-medium">Logistique & Déroulement</p>
            </div>
          </div>

          {/* 2. Section Graphiques Statistiques (Donut NPS & Barres par Critère) */}
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
            
            {/* Graphique Donut : Répartition des profils NPS */}
            <div className="lg:col-span-5 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-orange-50 text-[#FF5005] rounded-2xl">
                    <PieIcon className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Répartition NPS</h3>
                    <p className="text-xs text-gray-400">Fidélité et recommandation</p>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 bg-slate-100 text-slate-700 rounded-full">
                  Score : {averageNps}/10
                </span>
              </div>

              <div className="h-52 w-full relative flex items-center justify-center">
                <ResponsiveContainer width="100%" height="100%">
                  <RechartsPieChart>
                    <Pie
                      data={npsDonutData}
                      cx="50%"
                      cy="50%"
                      innerRadius={50}
                      outerRadius={78}
                      paddingAngle={4}
                      dataKey="count"
                    >
                      {npsDonutData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip 
                      content={({ active, payload }) => {
                        if (active && payload && payload.length) {
                          const item = payload[0].payload;
                          return (
                            <div className="bg-slate-950 text-white px-3.5 py-2 rounded-xl text-xs space-y-0.5 shadow-xl border border-slate-800">
                              <div className="font-bold">{item.name}</div>
                              <div className="text-emerald-400 font-black">{item.count} participant(s) ({item.percent}%)</div>
                            </div>
                          );
                        }
                        return null;
                      }}
                    />
                  </RechartsPieChart>
                </ResponsiveContainer>

                <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none text-center">
                  <span className="text-[10px] font-black uppercase text-slate-400 tracking-wider">Avis</span>
                  <span className="text-xl font-black text-slate-900">{totalReviews}</span>
                </div>
              </div>

              <div className="space-y-2 border-t border-gray-100 pt-3">
                {npsDonutData.map((item, idx) => (
                  <div key={idx} className="flex justify-between items-center text-xs">
                    <div className="flex items-center gap-2">
                      <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: item.color }} />
                      <span className="font-bold text-gray-700">{item.name}</span>
                    </div>
                    <span className="font-black text-gray-900">{item.count} ({item.percent}%)</span>
                  </div>
                ))}
              </div>
            </div>

            {/* Graphique Barres : Performance détaillée des 4 critères */}
            <div className="lg:col-span-7 bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-7 shadow-xs flex flex-col justify-between space-y-4">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="p-2.5 bg-blue-50 text-blue-600 rounded-2xl">
                    <BarChart3 className="w-4 h-4" />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-gray-900">Notes Détaillées par Critère</h3>
                    <p className="text-xs text-gray-400">Moyennes calculées sur 5 étoiles</p>
                  </div>
                </div>
                <span className="text-[11px] font-black px-2.5 py-0.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full">
                  Satisfaction {globalSatisfactionRate}%
                </span>
              </div>

              <div className="space-y-4 py-2">
                {criteriaBarData.map((item, idx) => {
                  const percent = Math.min(100, Math.round((item.note / 5) * 100));
                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex justify-between items-center text-xs">
                        <span className="font-bold text-gray-800">{item.name}</span>
                        <span className="font-black text-gray-900 flex items-center gap-1">
                          {item.note} / 5 <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                        </span>
                      </div>
                      <div className="w-full bg-gray-100 h-2.5 rounded-full overflow-hidden">
                        <div 
                          className="h-full rounded-full transition-all duration-700 ease-out bg-gradient-to-r from-orange-500 to-amber-400"
                          style={{ width: `${percent}%` }}
                        />
                      </div>
                    </div>
                  );
                })}
              </div>

              <div className="pt-3 border-t border-gray-100 text-[11px] text-gray-400 flex items-center justify-between">
                <span>Échelle d'évaluation : 1 à 5 étoiles</span>
                <span className="font-bold text-gray-700">Calcul en direct de MongoDB</span>
              </div>
            </div>

          </div>

          {/* 3. Section Synthèse Exécutive IA Gemini si disponible */}
          {aiReport?.aiAnalysis ? (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] flex items-center justify-center">
                    <Sparkles className="w-5 h-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-black text-gray-900 tracking-tight">
                      Synthèse Stratégique IA (Gemini)
                    </h3>
                    <p className="text-xs text-gray-400 font-medium">
                      Analyse basée sur les {aiReport.totalResponsesCount || totalReviews} avis réels enregistrés en base
                    </p>
                  </div>
                </div>

                <div className="inline-flex items-center gap-2 bg-gray-50 px-4 py-2 rounded-2xl border border-gray-200/60">
                  <span className="text-xs font-bold text-gray-600">Sentiment Global :</span>
                  <span className="text-xs font-black text-emerald-600 bg-emerald-50 px-2.5 py-0.5 rounded-full border border-emerald-200">
                    {aiReport.aiAnalysis.sentimentPolarity?.globalMood || 'Positif'} ({aiReport.aiAnalysis.sentimentPolarity?.positive || 100}%)
                  </span>
                </div>
              </div>

              {/* Synthèse Rédigée */}
              <div className="text-xs sm:text-sm text-gray-700 leading-relaxed bg-gray-50/70 p-6 rounded-2xl border border-gray-200/60 font-medium whitespace-pre-line">
                {aiReport.aiAnalysis.executiveSummary}
              </div>

              {/* Points Forts & Axes d'Amélioration */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Forces */}
                <div className="bg-emerald-50/50 border border-emerald-200/70 rounded-3xl p-6 space-y-3">
                  <h4 className="font-black text-sm text-emerald-800 flex items-center gap-2">
                    <ThumbsUp className="w-4 h-4 text-emerald-600" />
                    Points Forts Majeurs Plébiscités
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-700">
                    {aiReport.aiAnalysis.topStrengths?.map((str, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                        <span>{str}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Axes d'Amélioration */}
                <div className="bg-amber-50/50 border border-amber-200/70 rounded-3xl p-6 space-y-3">
                  <h4 className="font-black text-sm text-amber-800 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-amber-600" />
                    Axes de Progrès Prioritaires
                  </h4>
                  <ul className="space-y-2 text-xs font-medium text-gray-700">
                    {aiReport.aiAnalysis.priorityImprovements?.map((imp, idx) => (
                      <li key={idx} className="flex items-start gap-2">
                        <span className="w-1.5 h-1.5 rounded-full bg-amber-500 mt-1.5 flex-shrink-0" />
                        <span>{imp}</span>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>

              {/* Matrice des Recommandations Stratégiques */}
              {aiReport.aiAnalysis.strategicRecommendations?.length > 0 && (
                <div className="space-y-4 pt-2">
                  <h4 className="font-black text-sm text-gray-900 flex items-center gap-2">
                    <Lightbulb className="w-4 h-4 text-[#FF5005]" />
                    Recommandations Actionnables pour la Prochaine Édition
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {aiReport.aiAnalysis.strategicRecommendations.map((rec, idx) => (
                      <div
                        key={idx}
                        className="p-5 bg-gray-50 rounded-2xl border border-gray-200/60 space-y-2"
                      >
                        <div className="flex items-center justify-between">
                          <span className="font-black text-xs text-[#FF5005]">
                            {rec.area}
                          </span>
                          <span
                            className={`text-[10px] font-black uppercase px-2.5 py-0.5 rounded-full ${
                              rec.priority === 'Haute'
                                ? 'bg-rose-50 text-rose-600 border border-rose-200'
                                : rec.priority === 'Moyenne'
                                ? 'bg-amber-50 text-amber-700 border border-amber-200'
                                : 'bg-gray-100 text-gray-600'
                            }`}
                          >
                            Priorité {rec.priority}
                          </span>
                        </div>
                        <p className="text-xs font-bold text-gray-900">
                          {rec.recommendation}
                        </p>
                        {rec.expectedImpact && (
                          <p className="text-[11px] text-gray-500 font-medium italic flex items-center gap-1">
                            <Lightbulb className="w-3 h-3 text-amber-500 shrink-0" />
                            <span>Impact : {rec.expectedImpact}</span>
                          </p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white border border-gray-200/80 rounded-3xl p-8 text-center space-y-3 shadow-xs">
              <div className="w-12 h-12 rounded-2xl bg-orange-50 text-[#FF5005] flex items-center justify-center mx-auto">
                <Sparkles className="w-6 h-6" />
              </div>
              <h4 className="font-black text-base text-gray-900">
                Générez la synthèse IA à partir de vos {totalReviews} avis
              </h4>
              <p className="text-xs text-gray-500 max-w-md mx-auto font-medium">
                Déclenchez l'analyse sémantique Gemini pour extraire les forces et axes d'amélioration clés.
              </p>
              <button
                type="button"
                onClick={handleGenerateAiReport}
                disabled={generatingReport}
                className="bg-[#FF5005] hover:bg-[#e04500] text-white font-bold text-xs px-6 py-3 rounded-xl shadow-xs transition-all inline-flex items-center gap-2 cursor-pointer"
              >
                <Sparkles className="w-4 h-4" />
                {generatingReport ? 'Génération en cours...' : 'Lancer l\'analyse IA'}
              </button>
            </div>
          )}

          {/* 4. Liste Détaillée des Avis Réels avec Recherche & Filtres */}
          <div className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-100 pb-5">
              <div>
                <h3 className="font-black text-gray-900 text-base flex items-center gap-2">
                  Retours et Évaluations des Participants
                  <span className="text-xs font-bold bg-slate-100 text-slate-700 px-2.5 py-0.5 rounded-full">
                    {filteredFeedbacks.length} / {totalReviews} avis
                  </span>
                </h3>
                <p className="text-xs text-gray-400 font-medium">
                  Données enregistrées en direct dans MongoDB
                </p>
              </div>

              <div className="flex items-center gap-2.5 self-start sm:self-auto">
                <button
                  type="button"
                  onClick={handleExportCSV}
                  className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-900 hover:bg-slate-800 text-white text-xs font-bold rounded-2xl shadow-xs transition cursor-pointer"
                >
                  <FileSpreadsheet className="w-4 h-4 text-emerald-400" />
                  Exporter en CSV
                </button>

                <button
                  type="button"
                  onClick={handleOpenTestForm}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2.5 rounded-2xl bg-emerald-50 hover:bg-emerald-100 text-emerald-700 text-xs font-bold transition border border-emerald-200 cursor-pointer"
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                  Tester une soumission
                </button>
              </div>
            </div>

            {/* Barre de Recherche et Filtres */}
            <div className="grid grid-cols-1 sm:grid-cols-12 gap-3">
              {/* Champ de recherche */}
              <div className="sm:col-span-6 relative">
                <Search className="w-4 h-4 absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Rechercher par nom, email ou mot-clé dans les avis..."
                  className="w-full pl-10 pr-4 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 focus:border-[#FF5005] text-slate-900 placeholder:text-slate-400"
                />
              </div>

              {/* Filtre Profil NPS */}
              <div className="sm:col-span-3">
                <select
                  value={filterNps}
                  onChange={(e) => setFilterNps(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-700 font-bold"
                >
                  <option value="ALL">Tous les profils NPS</option>
                  <option value="PROMOTERS">Promoteurs (9-10/10)</option>
                  <option value="PASSIVES">Passifs (7-8/10)</option>
                  <option value="DETRACTORS">Détracteurs (1-6/10)</option>
                </select>
              </div>

              {/* Tri */}
              <div className="sm:col-span-3">
                <select
                  value={sortBy}
                  onChange={(e) => setSortBy(e.target.value)}
                  className="w-full px-3.5 py-2.5 text-xs bg-slate-50 border border-slate-200 rounded-2xl focus:outline-none focus:ring-2 focus:ring-orange-500/20 text-slate-700 font-bold"
                >
                  <option value="recent">Plus récents en premier</option>
                  <option value="highest">Meilleures notes NPS</option>
                  <option value="lowest">Notes NPS les plus basses</option>
                </select>
              </div>
            </div>

            {/* Liste des avis filtrés */}
            <div className="space-y-4 pt-2">
              {filteredFeedbacks.length === 0 ? (
                <div className="py-12 text-center text-slate-400">
                  <p className="font-bold text-slate-700 text-sm">Aucun avis ne correspond à vos filtres</p>
                  <p className="text-xs text-slate-400 mt-1">Modifiez vos critères de recherche ou réinitialisez les filtres.</p>
                </div>
              ) : (
                filteredFeedbacks.map((fb, idx) => {
                  const isPromoter = fb.npsScore >= 9;
                  const isPassive = fb.npsScore >= 7 && fb.npsScore <= 8;
                  const dateStr = fb.submittedAt 
                    ? new Date(fb.submittedAt).toLocaleDateString('fr-FR', { day: '2-digit', month: 'short', year: 'numeric', hour: '2-digit', minute: '2-digit' }) 
                    : 'Récemment';

                  return (
                    <motion.div
                      key={fb._id || idx}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      transition={{ duration: 0.2, delay: idx * 0.02 }}
                      className="p-5 bg-gray-50/80 hover:bg-gray-100/70 border border-gray-200/70 rounded-2xl transition-all space-y-3 text-left"
                    >
                      {/* Header de l'avis */}
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                        <div className="flex items-center gap-2.5">
                          <div className="w-8 h-8 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-slate-700 font-black text-xs shadow-xs">
                            {fb.guestName ? fb.guestName.charAt(0).toUpperCase() : 'P'}
                          </div>
                          <div>
                            <div className="font-extrabold text-xs text-gray-900">
                              {fb.guestName || 'Participant anonyme'}
                            </div>
                            {fb.guestEmail && (
                              <div className="text-[11px] text-gray-400 font-medium flex items-center gap-1">
                                <Mail className="w-3 h-3" />
                                <span>{fb.guestEmail}</span>
                              </div>
                            )}
                          </div>
                        </div>

                        <div className="flex items-center gap-3">
                          <span
                            className={`font-black px-3 py-1 rounded-full text-xs border ${
                              isPromoter
                                ? 'bg-emerald-50 text-emerald-700 border-emerald-200'
                                : isPassive
                                ? 'bg-amber-50 text-amber-700 border-amber-200'
                                : 'bg-rose-50 text-rose-700 border-rose-200'
                            }`}
                          >
                            NPS : {fb.npsScore} / 10
                          </span>
                          <span className="text-gray-400 text-[11px] font-medium flex items-center gap-1">
                            <Calendar className="w-3 h-3" />
                            {dateStr}
                          </span>
                        </div>
                      </div>

                      {/* Étoiles par critère */}
                      {fb.criteriaRatings && (
                        <div className="flex flex-wrap items-center gap-4 py-2 border-y border-gray-200/60 text-[11px] text-gray-600 font-medium">
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-700">Organisation :</span>
                            <span className="text-amber-500 font-black flex items-center gap-0.5">
                              {fb.criteriaRatings.organisation || 5} <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-700">Accueil :</span>
                            <span className="text-amber-500 font-black flex items-center gap-0.5">
                              {fb.criteriaRatings.accueil || 5} <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-700">Ambiance :</span>
                            <span className="text-amber-500 font-black flex items-center gap-0.5">
                              {fb.criteriaRatings.ambiance || 5} <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                          </div>
                          <div className="flex items-center gap-1">
                            <span className="font-bold text-gray-700">Contenu :</span>
                            <span className="text-amber-500 font-black flex items-center gap-0.5">
                              {fb.criteriaRatings.restaurationContenu || 5} <Star className="w-3 h-3 fill-amber-400" />
                            </span>
                          </div>
                        </div>
                      )}

                      {/* Commentaires textuels */}
                      <div className="space-y-1.5 text-xs">
                        {fb.likedMost && (
                          <div className="flex items-start gap-1.5 text-gray-800">
                            <span className="inline-flex items-center gap-1 text-emerald-700 font-black shrink-0">
                              <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                              Apprécié :
                            </span>
                            <span>{fb.likedMost}</span>
                          </div>
                        )}
                        {fb.improvementsNeeded && (
                          <div className="flex items-start gap-1.5 text-gray-800">
                            <span className="inline-flex items-center gap-1 text-amber-700 font-black shrink-0">
                              <Wrench className="w-3.5 h-3.5 text-amber-600" />
                              À perfectionner :
                            </span>
                            <span>{fb.improvementsNeeded}</span>
                          </div>
                        )}
                        {fb.generalComment && (
                          <p className="text-gray-600 italic font-medium bg-white p-3 rounded-xl border border-gray-200/50">
                            "{fb.generalComment}"
                          </p>
                        )}
                      </div>
                    </motion.div>
                  );
                })
              )}
            </div>
          </div>

        </div>
      )}
    </div>
  );
}
