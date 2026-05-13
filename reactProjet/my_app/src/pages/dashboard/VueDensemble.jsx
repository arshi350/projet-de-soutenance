import React from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '../../components/dashboard/overview/stats';
import ActivitySection from '../../components/dashboard/overview/ActivitySection';
import LocationBanner from '../../components/dashboard/overview/locationBanner';

// Variants d'animation pour les sections
const sectionVariants = {
  hidden: { opacity: 0, y: 30 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      delay: custom * 0.1,
      ease: "easeOut",
      type: "spring",
      stiffness: 100,
      damping: 15
    }
  })
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.15,
      delayChildren: 0.2,
      ease: "easeInOut"
    }
  }
};

const VueDensemble = () => {
  return (
    <motion.div
    id='vue_ensemble'
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-8 mx-20 bg-gradient-to-br from-gray-50 to-white min-h-screen"
    >

      {/* Conteneur avec animation en cascade */}
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-8"
      >
        {/* Section Statistiques */}
        <motion.div
          variants={sectionVariants}
          custom={0}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
          className="relative"
        >
          <motion.div
            className="absolute -top-2 -left-2 w-20 h-20 bg-gradient-to-r from-[#FF5005]/10 to-transparent rounded-full blur-xl"
            animate={{ scale: [1, 1.2, 1], opacity: [0.5, 0.8, 0.5] }}
            transition={{ duration: 3, repeat: Infinity }}
          />
          <DashboardStats />
        </motion.div>

        {/* Section Activité */}
        <motion.div
          variants={sectionVariants}
          custom={1}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <ActivitySection />
        </motion.div>

        {/* Section Localisation */}
        <motion.div
          variants={sectionVariants}
          custom={2}
          whileHover={{ scale: 1.01 }}
          transition={{ type: "spring", stiffness: 300, damping: 20 }}
        >
          <LocationBanner />
        </motion.div>
      </motion.div>

      {/* Bouton flottant d'aide (optionnel) */}
      <motion.button
        initial={{ scale: 0, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ delay: 1, type: "spring", stiffness: 200 }}
        whileHover={{ scale: 1.1, rotate: 5 }}
        whileTap={{ scale: 0.9 }}
        className="fixed bottom-8 right-8 bg-[#FF5005] text-white p-4 rounded-full shadow-lg z-50"
      >
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
        </svg>
      </motion.button>
    </motion.div>
  );
};

export default VueDensemble;