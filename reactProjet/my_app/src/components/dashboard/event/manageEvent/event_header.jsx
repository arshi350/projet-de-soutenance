import React from 'react';
import { ArrowLeft, Bell, Settings, MoreVertical, Zap, CheckCircle2, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

export default function EventHeader({ 
  activeTabId = 'overview', 
  tabs = [], 
  onTabChange, 
  eventTitle = 'Événement', 
  eventStatus = 'Statut inconnu' 
}) {
  const navigate = useNavigate();

  return (
    <header className="w-full bg-white border-b border-gray-200/80 font-sans sticky top-0 z-30 shadow-xs">
      {/* Barre supérieure */}
      <div className="max-w-7xl mx-auto px-6 h-18 flex items-center justify-between">
        
        {/* Section Gauche : Logo ARSHIEVENT & Breadcrumb */}
        <div className="flex items-center gap-3">
          <div 
            className="flex items-center gap-2 cursor-pointer group"
            onClick={() => navigate('/dashboard/evenement')}
          >
            <div className="w-8 h-8 rounded-xl bg-gray-100 group-hover:bg-orange-50 text-gray-600 group-hover:text-[#FF5005] flex items-center justify-center transition-colors">
              <ArrowLeft size={16} />
            </div>
            <div className="hidden sm:flex items-center text-base font-black tracking-tight text-gray-900">
              <span>ARSHI</span>
              <span className="text-[#FF5005] ml-0.5">EVENT</span>
            </div>
          </div>

          <div className="hidden sm:block text-gray-300">/</div>

          {/* Section Centrale : Titre de l'événement & Statut */}
          <div className="flex items-center gap-2.5">
            <h1 className="text-base sm:text-lg font-black text-gray-900 tracking-tight line-clamp-1">
              {eventTitle}
            </h1>
            <span className="inline-flex items-center gap-1.5 px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase bg-emerald-50 text-emerald-600 border border-emerald-200">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
              {eventStatus}
            </span>
          </div>
        </div>

        {/* Section Droite : Actions */}
        <div className="flex items-center gap-3">
          <button
            onClick={() => onTabChange?.('parametres')}
            className="p-2 text-gray-400 hover:text-gray-700 hover:bg-gray-100 rounded-xl transition cursor-pointer"
            title="Paramètres de l'événement"
          >
            <Settings size={18} />
          </button>
        </div>
      </div>

      {/* Barre de Navigation (Onglets avec indicateur glissant) */}
      <div className="max-w-7xl mx-auto px-2">
        <nav className="flex gap-2 overflow-x-auto no-scrollbar py-2">
          {tabs.map((tab) => {
            const isActive = activeTabId === tab.id;
            return (
              <button
                key={tab.id}
                onClick={() => onTabChange?.(tab.id)}
                className={`relative px-4 py-2 text-xs font-bold rounded-xl transition-all duration-200 whitespace-nowrap cursor-pointer ${
                  isActive
                    ? 'text-[#FF5005] bg-orange-50/80 shadow-xs'
                    : 'text-gray-500 hover:text-gray-900 hover:bg-gray-50'
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