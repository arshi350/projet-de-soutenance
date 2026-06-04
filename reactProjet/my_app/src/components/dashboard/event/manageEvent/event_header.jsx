import React from 'react';
import { ArrowLeft, Bell, Settings, MoreVertical } from 'lucide-react';

export default function EventHeader({ activeTabId = 'overview', tabs = [], onTabChange, eventTitle = 'Événement', eventStatus = 'Statut inconnu' }) {
  return (
    <header className="w-full font bg-white border-b border-gray-200 font-sans">
      {/* Barre supérieure */}
      <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        
        {/* Section Gauche : Logo ARSHIEVENT */}
       <div className="flex items-center gap-1 cursor-pointer"
        onClick={() => handleNavClick({ key: 'home' })} >
        <span className="text-2xl font-black tracking-tight text-gray-700">ARSHI </span>
        <span className="text-2xl font-black tracking-tight text-[#FF5005]"> EVENT</span>
      </div>

        {/* Section Centrale : Titre de l'événement & Statut */}
        <div className="flex gap-2">
          <h1 className="text-xl font-bold text-gray-800 tracking-tight line-clamp-1">
            {eventTitle}
          </h1>
          <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-[#10B981] text-white">
            <span className="w-1.5 h-1.5 rounded-full bg-white animate-pulse"></span>
            {eventStatus}
          </span>
        </div>

        {/* Section Droite : Actions & Profil */}
        <div className="flex items-center gap-4">
          {/* Notifications */}
          <button className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all">
            <Bell className="w-5 h-5" />
          </button>
          
          {/* Paramètres rapides */}
          <button
            onClick={() => onTabChange?.('parametres')}
            className="p-2 cursor-pointer text-gray-500 hover:text-gray-700 hover:bg-gray-50 rounded-full transition-all"
          >
            <Settings className="w-5 h-5" />
          </button>

          {/* Séparateur subtil */}
          <div className="h-6 w-px bg-gray-200 mx-1"></div>

          {/* Avatar utilisateur */}
          <button className="w-9 h-9 cursor-pointer rounded-full bg-gradient-to-tr from-slate-900 to-slate-800 p-0.5 border border-gray-200 shadow-sm overflow-hidden flex items-center justify-center">
            <div className="w-full h-full rounded-full bg-[#0a1914] flex items-center justify-center">
              {/* Remplacer par une balise <img /> si vous avez une vraie image */}
              <span className="text-[10px] text-emerald-400 font-bold">AT</span>
            </div>
          </button>

         
        </div>
      </div>

      {/* Barre de Navigation (Onglets) */}
      <div className="max-w-7xl mx-auto px-6">
        <nav className="flex gap-8">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`py-3 px-1 text-sm font-medium transition-all duration-200 relative border-b-2 -mb-px ${
                  isActive
                    ? 'text-[#FF5005] border-[#FF5005]'
                    : 'text-gray-500 border-transparent hover:text-gray-700 hover:border-gray-300'
                }`}
              >
                {tab.label}
              </button>
            );
          })}
        </nav>
      </div>
    </header>
  );
}