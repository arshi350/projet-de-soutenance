import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import EventStats from '../../../components/dashboard/event/manageEvent/vue_d_Ensemble/stats';
import EventAnalytics from '../../../components/dashboard/event/manageEvent/vue_d_Ensemble/EventAnalytics';
import EventActivityAndActions from '../../../components/dashboard/event/manageEvent/vue_d_Ensemble/EventActivityAndActions';
import { PublicTicketShareLink } from '../../../components/dashboard/event/public/PublicTicketShareLink';
import { DollarSign, TrendingUp, ArrowRight, Ticket, HeartHandshake, Star, Award } from 'lucide-react';
import { getEventSalesStats } from '../../../services/salesService';
import { feedbackApi } from '../../../services/feedbackApi';
import { useAuthContext } from '../../../context/AuthContext';

const Overview = ({ eventInfo }) => {
  const { eventId: routeEventId } = useParams();
  const [, setSearchParams] = useSearchParams();
  const { token } = useAuthContext();
  const eventId = eventInfo?._id || eventInfo?.id || routeEventId;
  const isPublic = eventInfo?.eventType === 'public';
  const title = eventInfo?.titre || eventInfo?.title || 'Mon Événement';

  const [salesSummary, setSalesSummary] = useState(null);
  const [feedbackSummary, setFeedbackSummary] = useState(null);

  useEffect(() => {
    if (eventId) {
      if (isPublic) {
        getEventSalesStats(eventId, token)
          .then(data => {
            if (data?.success) setSalesSummary(data.kpis);
          })
          .catch(() => {});
      }

      feedbackApi.getStats(eventId)
        .then(res => {
          if (res?.success && res.data?.total > 0) {
            setFeedbackSummary(res.data);
          }
        })
        .catch(() => {});
    }
  }, [isPublic, eventId, token]);

  const goToSales = () => {
    setSearchParams({ tab: 'ventes' }, { replace: true });
  };

  const goToFeedback = () => {
    setSearchParams({ tab: 'feedback' }, { replace: true });
  };

  return (
    <section className="pt-6 pb-12 space-y-6">
      {/* Pour les événements publics : Affichage prioritaire du lien de vente */}
      {isPublic && eventId && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 space-y-4">
          <PublicTicketShareLink eventId={eventId} eventTitle={title} />

          {/* Raccourci vers les Ventes & Revenus */}
          {salesSummary && (
            <div className="bg-gradient-to-r from-emerald-900 to-slate-900 text-white rounded-3xl p-5 shadow-sm border border-emerald-800/60 flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3.5">
                <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl border border-emerald-500/30">
                  <DollarSign className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                    Recettes Billetterie : {Number(salesSummary.totalRevenue || 0).toLocaleString('fr-FR')} €
                    <span className="text-[10px] font-bold bg-emerald-500/30 text-emerald-300 px-2 py-0.5 rounded-full border border-emerald-400/30">
                      {salesSummary.totalSold || 0} billet(s) vendus
                    </span>
                  </h4>
                  <p className="text-xs text-emerald-200/80">
                    Jauge remplie à {salesSummary.fillRate || 0}% ({salesSummary.remainingCapacity || 0} places disponibles)
                  </p>
                </div>
              </div>

              <button
                type="button"
                onClick={goToSales}
                className="inline-flex items-center gap-2 px-4 py-2 bg-emerald-500 hover:bg-emerald-400 text-slate-950 text-xs font-black rounded-2xl shadow-md transition shrink-0 cursor-pointer"
              >
                <span>Voir le tableau financier complet</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>
      )}

      {/* Widget Satisfaction Post-Event si des avis existent */}
      {feedbackSummary && (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="bg-gradient-to-r from-orange-900 via-slate-900 to-amber-950 text-white rounded-3xl p-5 shadow-sm border border-orange-800/50 flex flex-col sm:flex-row items-center justify-between gap-4">
            <div className="flex items-center gap-3.5">
              <div className="p-3 bg-orange-500/20 text-orange-400 rounded-2xl border border-orange-500/30">
                <HeartHandshake className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-extrabold text-sm text-white flex items-center gap-2">
                  Satisfaction Participants : Score NPS {feedbackSummary.averageNps} / 10
                  <span className="text-[10px] font-black uppercase px-2.5 py-0.5 bg-orange-500/30 text-orange-300 border border-orange-400/30 rounded-full">
                    {feedbackSummary.total} avis réels
                  </span>
                </h4>
                <p className="text-xs text-orange-200/80 flex items-center gap-1.5 mt-0.5">
                  <span>{feedbackSummary.npsCategory?.promotersPercent || 0}% Promoteurs</span>
                  <span>•</span>
                  <span className="flex items-center gap-1">
                    Organisation : {feedbackSummary.criteriaAverages?.organisation || 0}/5
                    <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                  </span>
                </p>
              </div>
            </div>

            <button
              type="button"
              onClick={goToFeedback}
              className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500 hover:bg-orange-400 text-slate-950 text-xs font-black rounded-2xl shadow-md transition shrink-0 cursor-pointer"
            >
              <span>Consulter les avis & stats</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>
        </div>
      )}

      <EventStats eventInfo={eventInfo ?? {}} />
      <EventAnalytics eventInfo={eventInfo} />
      <EventActivityAndActions eventInfo={eventInfo} />
    </section>
  );
};

export default Overview;
