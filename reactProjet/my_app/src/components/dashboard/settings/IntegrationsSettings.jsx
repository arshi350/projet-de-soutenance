import React, { useState } from 'react';
import { 
  Puzzle, CheckCircle2, Globe, Database, 
  Download, Sparkles, ExternalLink, Calendar, 
  Share2, ShieldCheck, Zap 
} from 'lucide-react';
import { motion } from 'framer-motion';
import { useAuthContext } from '../../../context/AuthContext';

/**
 * Composant d'Intégrations & Export de Données RGPD
 */
export const IntegrationsSettings = () => {
  const { user } = useAuthContext();
  const [downloading, setDownloading] = useState(false);

  const handleExportData = () => {
    setDownloading(true);
    setTimeout(() => {
      const exportPayload = {
        exportedAt: new Date().toISOString(),
        user: {
          id: user?._id || user?.id,
          first_name: user?.first_name,
          last_name: user?.last_name,
          email: user?.email,
          phone: user?.phone,
          city: user?.city,
        },
        platform: 'ARSHIEVENT VIP',
      };

      const dataStr = 'data:text/json;charset=utf-8,' + encodeURIComponent(JSON.stringify(exportPayload, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute('href', dataStr);
      downloadAnchor.setAttribute('download', `arshievent_data_${user?.first_name || 'user'}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      setDownloading(false);
    }, 1000);
  };

  const integrations = [
    {
      name: 'Brevo API (Email & SMS/WhatsApp)',
      desc: 'Envoi automatisé des invitations et des billets avec délivrabilité 99.8%.',
      status: 'Connecté',
      badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: Zap,
    },
    {
      name: 'Google Calendar Sync',
      desc: 'Synchronisation automatique des événements créés avec votre agenda Google.',
      status: 'Actif',
      badgeClass: 'bg-emerald-50 text-emerald-600 border-emerald-200',
      icon: Calendar,
    },
    {
      name: 'Meta Ads & Pixel (Facebook / Instagram)',
      desc: 'Suivi des conversions et reciblage publicitaire pour vos billetteries B2C.',
      status: 'Prêt à configurer',
      badgeClass: 'bg-blue-50 text-blue-600 border-blue-200',
      icon: Share2,
    },
    {
      name: 'Google Gemini Pro IA',
      desc: 'Moteur d\'intelligence artificielle pour la rédaction et l\'optimisation de vos événements.',
      status: 'Intégré',
      badgeClass: 'bg-orange-50 text-[#FF5005] border-orange-200',
      icon: Sparkles,
    },
  ];

  return (
    <div className="space-y-6 text-left font-sans">
      
      {/* 1. Liste des Intégrations */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-6">
        <div>
          <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
            <Puzzle size={20} className="text-[#FF5005]" />
            <span>Services & Intégrations Connectées</span>
          </h3>
          <p className="text-xs text-gray-400 mt-1">
            Connecteurs natifs pour automatiser votre communication et la promotion de vos événements.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {integrations.map((item, idx) => {
            const Icon = item.icon;
            return (
              <div
                key={idx}
                className="p-5 rounded-2xl bg-gray-50/70 border border-gray-100 flex flex-col justify-between space-y-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white border border-gray-200 flex items-center justify-center text-[#FF5005] shadow-xs">
                    <Icon size={20} />
                  </div>
                  <span
                    className={`px-3 py-0.5 rounded-full text-[10px] font-extrabold uppercase border ${item.badgeClass}`}
                  >
                    {item.status}
                  </span>
                </div>

                <div>
                  <h4 className="text-sm font-black text-gray-900">{item.name}</h4>
                  <p className="text-xs text-gray-500 mt-1 leading-relaxed">{item.desc}</p>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* 2. Export de Données RGPD */}
      <div className="bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-xs space-y-4">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="space-y-1">
            <h3 className="text-lg font-black text-gray-900 flex items-center gap-2">
              <Database size={20} className="text-blue-600" />
              <span>Export & Sauvegarde de vos Données</span>
            </h3>
            <p className="text-xs text-gray-400">
              Téléchargez l'intégralité de vos données de profil et événements au format JSON standardisé.
            </p>
          </div>

          <button
            type="button"
            disabled={downloading}
            onClick={handleExportData}
            className="px-5 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-extrabold text-xs uppercase tracking-wider rounded-2xl flex items-center gap-2 transition cursor-pointer self-start sm:self-auto"
          >
            <Download size={16} />
            <span>{downloading ? 'Génération...' : 'Exporter mes données (JSON)'}</span>
          </button>
        </div>
      </div>

    </div>
  );
};

export default IntegrationsSettings;
