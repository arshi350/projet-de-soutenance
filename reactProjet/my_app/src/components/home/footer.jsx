import React from 'react';
import { Globe, Share2, AtSign, Zap, ArrowRight, ShieldCheck, Heart } from 'lucide-react';
import { Link } from 'react-router-dom';

const Footer = () => {
  return (
    <footer className="bg-[#0B1727] relative z-10 text-white pt-12 pb-8 px-5 md:px-10 lg:px-16 border-t border-white/10">
      <div className="max-w-7xl mx-auto">
        
        {/* Top Newsletter & Brand Row */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 pb-10 border-b border-white/10 items-center">
          
          <div className="lg:col-span-6 space-y-3 text-left">
            <div className="flex items-center gap-2">
              <div className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5005] to-orange-400 flex items-center justify-center text-white shadow-md shadow-orange-500/25">
                <Zap size={18} className="fill-white" />
              </div>
              <span className="text-xl font-black tracking-tight text-white">
                ARSHI<span className="text-[#FF5005]">EVENT</span>
              </span>
            </div>
            <p className="text-gray-400 text-xs leading-relaxed max-w-md">
              L'écosystème SaaS nouvelle génération qui sublime vos événements grâce à l'intelligence artificielle, la billetterie instantanée et la sécurité cryptographique.
            </p>
          </div>

          <div className="lg:col-span-6 text-left">
            <h4 className="text-[11px] font-bold uppercase tracking-widest text-gray-300 mb-2.5 flex items-center gap-2">
              <Globe size={13} className="text-[#FF5005]" />
              Restez informé des innovations ARSHI EVENT
            </h4>
            <form onSubmit={(e) => e.preventDefault()} className="flex flex-col sm:flex-row gap-2 max-w-md">
              <input 
                type="email" 
                placeholder="votre.email@entreprise.com" 
                className="bg-white/5 border border-white/15 rounded-lg px-3.5 py-2 text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005] flex-grow transition-all"
              />
              <button 
                type="submit" 
                className="bg-[#FF5005] hover:bg-[#ff6220] text-white px-4 py-2 rounded-lg text-xs font-bold flex items-center justify-center gap-1.5 shadow-md shadow-orange-600/30 cursor-pointer transition-all shrink-0"
              >
                <span>Rejoindre</span>
                <ArrowRight size={13} />
              </button>
            </form>
          </div>

        </div>

        {/* Links Navigation Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-8 py-12 text-left">
          <div>
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5005] mb-4">
              Plateforme
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li><Link to="/dashboard/vue" className="hover:text-white transition-colors">Tableau de bord</Link></li>
              <li><Link to="/register" className="hover:text-white transition-colors">Billetterie publique</Link></li>
              <li><a href="#concierge" className="hover:text-white transition-colors">Concierge IA</a></li>
              <li><a href="#services" className="hover:text-white transition-colors">Scanner Haute Fréquence</a></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5005] mb-4">
              Solutions
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li><span className="hover:text-white transition-colors cursor-pointer">Galas & Soirées VIP</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Conférences Tech & Salons</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Mariages & Célébrations</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Festivals & Spectacles</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5005] mb-4">
              Sécurité & Légal
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li><span className="hover:text-white transition-colors cursor-pointer">Chiffrement AES-256</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Conformité RGPD</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Conditions Générales</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Politique de Confidentialité</span></li>
            </ul>
          </div>

          <div>
            <h5 className="text-[11px] font-extrabold uppercase tracking-widest text-[#FF5005] mb-4">
              Contact & Support
            </h5>
            <ul className="space-y-2.5 text-xs text-gray-400 font-medium">
              <li><span className="hover:text-white transition-colors cursor-pointer">support@arshievent.com</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Assistance VIP 24/7</span></li>
              <li><span className="hover:text-white transition-colors cursor-pointer">Documentation Développeur</span></li>
            </ul>
          </div>
        </div>

        {/* Bottom Bar */}
        <div className="pt-8 border-t border-white/10 flex flex-col sm:flex-row justify-between items-center gap-4 text-xs text-gray-500">
          <div className="flex items-center gap-2">
            <ShieldCheck size={14} className="text-emerald-400" />
            <span>© {new Date().getFullYear()} ARSHI EVENT. Tous droits réservés.</span>
          </div>
          
          <div className="flex items-center gap-4 text-gray-400">
            <span className="hover:text-[#FF5005] cursor-pointer transition-colors">LinkedIn</span>
            <span>•</span>
            <span className="hover:text-[#FF5005] cursor-pointer transition-colors">X (Twitter)</span>
            <span>•</span>
            <span className="hover:text-[#FF5005] cursor-pointer transition-colors">Instagram</span>
          </div>
        </div>

      </div>
    </footer>
  );
};

export default Footer;