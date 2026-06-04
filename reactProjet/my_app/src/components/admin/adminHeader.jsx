import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, Settings } from 'lucide-react'; 
import { useNavigate } from 'react-router-dom';

// Liste mise à jour selon l'image (Panel Admin)
const navItemsList = [
  { id:'', name: 'Accueil', key: 'home' },
  { id:'', name: "Vue d'ensemble", key: 'vue' },
  { id:'', name: 'utilisateurs', key: 'utilisateurs' },
  { id:'', name: 'evenement', key: 'evenement' },
  { id:'', name: 'analytique', key: 'analytique' },
  { id:'', name: 'Paramètres', key: 'parametres' },
];

const AdminHeader = ({ onSectionChange, onAvatarClick }) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [activeSection, setActiveSection] = useState('vue'); // Par défaut sur "Vue d'ensemble"

  const handleNavClick = (item) => {
    if (item.key === 'home') {
      navigate('/');
      return;
    }

    navigate(`/admin/${item.key}`);
    setActiveSection(item.key);
    if (onSectionChange) {
      onSectionChange(item.key);
    }
  };

  // Variants d'animation
  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.02, transition: { duration: 0.2 } },
    tap: { scale: 0.98 }
  };

  const tooltipVariants = {
    initial: { opacity: 0, y: -5, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -5, scale: 0.9, transition: { duration: 0.1 } }
  };

  const searchVariants = {
    focused: { scale: 1.01, boxShadow: "0 0 0 2px #FF5005/10" },
    blurred: { scale: 1, boxShadow: "none" }
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const iconVariants = {
    hover: { rotate: 10, scale: 1.05, transition: { duration: 0.2 } }
  };

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50 w-full"
    >
      {/* Logo Section */}
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate="animate"
        className="flex items-center gap-1 cursor-pointer select-none min-w-max"
        onClick={() => handleNavClick({ key: 'home' })}
      >
        <span className="text-2xl font-black tracking-tight text-gray-800">
          ARSHI
        </span>
        <span className="text-2xl font-black tracking-tight text-[#FF5005]">
          EVENT
        </span>
      </motion.div>

      {/* Navigation Admin (Ajustement des gaps pour éviter les retours à la ligne) */}
      <nav className="flex items-center gap-5 ml-8 flex-wrap">
        {navItemsList.map((item, index) => (
          <motion.div
            key={item.key}
            variants={navItemVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.03 }}
            whileHover="hover"
            whileTap="tap"
            className="relative py-2 cursor-pointer max-w-[110px] text-center"
            onClick={() => handleNavClick(item)}
          >
            <span
              className={`text-sm font-medium block break-words transition duration-300 ${
                activeSection === item.key 
                  ? 'text-[#FF5005] font-semibold' 
                  : 'text-slate-500 hover:text-[#FF5005] hover:font-semibold'
              }`}
            >
              {item.name}
            </span>
            
            {/* Indicateur actif bleu sous l'élément comme sur la maquette */}
            {activeSection === item.key && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#0066FF] rounded-full" // Changé en bleu pour matcher l'image
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              />
            )}
          </motion.div>
        ))}
      </nav>

      {/* Barre de recherche (Placeholder modifié pour l'Admin) */}
      <motion.div
        className="flex-1 max-w-sm mx-6"
        animate={isSearchFocused ? "focused" : "blurred"}
        variants={searchVariants}
      >
        <div className="relative">
          <div className="absolute z-10 left-3 top-1/2 -translate-y-1/2">
            <Search className="text-gray-400 w-4 h-4" />
          </div>
          <input
            type="text"
            placeholder="Rechercher un utilisateur"
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-full pl-10 pr-4 py-2 bg-slate-100/80 border border-transparent rounded-full text-sm focus:outline-none focus:border-[#FF5005]/50 placeholder:text-gray-400 text-gray-700 transition-all duration-200"
          />
        </div>
      </motion.div>

      {/* Actions de Droite (Notifications, Paramètres, Profil) */}
      <div className="flex items-center gap-4 border-l border-gray-100 pl-4">
        
        {/* Icône Notifications */}
        <div className="relative">
          <motion.button
            variants={iconVariants}
            whileHover="hover"
            className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
            onMouseEnter={() => setTooltip('Notifications')}
            onMouseLeave={() => setTooltip('')}
          >
            <Bell size={20} />
          </motion.button>
          
          <AnimatePresence>
            {tooltip === 'Notifications' && (
              <motion.span
                variants={tooltipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap"
                style={{ bottom: '-2.2rem' }}
              >
                Notifications
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Icône Configuration / Paramètres Globaux */}
        <div className="relative">
          <motion.button
            variants={iconVariants}
            whileHover="hover"
            className="text-slate-400 hover:text-slate-600 cursor-pointer transition-colors p-1"
            onMouseEnter={() => setTooltip('Configuration')}
            onMouseLeave={() => setTooltip('')}
          >
            <Settings size={20} />
          </motion.button>
          
          <AnimatePresence>
            {tooltip === 'Configuration' && (
              <motion.span
                variants={tooltipVariants}
                initial="initial"
                animate="animate"
                exit="exit"
                className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap"
                style={{ bottom: '-2.2rem' }}
              >
                Configuration
              </motion.span>
            )}
          </AnimatePresence>
        </div>

        {/* Avatar Profil */}
        <div className="relative ml-1">
          <motion.div
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="w-9 h-9 rounded-full overflow-hidden border border-gray-200 bg-slate-100 flex items-center justify-center cursor-pointer"
            onClick={onAvatarClick}
          >
            <img
              src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
              alt="Admin Profile"
              className="w-full h-full object-cover"
            />
          </motion.div>
        </div>

      </div>
    </motion.header>
  );
};

export default AdminHeader;