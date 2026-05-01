import React from 'react';
import { MapPin } from 'lucide-react';

const LocationBanner = () => {
  return (
    <div className="mx-8 mb-8 font overflow-hidden rounded-3xl bg-white border border-slate-100 shadow-sm flex flex-col md:flex-row items-stretch min-h-[300px]">
      
      {/* Partie Gauche : Texte */}
      <div className="flex-1 p-10 flex flex-col justify-center">
        <h2 className="text-3xl font-black text-slate-900 mb-4 tracking-tight">
          Gérez vos événements partout.
        </h2>
        <p className="text-slate-500 leading-relaxed max-w-md mb-8 font-medium">
          Visualisez la répartition géographique de vos invités et optimisez la 
          logistique de vos lieux de réception grâce à notre intégration 
          cartographique intelligente.
        </p>

        {/* Badge Prochain événement */}
        <div className="flex items-center gap-3">
          <div className="bg-emerald-50 p-2.5 rounded-full">
            <MapPin className="text-emerald-500" size={20} />
          </div>
          <div>
            <p className="text-sm font-bold text-slate-900">
              Prochain événement : Paris
            </p>
            <p className="text-xs text-slate-400 font-medium">
              Pavillon Vendôme - 12 Nov
            </p>
          </div>
        </div>
      </div>

      {/* Partie Droite : Illustration et Dégradé */}
      <div className="flex-1 relative overflow-hidden bg-gradient-to-r from-white via-cyan-50 to-cyan-100 flex items-center justify-center py-10">
        
        {/* Cercles décoratifs en arrière-plan (optionnel pour le style) */}
        <div className="absolute top-10 right-10 w-32 h-32 bg-white/40 rounded-full blur-2xl" />
        <div className="absolute bottom-10 left-20 w-24 h-24 bg-cyan-200/30 rounded-full blur-xl" />

        {/* Illustration Map Pin (simplifiée en CSS/SVG) */}
        <div className="relative z-10 flex flex-col items-center">
          {/* Forme du Pin géant */}
          <div className="relative w-48 h-64 bg-red-400 rounded-t-full rounded-bl-full rotate-45 flex items-center justify-center shadow-2xl border-4 border-white/20">
            {/* Le trou au milieu du pin */}
            <div className="w-20 h-20 bg-white rounded-full -rotate-45 shadow-inner" />
          </div>
          
          {/* Nuages stylisés (simulés avec des div blanches) */}
          <div className="absolute -right-12 top-1/4 w-32 h-10 bg-white/80 rounded-full blur-sm" />
          <div className="absolute -left-16 bottom-1/3 w-40 h-12 bg-white/60 rounded-full blur-md" />
        </div>
      </div>

    </div>
  );
};

export default LocationBanner;