import React from 'react';
import { Check, Sparkles, Zap, Shield, Crown, Users, TrendingUp, CreditCard } from 'lucide-react';
import { motion } from 'framer-motion';

const SUBSCRIPTION_PLANS = [
  {
    id: 'starter',
    name: 'Starter Organisateur',
    price: 'Gratuit',
    period: 'à vie',
    subscribers: 142,
    badge: 'Standard',
    badgeColor: 'bg-gray-100 text-gray-700',
    icon: <Users className="text-gray-600" size={20} />,
    features: [
      'Jusqu’à 2 événements simultanés',
      'Scan de billets via mobileAppScann',
      'QR Code standard certifié',
      'Support par email'
    ],
    isFeatured: false
  },
  {
    id: 'pro',
    name: 'Premium VIP Illimité',
    price: '29 900 FCFA',
    period: '/mois',
    subscribers: 87,
    badge: 'Recommandé',
    badgeColor: 'bg-orange-50 text-[#FF5005] border border-orange-200',
    icon: <Zap className="text-[#FF5005]" size={20} />,
    features: [
      'Événements & Invités illimités',
      '0 FCFA de frais sur créations d’événements',
      'Générateur Marketing & Moteurs IA Gemini Pro',
      'Relances WhatsApp automatiques incluses',
      'Billetterie en ligne sans commission',
      'Export des listes d’invités Excel / CSV'
    ],
    isFeatured: true
  },
  {
    id: 'vip',
    name: 'VIP Concierge Elite',
    price: '49 000 FCFA',
    period: '/mois',
    subscribers: 24,
    badge: 'Prestige Gold',
    badgeColor: 'bg-amber-50 text-[#EFB810] border border-[#EFB810]/30',
    icon: <Crown className="text-[#EFB810]" size={20} />,
    features: [
      'Tout le forfait Pro Studio',
      'Pass VIP numériques personnalisés par IA',
      'Modèle Gemini Pro haute fidélité',
      'Multi-utilisateurs & permissions d’équipe',
      'Support téléphonique dédié 24/7'
    ],
    isFeatured: false
  }
];

import { useEffect } from 'react';
import { useAdminSubscriptions } from '../../../hooks/useAdminStats';

export default function Abonements() {
  const token = localStorage.getItem('token') || localStorage.getItem('accessToken');
  const { subData, fetchSubscriptions } = useAdminSubscriptions();

  useEffect(() => {
    if (token) fetchSubscriptions(token);
  }, [token, fetchSubscriptions]);

  const formattedMRR = subData?.mrr 
    ? `${subData.mrr.toLocaleString('fr-FR')} FCFA`
    : '2 850 000 FCFA';

  const dynamicPlans = SUBSCRIPTION_PLANS.map(p => {
    if (p.id === 'starter') return { ...p, subscribers: subData?.subscribers?.starter ?? p.subscribers };
    if (p.id === 'pro') return { ...p, subscribers: subData?.subscribers?.pro ?? p.subscribers };
    if (p.id === 'vip') return { ...p, subscribers: subData?.subscribers?.vip ?? p.subscribers };
    return p;
  });

  return (
    <div className="min-h-screen bg-gray-50/60 p-6 md:p-10 font-sans text-slate-900 max-w-7xl mx-auto text-left">
      
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
        <div>
          <span className="text-[10px] font-extrabold uppercase tracking-widest text-[#FF5005]">
            Monétisation & Plans
          </span>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight text-gray-900 mt-0.5">
            Gestion des Abonnements SaaS
          </h1>
          <p className="text-xs text-gray-400 mt-1">Supervision des forfaits, revenus récurrents (MRR) et privilèges des organisateurs.</p>
        </div>

        {/* Global MRR Counter */}
        <div className="bg-white p-4 rounded-2xl border border-gray-200/80 shadow-xs flex items-center gap-4">
          <div className="w-10 h-10 rounded-xl bg-emerald-50 text-emerald-600 flex items-center justify-center">
            <CreditCard size={20} />
          </div>
          <div>
            <p className="text-[9px] font-extrabold uppercase tracking-wider text-gray-400">Revenu Récurrent (MRR)</p>
            <p className="text-xl font-black text-gray-900">{formattedMRR} <span className="text-xs text-emerald-600 font-bold">+18%</span></p>
          </div>
        </div>
      </div>

      {/* Pricing Matrix */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
        {dynamicPlans.map((plan) => (
          <motion.div
            key={plan.id}
            whileHover={{ y: -4 }}
            className={`rounded-3xl p-6 sm:p-8 flex flex-col justify-between transition-all ${
              plan.isFeatured
                ? 'bg-white border-2 border-[#FF5005] shadow-xl shadow-orange-500/10 relative'
                : 'bg-white border border-gray-200/80 shadow-xs'
            }`}
          >
            <div>
              <div className="flex justify-between items-center mb-4">
                <span className={`text-[10px] font-extrabold uppercase px-3 py-1 rounded-full ${plan.badgeColor}`}>
                  {plan.badge}
                </span>
                <div className="p-2 rounded-xl bg-gray-50 border border-gray-100">
                  {plan.icon}
                </div>
              </div>

              <h3 className="text-lg font-black text-gray-900 mb-1">{plan.name}</h3>
              <p className="text-xs text-gray-400 mb-4">{plan.subscribers} organisateurs abonnés</p>

              <div className="flex items-baseline gap-1 mb-6 border-b border-gray-100 pb-4">
                <span className="text-3xl font-black text-gray-900">{plan.price}</span>
                <span className="text-xs text-gray-400 font-semibold">{plan.period}</span>
              </div>

              <ul className="space-y-3 mb-6 text-xs text-gray-600">
                {plan.features.map((feat, i) => (
                  <li key={i} className="flex items-center gap-2.5">
                    <div className="w-4 h-4 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center shrink-0">
                      <Check size={10} />
                    </div>
                    <span>{feat}</span>
                  </li>
                ))}
              </ul>
            </div>

            <button
              className={`w-full py-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all cursor-pointer ${
                plan.isFeatured
                  ? 'bg-[#FF5005] hover:bg-[#ff6220] text-white shadow-md shadow-orange-500/25'
                  : 'bg-gray-100 hover:bg-gray-200 text-gray-800'
              }`}
            >
              Éditer ce forfait
            </button>
          </motion.div>
        ))}
      </div>

    </div>
  );
}
