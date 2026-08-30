import React, { useState } from 'react';
import { 
  FileText, ListOrdered, Navigation, HelpCircle, 
  CheckCircle, AlertCircle, ChevronDown, Sparkles, 
  Music, Shield, Info, Car, Bus, Accessibility 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Système d'Onglets Interactifs : Description, Line-up, Accès, FAQ
 */
export const EventDetailsTabs = ({ event }) => {
  const [activeTab, setActiveTab] = useState('description');
  const [openFaq, setOpenFaq] = useState(null);

  if (!event) return null;

  const tabs = [
    { id: 'description', label: 'Description', icon: FileText },
    { id: 'lineup', label: 'Programme & Line-up', icon: ListOrdered },
    { id: 'access', label: 'Accès & Infos Pratiques', icon: Navigation },
    { id: 'faq', label: 'FAQ & Conditions', icon: HelpCircle }
  ];

  const defaultFaqs = [
    {
      q: "Comment vais-je recevoir mes billets après l'achat ?",
      a: "Vos billets vous sont délivrés instantanément sur votre écran sous format numérique avec un QR Code unique sécurisé, et sont également envoyés par email avec une pièce jointe PDF téléchargeable."
    },
    {
      q: "Les billets sont-ils nominatifs et modifiables ?",
      a: "Oui, chaque billet généré comporte le nom du titulaire. Vous pouvez présenter votre billet directement sur votre smartphone sans avoir besoin de l'imprimer."
    },
    {
      q: "Quelle est la politique de remboursement ?",
      a: "En cas d'annulation ou de report officiel de l'événement par l'organisateur, vous bénéficiez d'un remboursement intégral automatique du montant de vos billets."
    },
    {
      q: "Quel est l'âge minimum requis pour participer ?",
      a: "L'accès est ouvert à tous. Les mineurs de moins de 16 ans doivent être accompagnés d'un adulte titulaire d'un billet valide."
    }
  ];

  return (
    <div className="bg-[#0E1522]/90 border border-white/10 rounded-3xl p-6 sm:p-8 space-y-8 shadow-xl text-left">
      
      {/* Barre de navigation des onglets */}
      <div className="flex flex-wrap gap-2 border-b border-white/10 pb-4">
        {tabs.map((tab) => {
          const Icon = tab.icon;
          const isActive = activeTab === tab.id;
          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2.5 px-4 sm:px-5 py-2.5 rounded-2xl text-xs sm:text-sm font-extrabold uppercase tracking-wider transition-all cursor-pointer ${
                isActive
                  ? 'bg-[#FF5005] text-white shadow-lg shadow-orange-500/25'
                  : 'bg-white/[0.04] text-slate-400 hover:text-white hover:bg-white/[0.08]'
              }`}
            >
              <Icon size={16} />
              <span>{tab.label}</span>
            </button>
          );
        })}
      </div>

      {/* Contenu dynamique des onglets */}
      <AnimatePresence mode="wait">
        
        {/* 1. Description */}
        {activeTab === 'description' && (
          <motion.div
            key="description"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="prose prose-invert max-w-none text-slate-300 text-sm sm:text-base leading-relaxed space-y-4">
              <p className="whitespace-pre-line">
                {event.description || "Rejoignez-nous pour cet événement exceptionnel réunissant les meilleurs talents et une expérience immersive inoubliable."}
              </p>
            </div>

            {/* Points forts */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="w-8 h-8 rounded-xl bg-orange-500/15 text-[#FF5005] flex items-center justify-center font-bold">
                  <Sparkles size={16} />
                </div>
                <h4 className="font-extrabold text-sm text-white pt-1">Expérience Premium</h4>
                <p className="text-xs text-slate-400">Son et lumière de pointe, ambiance garantie.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="w-8 h-8 rounded-xl bg-emerald-500/15 text-emerald-400 flex items-center justify-center font-bold">
                  <Shield size={16} />
                </div>
                <h4 className="font-extrabold text-sm text-white pt-1">Accès Sécurisé</h4>
                <p className="text-xs text-slate-400">Scannage instantané avec QR Code unique infalsifiable.</p>
              </div>

              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-1">
                <div className="w-8 h-8 rounded-xl bg-blue-500/15 text-blue-400 flex items-center justify-center font-bold">
                  <Info size={16} />
                </div>
                <h4 className="font-extrabold text-sm text-white pt-1">Support 7j/7</h4>
                <p className="text-xs text-slate-400">Assistance acheteurs dédiée avant et pendant l'événement.</p>
              </div>
            </div>
          </motion.div>
        )}

        {/* 2. Programme & Line-up */}
        {activeTab === 'lineup' && (
          <motion.div
            key="lineup"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-4"
          >
            <div className="relative pl-6 border-l-2 border-[#FF5005]/40 space-y-6">
              
              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-[#FF5005] rounded-full border-4 border-[#0E1522]" />
                <span className="text-xs font-bold text-[#FF5005] uppercase tracking-wider">{event.heureDebut || '19:00'}</span>
                <h4 className="text-base font-black text-white">Ouverture des portes & Accueil VIP</h4>
                <p className="text-xs text-slate-400">Contrôle des billets, vestiaire et cocktail de bienvenue.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-amber-400 rounded-full border-4 border-[#0E1522]" />
                <span className="text-xs font-bold text-amber-400 uppercase tracking-wider">20:30</span>
                <h4 className="text-base font-black text-white">Lancement & Première Partie</h4>
                <p className="text-xs text-slate-400">Début du spectacle / interventions principales.</p>
              </div>

              <div className="relative">
                <div className="absolute -left-[31px] top-1 w-3.5 h-3.5 bg-purple-400 rounded-full border-4 border-[#0E1522]" />
                <span className="text-xs font-bold text-purple-400 uppercase tracking-wider">22:00</span>
                <h4 className="text-base font-black text-white">Main Event & Clôture</h4>
                <p className="text-xs text-slate-400">Grande performance live et networking.</p>
              </div>

            </div>
          </motion.div>
        )}

        {/* 3. Accès & Infos Pratiques */}
        {activeTab === 'access' && (
          <motion.div
            key="access"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-6"
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              
              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-emerald-400 font-bold text-sm">
                  <Car size={18} />
                  <span>En Voiture & Parking</span>
                </div>
                <p className="text-xs text-slate-300">
                  Parking surveillé gratuit sur place pour tous les détenteurs de billets VIP et Standard.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2">
                <div className="flex items-center gap-2 text-blue-400 font-bold text-sm">
                  <Bus size={18} />
                  <span>Transports en Commun</span>
                </div>
                <p className="text-xs text-slate-300">
                  Desservi par les lignes de bus principales et stations de taxis à proximité directe.
                </p>
              </div>

              <div className="p-5 rounded-2xl bg-white/[0.03] border border-white/10 space-y-2 md:col-span-2">
                <div className="flex items-center gap-2 text-purple-400 font-bold text-sm">
                  <Accessibility size={18} />
                  <span>Accessibilité Personnes à Mobilité Réduite (PMR)</span>
                </div>
                <p className="text-xs text-slate-300">
                  Lieu 100% accessible avec rampes d'accès, places réservées et accompagnateurs dédiés.
                </p>
              </div>

            </div>
          </motion.div>
        )}

        {/* 4. FAQ & Conditions */}
        {activeTab === 'faq' && (
          <motion.div
            key="faq"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            className="space-y-3"
          >
            {defaultFaqs.map((faq, idx) => (
              <div
                key={idx}
                className="border border-white/10 rounded-2xl overflow-hidden bg-white/[0.02]"
              >
                <button
                  type="button"
                  onClick={() => setOpenFaq(openFaq === idx ? null : idx)}
                  className="w-full p-4 text-left flex items-center justify-between text-white font-extrabold text-sm hover:bg-white/[0.04] transition cursor-pointer"
                >
                  <span>{faq.q}</span>
                  <ChevronDown
                    size={16}
                    className={`text-slate-400 transition-transform ${
                      openFaq === idx ? 'rotate-180 text-[#FF5005]' : ''
                    }`}
                  />
                </button>
                {openFaq === idx && (
                  <div className="px-4 pb-4 text-xs text-slate-300 leading-relaxed border-t border-white/5 pt-3">
                    {faq.a}
                  </div>
                )}
              </div>
            ))}
          </motion.div>
        )}

      </AnimatePresence>

    </div>
  );
};

export default EventDetailsTabs;
