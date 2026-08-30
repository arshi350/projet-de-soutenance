import React from 'react';
import QuickStats from '../../components/dashboard/event/QuickStats';
import EventManagement from '../../components/dashboard/event/eventManagement';
import Footer from '../../components/dashboard/event/footer';
import { motion } from 'framer-motion';

/**
 * Page Principale Événements du Dashboard (/dashboard/evenement)
 */
export default function Evenement() {
  return (
    <motion.div
      id="evenement"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      className="p-6 sm:p-8 lg:p-10 max-w-7xl mx-auto min-h-screen font-sans space-y-2"
    >
      {/* 1. Cartes de Statistiques Rapides */}
      <QuickStats />

      {/* 2. Hub & Catalogue des Événements */}
      <EventManagement />

      {/* 3. Bannière IA & Footer */}
      <Footer />
    </motion.div>
  );
}
