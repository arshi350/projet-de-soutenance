import React, { useState } from 'react';
import { Copy, Check, ExternalLink, QrCode, Share2, Sparkles, Send } from 'lucide-react';
import { WhatsAppIcon } from '../../../common/SocialBrandIcons';
import { motion, AnimatePresence } from 'framer-motion';
import toast from 'react-hot-toast';

export const PublicTicketShareLink = ({ eventId, eventTitle }) => {
  const [copied, setCopied] = useState(false);
  const [showQrModal, setShowQrModal] = useState(false);

  const ticketUrl = `${window.location.origin}/event/${eventId}/tickets`;
  const qrCodeUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(ticketUrl)}`;

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(ticketUrl);
      setCopied(true);
      toast.success("Lien officiel copié dans le presse-papiers !");
      setTimeout(() => setCopied(false), 2500);
    } catch (err) {
      toast.error("Impossible de copier automatiquement.");
    }
  };

  const handleShareWhatsApp = () => {
    const message = `Réservez vos billets officiels pour l'événement "${eventTitle || 'Mon Événement'}" ici : ${ticketUrl}`;
    window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
  };

  return (
    <div className="bg-white border border-gray-200/90 rounded-3xl p-6 sm:p-8 shadow-xs relative overflow-hidden text-left font-sans text-gray-900">
      
      {/* Barre d'accentuation ARSHI EVENT */}
      <div className="absolute top-0 left-0 right-0 h-1.5 bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />

      <div className="relative z-10 flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 pt-2">
        
        {/* Titre & Explications */}
        <div className="space-y-2 max-w-xl">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-orange-50 text-[#FF5005] rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-orange-200/60">
            <Sparkles className="w-3.5 h-3.5 text-[#FF5005]" />
            <span>Guichet de Vente & Billetterie Publique</span>
          </div>
          <h3 className="text-xl sm:text-2xl font-black text-gray-900 tracking-tight">
            Lien Officiel d'Achat des Billets
          </h3>
          <p className="text-xs text-gray-500 leading-relaxed">
            Diffusez ce lien à votre public pour permettre l'achat sécurisé de billets en ligne avec génération automatique de pass QR code uniques et contrôle anti-fraude.
          </p>
        </div>

        {/* Action Input & Boutons */}
        <div className="w-full lg:w-auto flex-1 flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          
          {/* Champ d'URL */}
          <div className="flex-1 bg-gray-50 border border-gray-200 rounded-2xl px-4 py-3 flex items-center justify-between gap-3 text-gray-800 shadow-xs">
            <span className="text-xs font-mono font-bold truncate text-[#FF5005] select-all">
              {ticketUrl}
            </span>
            <button
              onClick={handleCopy}
              className="p-1.5 hover:bg-gray-200 text-gray-400 hover:text-gray-900 rounded-lg transition shrink-0 cursor-pointer"
              title="Copier le lien"
            >
              {copied ? <Check className="w-4 h-4 text-emerald-500" /> : <Copy className="w-4 h-4" />}
            </button>
          </div>

          {/* Boutons d'actions */}
          <div className="flex items-center gap-2 shrink-0">
            
            <motion.button
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
              onClick={handleCopy}
              className="flex-1 sm:flex-none px-4 py-3 bg-[#FF5005] hover:bg-[#ff6220] text-white font-extrabold uppercase tracking-wider rounded-2xl text-xs flex items-center justify-center gap-2 transition shadow-md shadow-orange-500/25 cursor-pointer"
            >
              {copied ? <Check className="w-4 h-4 text-white" /> : <Copy className="w-4 h-4" />}
              <span>{copied ? 'Copié !' : 'Copier'}</span>
            </motion.button>

            <a
              href={`/event/${eventId}/tickets`}
              target="_blank"
              rel="noopener noreferrer"
              className="px-4 py-3 bg-gray-100 hover:bg-gray-200 text-gray-800 font-bold rounded-2xl text-xs flex items-center justify-center gap-2 transition border border-gray-200 cursor-pointer"
              title="Tester le guichet en direct"
            >
              <span>Tester</span>
              <ExternalLink className="w-4 h-4" />
            </a>

            <button
              onClick={() => setShowQrModal(true)}
              className="p-3 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-2xl transition border border-gray-200 cursor-pointer"
              title="Afficher le QR code pour affiches ou flyers"
            >
              <QrCode className="w-4 h-4 text-[#EFB810]" />
            </button>

            <button
              onClick={handleShareWhatsApp}
              className="p-3 bg-emerald-50 hover:bg-emerald-100 text-emerald-600 rounded-2xl transition border border-emerald-200 cursor-pointer"
              title="Partager sur WhatsApp"
            >
              <WhatsAppIcon size={16} />
            </button>

          </div>

        </div>

      </div>

      {/* Modal QR Code */}
      <AnimatePresence>
        {showQrModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-md p-4">
            <motion.div 
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-white border border-gray-200 rounded-3xl p-6 sm:p-8 max-w-sm w-full text-center space-y-4 shadow-2xl relative"
            >
              <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727] absolute top-0 left-0 right-0 rounded-t-3xl" />
              
              <h4 className="text-base font-extrabold text-gray-900 pt-2">Pass & QR Code Affiche</h4>
              <p className="text-xs text-gray-400">
                Imprimez ce QR Code sur vos supports physiques (affiches, badges, flyers) pour un accès direct au guichet.
              </p>

              <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl inline-block shadow-sm mx-auto">
                <img src={qrCodeUrl} alt="QR Code Billetterie" className="w-48 h-48 object-contain rounded-xl" />
              </div>

              <div className="flex gap-2">
                <a
                  href={qrCodeUrl}
                  download={`qrcode-billetterie-${eventId}.png`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 py-2.5 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-extrabold uppercase tracking-wider rounded-xl transition cursor-pointer shadow-sm"
                >
                  Télécharger
                </a>
                <button
                  onClick={() => setShowQrModal(false)}
                  className="px-4 py-2.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl transition cursor-pointer"
                >
                  Fermer
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>

    </div>
  );
};
