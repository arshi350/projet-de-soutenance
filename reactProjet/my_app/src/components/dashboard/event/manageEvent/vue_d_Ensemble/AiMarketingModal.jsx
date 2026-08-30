import React, { useState } from 'react';
import { apiGenerateMarketingAI } from '../../../../../services/aiService';
import { toast } from 'react-hot-toast';
import { 
  Megaphone, Sparkles, Copy, Target, Globe, Mail, X, Check, ArrowRight 
} from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../../../../common/SocialBrandIcons';

export default function AiMarketingModal({ isOpen, onClose, eventData = {}, token }) {
  const [artists, setArtists] = useState('');
  const [targetAudience, setTargetAudience] = useState('Grand Public');
  const [highlights, setHighlights] = useState('');
  const [loading, setLoading] = useState(false);
  const [marketingResult, setMarketingResult] = useState(null);
  const [activeTab, setActiveTab] = useState('instagram');

  if (!isOpen) return null;

  const handleGenerate = async () => {
    try {
      setLoading(true);
      const payload = {
        eventId: eventData._id || eventData.id,
        eventTitle: eventData.titre || eventData.title || 'Grand Événement Public',
        category: eventData.categorie || eventData.category || 'Concert / Festival',
        artists: artists.trim(),
        targetAudience: targetAudience.trim(),
        highlights: highlights.trim(),
      };

      const res = await apiGenerateMarketingAI(payload, token);
      if (res.success && res.data) {
        setMarketingResult(res.data);
        toast.success('Campagne marketing générée avec succès !');
      } else {
        toast.error(res.message || 'Erreur lors de la génération marketing.');
      }
    } catch (err) {
      console.error('Erreur Marketing IA:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la génération avec l\'IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Texte copié dans le presse-papier !');
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-md">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh] text-left font-sans border border-gray-200"
      >
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />
        
        {/* En-tête */}
        <div className="px-6 py-5 border-b border-gray-100 flex items-center justify-between bg-gray-50/50">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shadow-xs">
              <Megaphone size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Générateur de Campagne Marketing IA
              </h3>
              <p className="text-xs text-gray-400">
                Générez vos publications Instagram, Facebook, description SEO et newsletters
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 text-gray-500 hover:text-gray-900 flex items-center justify-center transition cursor-pointer"
          >
            <X size={16} />
          </button>
        </div>

        {/* Corps */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Champs de configuration */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                1. Artistes & Têtes d'affiche
              </label>
              <input
                type="text"
                value={artists}
                onChange={(e) => setArtists(e.target.value)}
                placeholder="Ex: Artiste A, DJ Snake, Conférenciers Tech..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005]"
              />
            </div>

            <div>
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                2. Cible prioritaire
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex: Jeunes 18-35 ans, Cadres, Passionnés de musique..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005]"
              />
            </div>

            <div className="sm:col-span-2">
              <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-1">
                3. Points forts & Expérience unique
              </label>
              <input
                type="text"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Ex: Show son et lumière, Village gastronomique, Pass Early Bird à tarif réduit..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3.5 py-2.5 text-xs text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005]"
              />
            </div>
          </div>

          {/* Bouton de génération */}
          <button
            type="button"
            onClick={handleGenerate}
            disabled={loading}
            className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition flex items-center justify-center gap-2 shadow-md cursor-pointer ${
              loading
                ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                : 'bg-[#FF5005] hover:bg-[#ff6220] text-white shadow-orange-500/25'
            }`}
          >
            {loading ? (
              <span>Génération de la stratégie marketing...</span>
            ) : (
              <>
                <Sparkles size={14} />
                <span>Générer la Campagne Marketing Complète</span>
              </>
            )}
          </button>

          {/* Résultats structurés par onglet */}
          {marketingResult && (
            <div className="mt-4 p-5 rounded-2xl bg-orange-50/40 border border-orange-200 space-y-4 animate-fadeIn">
              
              {marketingResult.punchline && (
                <div className="p-3.5 bg-white rounded-xl border border-orange-200 flex items-center justify-between">
                  <div className="flex items-center gap-2 text-xs font-bold text-gray-900">
                    <Target size={14} className="text-[#FF5005]" />
                    <span>Accroche : « {marketingResult.punchline} »</span>
                  </div>
                  <button
                    onClick={() => handleCopyText(marketingResult.punchline)}
                    className="text-[11px] text-[#FF5005] font-bold hover:underline flex items-center gap-1 cursor-pointer"
                  >
                    <Copy size={12} />
                    Copier
                  </button>
                </div>
              )}

              {/* Sélecteur de canal avec vraies icônes de marque */}
              <div className="flex flex-wrap gap-2 border-b border-orange-200/60 pb-2">
                {[
                  { id: 'instagram', label: 'Instagram & TikTok', icon: <InstagramIcon size={14} /> },
                  { id: 'facebook', label: 'Facebook & Réseaux', icon: <FacebookIcon size={14} className="text-[#1877F2]" /> },
                  { id: 'seo', label: 'Billetterie SEO', icon: <Globe size={13} /> },
                  { id: 'newsletter', label: 'Newsletter / Emailing', icon: <Mail size={13} /> },
                ].map((tab) => (
                  <button
                    key={tab.id}
                    type="button"
                    onClick={() => setActiveTab(tab.id)}
                    className={`px-3 py-1.5 rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer ${
                      activeTab === tab.id
                        ? 'bg-[#FF5005] text-white shadow-xs'
                        : 'bg-white border border-gray-200 text-gray-600 hover:text-gray-900'
                    }`}
                  >
                    {tab.icon}
                    <span>{tab.label}</span>
                  </button>
                ))}
              </div>

              {/* Contenu */}
              <div className="space-y-2">
                <div className="bg-white p-4 rounded-xl border border-gray-200 text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto font-sans">
                  {activeTab === 'instagram' && (marketingResult.instagramPost || 'Non disponible')}
                  {activeTab === 'facebook' && (marketingResult.facebookPost || 'Non disponible')}
                  {activeTab === 'seo' && (marketingResult.seoDescription || 'Non disponible')}
                  {activeTab === 'newsletter' && (
                    <>
                      {marketingResult.newsletterSubject && (
                        <div className="font-bold text-[#FF5005] mb-2">
                          Objet : {marketingResult.newsletterSubject}
                        </div>
                      )}
                      {marketingResult.newsletterBody}
                    </>
                  )}
                </div>

                <div className="flex justify-end">
                  <button
                    type="button"
                    onClick={() => {
                      let textToCopy = '';
                      if (activeTab === 'instagram') textToCopy = marketingResult.instagramPost;
                      else if (activeTab === 'facebook') textToCopy = marketingResult.facebookPost;
                      else if (activeTab === 'seo') textToCopy = marketingResult.seoDescription;
                      else if (activeTab === 'newsletter') textToCopy = `Objet: ${marketingResult.newsletterSubject}\n\n${marketingResult.newsletterBody}`;
                      handleCopyText(textToCopy);
                    }}
                    className="px-4 py-2 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-1.5 cursor-pointer"
                  >
                    <Copy size={13} />
                    <span>Copier ce contenu</span>
                  </button>
                </div>
              </div>

            </div>
          )}

        </div>

        {/* Footer */}
        <div className="px-6 py-4 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-2 text-xs font-bold text-gray-500 hover:text-gray-800 cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </motion.div>
    </div>
  );
}
