import React from "react";
import { motion } from "framer-motion";
import { Calendar, ScanLine, ShieldCheck, Mail, Users, Bot, Sparkles, ArrowRight, CheckCircle } from "lucide-react";
import { Link } from "react-router-dom";

export function ConciergeSection() {
  const widgets = [
    {
      icon: Calendar,
      title: "Événement en cours d'exécution",
      desc: "Afterwork Tech Paris : 128 invités confirmés, 92 déjà scannés à l'accueil.",
      status: "Actif",
      statusColor: "text-emerald-500 bg-emerald-50 border-emerald-200",
    },
    {
      icon: ScanLine,
      title: "Scanner laser en direct",
      desc: "Dernier scan : Jean Dupont — 19h42. Badge VIP validé sans attente.",
      status: "0.1s",
      statusColor: "text-orange-500 bg-orange-50 border-orange-200",
    },
  ];

  const cards = [
    {
      icon: ShieldCheck,
      title: "Sécurité Cryptographique",
      desc: "QR code anti-fraude avec signature RSA.",
      className: "bg-slate-900 text-white border-white/10",
      iconColor: "text-emerald-400",
    },
    {
      icon: Mail,
      title: "Studio Design IA",
      desc: "Génération de templates et invitations sur-mesure.",
      className: "bg-white text-gray-900 border-gray-200",
      iconColor: "text-[#FF5005]",
    },
    {
      icon: Bot,
      title: "Marketing Automatisé",
      desc: "Copywriting par Gemini & diffusion multicanale.",
      className: "bg-gradient-to-br from-[#0B1727] to-[#1A2C4B] text-white border-white/10",
      iconColor: "text-[#EFB810]",
    },
    {
      icon: Users,
      title: "CRM Invités & RSVP",
      desc: "Segmentation précise et gestion de listes VIP.",
      className: "bg-white text-gray-900 border-gray-200",
      iconColor: "text-blue-600",
    },
  ];

  return (
    <section id="concierge" className="bg-white relative z-20 py-14 px-5 md:px-10 lg:px-16 overflow-hidden border-y border-gray-200/60">
      <div className="max-w-7xl mx-auto grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center">
        
        {/* LEFT COLUMN */}
        <div className="lg:col-span-6 space-y-4">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-blue-50 border border-blue-200 text-blue-600 text-xs font-bold uppercase tracking-widest">
            <Bot size={13} />
            Concierge Intelligent
          </div>

          <h2 className="text-2xl sm:text-4xl font-extrabold text-gray-900 leading-tight">
            Pilotez votre événement comme un{" "}
            <span className="text-[#FF5005]">Concierge Digital</span>
          </h2>

          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed">
            De la création des visuels par IA à l'accueil physique des participants, ARSHI EVENT prend le relais pour garantir une expérience sans accroc.
          </p>

          {/* Interactive Widgets */}
          <div className="space-y-4 pt-2">
            {widgets.map((item, i) => {
              const Icon = item.icon;
              return (
                <motion.div
                  key={i}
                  whileHover={{ scale: 1.01, x: 4 }}
                  className="flex items-start justify-between gap-4 bg-gray-50/80 p-5 rounded-2xl border border-gray-200/70 shadow-sm"
                >
                  <div className="flex items-start gap-4">
                    <div className="bg-white p-3 rounded-xl shadow-sm text-[#FF5005] border border-gray-100">
                      <Icon size={20} />
                    </div>
                    <div>
                      <h4 className="font-bold text-gray-900 text-sm">
                        {item.title}
                      </h4>
                      <p className="text-gray-500 text-xs mt-1 leading-relaxed">
                        {item.desc}
                      </p>
                    </div>
                  </div>
                  <span className={`text-[10px] font-extrabold uppercase px-2.5 py-1 rounded-full border ${item.statusColor}`}>
                    {item.status}
                  </span>
                </motion.div>
              );
            })}
          </div>

          {/* CTA */}
          <div className="pt-2">
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.03, boxShadow: "0 15px 30px -5px rgba(255, 80, 5, 0.4)" }}
                whileTap={{ scale: 0.97 }}
                className="bg-[#FF5005] hover:bg-[#ff6220] text-white px-7 py-4 rounded-xl font-bold text-sm flex items-center gap-2.5 shadow-lg shadow-orange-500/25 cursor-pointer transition-all"
              >
                <span>Générer mes premières invitations</span>
                <ArrowRight size={16} />
              </motion.button>
            </Link>
          </div>
        </div>

        {/* RIGHT BENTO GRID */}
        <div className="lg:col-span-6 grid grid-cols-1 sm:grid-cols-2 gap-4">
          {cards.map((item, i) => {
            const Icon = item.icon;
            return (
              <motion.div
                key={i}
                whileHover={{ y: -4, scale: 1.02 }}
                transition={{ duration: 0.25 }}
                className={`rounded-3xl p-6 h-56 flex flex-col justify-between border shadow-sm ${item.className}`}
              >
                <div className="w-12 h-12 rounded-2xl bg-white/10 dark:bg-white/5 backdrop-blur-md flex items-center justify-center border border-white/10 shadow-inner">
                  <Icon className={item.iconColor} size={24} />
                </div>
                <div>
                  <h4 className="font-extrabold text-base tracking-tight mb-1.5">
                    {item.title}
                  </h4>
                  <p className="text-xs opacity-75 leading-relaxed font-normal">
                    {item.desc}
                  </p>
                </div>
              </motion.div>
            );
          })}
        </div>

      </div>
    </section>
  );
}