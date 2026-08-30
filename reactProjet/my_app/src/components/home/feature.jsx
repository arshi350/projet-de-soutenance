import React from "react";
import { motion } from "framer-motion";
import { Share2, QrCode, BarChart3, Sparkles, Shield, Cpu } from "lucide-react";

export function FeaturesSection() {
  const features = [
    {
      icon: Share2,
      badge: "AUTOMATION MULTI-CANAL",
      title: "Invitations Intelligentes",
      description: "Programmez l'envoi automatisé de vos invitations par Email et WhatsApp avec relances dynamiques pour maximiser le taux de confirmation.",
      accent: "from-orange-500/20 to-transparent",
      iconBg: "bg-orange-500/10 text-[#FF5005] border-orange-500/20",
    },
    {
      icon: QrCode,
      badge: "SÉCURITÉ INFRA-SECONDE",
      title: "QR Code Unique & Sécurisé",
      description: "Chaque invité bénéficie d'un badge chiffré infalsifiable. Le scan instantané à l'entrée actualise votre base en direct à 60fps.",
      accent: "from-blue-500/20 to-transparent",
      iconBg: "bg-blue-500/10 text-blue-500 border-blue-500/20",
    },
    {
      icon: BarChart3,
      badge: "ANALYTIQUE AVANCÉE",
      title: "Pilotage Temps Réel",
      description: "Surveillez la jauge d'affluence, le rythme des entrées et exportez vos rapports financiers et de présence au format PDF/CSV en un clic.",
      accent: "from-emerald-500/20 to-transparent",
      iconBg: "bg-emerald-500/10 text-emerald-500 border-emerald-500/20",
    },
  ];

  return (
    <section id="services" className="relative z-10 py-14 px-5 md:px-10 lg:px-16 bg-[#F8FAFC]">
      <div className="max-w-7xl mx-auto">
        
        {/* SECTION HEADER */}
        <div className="text-center max-w-2xl mx-auto mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-orange-50 border border-orange-200/60 text-[#FF5005] text-xs font-bold uppercase tracking-widest mb-3">
            <Sparkles size={13} />
            Puissance Technologique
          </div>
          <h2 className="text-2xl md:text-4xl font-extrabold text-gray-900 tracking-tight">
            Chaque détail conçu pour la <span className="text-[#FF5005]">performance</span>.
          </h2>
          <p className="text-gray-500 text-xs md:text-sm mt-3 leading-relaxed">
            Une architecture conçue pour absorber des milliers de scans simultanés tout en offrant une expérience VIP sans la moindre friction.
          </p>
        </div>

        {/* CARDS GRID WITH 3D HOVER TILT */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {features.map((item, index) => {
            const Icon = item.icon;

            return (
              <motion.div
                key={index}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.6, delay: index * 0.15 }}
                whileHover={{ 
                  y: -6,
                  scale: 1.02,
                  boxShadow: "0 20px 40px -12px rgba(255, 80, 5, 0.15)"
                }}
                className="bg-white rounded-2xl p-6 border border-gray-200/80 shadow-sm relative overflow-hidden transition-all duration-300 group"
              >
                {/* Accent glow on top right */}
                <div className={`absolute top-0 right-0 w-28 h-28 bg-gradient-to-bl ${item.accent} rounded-full blur-2xl pointer-events-none group-hover:scale-150 transition-transform duration-500`}></div>

                {/* ICON */}
                <div className={`w-11 h-11 flex items-center justify-center rounded-xl border ${item.iconBg} mb-4 shadow-sm group-hover:scale-110 transition-transform duration-300`}>
                  <Icon size={20} />
                </div>

                {/* BADGE */}
                <span className="text-[9px] font-extrabold tracking-wider uppercase text-gray-400">
                  {item.badge}
                </span>

                {/* TITLE */}
                <h3 className="mt-1.5 text-lg font-bold text-gray-900 group-hover:text-[#FF5005] transition-colors duration-200">
                  {item.title}
                </h3>

                {/* TEXT */}
                <p className="mt-2 text-gray-500 text-xs leading-relaxed">
                  {item.description}
                </p>

                {/* BOTTOM ACCENT BAR */}
                <div className="mt-6 pt-3 border-t border-gray-100 flex items-center justify-between text-xs font-semibold text-gray-400 group-hover:text-[#FF5005] transition-colors">
                  <span>En savoir plus</span>
                  <span className="group-hover:translate-x-1 transition-transform">→</span>
                </div>

              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}