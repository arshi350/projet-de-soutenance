import React from 'react';
import { Sparkles, Bot, ArrowRight, ShieldCheck, Zap } from 'lucide-react';
import { motion } from 'framer-motion';
import { useNavigate } from 'react-router-dom';

/**
 * Footer et Bannière Concierge IA du Dashboard Événement
 */
export const Footer = () => {
  const currentYear = new Date().getFullYear();
  const navigate = useNavigate();

  return (
    <footer className="mt-12 space-y-10 font-sans text-left">
      
      {/* Bannière Assistant Concierge IA */}
      <div className="relative overflow-hidden bg-gradient-to-br from-[#0B1727] via-[#111927] to-[#090D16] rounded-3xl p-8 sm:p-10 border border-white/10 text-white shadow-xl">
        
        {/* Glow lights décoratifs */}
        <div className="absolute -top-24 -right-24 w-80 h-80 bg-[#FF5005]/20 rounded-full blur-3xl pointer-events-none" />
        <div className="absolute -bottom-24 -left-24 w-80 h-80 bg-purple-600/15 rounded-full blur-3xl pointer-events-none" />

        <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-8">
          
          <div className="space-y-2.5 max-w-2xl">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-[#FF5005]/20 border border-[#FF5005]/40 rounded-full text-[#FF5005] text-[11px] font-black uppercase tracking-wider">
              <Sparkles size={13} />
              Suite d'Intelligence Artificielle Google Gemini
            </div>
            
            <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight leading-snug">
              Optimisez vos invitations & votre marketing en 1 clic
            </h2>
            
            <p className="text-slate-300 text-xs sm:text-sm leading-relaxed">
              Laissez notre moteur IA rédiger vos textes d'invitations WhatsApp & Email, générer vos visuels de billets personnalisés et maximiser votre taux de présence.
            </p>
          </div>

          <motion.button
            whileHover={{ scale: 1.03, boxShadow: '0 10px 30px -5px rgba(255, 80, 5, 0.4)' }}
            whileTap={{ scale: 0.97 }}
            onClick={() => navigate('/dashboard/evenement/create')}
            className="px-7 py-4 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5f1b] hover:to-[#ff861b] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/25 flex items-center gap-2 transition cursor-pointer whitespace-nowrap"
          >
            <Bot size={18} />
            <span>Lancer l'Assistant IA</span>
            <ArrowRight size={16} />
          </motion.button>

        </div>

      </div>

      {/* Barre inférieure de copyright */}
      <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-6 border-t border-gray-200/80 text-xs text-gray-400">
        <div className="flex items-center gap-2">
          <span className="font-black text-gray-900 tracking-tight text-sm">
            <span className="text-[#FF5005]">ARSHI</span>EVENT
          </span>
          <span>•</span>
          <span>© {currentYear} Plateforme Événementielle & Billetterie Certifiée.</span>
        </div>

        <div className="flex items-center gap-6 font-bold text-gray-500">
          <a href="#support" className="hover:text-[#FF5005] transition">Support 24/7</a>
          <a href="#security" className="hover:text-[#FF5005] transition">Sécurité & Chiffrement</a>
          <a href="#terms" className="hover:text-[#FF5005] transition">Conditions</a>
        </div>
      </div>

    </footer>
  );
};

export default Footer;