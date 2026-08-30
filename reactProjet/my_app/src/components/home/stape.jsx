import React from 'react';
import { motion } from 'framer-motion';
import { Sparkles, Calendar, Upload, QrCode, Send, Scan, BarChart2 } from 'lucide-react';

const steps = [
  { id: 1, label: 'Créez', icon: Calendar, desc: 'Configurez en 2 min' },
  { id: 2, label: 'Importez', icon: Upload, desc: 'Vos listes Excel/CSV' },
  { id: 3, label: 'Générez QR', icon: QrCode, desc: 'Badges uniques sécurisés' },
  { id: 4, label: 'Diffusez', icon: Send, desc: 'Emails & WhatsApp' },
  { id: 5, label: 'Scannez', icon: Scan, desc: 'À l\'entrée sans attente' },
  { id: 6, label: 'Analysez', icon: BarChart2, desc: 'Rapports en direct' },
];

export default function CommentCaMarche() {
  return (
    <section className="bg-gradient-to-br from-[#0B1727] via-[#111827] to-[#1A2C4B] relative z-10 py-14 px-5 md:px-10 lg:px-16 text-white overflow-hidden">
      
      {/* Background glow lines */}
      <div className="absolute inset-0 bg-[radial-gradient(ellipse_80%_80%_at_50%_-20%,rgba(255,80,5,0.15),rgba(255,255,255,0))]"></div>

      <div className="max-w-7xl mx-auto relative z-10 text-center">
        
        {/* Header */}
        <div className="max-w-xl mx-auto mb-10">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={12} />
            Simplicité Radicale
          </span>
          <h2 className="text-2xl sm:text-4xl font-extrabold tracking-tight text-white">
            Comment ça marche ?
          </h2>
          <p className="text-slate-300 text-xs sm:text-sm mt-2">
            Un tunnel sans accroc pour transformer l'organisation de vos événements.
          </p>
        </div>

        {/* Steps Grid */}
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 relative">
          {steps.map((step, index) => {
            const Icon = step.icon;
            const isLast = step.id === 6;

            return (
              <motion.div 
                key={step.id}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
                whileHover={{ y: -6 }}
                className="flex flex-col items-center bg-white/5 backdrop-blur-md p-4 rounded-2xl border border-white/10 relative group"
              >
                {/* Step number badge */}
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl text-base font-black mb-3 shadow-md transition-all duration-300 ${
                  isLast 
                    ? 'bg-gradient-to-tr from-[#FF5005] to-orange-400 text-white shadow-orange-500/30' 
                    : 'bg-white/10 text-white group-hover:bg-[#FF5005] group-hover:text-white'
                }`}>
                  <Icon size={18} />
                </div>

                <span className="text-white font-extrabold text-base tracking-tight">
                  {step.label}
                </span>

                <span className="text-gray-400 text-xs mt-1 text-center font-normal">
                  {step.desc}
                </span>

                {/* Micro step index */}
                <span className="absolute top-3 right-3 text-[10px] font-bold text-gray-500">
                  0{step.id}
                </span>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}