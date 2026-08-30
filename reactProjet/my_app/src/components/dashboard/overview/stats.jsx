import React, { useEffect } from 'react';
import { Calendar, Layers, Users, BarChart3, TrendingUp, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { useUserStats } from '../../../hooks/useUserStats';
import { useCurrentUser } from '../../../hooks/useAuth';

const DashboardStats = () => {
  const { stats, loading, error, fetchUserStats } = useUserStats();
  const { user } = useCurrentUser();
  const userId = user?.id || user?._id;
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token && userId) {
      fetchUserStats(userId, token);
    }
  }, [fetchUserStats, userId, token]);

  const statCards = [
    {
      label: 'Total Événements',
      value: stats?.totalEvents ?? 0,
      trend: '+12%',
      trendColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      icon: <Calendar className="text-[#FF5005]" size={20} />,
      iconBg: 'bg-orange-500/10 border-orange-500/20',
      color: 'text-gray-900',
    },
    {
      label: 'Événements Actifs',
      value: stats?.activeEvents ?? 0,
      trend: 'En cours',
      trendColor: 'text-orange-500 bg-orange-50 border-orange-200',
      icon: <Layers className="text-[#EFB810]" size={20} />,
      iconBg: 'bg-amber-500/10 border-amber-500/20',
      color: 'text-gray-900',
    },
    {
      label: 'Invités Totaux',
      value: stats?.totalAttendees ?? 0,
      trend: '+4.5k',
      trendColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      icon: <Users className="text-blue-600" size={20} />,
      iconBg: 'bg-blue-500/10 border-blue-500/20',
      color: 'text-gray-900',
    },
    {
      label: 'Taux de Présence',
      value: '84.2%',
      trend: '+4.8%',
      trendColor: 'text-emerald-500 bg-emerald-50 border-emerald-200',
      icon: <BarChart3 className="text-emerald-500" size={20} />,
      iconBg: 'bg-emerald-500/10 border-emerald-500/20',
      color: 'text-gray-900',
    },
  ];

  const date = new Date();
  const formattedDate = date.toLocaleDateString('fr-FR', {
    weekday: 'long',
    day: 'numeric',
    month: 'long',
    year: 'numeric'
  });

  return (
    <div className="font-sans mb-8">
      {/* Header Section */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Espace Organisateur VIP
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-0.5">
            Tableau de Bord & Performance
          </h1>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-3 bg-white border border-gray-200/80 px-4 py-2 rounded-2xl shadow-sm">
          <div className="w-8 h-8 rounded-xl bg-orange-500/10 text-[#FF5005] flex items-center justify-center">
            <Calendar size={16} />
          </div>
          <div>
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-wider">Aujourd'hui</p>
            <p className="text-xs font-bold text-gray-800 capitalize">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {statCards.map((stat, index) => (
          <motion.div 
            key={index}
            whileHover={{ y: -4, boxShadow: "0 20px 40px -15px rgba(0,0,0,0.06)" }}
            className="bg-white p-6 rounded-3xl border border-gray-200/80 shadow-sm transition-all text-left group"
          >
            <div className="flex justify-between items-start mb-4">
              <div className={`w-11 h-11 rounded-2xl border flex items-center justify-center ${stat.iconBg}`}>
                {stat.icon}
              </div>
              <span className={`text-[10px] font-extrabold uppercase px-2.5 py-0.5 rounded-full border ${stat.trendColor}`}>
                {stat.trend}
              </span>
            </div>
            
            <div>
              <p className="text-gray-400 text-xs font-bold uppercase tracking-wider mb-1">{stat.label}</p>
              <p className={`text-3xl font-black ${stat.color} tracking-tight`}>{stat.value}</p>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;