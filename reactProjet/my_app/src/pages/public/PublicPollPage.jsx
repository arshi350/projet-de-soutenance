import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import { 
  BarChart3, CheckCircle2, Star, Sparkles, Send, 
  HelpCircle, Eye, AlertCircle, RefreshCw, ArrowRight,
  ShieldCheck, Users, Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { toast, Toaster } from 'react-hot-toast';
import { pollApi } from '../../services/pollApi';

export default function PublicPollPage() {
  const { pollId } = useParams();
  const [poll, setPoll] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [voterName, setVoterName] = useState('');
  const [answers, setAnswers] = useState({});
  const [hasVoted, setHasVoted] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [liveResults, setLiveResults] = useState(null);

  // Identifiant unique de session
  const voterIdentifier = `${pollId}_${localStorage.getItem('poll_voter_id') || Math.random().toString(36).substring(2)}`;

  useEffect(() => {
    if (!localStorage.getItem('poll_voter_id')) {
      localStorage.setItem('poll_voter_id', Math.random().toString(36).substring(2));
    }
  }, []);

  const loadPoll = async () => {
    try {
      setLoading(true);
      const res = await pollApi.getPublicPoll(pollId);
      if (res.success) {
        setPoll(res.data);
        const alreadyVoted = localStorage.getItem(`voted_${pollId}`);
        if (alreadyVoted) {
          setHasVoted(true);
          if (res.data.showLiveResults) {
            loadLiveResults();
          }
        }
      }
    } catch (err) {
      console.error('Erreur sondage public:', err);
      setError(err.response?.data?.message || 'Ce sondage est introuvable ou clôturé.');
    } finally {
      setLoading(false);
    }
  };

  const loadLiveResults = async () => {
    try {
      const res = await pollApi.getPublicLiveResults(pollId);
      if (res.success) {
        setLiveResults(res.data);
      }
    } catch (err) {
      console.error('Erreur live results:', err);
    }
  };

  useEffect(() => {
    if (pollId) loadPoll();
  }, [pollId]);

  const handleOptionSelect = (questionId, optionId, isMultiple) => {
    setAnswers((prev) => {
      const current = prev[questionId]?.selectedOptionIds || [];
      let nextOptions = [];
      if (isMultiple) {
        nextOptions = current.includes(optionId)
          ? current.filter((id) => id !== optionId)
          : [...current, optionId];
      } else {
        nextOptions = [optionId];
      }
      return {
        ...prev,
        [questionId]: {
          ...prev[questionId],
          questionId,
          selectedOptionIds: nextOptions,
        },
      };
    });
  };

  const handleStarRating = (questionId, rating) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        ratingValue: rating,
      },
    }));
  };

  const handleTextAnswer = (questionId, text) => {
    setAnswers((prev) => ({
      ...prev,
      [questionId]: {
        ...prev[questionId],
        questionId,
        textAnswer: text,
      },
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      setSubmitting(true);
      const answersArray = Object.values(answers);

      await pollApi.submitVote(pollId, {
        voterIdentifier,
        voterName: voterName.trim() || undefined,
        answers: answersArray,
      });

      localStorage.setItem(`voted_${pollId}`, 'true');
      setHasVoted(true);
      toast.success('Vote validé avec succès !');

      if (poll?.showLiveResults) {
        loadLiveResults();
      }
    } catch (err) {
      console.error('Erreur soumission vote:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de l\'enregistrement de votre vote');
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900">
        <RefreshCw className="w-8 h-8 text-[#FF5005] animate-spin mb-3" />
        <p className="text-sm font-bold text-gray-600">Chargement du sondage en direct...</p>
      </div>
    );
  }

  if (error || !poll) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center p-6 text-gray-900 text-center font-sans">
        <div className="bg-white border border-gray-200/80 p-8 rounded-3xl max-w-md w-full shadow-xs space-y-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-50 text-amber-600 flex items-center justify-center mx-auto">
            <AlertCircle className="w-6 h-6" />
          </div>
          <h2 className="text-xl font-black text-gray-900">Sondage indisponible</h2>
          <p className="text-gray-500 text-xs leading-relaxed">{error || 'Ce sondage n\'est plus actif.'}</p>
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
          <div className="inline-flex items-center gap-1.5 text-base font-black tracking-tight text-gray-900 flex-wrap justify-center">
            <span>ARSHI</span>
            <span className="text-[#FF5005]">EVENT</span>
            <span className="text-gray-300 mx-1">•</span>
            <span className="text-xs font-bold text-gray-500 uppercase">Sondage en Direct</span>
            <span
              className={`ml-2 px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase ${
                poll.eventType === 'public'
                  ? 'bg-blue-50 text-blue-600 border border-blue-200'
                  : 'bg-purple-50 text-purple-600 border border-purple-200'
              }`}
            >
              {poll.eventType === 'public' ? 'Événement Public' : 'Événement Privé'}
            </span>
          </div>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            {poll.title}
          </h1>

          {poll.description && (
            <p className="text-gray-500 text-xs sm:text-sm max-w-md mx-auto font-medium">
              {poll.description}
            </p>
          )}
        </div>

        {/* Écran après vote */}
        {hasVoted ? (
          <motion.div
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6 text-center"
          >
            <div className="w-16 h-16 bg-emerald-50 text-emerald-600 rounded-2xl flex items-center justify-center mx-auto border border-emerald-100">
              <CheckCircle2 className="w-8 h-8" />
            </div>

            <div className="space-y-1">
              <h2 className="text-xl font-black text-gray-900">Merci pour votre vote !</h2>
              <p className="text-gray-500 text-xs font-medium">Votre participation a bien été enregistrée.</p>
            </div>

            {/* Résultats en direct */}
            {poll.showLiveResults && liveResults && (
              <div className="space-y-4 pt-6 border-t border-gray-100 text-left">
                <div className="flex items-center justify-between">
                  <h3 className="font-black text-xs uppercase tracking-wider text-gray-900 flex items-center gap-1.5">
                    <BarChart3 className="w-4 h-4 text-[#FF5005]" />
                    Résultats en direct ({liveResults.totalVotes} votes)
                  </h3>
                  <button
                    onClick={loadLiveResults}
                    className="text-xs text-[#FF5005] font-bold hover:underline cursor-pointer"
                  >
                    Actualiser
                  </button>
                </div>

                <div className="space-y-4">
                  {liveResults.analytics?.map((item, idx) => (
                    <div key={idx} className="bg-gray-50 p-4 rounded-2xl border border-gray-200/60 space-y-2.5">
                      <p className="font-bold text-xs text-gray-900">{item.title}</p>

                      {item.optionsDistribution && (
                        <div className="space-y-2">
                          {item.optionsDistribution.map((opt) => (
                            <div key={opt.id} className="space-y-1">
                              <div className="flex justify-between text-[11px] font-bold text-gray-600">
                                <span>{opt.text}</span>
                                <span className="text-[#FF5005]">{opt.percentage}%</span>
                              </div>
                              <div className="h-2.5 bg-gray-200/80 rounded-full overflow-hidden">
                                <motion.div
                                  initial={{ width: 0 }}
                                  animate={{ width: `${opt.percentage}%` }}
                                  transition={{ duration: 0.5 }}
                                  className="h-full bg-[#FF5005] rounded-full"
                                />
                              </div>
                            </div>
                          ))}
                        </div>
                      )}

                      {item.averageRating !== undefined && (
                        <div className="text-amber-500 text-xs font-black pt-1">
                          Note Moyenne : {item.averageRating} / 5 ⭐
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        ) : (
          /* Formulaire de vote */
          <motion.form
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            onSubmit={handleSubmit}
            className="bg-white border border-gray-200/80 rounded-3xl p-6 sm:p-8 shadow-xs space-y-6"
          >
            {!poll.isAnonymous && (
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-gray-700 mb-1">
                  Votre nom ou prénom (optionnel)
                </label>
                <input
                  type="text"
                  placeholder="Ex: Sarah, Thomas..."
                  value={voterName}
                  onChange={(e) => setVoterName(e.target.value)}
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium focus:outline-none focus:border-[#FF5005] focus:bg-white transition-all"
                />
              </div>
            )}

            {/* Questions */}
            <div className="space-y-6">
              {poll.questions.map((q, idx) => (
                <div key={q.id} className="space-y-3 pt-2">
                  <h3 className="font-bold text-sm text-gray-900 flex items-start gap-2.5">
                    <span className="w-5 h-5 rounded-full bg-orange-100 text-[#FF5005] flex items-center justify-center text-[10px] font-black flex-shrink-0 mt-0.5">
                      {idx + 1}
                    </span>
                    <span>
                      {q.title} {q.isRequired && <span className="text-[#FF5005]">*</span>}
                    </span>
                  </h3>

                  {/* Choix Unique ou Multiple */}
                  {(q.type === 'single_choice' || q.type === 'multiple_choice') && (
                    <div className="space-y-2">
                      {q.options.map((opt) => {
                        const isSelected = answers[q.id]?.selectedOptionIds?.includes(opt.id);
                        return (
                          <motion.button
                            key={opt.id}
                            type="button"
                            whileTap={{ scale: 0.99 }}
                            onClick={() => handleOptionSelect(q.id, opt.id, q.type === 'multiple_choice')}
                            className={`w-full text-left p-4 rounded-2xl border transition-all flex items-center justify-between text-xs font-bold cursor-pointer ${
                              isSelected
                                ? 'bg-orange-50/80 border-[#FF5005] text-[#FF5005] shadow-xs'
                                : 'bg-gray-50/60 border-gray-200 hover:border-gray-300 text-gray-700'
                            }`}
                          >
                            <span>{opt.text}</span>
                            <span
                              className={`w-5 h-5 rounded-full border flex items-center justify-center transition-colors ${
                                isSelected ? 'border-[#FF5005] bg-[#FF5005] text-white' : 'border-gray-300 bg-white'
                              }`}
                            >
                              {isSelected && <Check className="w-3 h-3 stroke-[3]" />}
                            </span>
                          </motion.button>
                        );
                      })}
                    </div>
                  )}

                  {/* Notation Étoiles */}
                  {q.type === 'star_rating' && (
                    <div className="flex items-center justify-center gap-3 py-4 bg-gray-50 rounded-2xl border border-gray-200/60">
                      {[1, 2, 3, 4, 5].map((star) => {
                        const currentRating = answers[q.id]?.ratingValue || 0;
                        return (
                          <button
                            key={star}
                            type="button"
                            onClick={() => handleStarRating(q.id, star)}
                            className="p-1 hover:scale-125 transition-transform cursor-pointer"
                          >
                            <Star
                              className={`w-8 h-8 transition-colors ${
                                star <= currentRating
                                  ? 'text-amber-400 fill-amber-400'
                                  : 'text-gray-300'
                              }`}
                            />
                          </button>
                        );
                      })}
                    </div>
                  )}

                  {/* Texte Libre */}
                  {q.type === 'free_text' && (
                    <textarea
                      rows="3"
                      placeholder="Tapez votre réponse..."
                      value={answers[q.id]?.textAnswer || ''}
                      onChange={(e) => handleTextAnswer(q.id, e.target.value)}
                      className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-xs font-medium focus:outline-none focus:border-[#FF5005] focus:bg-white transition-all"
                    />
                  )}
                </div>
              ))}
            </div>

            <button
              type="submit"
              disabled={submitting}
              className="w-full bg-[#FF5005] hover:bg-[#e04500] text-white font-bold py-3.5 rounded-2xl shadow-sm transition-all hover:scale-[1.01] active:scale-[0.99] flex items-center justify-center gap-2 text-sm cursor-pointer disabled:opacity-50"
            >
              <Send className="w-4 h-4" />
              {submitting ? 'Enregistrement...' : 'Valider mon vote'}
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
