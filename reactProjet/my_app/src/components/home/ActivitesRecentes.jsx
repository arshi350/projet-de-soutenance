import React from 'react';
import { Eye, Wine, GraduationCap, Scissors } from 'lucide-react';

const data = [
  {
    id: 1,
    evenement: "Gala annuel",
    date: "12 Mars 2024",
    invites: 250,
    presents: 230,
    taux: 92,
    color: "bg-orange-100 text-orange-600",
    icon: <Wine size={18} />,
  },
  {
    id: 2,
    evenement: "Webinar IA",
    date: "08 Mars 2024",
    invites: 500,
    presents: 380,
    taux: 76,
    color: "bg-blue-50 text-orange-400", // Adapté au style bleuté de la ligne
    icon: <GraduationCap size={18} />,
    rowBg: "bg-blue-50/50"
  },
  {
    id: 3,
    evenement: "Afterwork UX",
    date: "05 Mars 2024",
    invites: 100,
    presents: 84,
    taux: 84,
    color: "bg-red-100 text-red-500",
    icon: <Scissors size={18} />,
  },
   {
    id: 4,
    evenement: "Afterwork UX",
    date: "05 Mars 2024",
    invites: 100,
    presents: 100,
    taux: 100,
    color: "bg-red-100 text-red-500",
    icon: <Scissors size={18} />,
  },
];

const ActivitesRecentes = () => {
  return (
    <div className="p-8 relative z-10 ">
      <div className="w-[82%] mx-auto">
        {/* Header */}
        <div className="flex justify-between items-end mb-6">
          <div>
            <h2 className="text-3xl font-bold text-gray-700">Activités Récentes</h2>
            <p className="text-gray-500 text-sm mt-1">
              Vue d'ensemble de vos derniers événements terminés ou en cours.
            </p>
          </div>
          <a href="#" className="text-blue-500 text-sm font-semibold hover:underline">
            Voir tout l'historique
          </a>
        </div>

        {/* Tableau */}
        <div className="bg-white rounded-xl shadow-sm border border-gray-100 overflow-hidden">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-gray-50/80 text-gray-400 text-xs uppercase tracking-wider">
                <th className="px-6 py-4 font-semibold">Événement</th>
                <th className="px-6 py-4 font-semibold">Date</th>
                <th className="px-6 py-4 font-semibold text-center">Invités</th>
                <th className="px-6 py-4 font-semibold text-center">Présents</th>
                <th className="px-6 py-4 font-semibold text-center">Taux</th>
                <th className="px-6 py-4 font-semibold text-right">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {data.map((item) => (
                <tr key={item.id} className={`${item.rowBg || 'bg-white'} hover:bg-gray-50 transition-colors`}>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className={`p-2 rounded-lg ${item.color}`}>
                        {item.icon}
                      </div>
                      <span className="font-bold text-gray-800 text-sm">{item.evenement}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-600">{item.date}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">{item.invites}</td>
                  <td className="px-6 py-4 text-sm text-gray-600 text-center">{item.presents}</td>
                  <td className="px-6 py-4 text-center">
                    <span className={`px-3 py-1 rounded-full text-xs font-bold ${
                      item.taux > 80 ? 'bg-green-100 text-green-600' : 'bg-orange-100 text-orange-400'
                    }`}>
                      {item.taux}%
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <button className="text-yellow-700 hover:text-yellow-800 transition-colors">
                      <Eye size={20} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default ActivitesRecentes;