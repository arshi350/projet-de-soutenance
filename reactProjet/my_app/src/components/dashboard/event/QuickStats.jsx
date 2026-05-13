import React, { useEffect } from 'react';
import { Calendar, Layers, Users, BarChart3 } from 'lucide-react';
import { useUserStats } from '../../../hooks/useUserStats';
import { useCurrentUser } from '../../../hooks/useAuth';

const QuickStats = () => {
  const { stats, loading, error, fetchUserStats } = useUserStats();
  const { user } = useCurrentUser();
  const userId = user?.id;
  const token = localStorage.getItem('accessToken');

  useEffect(() => {
    if (token && userId) {
      fetchUserStats(userId, token);
    }
  }, [fetchUserStats, userId, token]);

  const quickStats = [
    {
      label: 'Total événements',
      value: stats?.totalEvents ?? 0,
      valueColor: 'text-blue-600',
      icon: <Calendar className="text-blue-600" size={28} />,
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Événements actifs',
      value: stats?.activeEvents ?? 0,
      valueColor: 'text-amber-600',
      icon: <Layers className="text-amber-600" size={28} />,
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Total invités',
      value: stats?.totalAttendees ?? 0,
      valueColor: 'text-orange-600',
      icon: <Users className="text-orange-600" size={28} />,
      iconBg: 'bg-orange-50',
    },
    {
      label: 'Taux de présence moyen',
      value: stats?.averageAttendanceRate ? `${stats.averageAttendanceRate}%` : '0.00%',
      valueColor: 'text-purple-600',
      icon: <BarChart3 className="text-purple-600" size={28} />,
      iconBg: 'bg-purple-50',
    },
  ];

  return (
    <div className="p-8 flex gap-6 justify-center overflow-x-auto font">
      {quickStats.map((stat, index) => (
        <div
          key={index}
          className="bg-white min-w-[367px] p-15 rounded-2xl shadow-sm border border-gray-50 flex justify-between items-center transition duration-300 hover:scale-105 hover:shadow-xl cursor-default"
        >
          <div className="flex flex-col gap-2">
            <span className="text-[11px] font-black text-gray-500 uppercase tracking-widest">
              {stat.label}
            </span>
            <span className={`text-4xl font-black ${stat.valueColor}`}>
              {loading ? '...' : stat.value}
            </span>
          </div>
          <div className={`${stat.iconBg} w-16 h-16 rounded-full flex items-center justify-center shadow-inner`}>
            {stat.icon}
          </div>
        </div>
      ))}
    </div>
  );
};

export default QuickStats;