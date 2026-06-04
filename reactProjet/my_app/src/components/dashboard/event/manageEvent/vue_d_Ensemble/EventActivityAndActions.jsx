import React from 'react';
import { History, Scan, Calendar, MapPin, Users, Info, Plus } from 'lucide-react';

export default function EventActivityAndActions() {
  // Données de l'activité récente
  const activities = [
    {
      id: 1,
      name: 'Jean Dupont',
      status: 'Arrivée enregistrée',
      location: 'Entrée Nord',
      time: '20:45',
      type: 'success', // Vert
      avatar: 'https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&auto=format&fit=crop&q=80', // Exemple d'avatar réaliste
      bgColor: 'bg-blue-50/40',
      borderColor: 'border-blue-100'
    },
    {
      id: 2,
      name: 'Marie Curie',
      status: 'Arrivée enregistrée',
      location: 'VIP Lounge',
      time: '20:42',
      type: 'success', // Vert
      avatar: 'https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=100&auto=format&fit=crop&q=80',
      bgColor: 'bg-white',
      borderColor: 'border-orange-100'
    },
    {
      id: 3,
      name: 'Thomas Pesquet',
      status: 'Absence signalée',
      location: 'Empêchement',
      time: '20:38',
      type: 'danger', // Rouge
      avatar: 'https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&auto=format&fit=crop&q=80',
      bgColor: 'bg-white',
      borderColor: 'border-red-100'
    }
  ];

  return (
    <div className="px-60 p-6 font grid grid-cols-1 lg:grid-cols-3 gap-6 font-sans">
      
      {/* --- BLOC GAUCHE : ACTIVITÉ RÉCENTE (Prend 2 colonnes) --- */}
      <div className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100 lg:col-span-2 flex flex-col justify-between">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-2">
            <History className="w-5 h-5 text-[#FF5005]" />
            <h3 className="text-base font-bold text-gray-800">Activité récente</h3>
          </div>
          <button className="text-xs font-semibold text-[#017EF7] hover:underline">
            Voir tout
          </button>
        </div>

        {/* Liste des activités */}
        <div className="space-y-3">
          {activities.map((item) => (
            <div
              key={item.id}
              className={`flex items-center justify-between p-4 rounded-xl border ${item.borderColor} ${item.bgColor} transition-all hover:shadow-sm`}
            >
              {/* Infos Utilisateur (Avatar + Texte) */}
              <div className="flex items-center gap-3">
                <img
                  src={item.avatar}
                  alt={item.name}
                  className="w-10 h-10 rounded-full object-cover border border-gray-100"
                />
                <div className="space-y-0.5">
                  <h4 className="text-sm font-bold text-gray-800">{item.name}</h4>
                  <p className="text-xs text-gray-500">
                    <span className="font-medium">{item.status}</span>
                    <span className="mx-1.5 text-gray-300">•</span>
                    <span className="text-gray-400">{item.location}</span>
                  </p>
                </div>
              </div>

              {/* Heure et Point d'état */}
              <div className="flex items-center gap-3">
                <span className="text-xs font-semibold text-gray-400">{item.time}</span>
                <span className={`w-2 h-2 rounded-full shrink-0 ${
                  item.type === 'success' ? 'bg-[#10B981]' : 'bg-[#EF4444]'
                }`} />
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* --- BLOC DROIT : ACTIONS ET DÉTAILS (Prend 1 colonne) --- */}
      <div className="space-y-6 flex flex-col justify-between">
        
        {/* Action : Gérer l'accès */}
        <div className="bg-[#FF5005] rounded-2xl p-6 shadow-md text-white relative overflow-hidden group">
          <div className="space-y-2 mb-6 max-w-[85%]">
            <h3 className="text-lg font-bold tracking-tight">Gérer l'accès</h3>
            <p className="text-xs text-orange-100 leading-relaxed opacity-90">
              Utilisez le scanner mobile pour valider rapidement les entrées à la porte.
            </p>
          </div>

          {/* Bouton Scanner imbriqué avec bouton "+" flottant */}
          <div className="relative flex items-center">
            <button className="w-full bg-white text-gray-800 text-xs font-bold py-3.5 px-4 rounded-xl shadow-sm hover:bg-orange-50 transition-all flex items-center justify-center gap-2">
              <Scan className="w-4 h-4 text-[#FF5005]" />
              <span>Scanner un ticket</span>
            </button>
            
            {/* Petit bouton "+" flottant à l'extrémité droite */}
            <button className="absolute -right-2 bg-[#FF5005] border-2 border-white text-white p-2 rounded-full shadow-md hover:scale-105 transition-transform">
              <Plus className="w-4 h-4 stroke-[3]" />
            </button>
          </div>
        </div>

        {/* Info Widget : Détails de l'événement */}
        <div className="bg-white rounded-2xl p-5 shadow-sm border border-orange-100/60 space-y-4">
          
          {/* Titre de section */}
          <div className="flex items-center gap-2 text-gray-700 text-sm font-bold pb-2 border-b border-gray-50">
            <Info className="w-4 h-4 text-[#017EF7]" />
            <span>Détails de l'événement</span>
          </div>

          {/* Liste des détails */}
          <div className="space-y-3.5">
            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <Calendar className="w-4 h-4 text-gray-400 shrink-0" />
              <span>12 Octobre 2025</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <MapPin className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Parc des Expositions, Paris</span>
            </div>

            <div className="flex items-center gap-3 text-xs font-medium text-gray-600">
              <Users className="w-4 h-4 text-gray-400 shrink-0" />
              <span>Capacité max: 500</span>
            </div>
          </div>

        </div>

      </div>

    </div>
  );
}