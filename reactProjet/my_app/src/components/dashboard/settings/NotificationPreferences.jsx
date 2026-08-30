import React, { useState } from 'react';
import { Bell, Mail, MessageSquare, Smartphone, Check, Sparkles, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Composant de Préférences de Notifications de l'Organisateur
 */
export const NotificationPreferences = () => {
  const [notifications, setNotifications] = useState({
    emailNewBooking: true,
    emailDailyReport: false,
    whatsappGuestRSVP: true,
    whatsappLiveScan: true,
    emailCapacityAlert: true,
    marketingUpdates: false,
  });

  const [saved, setSaved] = useState(false);

  const toggle = (key) => {
    setNotifications((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  const handleSave = () => {
    setSaved(true);
    setTimeout(() => setSaved(false), 3000);
  };

  const items = [
    {
      key: 'emailNewBooking',
      title: 'Nouvelle réservation ou achat de billet',
      desc: 'Recevez un email instantané dès qu\'un participant valide son billet ou confirme sa présence.',
      icon: Mail,
      category: 'Email',
    },
    {
      key: 'whatsappGuestRSVP',
      title: 'Confirmation WhatsApp en direct',
      desc: 'Notification WhatsApp sur votre téléphone dès qu\'un invité VIP répond positivement.',
      icon: MessageSquare,
      category: 'WhatsApp',
    },
    {
      key: 'whatsappLiveScan',
      title: 'Alerte de premier scan à l\'entrée',
      desc: 'Soyez notifié quand les premiers invités ou VIP scannent leur QR Code à la porte.',
      icon: Smartphone,
      category: 'Temps Réel',
    },
    {
      key: 'emailCapacityAlert',
      title: 'Alerte de jauge (80% & 100% complet)',
      desc: 'Alerte d\'urgence par email quand vos billets atteignent la limite de capacité fixée.',
      icon: AlertTriangle,
      category: 'Sécurité',
    },
    {
      key: 'emailDailyReport',
      title: 'Rapport d\'analyse hebdomadaire',
      desc: 'Synthèse des statistiques de visites, conversion des invitations et revenus générés.',
      icon: Bell,
      category: 'Analytics',
    },
  ];

  return (
    <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6 text-left font-sans">
      
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-gray-100">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Bell size={20} className="text-[#FF5005]" />
            <span>Canaux de Notifications & Alertes</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Personnalisez la façon dont vous recevez les événements critiques de votre billetterie.
          </p>
        </div>

        {saved && (
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            className="px-3.5 py-1.5 bg-emerald-50 text-emerald-700 border border-emerald-200 rounded-full text-xs font-bold flex items-center gap-1.5"
          >
            <Check size={14} /> Préférences enregistrées
          </motion.div>
        )}
      </div>

      <div className="space-y-4">
        {items.map((item) => {
          const Icon = item.icon;
          const isEnabled = notifications[item.key];
          return (
            <div
              key={item.key}
              onClick={() => toggle(item.key)}
              className="p-4 sm:p-5 rounded-2xl bg-gray-50/70 hover:bg-gray-50 border border-gray-100 flex items-start sm:items-center justify-between gap-4 transition cursor-pointer"
            >
              <div className="flex items-start gap-3.5">
                <div
                  className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 border transition ${
                    isEnabled
                      ? 'bg-orange-500/10 text-[#FF5005] border-orange-500/20'
                      : 'bg-gray-100 text-gray-400 border-gray-200'
                  }`}
                >
                  <Icon size={18} />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h4 className="text-xs sm:text-sm font-black text-gray-900">{item.title}</h4>
                    <span className="text-[9px] font-extrabold uppercase px-2 py-0.2 rounded-md bg-gray-200/80 text-gray-600">
                      {item.category}
                    </span>
                  </div>
                  <p className="text-xs text-gray-500 mt-0.5 leading-relaxed">{item.desc}</p>
                </div>
              </div>

              {/* Switch Toggle */}
              <div
                className={`w-12 h-6 rounded-full p-1 transition-colors duration-300 shrink-0 ${
                  isEnabled ? 'bg-[#FF5005]' : 'bg-gray-200'
                }`}
              >
                <div
                  className={`w-4 h-4 rounded-full bg-white transition-transform duration-300 ${
                    isEnabled ? 'translate-x-6' : 'translate-x-0'
                  }`}
                />
              </div>
            </div>
          );
        })}
      </div>

      <div className="pt-4 flex justify-end">
        <button
          type="button"
          onClick={handleSave}
          className="px-6 py-3 bg-[#0B1727] hover:bg-[#FF5005] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl transition cursor-pointer shadow-xs"
        >
          Enregistrer mes préférences
        </button>
      </div>

    </div>
  );
};

export default NotificationPreferences;
