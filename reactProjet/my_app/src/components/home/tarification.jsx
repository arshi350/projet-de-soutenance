import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { 
  Check, 
  Sparkles, 
  Lock, 
  Globe, 
  Crown, 
  Mail, 
  MessageSquare, 
  QrCode, 
  ScanLine, 
  Wand2, 
  Smartphone, 
  ShieldCheck, 
  BarChart3, 
  Zap, 
  HelpCircle,
  ArrowRight
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Tarification() {
  return (
    <section id="tarifs" className="py-14 relative z-10 px-5 md:px-10 lg:px-16 bg-white border-t border-gray-200/60 overflow-hidden font-sans">
      <div className="max-w-7xl mx-auto">
        
        {/* En-tête de section */}
        <div className="text-center max-w-3xl mx-auto mb-10 space-y-2">
          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-orange-50 border border-orange-200 text-[#FF5005] text-[10px] font-black uppercase tracking-wider">
            <Sparkles className="w-3 h-3" />
            Tarification Flexible & Transparente
          </span>
          <h2 className="text-2xl sm:text-3xl lg:text-4xl font-black text-gray-900 tracking-tight">
            Payez par <span className="text-[#FF5005]">événement</span> ou passez en <span className="text-[#FF5005]">illimité</span>.
          </h2>
          <p className="text-gray-500 text-xs sm:text-sm leading-relaxed font-medium">
            Aucun frais caché. Choisissez de payer uniquement ce que vous consommez à chaque événement, ou débloquez la puissance illimitée avec notre abonnement mensuel.
          </p>
        </div>

        {/* Grille des 3 formules tarifaires réelles */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 items-stretch max-w-7xl mx-auto">
          
          {/* CARTE 1 : Événement Privé (Paiement à l'événement) */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-2xl p-5 sm:p-6 border border-gray-200/90 shadow-xs flex flex-col justify-between relative hover:border-gray-300 transition-all text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-blue-50 text-blue-600 border border-blue-200/60 text-[10px] font-black uppercase tracking-wider">
                  <Lock className="w-3 h-3" />
                  À la carte • Privé
                </span>
                <span className="text-[11px] font-bold text-gray-400">Paiement unique</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Événement Privé
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                Idéal pour mariages, galas, anniversaires et soirées VIP sur liste d'invités.
              </p>

              {/* Prix */}
              <div className="mt-5 pb-5 border-b border-gray-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    2 500
                  </span>
                  <span className="text-base font-bold text-[#FF5005]">FCFA</span>
                  <span className="text-xs text-gray-400 font-semibold">/ jour</span>
                </div>
                <div className="text-[11px] text-gray-500 font-bold mt-1">
                  + Coût par invité selon le canal choisi
                </div>
              </div>

              {/* Détails du modèle */}
              <div className="py-4 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                  Tarification par invité :
                </div>
                <div className="space-y-1.5 text-xs text-gray-700 font-medium">
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Mail className="w-3.5 h-3.5 text-[#FF5005]" /> Invitation Email
                    </span>
                    <span className="font-black text-gray-900">15 FCFA / invité</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <MessageSquare className="w-3.5 h-3.5 text-emerald-600" /> Invitation WhatsApp
                    </span>
                    <span className="font-black text-gray-900">30 FCFA / invité</span>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl">
                    <span className="flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-indigo-600" /> Multi-Canaux (Email + WhatsApp)
                    </span>
                    <span className="font-black text-gray-900">45 FCFA / invité</span>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités incluses */}
              <div className="pt-2 pb-6 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                  Inclus d'office :
                </div>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Sondages pré-événement & préférences invités par IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Relances & rappels automatisés par IA</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>QR Codes nominatifs cryptés & Contrôle d'accès</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Questionnaire de satisfaction & Analyse IA post-event</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link to="/register" className="w-full">
              <button className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm">
                Créer un Événement Privé
              </button>
            </Link>
          </motion.div>

          {/* CARTE 2 : Événement Public & Billetterie (Paiement à l'événement) */}
          <motion.div
            whileHover={{ y: -6 }}
            transition={{ duration: 0.25 }}
            className="bg-white rounded-3xl p-7 sm:p-8 border border-gray-200/90 shadow-xs flex flex-col justify-between relative hover:border-gray-300 transition-all text-left"
          >
            <div>
              <div className="flex items-center justify-between gap-2 mb-4">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-[10px] font-black uppercase tracking-wider">
                  <Globe className="w-3 h-3" />
                  À la carte • Public
                </span>
                <span className="text-[11px] font-bold text-gray-400">Paiement unique</span>
              </div>

              <h3 className="text-xl font-black text-gray-900 tracking-tight">
                Billetterie Publique
              </h3>
              <p className="text-xs text-gray-500 mt-1 font-medium leading-relaxed">
                Idéal pour concerts, festivals, conférences, spectacles et salons ouverts au public.
              </p>

              {/* Prix */}
              <div className="mt-5 pb-5 border-b border-gray-100">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-3xl sm:text-4xl font-black text-gray-900 tracking-tight">
                    5 000
                  </span>
                  <span className="text-base font-bold text-[#FF5005]">FCFA</span>
                  <span className="text-xs text-gray-400 font-semibold">/ jour</span>
                </div>
                <div className="text-[11px] text-gray-500 font-bold mt-1">
                  + 10 FCFA / place de capacité maximale
                </div>
              </div>

              {/* Détails du modèle */}
              <div className="py-4 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                  Vente en ligne & Paiements :
                </div>
                <div className="space-y-1.5 text-xs text-gray-700 font-medium">
                  <div className="bg-orange-50/70 border border-orange-200/60 p-3 rounded-2xl space-y-1">
                    <div className="flex justify-between items-center text-[#FF5005] font-bold text-xs">
                      <span>Frais de Billetterie Sécurisée :</span>
                      <span>2.5% + 250 FCFA</span>
                    </div>
                    <p className="text-[10px] text-gray-500">
                      Pris en charge au choix par l'acheteur ou déduit des ventes organisateur.
                    </p>
                  </div>
                  <div className="flex justify-between items-center bg-gray-50 px-3 py-2 rounded-xl text-xs">
                    <span className="flex items-center gap-1.5">
                      <Smartphone className="w-3.5 h-3.5 text-orange-600" /> Mobile Money
                    </span>
                    <span className="font-bold text-gray-900">Orange • MTN • Wave</span>
                  </div>
                </div>
              </div>

              {/* Fonctionnalités incluses */}
              <div className="pt-2 pb-6 space-y-2.5">
                <div className="text-[11px] font-black uppercase text-gray-400 tracking-wider">
                  Inclus d'office :
                </div>
                <ul className="space-y-2 text-xs text-gray-600 font-medium">
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Ticket Designer IA Gemini & Visuels HD</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Campagnes Marketing IA & Auto-publication</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>E-tickets téléchargeables avec QR Code dynamique</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-500 shrink-0" />
                    <span>Contrôle rapide des entrées via mobileAppScann</span>
                  </li>
                </ul>
              </div>
            </div>

            <Link to="/register" className="w-full">
              <button className="w-full py-3.5 px-4 bg-gray-900 hover:bg-black text-white font-bold text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-sm">
                Lancer une Billetterie
              </button>
            </Link>
          </motion.div>

          {/* CARTE 3 : Abonnement Mensuel Tout-en-Un (Premium VIP) - Mise en avant */}
          <motion.div
            whileHover={{ y: -8 }}
            transition={{ duration: 0.25 }}
            className="bg-gradient-to-b from-[#FF5005] to-[#e04500] text-white rounded-3xl p-7 sm:p-8 shadow-2xl shadow-orange-500/25 border-2 border-orange-300 flex flex-col justify-between relative text-left lg:scale-105 z-10"
          >
            {/* Badge Choix Populaire */}
            <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-[#0B1727] text-[#EFB810] border border-[#EFB810]/40 px-3.5 py-1 rounded-full shadow-lg flex items-center gap-1.5 z-20 whitespace-nowrap">
              <Crown size={12} className="text-[#EFB810] fill-[#EFB810]" />
              <span className="text-[10px] font-black uppercase tracking-wider">Abonnement Mensuel Illimité</span>
            </div>

            <div>
              <div className="flex items-center justify-between gap-2 mb-4 mt-2">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-white/20 text-white text-[10px] font-black uppercase tracking-wider backdrop-blur-xs">
                  <Zap className="w-3 h-3" />
                  Premium VIP
                </span>
                <span className="text-[11px] font-black text-white/90 uppercase">Tout Inclus</span>
              </div>

              <h3 className="text-xl sm:text-2xl font-black text-white tracking-tight">
                Forfait Illimité
              </h3>
              <p className="text-xs text-white/85 mt-1 font-medium leading-relaxed">
                Pour les organisateurs réguliers, agences, entreprises et professionnels de l'événementiel.
              </p>

              {/* Prix */}
              <div className="mt-5 pb-5 border-b border-white/20">
                <div className="flex items-baseline gap-1.5">
                  <span className="text-4xl sm:text-5xl font-black text-white tracking-tight">
                    29 900
                  </span>
                  <span className="text-base font-bold text-white">FCFA</span>
                  <span className="text-xs text-white/80 font-semibold">/ mois</span>
                </div>
                <div className="text-[11px] text-white/90 font-bold mt-1 flex items-center gap-1.5">
                  <Sparkles className="w-3.5 h-3.5" /> 0 FCFA de frais sur vos créations d'événements
                </div>
              </div>

              {/* Avantages Illimités */}
              <div className="pt-5 pb-6 space-y-3">
                <div className="text-[11px] font-black uppercase text-white/90 tracking-wider">
                  Privilèges VIP Exclusifs :
                </div>
                <ul className="space-y-2.5 text-xs text-white font-semibold">
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Événements & Invités 100% illimités</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Accès illimité aux Moteurs IA Gemini Pro</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Relances WhatsApp automatiques incluses</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Ticket Designer IA & Billetteries illimitées</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Scanner live ultra-rapide 0.1s illimité</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <span className="w-4 h-4 rounded-full bg-white/20 flex items-center justify-center text-white shrink-0">
                      <Check className="w-3 h-3" />
                    </span>
                    <span>Support prioritaire VIP 24/7</span>
                  </li>
                </ul>
              </div>
            </div>

            <div>
              <Link to="/register" className="w-full">
                <button className="w-full py-4 px-4 bg-white hover:bg-orange-50 text-[#FF5005] font-black text-xs uppercase tracking-wider rounded-2xl transition-all cursor-pointer shadow-lg hover:scale-[1.02] active:scale-[0.98]">
                  Débloquer le Forfait Illimité
                </button>
              </Link>
              <p className="text-[10px] text-center mt-3 text-white/80 font-medium">
                Sans engagement • Résiliable à tout moment
              </p>
            </div>
          </motion.div>

        </div>

        {/* Bannière de réassurance en bas */}
        <div className="mt-16 bg-gray-50 border border-gray-200/80 rounded-3xl p-6 sm:p-8 max-w-5xl mx-auto flex flex-col md:flex-row items-center justify-between gap-6 text-left">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-orange-100/70 text-[#FF5005] flex items-center justify-center shrink-0">
              <ShieldCheck className="w-6 h-6" />
            </div>
            <div>
              <h4 className="font-black text-gray-900 text-sm sm:text-base">
                Besoin d'aide pour choisir la formule idéale ?
              </h4>
              <p className="text-xs text-gray-500 font-medium mt-0.5">
                Vous pouvez commencer sans engagement avec un seul événement, ou passer à l'illimité dès que votre volume augmente.
              </p>
            </div>
          </div>
          <Link to="/register" className="shrink-0">
            <button className="inline-flex items-center gap-2 bg-[#FF5005] hover:bg-[#e04500] text-white px-5 py-3 rounded-xl font-bold text-xs uppercase tracking-wider transition-all cursor-pointer shadow-sm">
              <span>Créer un Compte Gratuit</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </Link>
        </div>

      </div>
    </section>
  );
}