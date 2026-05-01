import { useEffect } from 'react';
import { Calendar, Layers, Users, BarChart3 } from 'lucide-react';
import { useUserStats } from '../../../hooks/useUserStats';
import { useCurrentUser } from '../../../hooks/useAuth';


const DashboardStats = () => {
   const { stats, loading, error, fetchUserStats } = useUserStats();
   const {user} = useCurrentUser();
   const userId = user?.id
   const token = localStorage.getItem('accessToken');

   useEffect(()=>{
    if(token && userId){
      fetchUserStats(userId, token);
    }
   },[fetchUserStats, userId, token])

  const Stats = [
    {
      label: 'Total événements',
      value: stats?.totalEvents ?? 0,
      trend: '+12%',
      trendColor: 'text-emerald-500 bg-emerald-50',
      icon: <Calendar className="text-blue-600" size={20} />,
      color: 'text-blue-600',
      iconBg: 'bg-blue-50',
    },
    {
      label: 'Événements actifs',
      value: stats?.activeEvents ?? 0,
      trend: 'Stable',
      trendColor: 'text-slate-500 bg-slate-100',
      icon: <Layers className="text-amber-600" size={20} />,
      color: 'text-amber-600',
      iconBg: 'bg-amber-50',
    },
    {
      label: 'Total invités',
      value: stats?.totalAttendees ?? 0,
      trend: '+4.5k',
      trendColor: 'text-emerald-500 bg-emerald-50',
      icon: <Users className="text-orange-600" size={20} />,
      color: 'text-orange-600',
      iconBg: 'bg-orange-50',
    },
    {
      label: 'Taux de présence moyen',
      value: '84.2%',
      trend: '-2%',
      trendColor: 'text-red-500 bg-red-50',
      icon: <BarChart3 className="text-purple-600" size={20} />,
      color: 'text-purple-600',
      iconBg: 'bg-purple-50',
    },
  ];

  const date = new Date();
  const options = { month: 'long', day: 'numeric', year: 'numeric' };
  const formattedDate = date.toLocaleDateString('fr-FR', options);

  return (
    <div className="p-10 mb-10 font">
      {/* Header Section */}
      <div className="flex justify-between items-start mb-10">
        <div>
          <h1 className="text-3xl font-black text-slate-900 leading-tight tracking-tight">
            BIENVENUE DANS VOTRE<br /><span className='text-[#0180FA]'>ESPACE DE TRAVAIL</span>
          </h1>
          <p className="text-slate-500 mt-2 font-medium">
            Voici l'état actuel de vos événements pour aujourd'hui.
          </p>
        </div>

        {/* Date Display */}
        <div className="flex items-center gap-3 bg-[#FF5005] backdrop-blur-sm p-2 pr-4 rounded-xl ">
          <div className="bg-white p-2 rounded-lg shadow-sm">
            <Calendar className="text-[#FF5005]" size={20} />
          </div>
          <div>
            <p className="text-[10px] font-bold text-white/90 uppercase tracking-wider">Date actuelle</p>
            <p className="text-sm font-bold text-white">{formattedDate}</p>
          </div>
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        {Stats.map((stat, index) => (
          <div key={index} className="bg-white p-6 rounded-2xl shadow-sm hover:shadow-xl transition duration-300">
            <div className="flex justify-between items-start mb-6">
              <div className={`${stat.iconBg} p-3 rounded-xl`}>
                {stat.icon}
              </div>
              <span className={`text-[11px] font-bold px-2 py-1 rounded-full ${stat.trendColor}`}>
                {stat.trend}
              </span>
            </div>
            
            <div>
              <p className="text-slate-500 text-sm font-medium mb-1">{stat.label}</p>
              <p className={`text-3xl font-bold ${stat.color}`}>{stat.value}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DashboardStats;