import React from 'react';
import { MapPin, Globe, Sparkles, Navigation } from 'lucide-react';
import { motion } from 'framer-motion';

const LocationBanner = () => {
  return (
    <div className="mt-8 overflow-hidden rounded-3xl bg-white border border-gray-200/80 shadow-sm flex flex-col md:flex-row items-stretch font-sans text-left">
      
      {/* Partie Gauche : Texte */}
      <div className="flex-1 p-8 sm:p-10 flex flex-col justify-center">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5005] text-[10px] font-extrabold uppercase tracking-widest w-max mb-3">
          <Globe size={12} />
          Cartographie & Logistique
        </div>
        <h2 className="text-2xl sm:text-3xl font-black text-gray-900 mb-3 tracking-tight">
          Supervisez vos réceptions partout.
        </h2>
        <p className="text-gray-500 text-xs sm:text-sm leading-relaxed max-w-md mb-6 font-medium">
          Visualisez la répartition géographique de vos invités et optimisez la logistique de vos points de contrôle d'accès en temps réel.
        </p>

        {/* Badge Prochain événement */}
        <div className="flex items-center gap-3 bg-gray-50 border border-gray-200 p-3 rounded-2xl w-max">
          <div className="bg-emerald-500/10 text-emerald-600 p-2 rounded-xl border border-emerald-200">
            <MapPin size={18} />
          </div>
          <div>
            <p className="text-xs font-extrabold text-gray-900">
              Prochain Événement Actif
            </p>
            <p className="text-[10px] text-gray-500 font-semibold">
              Palais des Congrès • Paris
            </p>
          </div>
        </div>
      </div>

      {/* Partie Droite : Visual Grid */}
      <div className="flex-1 relative bg-[#0B1727] flex items-center justify-center p-8 overflow-hidden border-t md:border-t-0 md:border-l border-white/10">
        <div className="absolute inset-0 bg-[radial-gradient(ellipse_60%_60%_at_50%_50%,rgba(255,80,5,0.2),transparent)] pointer-events-none"></div>
        
        <div className="relative z-10 text-center space-y-3">
          <div className="w-16 h-16 rounded-2xl bg-white/10 border border-white/20 backdrop-blur-md flex items-center justify-center mx-auto text-[#FF5005] shadow-xl">
            <Navigation size={28} />
          </div>
          <h4 className="text-white font-extrabold text-sm">Contrôle d'Accès Géolocalisé</h4>
          <p className="text-gray-400 text-xs max-w-xs">Synchronisation automatique avec l'application mobile de scan.</p>
        </div>
      </div>

    </div>
  );
};

export default LocationBanner;