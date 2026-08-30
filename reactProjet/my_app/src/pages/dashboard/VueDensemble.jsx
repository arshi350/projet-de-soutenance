import React from 'react';
import { motion } from 'framer-motion';
import DashboardStats from '../../components/dashboard/overview/stats';
import ActivitySection from '../../components/dashboard/overview/ActivitySection';
import LocationBanner from '../../components/dashboard/overview/locationBanner';

const sectionVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: (custom) => ({
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.4,
      delay: custom * 0.1,
      ease: [0.23, 1, 0.32, 1]
    }
  })
};

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.1,
      delayChildren: 0.05
    }
  }
};

const VueDensemble = () => {
  return (
    <motion.div
      id="vue_ensemble"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 md:p-10 max-w-7xl mx-auto min-h-screen font-sans"
    >
      <motion.div
        variants={containerVariants}
        initial="hidden"
        animate="visible"
        className="space-y-6"
      >
        {/* Section Statistiques */}
        <motion.div variants={sectionVariants} custom={0}>
          <DashboardStats />
        </motion.div>

        {/* Section Activité */}
        <motion.div variants={sectionVariants} custom={1}>
          <ActivitySection />
        </motion.div>

        {/* Section Localisation */}
        <motion.div variants={sectionVariants} custom={2}>
          <LocationBanner />
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

export default VueDensemble;