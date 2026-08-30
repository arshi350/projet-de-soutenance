import React, { useState, useEffect, useCallback } from 'react';
import { useParams } from 'react-router-dom';
import { 
  DollarSign, 
  TrendingUp, 
  Ticket, 
  RefreshCw, 
  AlertCircle, 
  Share2, 
  Download,
  Sparkles,
  Layers,
  ArrowUpRight
} from 'lucide-react';
import { useAuthContext } from '../../../context/AuthContext';
import { getEventSalesStats } from '../../../services/salesService';
import SalesMetricsCards from '../../../components/dashboard/event/public/sales/SalesMetricsCards';
import SalesRevenueChart from '../../../components/dashboard/event/public/sales/SalesRevenueChart';
import CategorySalesBreakdown from '../../../components/dashboard/event/public/sales/CategorySalesBreakdown';
import SalesTransactionList from '../../../components/dashboard/event/public/sales/SalesTransactionList';
import AiSalesInsightsCard from '../../../components/dashboard/event/public/sales/AiSalesInsightsCard';
import { PublicTicketShareLink } from '../../../components/dashboard/event/public/PublicTicketShareLink';

export default function SalesAnalyticsTab({ eventInfo }) {
  const { eventId: routeEventId } = useParams();
  const eventId = eventInfo?._id || eventInfo?.id || routeEventId;
  const { token } = useAuthContext();

  const [salesData, setSalesData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const fetchSalesData = useCallback(async (isSilent = false) => {
    if (!eventId) return;
    if (!isSilent) setLoading(true);
    else setRefreshing(true);
    setError(null);

    try {
      const data = await getEventSalesStats(eventId, token);
      if (data.success) {
        setSalesData(data);
      }
    } catch (err) {
      console.error("Erreur lors de la récupération des ventes :", err);
      setError(err.message || "Impossible de charger les statistiques de vente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [eventId, token]);

  useEffect(() => {
    fetchSalesData(false);
    // Rafraîchissement automatique toutes les 25 secondes
    const interval = setInterval(() => {
      fetchSalesData(true);
    }, 25000);

    return () => clearInterval(interval);
  }, [fetchSalesData]);

  const title = eventInfo?.titre || eventInfo?.title || salesData?.event?.titre || 'Événement Public';

  if (loading && !salesData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-16 text-center space-y-4">
        <div className="w-12 h-12 rounded-2xl bg-blue-50 text-blue-600 flex items-center justify-center mx-auto animate-pulse">
          <DollarSign className="w-6 h-6" />
        </div>
        <h3 className="font-bold text-slate-800 text-base">Chargement des données financières...</h3>
        <p className="text-xs text-slate-400">Calcul en temps réel des ventes de billets et revenus</p>
      </div>
    );
  }

  if (error && !salesData) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-white border border-rose-200 rounded-3xl p-8 max-w-lg mx-auto text-center space-y-4 shadow-sm">
          <AlertCircle className="w-10 h-10 text-rose-500 mx-auto" />
          <h3 className="text-lg font-black text-slate-900">Erreur de chargement</h3>
          <p className="text-xs text-slate-500">{error}</p>
          <button
            type="button"
            onClick={() => fetchSalesData(false)}
            className="inline-flex items-center gap-2 px-5 py-2.5 rounded-2xl bg-blue-600 text-white font-bold text-xs hover:bg-blue-700 transition"
          >
            <RefreshCw className="w-3.5 h-3.5" /> Réessayer
          </button>
        </div>
      </div>
    );
  }

  const kpis = salesData?.kpis || {};
  const categoryBreakdown = salesData?.categoryBreakdown || [];
  const salesTimeline = salesData?.salesTimeline || [];
  const transactions = salesData?.transactions || [];
  const aiInsights = salesData?.aiInsights || {};

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-8 font-sans text-slate-900">
      
      {/* Barre d'outils supérieure */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-[10px] font-black uppercase tracking-wider px-2.5 py-0.5 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200">
              Module Billetterie Pro
            </span>
            <span className="text-xs font-bold text-slate-400">• Événement Public</span>
          </div>
          <h2 className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight mt-1">
            Revenus & Statistiques de Vente
          </h2>
          <p className="text-xs text-slate-500 mt-0.5">
            Tableau de bord financier, suivi des places vendues et registre des transactions
          </p>
        </div>

        <div className="flex items-center gap-3 self-start sm:self-auto">
          <button
            type="button"
            onClick={() => fetchSalesData(true)}
            disabled={refreshing}
            className="inline-flex items-center gap-2 px-3.5 py-2 rounded-2xl bg-white border border-slate-200 hover:bg-slate-50 text-slate-700 text-xs font-bold shadow-xs transition"
          >
            <RefreshCw className={`w-3.5 h-3.5 ${refreshing ? 'animate-spin text-blue-600' : ''}`} />
            <span>{refreshing ? 'Actualisation...' : 'Actualiser'}</span>
          </button>
        </div>
      </div>

      {/* Widget de partage direct du lien de billetterie */}
      {eventId && (
        <PublicTicketShareLink eventId={eventId} eventTitle={title} />
      )}

      {/* 1. Cartes de Métriques Clés (KPIs) */}
      <SalesMetricsCards kpis={kpis} eventInfo={eventInfo} />

      {/* 2. Diagnostic & Recommandations IA */}
      <AiSalesInsightsCard aiInsights={aiInsights} eventInfo={eventInfo} />

      {/* 3. Section Graphiques : Courbe d'Évolution & Répartition par Pass */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
        <div className="lg:col-span-7">
          <SalesRevenueChart 
            salesTimeline={salesTimeline}
            totalRevenue={kpis.totalRevenue || 0}
            totalSold={kpis.totalSold || 0}
          />
        </div>
        <div className="lg:col-span-5">
          <CategorySalesBreakdown 
            categoryBreakdown={categoryBreakdown}
            totalRevenue={kpis.totalRevenue || 0}
          />
        </div>
      </div>

      {/* 4. Tableau Complet des Transactions et Billets Vendus */}
      <SalesTransactionList 
        transactions={transactions}
        eventId={eventId}
        eventTitle={title}
        token={token}
        onRefresh={() => fetchSalesData(true)}
      />

    </div>
  );
}
