import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  HeartHandshake, Star, Send, CheckCircle2, AlertCircle, 
  Sparkles, RefreshCw, ThumbsUp, MessageSquare, ArrowRight,
  ShieldCheck, Wrench
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { feedbackApi } from '../../services/feedbackApi';

export default function PublicFeedbackPage() {
  const { eventId } = useParams();
  const [event, setEvent] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [submitting, setSubmitting] = useState(false);
  const [hasSubmitted, setHasSubmitted] = useState(false);

  // Identifiant unique de session
  const voterIdentifier = `${eventId}_feedback_${localStorage.getItem('feedback_voter_id') || Math.random().toString(36).substring(2)}`;

  useEffect(() => {
    if (!localStorage.getItem('feedback_voter_id')) {
      localStorage.setItem('feedback_voter_id', Math.random().toString(36).substring(2));
    }
  }, []);

  const [form, setForm] = useState({
    guestName: '',
    guestEmail: '',
    npsScore: 10,
    criteriaRatings: {
      organisation: 5,
      accueil: 5,
      ambiance: 5,
      restaurationContenu: 5,
    },
    likedMost: '',
    improvementsNeeded: '',
    generalComment: '',
  });

  const loadEvent = async () => {
    try {
      setLoading(true);
      const res = await feedbackApi.getPublicEvent(eventId);
      if (res.success) {
        setEvent(res.data);
        const alreadyDone = localStorage.getItem(`feedback_submitted_${eventId}`);
        if (alreadyDone) {
          setHasSubmitted(true);
        }
      }
    } catch (err) {
      console.error('Erreur chargement événement feedback:', err);
      setError('Événement introuvable pour ce questionnaire.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) loadEvent();
  }, [eventId]);

  const handleCriteriaChange = (key, rating) => {
    setForm((prev) => ({
      ...prev,
      criteriaRatings: {
        ...prev.criteriaRatings,
        [key]: rating,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      await feedbackApi.submitFeedback(eventId, {
        ...form,
        voterIdentifier,
      });
      localStorage.setItem(`feedback_submitted_${eventId}`, 'true');
      setHasSubmitted(true);
      toast.success('Merci pour votre avis !');
    } catch (err) {
      console.error('Erreur soumission feedback:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de l\'envoi de votre avis');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900 font-sans">
        <RefreshCw className="w-8 h-8 text-[#FF5005] animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-600">Chargement du questionnaire de satisfaction...</p>
      </div>
    );
  }

  if (error || !event) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900 text-center font-sans">
        <div className="bg-white border border-gray-200/80 p-8 rounded-3xl max-w-md w-full shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Questionnaire indisponible</h2>
          <p className="text-gray-500 text-xs leading-relaxed">{error}</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-b from-gray-50 via-white to-gray-50 text-gray-900 flex flex-col justify-between py-10 px-4 font-sans">
      <Toaster position="top-center" />

      <div className="max-w-xl mx-auto w-full space-y-6">
        {/* Header ArshiEvent Branding */}
        <div className="text-center space-y-3">
          <div className="inline-flex items-center gap-1.5 text-base font-black tracking-tight text-gray-900">
            <span>ARSHI</span>
            <span className="text-[#FF5005]">EVENT</span>
            <span className="text-gray-300 mx-1">•</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Satisfaction Invité</span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {event.titre || event.title}
          </h1>

          <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto font-medium">
            Votre expérience nous est précieuse. Prenez 1 minute pour nous faire part de vos impressions.
          </p>
        </div>

        {/* Écran après soumission */}
        {hasSubmitted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200/80 rounded-3xl p-8 shadow-xs space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>
            <div className="space-y-2">
              <h2 className="text-2xl font-black text-gray-900">Merci pour votre retour !</h2>
              <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
                Votre évaluation a bien été enregistrée en base de données. L'organisateur peut désormais la visualiser en temps réel.
              </p>
            </div>

            <div className="pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => {
                  localStorage.removeItem(`feedback_submitted_${eventId}`);
                  localStorage.setItem('feedback_voter_id', Math.random().toString(36).substring(2));
                  setForm({
                    guestName: '',
                    guestEmail: '',
                    npsScore: 10,
                    criteriaRatings: {
                      organisation: 5,
                      accueil: 5,
                      ambiance: 5,
                      restaurationContenu: 5,
                    },
                    likedMost: '',
                    improvementsNeeded: '',
                    generalComment: '',
                  });
                  setHasSubmitted(false);
                }}
                className="w-full sm:w-auto inline-flex items-center justify-center gap-2 bg-gray-900 hover:bg-gray-800 text-white font-bold text-xs px-6 py-3.5 rounded-2xl shadow-sm transition-all cursor-pointer"
              >
                <RefreshCw className="w-4 h-4" />
                Soumettre un autre avis (Tester à nouveau)
              </button>
            </div>
          </motion.div>
        ) : (
          /* Formulaire de satisfaction */
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
          >
            {/* Score NPS (1 à 10) */}
            <div className="space-y-3">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-800 text-center">
                Quelle est la probabilité que vous recommandiez cet événement ? (Score NPS)
              </label>
              <div className="grid grid-cols-5 sm:grid-cols-10 gap-1.5">
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => {
                  const isSelected = form.npsScore === num;
                  const isPromoter = num >= 9;
                  const isPassive = num >= 7 && num <= 8;

                  return (
                    <motion.button
                      key={num}
                      type="button"
                      whileTap={{ scale: 0.95 }}
                      onClick={() => setForm({ ...form, npsScore: num })}
                      className={`h-12 rounded-2xl font-black text-sm transition-all cursor-pointer ${
                        isSelected
                          ? isPromoter
                            ? 'bg-[#FF5005] text-white shadow-xs scale-105'
                            : isPassive
                            ? 'bg-amber-500 text-white shadow-xs scale-105'
                            : 'bg-rose-500 text-white shadow-xs scale-105'
                          : 'bg-gray-50 text-gray-600 border border-gray-200 hover:border-gray-300'
                      }`}
                    >
                      {num}
                    </motion.button>
                  );
                })}
              </div>
              <div className="flex justify-between text-[10px] text-gray-400 font-bold px-1 uppercase">
                <span>0 = Peu probable</span>
                <span>10 = Certain</span>
              </div>
            </div>

            {/* Évaluation critères */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <label className="block text-xs font-black uppercase tracking-wider text-gray-800">
                Évaluation par critères (1 à 5 étoiles)
              </label>

              {[
                { key: 'organisation', label: 'Organisation générale & Logistique' },
                { key: 'accueil', label: 'Accueil & Entrée sécurisée' },
                { key: 'ambiance', label: 'Ambiance & Déroulement' },
                { key: 'restaurationContenu', label: 'Contenu & Restauration' },
              ].map((crit) => (
                <div key={crit.key} className="flex items-center justify-between bg-gray-50 p-4 rounded-2xl border border-gray-200/60">
                  <span className="text-xs font-bold text-gray-700">{crit.label}</span>
                  <div className="flex items-center gap-1">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <button
                        key={star}
                        type="button"
                        onClick={() => handleCriteriaChange(crit.key, star)}
                        className="p-1 hover:scale-125 transition-transform cursor-pointer"
                      >
                        <Star
                          className={`w-5 h-5 transition-colors ${
                            star <= form.criteriaRatings[crit.key]
                              ? 'text-amber-400 fill-amber-400'
                              : 'text-gray-300'
                          }`}
                        />
                      </button>
                    ))}
                  </div>
                </div>
              ))}
            </div>

            {/* Questions ouvertes qualitatives */}
            <div className="space-y-4 pt-4 border-t border-gray-100">
              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                  <ThumbsUp className="w-3.5 h-3.5 text-emerald-600" />
                  <span>Qu'avez-vous le plus apprécié ?</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="Points forts, moments mémorables, accueil..."
                  value={form.likedMost}
                  onChange={(e) => setForm({ ...form, likedMost: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#FF5005] focus:bg-white transition-all"
                />
              </div>

              <div>
                <label className="flex items-center gap-1.5 text-xs font-bold text-gray-800 mb-1">
                  <Wrench className="w-3.5 h-3.5 text-amber-600" />
                  <span>Quels points devraient être améliorés ?</span>
                </label>
                <textarea
                  rows="2"
                  placeholder="Suggestions, axes de progrès pour la prochaine fois..."
                  value={form.improvementsNeeded}
                  onChange={(e) => setForm({ ...form, improvementsNeeded: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#FF5005] focus:bg-white transition-all"
                />
              </div>
            </div>

            {/* Nom & Email (optionnels) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-2">
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase">
                  Votre nom (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Anonyme si vide"
                  value={form.guestName}
                  onChange={(e) => setForm({ ...form, guestName: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
              <div>
                <label className="block text-[11px] font-bold text-gray-500 mb-1 uppercase">
                  Votre email (optionnel)
                </label>
                <input
                  type="email"
                  placeholder="contact@exemple.com"
                  value={form.guestEmail}
                  onChange={(e) => setForm({ ...form, guestEmail: e.target.value })}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-xs font-medium"
                />
              </div>
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FF5005] hover:bg-[#e04500] text-white font-bold py-4 rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Envoi en cours...' : 'Transmettre mon avis'}
            </button>
          </motion.form>
        )}
      </div>

      <footer className="text-center text-xs text-gray-400 py-6">
        Sécurisé par <strong className="text-gray-700">ARSHIEVENT</strong> • Plateforme Événementielle Intelligente
      </footer>
    </div>
  );
}
