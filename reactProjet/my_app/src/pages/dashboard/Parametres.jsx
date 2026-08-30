import React, { useState } from 'react';
import { 
  User, Shield, Bell, Puzzle, AlertOctagon, 
  Sparkles, CheckCircle2, ChevronRight, LogOut 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import UserProfileSettings from '../../components/dashboard/settings/UserProfileSettings';
import SecuritySettings from '../../components/dashboard/settings/SecuritySettings';
import NotificationPreferences from '../../components/dashboard/settings/NotificationPreferences';
import IntegrationsSettings from '../../components/dashboard/settings/IntegrationsSettings';
import { useAuthContext } from '../../context/AuthContext';

/**
 * Page des Paramètres Globaux du Tableau de Bord Utilisateur (/dashboard/parametres)
 */
export const Parametres = () => {
  const [activeTab, setActiveTab] = useState('profile');
  const { logout, user } = useAuthContext();
  const [showLogoutConfirm, setShowLogoutConfirm] = useState(false);

  const tabs = [
    { id: 'profile', label: 'Profil & Coordonnées', icon: User, desc: 'Identité et coordonnées de contact' },
    { id: 'security', label: 'Sécurité & Accès', icon: Shield, desc: 'Mot de passe et sessions actives' },
    { id: 'notifications', label: 'Notifications', icon: Bell, desc: 'Alertes WhatsApp, Email et live scan' },
    { id: 'integrations', label: 'Intégrations & Données', icon: Puzzle, desc: 'Connecteurs Brevo, Meta, Google & Export' },
  ];

  return (
    <div className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto min-h-screen font-sans space-y-8 text-left">
      
      {/* Header Principal */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5005] block">
            Espace Utilisateur & Préférences
          </span>
          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight">
            Paramètres du Compte
          </h1>
          <p className="text-xs text-gray-400 mt-0.5">
            Gérez vos informations personnelles, votre sécurité et vos préférences de billetterie.
          </p>
        </div>

        <button
          type="button"
          onClick={() => setShowLogoutConfirm(true)}
          className="px-4 py-2.5 bg-red-50 hover:bg-red-100 text-red-600 font-extrabold text-xs uppercase tracking-wider rounded-2xl border border-red-200/60 flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
        >
          <LogOut size={14} />
          <span>Déconnexion</span>
        </button>
      </div>

      {/* Navigation par Onglets (Grille Responsive) */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        
        {/* Colonne Gauche : Menu des Onglets */}
        <div className="lg:col-span-4 bg-white rounded-3xl p-3 border border-gray-100 shadow-xs space-y-1.5 sticky top-24">
          {tabs.map((tab) => {
            const Icon = tab.icon;
            const isActive = activeTab === tab.id;
            return (
              <button
                key={tab.id}
                type="button"
                onClick={() => setActiveTab(tab.id)}
                className={`w-full p-4 rounded-2xl text-left transition-all cursor-pointer flex items-center justify-between group ${
                  isActive
                    ? 'bg-[#0B1727] text-white shadow-md'
                    : 'text-gray-600 hover:bg-gray-50 hover:text-gray-900'
                }`}
              >
                <div className="flex items-center gap-3.5">
                  <div
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition ${
                      isActive
                        ? 'bg-[#FF5005] text-white shadow-md shadow-orange-500/30'
                        : 'bg-gray-100 text-gray-500 group-hover:bg-gray-200'
                    }`}
                  >
                    <Icon size={18} />
                  </div>
                  <div>
                    <h4 className="text-xs sm:text-sm font-black">{tab.label}</h4>
                    <p className={`text-[10px] ${isActive ? 'text-slate-300' : 'text-gray-400'}`}>
                      {tab.desc}
                    </p>
                  </div>
                </div>

                <ChevronRight
                  size={16}
                  className={`transition-transform ${
                    isActive ? 'text-[#FF5005] translate-x-1' : 'text-gray-300 group-hover:text-gray-500'
                  }`}
                />
              </button>
            );
          })}
        </div>

        {/* Colonne Droite : Contenu de l'Onglet */}
        <div className="lg:col-span-8">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.2 }}
            >
              {activeTab === 'profile' && <UserProfileSettings />}
              {activeTab === 'security' && <SecuritySettings />}
              {activeTab === 'notifications' && <NotificationPreferences />}
              {activeTab === 'integrations' && <IntegrationsSettings />}
            </motion.div>
          </AnimatePresence>
        </div>

      </div>

      {/* Modal Confirmation Déconnexion */}
      {showLogoutConfirm && (
        <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-sm w-full shadow-2xl text-center space-y-4">
            <div className="w-14 h-14 rounded-3xl bg-red-50 text-red-500 flex items-center justify-center mx-auto border border-red-100">
              <LogOut size={26} />
            </div>
            <div className="space-y-1">
              <h3 className="text-xl font-black text-gray-900">Se déconnecter ?</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                Êtes-vous sûr de vouloir vous déconnecter de votre espace organisateur ?
              </p>
            </div>
            <div className="flex gap-3 pt-2">
              <button
                onClick={() => setShowLogoutConfirm(false)}
                className="flex-1 py-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer"
              >
                Annuler
              </button>
              <button
                onClick={() => logout()}
                className="flex-1 py-3 bg-red-600 hover:bg-red-700 text-white rounded-2xl text-xs font-extrabold uppercase tracking-wider transition cursor-pointer shadow-lg shadow-red-500/20"
              >
                Déconnexion
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
};

export default Parametres;
