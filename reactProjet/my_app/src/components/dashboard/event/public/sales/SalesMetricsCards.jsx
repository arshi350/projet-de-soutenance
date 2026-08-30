import React from 'react';
import { 
  TrendingUp, 
  Ticket, 
  Users, 
  DollarSign, 
  QrCode, 
  CheckCircle2, 
  Clock, 
  ArrowUpRight,
  ShieldCheck,
  Percent
} from 'lucide-react';
import { motion } from 'framer-motion';

export default function SalesMetricsCards({ kpis = {}, eventInfo = {} }) {
  const {
    totalRevenue = 0,
    totalSold = 0,
    totalCapacity = 0,
    remainingCapacity = 0,
    fillRate = 0,
    averageTicketPrice = 0,
    uniqueBuyersCount = 0,
    scannedCount = 0,
    scanRate = 0
  } = kpis;

  const isSoldOut = totalCapacity > 0 && remainingCapacity <= 0;

  const cards = [
    {
      id: 'revenue',
      title: "Chiffre d'Affaires Brut",
      value: `${Number(totalRevenue).toLocaleString('fr-FR')} FCFA`,
      subValue: `Panier moyen : ${Math.round(averageTicketPrice).toLocaleString('fr-FR')} FCFA / billet`,
      icon: DollarSign,
      gradient: 'from-emerald-500/10 to-teal-500/5',
      iconBg: 'bg-emerald-500/15 text-emerald-600 border border-emerald-500/20',
      badge: '+100% Encaissé',
      badgeColor: 'bg-emerald-50 text-emerald-700 border-emerald-200/80',
      accentColor: 'text-emerald-600'
    },
    {
      id: 'tickets_sold',
      title: 'Billets & Places Vendus',
      value: `${totalSold} / ${totalCapacity}`,
      subValue: `${fillRate}% de la jauge totale atteinte`,
      icon: Ticket,
      gradient: 'from-blue-500/10 to-indigo-500/5',
      iconBg: 'bg-blue-500/15 text-blue-600 border border-blue-500/20',
      badge: isSoldOut ? 'COMPLET' : `${remainingCapacity} restantes`,
      badgeColor: isSoldOut 
        ? 'bg-rose-50 text-rose-700 border-rose-200/80 font-black' 
        : 'bg-blue-50 text-blue-700 border-blue-200/80',
      accentColor: 'text-blue-600',
      progress: fillRate
    },
    {
      id: 'fill_rate',
      title: 'Taux de Remplissage',
      value: `${fillRate}%`,
      subValue: `${remainingCapacity} place(s) disponible(s) à la vente`,
      icon: Percent,
      gradient: 'from-amber-500/10 to-orange-500/5',
      iconBg: 'bg-amber-500/15 text-amber-600 border border-amber-500/20',
      badge: fillRate >= 80 ? 'Haute Demande' : (fillRate >= 40 ? 'Dynamique' : 'En Cours'),
      badgeColor: fillRate >= 80 
        ? 'bg-purple-50 text-purple-700 border-purple-200/80' 
        : 'bg-amber-50 text-amber-700 border-amber-200/80',
      accentColor: 'text-amber-600'
    },
    {
      id: 'check_in',
      title: 'Entrées Validées (Scan QR)',
      value: `${scannedCount} / ${totalSold}`,
      subValue: `${scanRate}% des participants se sont présentés`,
      icon: QrCode,
      gradient: 'from-purple-500/10 to-pink-500/5',
      iconBg: 'bg-purple-500/15 text-purple-600 border border-purple-500/20',
      badge: `${scanRate}% Check-in`,
      badgeColor: 'bg-purple-50 text-purple-700 border-purple-200/80',
      accentColor: 'text-purple-600'
    },
    {
      id: 'unique_buyers',
      title: 'Clients & Acheteurs Uniques',
      value: `${uniqueBuyersCount}`,
      subValue: `${totalSold > 0 ? (totalSold / Math.max(1, uniqueBuyersCount)).toFixed(1) : 0} billet(s) / commande`,
      icon: Users,
      gradient: 'from-slate-500/10 to-zinc-500/5',
      iconBg: 'bg-slate-900/10 text-slate-900 border border-slate-900/15',
      badge: 'B2C Direct',
      badgeColor: 'bg-slate-100 text-slate-800 border-slate-200',
      accentColor: 'text-slate-900'
    }
  ];

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-4">
      {cards.map((card, idx) => {
        const IconComponent = card.icon;
        return (
          <motion.div
            key={card.id}
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.35, delay: idx * 0.06 }}
            className="relative overflow-hidden bg-white border border-gray-200/80 rounded-3xl p-5 shadow-xs hover:shadow-md transition-all duration-300 flex flex-col justify-between group"
          >
            {/* Dégradé de fond subtil */}
            <div className={`absolute inset-0 bg-gradient-to-br ${card.gradient} opacity-50 pointer-events-none`} />

            <div>
              {/* En-tête de la carte */}
              <div className="flex items-center justify-between gap-2 mb-3">
                <div className={`p-2.5 rounded-2xl ${card.iconBg} transition-transform group-hover:scale-105 duration-200`}>
                  <IconComponent className="w-5 h-5" />
                </div>
                <span className={`text-[10px] font-extrabold uppercase tracking-wider px-2.5 py-1 rounded-full border ${card.badgeColor}`}>
                  {card.badge}
                </span>
              </div>

              {/* Titre */}
              <h4 className="text-xs font-bold text-slate-500 uppercase tracking-wider">
                {card.title}
              </h4>

              {/* Valeur Principale */}
              <div className="mt-2 flex items-baseline gap-2">
                <span className="text-2xl sm:text-3xl font-black text-slate-900 tracking-tight">
                  {card.value}
                </span>
              </div>
            </div>

            {/* Barre de progression si disponible */}
            {card.progress !== undefined && (
              <div className="w-full bg-slate-100 h-1.5 rounded-full mt-3 overflow-hidden">
                <div 
                  className="bg-blue-600 h-full rounded-full transition-all duration-700 ease-out" 
                  style={{ width: `${Math.min(100, card.progress)}%` }}
                />
              </div>
            )}

            {/* Sous-titre descriptif */}
            <div className="mt-3 pt-3 border-t border-slate-100 text-[11px] font-medium text-slate-500 flex items-center justify-between">
              <span className="truncate">{card.subValue}</span>
            </div>
          </motion.div>
        );
      })}
    </div>
  );
}
