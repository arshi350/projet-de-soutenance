import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Search, Bell, HelpCircle, Plus } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import EventForm from './event/eventForm';

const navItemsList = [
  { name: 'Accueil', key: 'home' },
  { name: "Vue d'ensemble", key: 'vue' },
  { name: 'Événement', key: 'evenement' },
  { name: 'Template', key: 'template' },
  { name: 'Paramètres', key: 'parametres' },
];

const Header = ({ activeSection, onSectionChange, onAvatarClick }) => {
  const navigate = useNavigate();
  const [tooltip, setTooltip] = useState('');
  const [isSearchFocused, setIsSearchFocused] = useState(false);
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isModalOpen, setIsModalOpen] = useState(false)
  

  const handleNavClick = (item) => {
    if (item.key === 'home') {
      navigate('/');
    } else {
      navigate(`/dashboard/${item.key}`);
      if (onSectionChange) {
        onSectionChange(item.key);
      }
    }
  };

  // Variants d'animation pour les éléments
  const navItemVariants = {
    initial: { opacity: 0, y: -10 },
    animate: { opacity: 1, y: 0 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const tooltipVariants = {
    initial: { opacity: 0, y: -5, scale: 0.9 },
    animate: { opacity: 1, y: 0, scale: 1, transition: { duration: 0.15 } },
    exit: { opacity: 0, y: -5, scale: 0.9, transition: { duration: 0.1 } }
  };

  const buttonVariants = {
    initial: { scale: 1 },
    hover: { scale: 1.05, transition: { duration: 0.2 } },
    tap: { scale: 0.95 }
  };

  const searchVariants = {
    focused: { scale: 1.02, boxShadow: "0 0 0 2px #FF5005/20" },
    blurred: { scale: 1, boxShadow: "none" }
  };

  const logoVariants = {
    initial: { opacity: 0, x: -20 },
    animate: { opacity: 1, x: 0, transition: { duration: 0.5 } }
  };

  const iconVariants = {
    hover: { rotate: 15, scale: 1.1, transition: { duration: 0.2 } }
  };

  const modaloppen = () => {
    setIsModalOpen(true);
  }
  const ModalClose = () => {
    setIsModalOpen(false);
  }

  return (
    <motion.header
      initial={{ y: -100, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.5, type: "spring", stiffness: 100 }}
      className="flex items-center justify-between px-8 py-3 bg-white border-b border-gray-100 shadow-sm sticky top-0 z-50"
    >
      {/* Logo Section avec animation */}
      <motion.div
        variants={logoVariants}
        initial="initial"
        animate="animate"
        className="flex items-center gap-1 cursor-pointer"
        whileHover={{ scale: 1.02 }}
        onClick={() => handleNavClick({ key: 'home' })}
      >
        <motion.span
          className="text-2xl font-black tracking-tight text-gray-700"
          whileHover={{ rotate: -2 }}
        >
          ARSHI
        </motion.span>
        <motion.span
          className="text-2xl font-black tracking-tight text-[#FF5005]"
          whileHover={{ rotate: 2 }}
        >
          EVENT
        </motion.span>
      </motion.div>

      {/* Navigation avec animations */}
      <nav className="flex items-center gap-8 ml-10">
        {navItemsList.map((item, index) => (
          <motion.div
            key={item.key}
            variants={navItemVariants}
            initial="initial"
            animate="animate"
            transition={{ delay: index * 0.05 }}
            whileHover="hover"
            whileTap="tap"
            className="relative py-2 cursor-pointer"
            onClick={() => handleNavClick(item)}
          >
            <motion.span
              className={`text-sm font-medium ${
                activeSection === item.key ? 'text-[#FF5005]' : 'text-gray-700 hover:text-[#FF5005] transition-colors duration-300'
              }`}
            >
              {item.name}
            </motion.span>
            
            {/* Indicateur actif avec animation */}
            {activeSection === item.key && (
              <motion.div
                layoutId="activeNavIndicator"
                className="absolute bottom-0 left-0 w-full h-0.5 bg-[#FF5005] rounded-full"
                initial={{ scaleX: 0 }}
                animate={{ scaleX: 1 }}
                transition={{ duration: 0.3, type: "spring", stiffness: 300 }}
              />
            )}
          </motion.div>
        ))}
      </nav>

      {/* Search Bar avec animations */}
      <motion.div
        className="flex-1 max-w-md mx-8"
        animate={isSearchFocused ? "focused" : "blurred"}
        variants={searchVariants}
      >
        <div className="relative">
          <motion.div
            className="absolute z-10 left-3 top-1/2 -translate-y-1/2"
            animate={{ rotate: isSearchFocused ? 5 : 0 }}
            transition={{ duration: 0.2 }}
          >
            <Search className="text-gray-500 w-4 h-4" />
          </motion.div>
          <motion.input
            type="text"
            placeholder="Rechercher un événement..."
            onFocus={() => setIsSearchFocused(true)}
            onBlur={() => setIsSearchFocused(false)}
            className="w-[100%] pl-10 pr-4 py-2 bg-slate-100 border border-gray-200 rounded-full text-sm focus:outline-none placeholder:text-gray-500"
            whileFocus={{ borderColor: "#FF5005" }}
            transition={{ duration: 0.2 }}
          />
        </div>
      </motion.div>

      {/* Actions Section */}
      <div className="flex items-center gap-6">
        {/* Bouton Créer un événement */}
        <motion.button
          variants={buttonVariants}
          initial="initial"
          whileHover="hover"
          whileTap="tap"
          className="bg-gradient-to-r from-[#FF5005] to-[#FF5005]/90 text-white px-5 py-2.5 rounded-xl text-sm font-semibold flex items-center gap-2 shadow-md"
          onClick={modaloppen}
        >
          <motion.span
            animate={{ rotate: [0, 5, -5, 0] }}
            transition={{ duration: 0.3, delay: 0.5 }}
          >
            <Plus size={16} />
          </motion.span>
          Créer un événement
        </motion.button>

         {/* formulaire de création d'événement */}
        {isModalOpen && (
          <div onClick={ModalClose} className="modal fixed inset-0 bg-black/20 backdrop-blur-xs bg-opacity-50 flex items-center justify-center z-50">
            <div onClick={(e) => e.stopPropagation()} className="modal-content w-full max-w-3xl p-8">
              <EventForm closeModal={ModalClose} />
            </div>
          </div>
        )}

        {/* Divider */}
        <motion.div
          initial={{ scaleX: 0 }}
          animate={{ scaleX: 1 }}
          transition={{ duration: 0.5 }}
          className="h-8 w-px bg-gray-200"
        />

        {/* Icons & Profile */}
        <div className="flex items-center gap-4 text-slate-400">
          {/* Notifications */}
          <div className="relative">
            <motion.button
              variants={iconVariants}
              whileHover="hover"
              className="hover:text-slate-600 cursor-pointer transition-colors relative"
              onMouseEnter={() => setTooltip('Notifications')}
              onMouseLeave={() => setTooltip('')}
            >
              <Bell size={20} />
              <motion.span
                initial={{ scale: 0 }}
                animate={{ scale: 1 }}
                className="absolute -top-1 -right-1 w-2 h-2 bg-red-500 rounded-full"
              />
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

          {/* Aide */}
          <div className="relative">
            <motion.button
              variants={iconVariants}
              whileHover="hover"
              className="hover:text-slate-600 cursor-pointer transition-colors"
              onMouseEnter={() => setTooltip('Aide')}
              onMouseLeave={() => setTooltip('')}
            >
              <HelpCircle size={20} />
            </motion.button>
            
            <AnimatePresence>
              {tooltip === 'Aide' && (
                <motion.span
                  variants={tooltipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap"
                  style={{ bottom: '-2.2rem' }}
                >
                  Aide
                </motion.span>
              )}
            </AnimatePresence>
          </div>

          {/* Profil */}
          <div className="relative">
            <motion.div
              whileHover={{ scale: 1.05, rotate: 3 }}
              whileTap={{ scale: 0.95 }}
              className="ml-2 w-10 h-10 rounded-full overflow-hidden border-2 border-white bg-slate-800 flex items-center justify-center cursor-pointer shadow-md"
              onClick={onAvatarClick}
              onMouseEnter={() => setTooltip('Profil')}
              onMouseLeave={() => setTooltip('')}
            >
              <motion.img
                src="https://api.dicebear.com/7.x/avataaars/svg?seed=Felix"
                alt="User"
                className="w-full h-full object-cover"
                whileHover={{ scale: 1.1 }}
                transition={{ duration: 0.2 }}
              />
            </motion.div>
            
            <AnimatePresence>
              {tooltip === 'Profil' && (
                <motion.span
                  variants={tooltipVariants}
                  initial="initial"
                  animate="animate"
                  exit="exit"
                  className="absolute left-1/2 -translate-x-1/2 mt-2 px-2 py-1 bg-gray-800 text-white text-xs rounded shadow-lg z-10 whitespace-nowrap"
                  style={{ bottom: '-2.2rem' }}
                >
                  Profil
                </motion.span>
              )}
            </AnimatePresence>
          </div>
        </div>
      </div>
    </motion.header>
  );
};

export default Header;