import React from 'react';
import { useParams, Link } from 'react-router-dom';
import { Download, Printer, ShieldCheck, Ticket, Sparkles, ArrowLeft, ExternalLink } from 'lucide-react';
import { motion } from 'framer-motion';
import { API_BASE_URL } from '../../services/api';

export const TicketDownloadPage = () => {
  const { token } = useParams();
  const downloadUrl = `${API_BASE_URL}/public/tickets/download/${token}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 font-sans relative overflow-hidden">
      
      {/* Background glow orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF5005]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#8B5CF6]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Top action bar */}
      <div className="mb-6 flex flex-wrap gap-4 no-print items-center justify-between w-full max-w-4xl z-10">
        <Link
          to="/"
          className="px-4 py-2.5 bg-white/5 hover:bg-white/10 text-slate-300 font-extrabold text-xs uppercase tracking-wider rounded-xl border border-white/10 flex items-center gap-2 transition"
        >
          <ArrowLeft size={14} />
          <span>Accueil</span>
        </Link>

        <div className="flex items-center gap-3">
          <a
            href={downloadUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="px-5 py-2.5 bg-white/10 hover:bg-white/15 text-white font-extrabold text-xs uppercase tracking-wider rounded-xl border border-white/15 flex items-center gap-2 transition"
          >
            <Download size={14} />
            <span>Télécharger PDF</span>
          </a>

          <motion.button
            onClick={handlePrint}
            whileHover={{ scale: 1.02, boxShadow: "0 10px 30px -5px rgba(255, 80, 5, 0.4)" }}
            whileTap={{ scale: 0.98 }}
            className="px-6 py-2.5 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5e19] hover:to-[#ff8519] text-white font-extrabold text-xs uppercase tracking-wider rounded-xl flex items-center gap-2 transition shadow-lg shadow-orange-500/25 cursor-pointer"
          >
            <Printer size={14} />
            <span>Imprimer</span>
          </motion.button>
        </div>
      </div>

      {/* Boarding Pass Frame Container */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.96 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="w-full max-w-4xl bg-[#0E1522]/95 border border-white/15 rounded-3xl overflow-hidden shadow-2xl backdrop-blur-2xl relative z-10"
      >
        {/* Top Gradient Bar */}
        <div className="h-2 bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#8B5CF6]" />
        
        <iframe
          src={downloadUrl}
          title="Billet Officiel"
          className="w-full h-[640px] border-0 bg-white"
        />
      </motion.div>

      {/* Security badge footer */}
      <div className="mt-6 text-xs text-slate-400 flex items-center gap-2 no-print relative z-10">
        <ShieldCheck size={16} className="text-emerald-400" />
        <span>Document officiel émis par ARSHI EVENT • Signature cryptographique certifiée</span>
      </div>

    </div>
  );
};

export default TicketDownloadPage;
