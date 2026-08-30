import React, { useState, useEffect } from "react";
import { motion, useScroll, useTransform } from "framer-motion";
import { Play, Sparkles, QrCode, ArrowRight, ShieldCheck, Zap, Users, TrendingUp, CheckCircle2 } from "lucide-react";
import { Link } from "react-router-dom";
import img from "../../assets/img1.jpg";

export function HeroSection() {
  const { scrollY } = useScroll();
  const yParallax = useTransform(scrollY, [0, 500], [0, 80]);
  const yParallaxFast = useTransform(scrollY, [0, 500], [0, -60]);

  // Compteur flip / digital dynamique
  const [count, setCount] = useState(540);
  useEffect(() => {
    const timer = setInterval(() => {
      setCount((prev) => (prev < 590 ? prev + 1 : 540));
    }, 4000);
    return () => clearInterval(timer);
  }, []);

  return (
    <section className="relative min-h-[78vh] flex items-center justify-center overflow-hidden bg-[#0B1727] text-white pt-30 pb-30 px-5 md:px-10 lg:px-16">
      
      {/* Background Mesh Gradient & Glowing Orbs */}
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        {/* Glow Orb Orange */}
        <motion.div 
          className="absolute -top-20 -left-20 w-[450px] h-[450px] rounded-full bg-[#FF5005]/20 blur-[130px]"
          animate={{
            scale: [1, 1.15, 1],
            x: [0, 30, 0],
            y: [0, 20, 0],
          }}
          transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Glow Orb Navy/Blue */}
        <motion.div 
          className="absolute top-1/3 -right-20 w-[500px] h-[500px] rounded-full bg-[#1E6FD9]/25 blur-[140px]"
          animate={{
            scale: [1, 1.2, 1],
            x: [0, -40, 0],
            y: [0, -30, 0],
          }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
        />
        {/* Grid pattern overlay */}
        <div className="absolute inset-0 bg-[linear-gradient(to_right,#ffffff08_1px,transparent_1px),linear-gradient(to_bottom,#ffffff08_1px,transparent_1px)] bg-[size:4rem_4rem] [mask-image:radial-gradient(ellipse_60%_50%_at_50%_0%,#000_70%,transparent_100%)]"></div>
      </div>

      <div className="max-w-7xl mx-auto w-full grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-6 items-center relative z-10">
        
        {/* COLONNE GAUCHE (CONTENU & CTAs) */}
        <div className="lg:col-span-7 space-y-5 text-left">
          
          {/* BADGE PRESTIGE FLIP CHRONO */}
          <motion.div 
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            className="inline-flex items-center gap-2.5 px-3.5 py-1 rounded-full bg-white/5 border border-white/10 backdrop-blur-xl shadow-inner"
          >
            <span className="flex h-2 w-2 relative">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-[#FF5005] opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2 w-2 bg-[#FF5005]"></span>
            </span>
            <span className="text-xs font-bold tracking-wider uppercase text-gray-300">
              <span className="text-[#FF5005] font-extrabold">{count}+</span> Événements propulsés ce mois-ci
            </span>
            <div className="h-3 w-px bg-white/20"></div>
            <span className="text-[10px] font-semibold text-emerald-400 flex items-center gap-1">
              <CheckCircle2 size={11} /> 99.9% Taux de scan
            </span>
          </motion.div>

          {/* TITRE MONUMENTAL */}
          <motion.h1 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            className="text-3xl sm:text-4xl lg:text-5xl font-extrabold tracking-tight leading-[1.1] text-white"
          >
            L'excellence de vos événements,{" "}
            <span className="bg-gradient-to-r from-[#FF5005] via-[#ff7b2a] to-[#EFB810] bg-clip-text text-transparent">
              scénarisée par l'IA.
            </span>
          </motion.h1>

          {/* DESCRIPTION */}
          <motion.p 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.2 }}
            className="text-sm sm:text-base text-slate-300 max-w-xl leading-relaxed font-normal"
          >
            Plateforme tout-en-un de gestion événementielle de nouvelle génération : billetterie instantanée, RSVP protocolaire, scans haute fréquence et concierge marketing intelligent.
          </motion.p>

          {/* CTA BOUTONS */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.7, delay: 0.3 }}
            className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 pt-1"
          >
            <Link to="/register">
              <motion.button 
                whileHover={{ scale: 1.03, boxShadow: "0 12px 25px -5px rgba(255, 80, 5, 0.5)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-6 py-3 bg-[#FF5005] hover:bg-[#ff6220] text-white font-bold text-xs rounded-lg flex items-center justify-center gap-2.5 shadow-lg shadow-orange-600/30 cursor-pointer transition-all duration-200"
              >
                <span>Créer mon événement VIP</span>
                <ArrowRight size={16} />
              </motion.button>
            </Link>

            <a href="#services">
              <motion.button 
                whileHover={{ scale: 1.02, backgroundColor: "rgba(255, 255, 255, 0.12)" }}
                whileTap={{ scale: 0.97 }}
                className="w-full sm:w-auto px-5 py-3 bg-white/5 hover:bg-white/10 text-white font-semibold text-xs rounded-lg border border-white/15 backdrop-blur-md flex items-center justify-center gap-2 transition-all duration-200 cursor-pointer"
              >
                <div className="w-6 h-6 rounded-full bg-[#FF5005]/20 flex items-center justify-center text-[#FF5005]">
                  <Play size={11} className="fill-[#FF5005] ml-0.5" />
                </div>
                <span>Découvrir la plateforme</span>
              </motion.button>
            </a>
          </motion.div>

          {/* REASSURANCE / METRICS */}
          <motion.div 
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="pt-6 border-t border-white/10 grid grid-cols-3 gap-4 max-w-lg"
          >
            <div>
              <div className="text-2xl font-black text-white tracking-tight">0.1s</div>
              <div className="text-[11px] text-gray-400 uppercase font-semibold mt-0.5">Vitesse de Scan</div>
            </div>
            <div>
              <div className="text-2xl font-black text-emerald-400 tracking-tight">100%</div>
              <div className="text-[11px] text-gray-400 uppercase font-semibold mt-0.5">Sécurité Cryptée</div>
            </div>
            <div>
              <div className="text-2xl font-black text-[#EFB810] tracking-tight">24/7</div>
              <div className="text-[11px] text-gray-400 uppercase font-semibold mt-0.5">Concierge IA</div>
            </div>
          </motion.div>

        </div>

        {/* COLONNE DROITE (3D PREVIEW CARTE & LIVE SCANNER) */}
        <div className="lg:col-span-5 relative perspective-1000 flex justify-center">
          
          {/* CARTE PRINCIPALE CINEMATIQUE */}
          <motion.div 
            style={{ y: yParallax }}
            initial={{ opacity: 0, scale: 0.9, rotateY: 15 }}
            animate={{ opacity: 1, scale: 1, rotateY: 0 }}
            transition={{ duration: 1, ease: [0.23, 1, 0.32, 1] }}
            whileHover={{ rotateY: -4, rotateX: 4, scale: 1.02 }}
            className="w-full max-w-md bg-[#111827]/90 rounded-3xl p-6 border border-white/15 backdrop-blur-2xl shadow-[0_25px_60px_-15px_rgba(0,0,0,0.8)] relative overflow-hidden group"
          >
            {/* Ambient halo on hover */}
            <div className="absolute inset-0 bg-gradient-to-tr from-[#FF5005]/10 via-transparent to-[#1E6FD9]/15 opacity-50 group-hover:opacity-100 transition-opacity duration-500 pointer-events-none"></div>

            {/* Header de la carte de prévisualisation */}
            <div className="flex items-center justify-between pb-4 border-b border-white/10">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-[#FF5005] flex items-center justify-center text-white font-bold text-xs shadow-md shadow-orange-500/30">
                  AE
                </div>
                <div>
                  <h4 className="text-xs font-bold text-white tracking-wide">Gala Tech International 2025</h4>
                  <p className="text-[10px] text-gray-400">Palais des Congrès • Paris</p>
                </div>
              </div>
              <span className="px-2.5 py-1 rounded-full text-[10px] font-bold bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
                Direct Live
              </span>
            </div>

            {/* IMAGE D'ÉVÉNEMENT AVEC SCAN LASER */}
            <div className="my-5 relative rounded-2xl overflow-hidden aspect-[4/3] bg-black/40 border border-white/10">
              <img 
                src={img} 
                alt="Event Preview" 
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700 opacity-80"
              />
              
              {/* Ligne Laser de Scan Holographique */}
              <div className="absolute inset-x-0 h-0.5 bg-gradient-to-r from-transparent via-[#FF5005] to-transparent shadow-[0_0_15px_#FF5005] animate-scan-laser pointer-events-none"></div>
              
              {/* Badge VIP Overlay */}
              <div className="absolute top-3 right-3 px-3 py-1 bg-black/70 backdrop-blur-md rounded-full border border-[#EFB810]/40 text-[#EFB810] text-[10px] font-extrabold flex items-center gap-1 shadow-lg">
                <Sparkles size={11} />
                PASS VIP EXCLUSIF
              </div>

              {/* QR Code Glass Box */}
              <div className="absolute bottom-3 left-3 bg-black/80 backdrop-blur-md p-2 rounded-xl border border-white/20 flex items-center gap-2.5 shadow-xl">
                <QrCode size={32} className="text-white" />
                <div className="text-left pr-2">
                  <div className="text-[10px] font-extrabold text-white">#AE-9824-FR</div>
                  <div className="text-[8px] text-emerald-400 font-semibold">CERTIFIÉ BLOCKCHAIN</div>
                </div>
              </div>
            </div>

            {/* STATISTIQUES EN TEMPS RÉEL */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Taux de présence</div>
                <div className="text-xl font-extrabold text-white flex items-center gap-2 mt-0.5">
                  <span>94.2%</span>
                  <span className="text-[10px] font-bold text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded">+12%</span>
                </div>
                <div className="w-full bg-white/10 h-1.5 rounded-full mt-2 overflow-hidden">
                  <motion.div 
                    initial={{ width: 0 }}
                    animate={{ width: "94.2%" }}
                    transition={{ duration: 1.5, delay: 0.5 }}
                    className="bg-gradient-to-r from-[#FF5005] to-orange-400 h-full rounded-full"
                  />
                </div>
              </div>

              <div className="bg-white/5 rounded-xl p-3 border border-white/5">
                <div className="text-[10px] font-bold text-gray-400 uppercase">Invités Confirmés</div>
                <div className="text-xl font-extrabold text-white mt-0.5">
                  1,420 <span className="text-xs text-gray-400 font-normal">/ 1,500</span>
                </div>
                <div className="text-[10px] text-[#FF5005] font-semibold flex items-center gap-1 mt-2">
                  <TrendingUp size={11} /> 95% Capacité max
                </div>
              </div>
            </div>

          </motion.div>

          {/* FLOATING MINI WIDGET 1 */}
          <motion.div 
            style={{ y: yParallaxFast }}
            animate={{ y: [0, -10, 0] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
            className="absolute -bottom-6 -left-6 bg-[#0B1727]/95 border border-white/15 backdrop-blur-xl rounded-2xl p-4 shadow-2xl hidden sm:flex items-center gap-3.5 z-20"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/30 flex items-center justify-center">
              <Zap size={18} />
            </div>
            <div>
              <div className="text-xs font-bold text-white">Scan Instantané</div>
              <div className="text-[10px] text-gray-400">Émission de billet &lt; 0.2s</div>
            </div>
          </motion.div>

        </div>

      </div>

    </section>
  );
}