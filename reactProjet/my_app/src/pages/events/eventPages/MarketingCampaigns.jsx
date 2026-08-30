import React, { useState, useEffect } from 'react';
import { 
  Sparkles, Megaphone, Copy, Check, Share2, MessageSquare, Globe, Mail, 
  Target, Users, Flame, Star, RefreshCw, Send, CheckCircle2, ExternalLink, Link2,
  Zap, ArrowRight, Briefcase, Crown, Heart
} from 'lucide-react';
import { FacebookIcon, InstagramIcon } from '../../../components/common/SocialBrandIcons';
import { motion } from 'framer-motion';
import { apiGenerateMarketingAI } from '../../../services/aiService';
import { apiGetSocialAccounts, apiPublishSocialPost, apiGetSocialHistory } from '../../../services/socialService';
import { useAuthContext } from '../../../context/AuthContext';
import SocialConnectModal from '../../../components/dashboard/event/manageEvent/social/SocialConnectModal';
import { toast, Toaster } from 'react-hot-toast';

const MARKETING_TONES = [
  { id: 'impactant', label: 'Énergique & Festival', desc: 'Punchy, enthousiaste, créateur de hype' },
  { id: 'pro', label: 'Professionnel & B2B', desc: 'Rassurant, expert pour salons et conférences' },
  { id: 'luxe', label: 'Élégant & VIP', desc: 'Sélectif, prestigieux et haut de gamme' },
  { id: 'familial', label: 'Convivial & Grand Public', desc: 'Accessible, chaleureux pour tout le monde' }
];

export default function MarketingCampaigns({ eventInfo }) {
  const { token } = useAuthContext();
  const eventId = eventInfo?._id || eventInfo?.id;

  const [artists, setArtists] = useState('');
  const [targetAudience, setTargetAudience] = useState('Grand Public & Passionnés');
  const [highlights, setHighlights] = useState('');
  const [selectedTone, setSelectedTone] = useState(MARKETING_TONES[0].label);
  const [specialOffers, setSpecialOffers] = useState('');

  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [activeChannel, setActiveChannel] = useState('all');
  const [copiedKey, setCopiedKey] = useState(null);

  const [showConnectModal, setShowConnectModal] = useState(false);
  const [socialAccounts, setSocialAccounts] = useState([]);
  const [publishingPlatform, setPublishingPlatform] = useState(null);
  const [publishedPosts, setPublishedPosts] = useState({});
  const [postHistory, setPostHistory] = useState([]);

  const loadSocialData = async () => {
    if (!token) return;
    try {
      const accRes = await apiGetSocialAccounts(token);
      if (accRes.success) {
        setSocialAccounts(accRes.data || []);
      }
      if (eventId) {
        const histRes = await apiGetSocialHistory(eventId, token);
        if (histRes.success) {
          setPostHistory(histRes.data || []);
        }
      }
    } catch (err) {
      console.warn("Erreur chargement données sociales:", err.message);
    }
  };

  useEffect(() => {
    loadSocialData();
  }, [eventId, token]);

  const handleGenerate = async (e) => {
    if (e) e.preventDefault();
    try {
      setLoading(true);
      const payload = {
        eventId,
        eventTitle: eventInfo?.titre || eventInfo?.title || 'Grand Événement Public',
        category: eventInfo?.categorie || eventInfo?.category || 'Musique / Festival / Conférence',
        artists: artists.trim(),
        targetAudience: targetAudience.trim(),
        highlights: `${highlights} ${specialOffers ? `| Offres: ${specialOffers}` : ''} | Ton: ${selectedTone}`.trim(),
      };

      const res = await apiGenerateMarketingAI(payload, token);
      if (res.success && res.data) {
        setResult(res.data);
        toast.success('Campagne marketing générée avec succès !');
        setTimeout(() => {
          document.getElementById('marketing-results-section')?.scrollIntoView({ behavior: 'smooth' });
        }, 150);
      } else {
        toast.error(res.message || 'Erreur lors de la génération marketing.');
      }
    } catch (err) {
      console.error('Erreur marketing IA:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la génération avec l\'IA.');
    } finally {
      setLoading(false);
    }
  };

  const handleCopy = (text, key) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    toast.success('Copié dans le presse-papier !');
    setTimeout(() => setCopiedKey(null), 2000);
  };

  const handlePublishDirect = async (platform, content) => {
    const hasAccount = socialAccounts.some(a => a.provider === platform);
    if (!hasAccount) {
      toast.error(`Veuillez d'abord associer votre compte ${platform === 'facebook' ? 'Facebook' : 'Instagram'}.`);
      setShowConnectModal(true);
      return;
    }

    try {
      setPublishingPlatform(platform);
      const payload = {
        eventId,
        platform,
        content,
        mediaUrl: eventInfo?.image || eventInfo?.flyerUrl || eventInfo?.bannerUrl || ''
      };

      const res = await apiPublishSocialPost(payload, token);
      if (res.success && res.data) {
        toast.success(`Publié avec succès sur ${platform === 'facebook' ? 'Facebook' : 'Instagram'} !`);
        setPublishedPosts(prev => ({
          ...prev,
          [platform]: res.data.postUrl
        }));
        loadSocialData();
      } else {
        toast.error(res.message || 'Erreur lors de la publication.');
      }
    } catch (err) {
      console.error('Erreur publication:', err);
      toast.error(err.response?.data?.message || `Erreur lors de la publication sur ${platform}.`);
    } finally {
      setPublishingPlatform(null);
    }
  };

  const fbConnected = socialAccounts.some(a => a.provider === 'facebook');
  const igConnected = socialAccounts.some(a => a.provider === 'instagram');

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 py-6 font-sans space-y-6 text-left">
      <Toaster position="top-center" />
      
      {/* En-tête Studio Marketing */}
      <div className="bg-[#0B1727] rounded-3xl p-8 text-white shadow-xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6 relative overflow-hidden border border-white/10">
        <div className="absolute right-0 top-0 w-96 h-96 bg-[#FF5005]/15 rounded-full blur-3xl pointer-events-none"></div>
        <div className="relative z-10 space-y-2 max-w-2xl">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/10 text-xs font-bold uppercase tracking-wider text-[#EFB810] border border-white/15">
            <Sparkles className="w-3.5 h-3.5" />
            <span>Studio Marketing IA & Multi-Diffusion</span>
          </div>
          <h1 className="text-2xl sm:text-3xl font-black tracking-tight">
            Générateur de Campagnes & Auto-Publication
          </h1>
          <p className="text-xs sm:text-sm text-gray-300 leading-relaxed">
            Rédigez vos messages promotionnels avec Gemini IA et diffusez-les instantanément sur <strong>Facebook</strong> et <strong>Instagram</strong>.
          </p>
        </div>

        <div className="relative z-10 w-14 h-14 rounded-2xl bg-gradient-to-tr from-[#FF5005] to-orange-400 flex items-center justify-center text-white text-2xl shadow-lg shadow-orange-500/25 shrink-0">
          <Megaphone size={26} />
        </div>
      </div>

      {/* BARRE D'ÉTAT DES COMPTES RÉSEAUX SOCIAUX */}
      <div className="bg-white rounded-3xl border border-gray-200/80 p-5 shadow-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] flex items-center justify-center font-bold">
            <Link2 className="w-5 h-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-sm font-extrabold text-gray-900">Comptes Réseaux Sociaux Liés</h3>
              <span className="text-[10px] px-2 py-0.5 rounded-full bg-gray-100 font-bold text-gray-600">
                {socialAccounts.length} connecté(s)
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              <span className={`inline-flex items-center gap-1 font-semibold ${fbConnected ? 'text-blue-600' : 'text-gray-400'}`}>
                <MessageSquare className="w-3.5 h-3.5" /> {fbConnected ? 'Facebook lié' : 'Facebook non lié'}
              </span>
              <span className="text-gray-300">•</span>
              <span className={`inline-flex items-center gap-1 font-semibold ${igConnected ? 'text-pink-600' : 'text-gray-400'}`}>
                <Share2 className="w-3.5 h-3.5" /> {igConnected ? 'Instagram lié' : 'Instagram non lié'}
              </span>
            </div>
          </div>
        </div>

        <button
          type="button"
          onClick={() => setShowConnectModal(true)}
          className="px-4 py-2 bg-[#0B1727] hover:bg-black text-white rounded-xl text-xs font-bold transition flex items-center gap-2 shadow-xs cursor-pointer"
        >
          <span>Gérer les comptes Meta</span>
          <ExternalLink className="w-3.5 h-3.5" />
        </button>
      </div>

      {/* SECTION 1 : FORMULAIRE DE CONFIGURATION */}
      <div className="bg-white rounded-3xl border border-gray-200/80 shadow-xs p-6 sm:p-8 space-y-6">
        <div className="border-b border-gray-100 pb-4 flex items-center justify-between">
          <div>
            <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
              <Target className="w-5 h-5 text-[#FF5005]" />
              <span>Paramètres de la Campagne</span>
            </h2>
            <p className="text-xs text-gray-400 mt-0.5">Renseignez les spécificités de votre événement.</p>
          </div>
          <span className="text-xs font-bold px-3 py-1 rounded-full bg-orange-50 text-[#FF5005] border border-orange-200">
            {eventInfo?.categorie || 'Événement Public'}
          </span>
        </div>

        <form onSubmit={handleGenerate} className="space-y-6">
          
          {/* Sélection du ton */}
          <div>
            <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-2.5">
              1. Tonalité & Style de Rédaction
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
              {MARKETING_TONES.map((t) => {
                const isSelected = selectedTone === t.label;
                return (
                  <button
                    key={t.id}
                    type="button"
                    onClick={() => setSelectedTone(t.label)}
                    className={`p-3.5 rounded-2xl border text-left transition-all cursor-pointer ${
                      isSelected
                        ? 'border-[#FF5005] bg-orange-50/50 shadow-xs ring-2 ring-[#FF5005]/20'
                        : 'border-gray-200 hover:border-gray-300 bg-gray-50/50 text-gray-600'
                    }`}
                  >
                    <div className={`text-xs font-bold ${isSelected ? 'text-[#FF5005]' : 'text-gray-800'}`}>
                      {t.label}
                    </div>
                    <div className="text-[11px] text-gray-500 mt-1 leading-tight">
                      {t.desc}
                    </div>
                  </button>
                );
              })}
            </div>
          </div>

          {/* Grille des champs */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                2. Artistes / Intervenants
              </label>
              <input
                type="text"
                value={artists}
                onChange={(e) => setArtists(e.target.value)}
                placeholder="Ex: DJ Snake, Maître Gims..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FF5005] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                3. Audience Cible
              </label>
              <input
                type="text"
                value={targetAudience}
                onChange={(e) => setTargetAudience(e.target.value)}
                placeholder="Ex: 18-35 ans, Passionnés..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FF5005] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                4. Points Forts & Expérience
              </label>
              <input
                type="text"
                value={highlights}
                onChange={(e) => setHighlights(e.target.value)}
                placeholder="Ex: Show 3D, Scène 360°..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FF5005] focus:bg-white"
              />
            </div>

            <div>
              <label className="block text-xs font-extrabold text-gray-700 uppercase tracking-wider mb-1.5">
                5. Offres Spéciales (Optionnel)
              </label>
              <input
                type="text"
                value={specialOffers}
                onChange={(e) => setSpecialOffers(e.target.value)}
                placeholder="Ex: Early Bird -30%..."
                className="w-full bg-gray-50 border border-gray-200 rounded-xl px-4 py-2.5 text-xs text-gray-800 focus:outline-none focus:border-[#FF5005] focus:bg-white"
              />
            </div>
          </div>

          {/* Bouton de soumission */}
          <div className="pt-2">
            <button
              type="submit"
              disabled={loading}
              className={`w-full py-3.5 px-6 rounded-xl font-bold text-xs uppercase tracking-wider transition-all flex items-center justify-center gap-2 shadow-md cursor-pointer ${
                loading
                  ? 'bg-gray-800 text-gray-400 cursor-not-allowed'
                  : 'bg-[#FF5005] hover:bg-[#ff6220] text-white shadow-orange-500/25'
              }`}
            >
              {loading ? (
                <>
                  <RefreshCw className="w-4 h-4 animate-spin" />
                  <span>Rédaction IA en cours...</span>
                </>
              ) : (
                <>
                  <Sparkles className="w-4 h-4" />
                  <span>Générer la Campagne Marketing Complète</span>
                </>
              )}
            </button>
          </div>

        </form>
      </div>

      {/* SECTION 2 : RÉSULTATS DE LA CAMPAGNE */}
      {result && (
        <div id="marketing-results-section" className="space-y-6">
          
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <h2 className="text-base font-extrabold text-gray-900 flex items-center gap-2">
                <Sparkles className="w-4 h-4 text-[#FF5005]" />
                <span>Contenus Générés & Publication Directe</span>
              </h2>
              <p className="text-xs text-gray-400">Publiez directement ou copiez les textes.</p>
            </div>

            <div className="flex flex-wrap gap-1.5 bg-gray-100 p-1 rounded-xl border border-gray-200 max-w-max">
              {[
                { id: 'all', label: 'Tous' },
                { id: 'instagram', label: 'Instagram' },
                { id: 'facebook', label: 'Facebook' },
                { id: 'seo', label: 'SEO' },
                { id: 'newsletter', label: 'Newsletter' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  type="button"
                  onClick={() => setActiveChannel(tab.id)}
                  className={`px-3 py-1 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    activeChannel === tab.id
                      ? 'bg-white text-[#FF5005] shadow-xs'
                      : 'text-gray-600 hover:text-gray-900'
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>
          </div>

          {result.punchline && (
            <div className="bg-orange-50/50 border border-orange-200 rounded-2xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="space-y-1">
                <span className="text-[10px] font-extrabold uppercase tracking-wider text-[#FF5005] flex items-center gap-1.5">
                  <Flame className="w-3.5 h-3.5" /> Slogan / Accroche Publicitaire
                </span>
                <p className="text-sm font-black text-gray-900 italic">
                  « {result.punchline} »
                </p>
              </div>
              <button
                onClick={() => handleCopy(result.punchline, 'punchline')}
                className="px-3 py-1.5 bg-white text-gray-700 rounded-lg text-xs font-bold border border-gray-200 shadow-xs transition flex items-center gap-1 cursor-pointer"
              >
                {copiedKey === 'punchline' ? <Check className="w-3.5 h-3.5 text-emerald-600" /> : <Copy className="w-3.5 h-3.5" />}
                <span>{copiedKey === 'punchline' ? 'Copié !' : 'Copier'}</span>
              </button>
            </div>
          )}

          {/* Grille des Cartes */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">

            {/* Instagram */}
            {(activeChannel === 'all' || activeChannel === 'instagram') && (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-gray-900">
                      <InstagramIcon size={18} />
                      <span>Instagram & TikTok</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                    {result.instagramPost || 'Non disponible'}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePublishDirect('instagram', result.instagramPost)}
                    disabled={publishingPlatform === 'instagram'}
                    className="w-full py-2.5 bg-gradient-to-r from-purple-600 via-pink-600 to-amber-500 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publier sur Instagram</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(result.instagramPost, 'instagram')}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le texte</span>
                  </button>
                </div>
              </div>
            )}

            {/* Facebook */}
            {(activeChannel === 'all' || activeChannel === 'facebook') && (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 font-bold text-xs uppercase text-[#1877F2]">
                      <FacebookIcon size={18} />
                      <span>Facebook</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                    {result.facebookPost || 'Non disponible'}
                  </div>
                </div>

                <div className="space-y-2">
                  <button
                    type="button"
                    onClick={() => handlePublishDirect('facebook', result.facebookPost)}
                    disabled={publishingPlatform === 'facebook'}
                    className="w-full py-2.5 bg-blue-600 hover:bg-blue-700 text-white rounded-xl text-xs font-bold flex items-center justify-center gap-2 transition cursor-pointer shadow-xs disabled:opacity-50"
                  >
                    <Send className="w-3.5 h-3.5" />
                    <span>Publier sur Facebook</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => handleCopy(result.facebookPost, 'facebook')}
                    className="w-full py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                  >
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copier le texte</span>
                  </button>
                </div>
              </div>
            )}

            {/* SEO */}
            {(activeChannel === 'all' || activeChannel === 'seo') && (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 text-emerald-600 font-bold text-xs uppercase">
                      <Globe className="w-4 h-4" />
                      <span>Description SEO & Billetterie</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                    {result.seoDescription || 'Non disponible'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(result.seoDescription, 'seo')}
                  className="w-full py-2.5 bg-[#0B1727] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier pour la billetterie</span>
                </button>
              </div>
            )}

            {/* Newsletter */}
            {(activeChannel === 'all' || activeChannel === 'newsletter') && (
              <div className="bg-white rounded-3xl border border-gray-200/80 p-6 shadow-xs flex flex-col justify-between space-y-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                    <div className="flex items-center gap-2 text-purple-600 font-bold text-xs uppercase">
                      <Mail className="w-4 h-4" />
                      <span>Newsletter & Emailing</span>
                    </div>
                  </div>
                  <div className="bg-gray-50 p-4 rounded-xl text-xs text-gray-800 whitespace-pre-line leading-relaxed max-h-56 overflow-y-auto">
                    {result.newsletterBody || 'Non disponible'}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => handleCopy(`Objet : ${result.newsletterSubject}\n\n${result.newsletterBody}`, 'newsletter')}
                  className="w-full py-2.5 bg-[#0B1727] hover:bg-black text-white rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition cursor-pointer"
                >
                  <Copy className="w-3.5 h-3.5" />
                  <span>Copier le mail complet</span>
                </button>
              </div>
            )}

          </div>

        </div>
      )}

      {/* Modal Association Meta */}
      <SocialConnectModal
        isOpen={showConnectModal}
        onClose={() => setShowConnectModal(false)}
        token={token}
        onAccountsUpdated={loadSocialData}
      />

    </div>
  );
}
