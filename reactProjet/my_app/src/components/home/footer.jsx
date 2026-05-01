import React from 'react';
import { Globe, Share2, AtSign, Zap } from 'lucide-react';

const Footer = () => {
  return (
    <footer className="bg-[#003d82] relative z-10 text-white pt-16 pb-8 px-8">
      <div className="max-w-7xl mx-auto">
        {/* Section Principale */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-12 mb-16">
          
          {/* Logo et Description */}
          <div className="col-span-1">
            <div className="flex items-center gap-2 mb-6">
              <div className="text-orange-500">
                <Zap size={24} fill="currentColor" />
              </div>
              <h2 className="text-xl font-bold tracking-tight">ArshiEvent</h2>
            </div>
            <p className="text-blue-200/70 text-sm leading-relaxed max-w-xs">
              L'excellence de la gestion d'événements propulsée par l'intelligence artificielle et la précision du QR code.
            </p>
          </div>

          {/* Colonne Plateforme */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Plateforme</h3>
            <ul className="space-y-4 text-blue-200/60 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Tableau de bord</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Scanner Mobile</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Tarification</a></li>
            </ul>
          </div>

          {/* Colonne Fonctionnalités */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Fonctionnalités</h3>
            <ul className="space-y-4 text-blue-200/60 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Automation Emails</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Génération QR</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Exports CSV/PDF</a></li>
            </ul>
          </div>

          {/* Colonne Légal */}
          <div>
            <h3 className="text-xs font-bold uppercase tracking-widest mb-6">Légal</h3>
            <ul className="space-y-4 text-blue-200/60 text-sm">
              <li><a href="#" className="hover:text-white transition-colors">Confidentialité</a></li>
              <li><a href="#" className="hover:text-white transition-colors">Conditions Générales</a></li>
              <li><a href="#" className="hover:text-white transition-colors">RGPD</a></li>
            </ul>
          </div>
        </div>

        {/* Barre de Copyright & Socials */}
        <div className="pt-8 border-t border-white/10 flex flex-col md:row flex-row justify-between items-center gap-4">
          <p className="text-blue-200/60 text-sm">
            © 2024 ARSHIEVENT. Tous droits réservés.
          </p>
          
          <div className="flex items-center gap-6 text-blue-200/80">
            <a href="#" className="hover:text-white transition-colors">
              <Globe size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <Share2 size={20} />
            </a>
            <a href="#" className="hover:text-white transition-colors">
              <AtSign size={20} />
            </a>
          </div>
        </div>
      </div>
    </footer>
  );
};

export default Footer;