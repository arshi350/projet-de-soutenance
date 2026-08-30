import React, { useEffect } from 'react';
import { 
  Calendar, Layers, Users, BarChart3, TrendingUp, 
  Sparkles, CheckCircle2, Clock, ArrowUpRight 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStats } from '../../../hooks/useUserStats';
import { useAuthContext } from '../../../context/AuthContext';

/**
 * Cartes de Statistiques Rapides du Dashboard Événements (QuickStats)
 * Grille responsive 4 colonnes, micro-interactions, dark/light glassmorphism et indicateurs de performance.
 */
export const QuickStats = () => {
  const { stats, loading, error, fetchUserStats } = useUserStats();
  const { user, token } = useAuthContext();
  const userId = user?._id || user?.id;

  useEffect(() => {
    if (token && userId) {
      fetchUserStats(userId, token);
    }
  }, [fetchUserStats, userId, token]);

  const statCards = [
    {
      id: 'total',
      label: 'Total Événements',
      value: stats?.totalEvents ?? 0,
      subValue: 'Catalogue global',
      trend: `${stats?.totalEvents ?? 0} créés`,
      icon: Calendar,
      accentColor: 'from-[#FF5005] to-[#FF7A00]',
      iconBg: 'bg-orange-500/10 text-[#FF5005] border-orange-500/20',
      badgeStyle: 'bg-orange-500/10 text-[#FF5005] border-orange-500/20',
      progress: Math.min(100, (stats?.totalEvents || 0) * 10),
    },
    {
      id: 'active',
      label: 'Événements Actifs',
      value: stats?.activeEvents ?? 0,
      subValue: 'En cours de diffusion',
      trend: 'En direct',
      icon: Layers,
      accentColor: 'from-emerald-500 to-teal-400',
      iconBg: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      badgeStyle: 'bg-emerald-500/10 text-emerald-500 border-emerald-500/20',
      isLive: (stats?.activeEvents || 0) > 0,
      progress: stats?.totalEvents ? Math.min(100, Math.round(((stats?.activeEvents || 0) / stats.totalEvents) * 100)) : 0,
    },
    {
      id: 'attendees',
      label: 'Invités & Participants',
      value: stats?.totalAttendees ?? 0,
      subValue: 'Personnes engagées',
      trend: '+100% délivrabilité',
      icon: Users,
      accentColor: 'from-blue-600 to-indigo-500',
      iconBg: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      badgeStyle: 'bg-blue-500/10 text-blue-600 border-blue-500/20',
      progress: Math.min(100, (stats?.totalAttendees || 0) * 2),
    },
    {
      id: 'attendanceRate',
      label: 'Taux de Présence Moyen',
      value: stats?.averageAttendanceRate ? `${stats.averageAttendanceRate}%` : '85.0%',
      subValue: 'Ratio de participation',
      trend: '+4.5% vs moyenne',
      icon: BarChart3,
      accentColor: 'from-purple-600 to-pink-500',
      iconBg: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      badgeStyle: 'bg-purple-500/10 text-purple-600 border-purple-500/20',
      progress: parseFloat(stats?.averageAttendanceRate || '85'),
    },
  ];

  // Skeleton Loader pendant le chargement
  if (loading && !stats) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8">
        {[1, 2, 3, 4].map((n) => (
          <div
            key={n}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-sm animate-pulse space-y-4"
          >
            <div className="flex justify-between items-center">
              <div className="w-12 h-12 bg-gray-100 rounded-2xl" />
              <div className="w-16 h-5 bg-gray-100 rounded-full" />
            </div>
            <div className="space-y-2">
              <div className="w-24 h-4 bg-gray-100 rounded-md" />
              <div className="w-16 h-8 bg-gray-200 rounded-lg" />
            </div>
            <div className="w-full h-1.5 bg-gray-100 rounded-full" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5 mb-8 font-sans">
      {statCards.map((card, index) => {
        const Icon = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3, delay: index * 0.08 }}
            whileHover={{ y: -4, boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.07)' }}
            className="bg-white rounded-3xl p-6 border border-gray-100 shadow-xs hover:border-gray-200 transition-all text-left relative overflow-hidden group"
          >
            {/* Ligne d'accent supérieure au survol */}
            <div
              className={`absolute top-0 left-0 right-0 h-1 bg-gradient-to-r ${card.accentColor} opacity-0 group-hover:opacity-100 transition-opacity duration-300`}
            />

            {/* En-tête de la carte */}
            <div className="flex justify-between items-start mb-4">
              <div
                className={`w-12 h-12 rounded-2xl border flex items-center justify-center transition-transform group-hover:scale-105 duration-300 shadow-xs ${card.iconBg}`}
              >
                <Icon size={22} />
              </div>

              <div
                className={`flex items-center gap-1 px-3 py-1 rounded-full text-[11px] font-extrabold uppercase tracking-wider border ${card.badgeStyle}`}
              >
                {card.isLive && (
                  <span className="w-2 h-2 rounded-full bg-emerald-500 animate-ping mr-0.5" />
                )}
                <span>{card.trend}</span>
              </div>
            </div>

            {/* Corps de la carte */}
            <div className="space-y-1">
              <span className="text-[11px] font-black uppercase tracking-wider text-gray-400 block">
                {card.label}
              </span>
              <div className="flex items-baseline gap-2">
                <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                  {card.value}
                </span>
              </div>
              <span className="text-xs text-gray-400 font-medium block">
                {card.subValue}
              </span>
            </div>

            {/* Micro-barre de progression esthétique */}
            <div className="mt-4 pt-3 border-t border-gray-50">
              <div className="w-full bg-gray-100 h-1.5 rounded-full overflow-hidden">
                <motion.div
                  initial={{ width: 0 }}
                  animate={{ width: `${card.progress}%` }}
                  transition={{ duration: 0.8, delay: index * 0.1 }}
                  className={`h-full rounded-full bg-gradient-to-r ${card.accentColor}`}
                />
              </div>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
};

export default QuickStats;