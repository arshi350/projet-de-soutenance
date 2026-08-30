import React, { useState, useEffect } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  Sparkles, Ticket, ShieldCheck, CheckCircle2, 
  AlertTriangle, ArrowLeft, ArrowRight, UserCheck, 
  Heart, Share2, Calendar, Clock, MapPin, Download, 
  Check, RefreshCw, Lock 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import api, { API_BASE_URL } from '../../services/api';

// Composants modulaires de la billetterie
import TicketCard from '../../components/public/ticket/TicketCard';
import QuickInfoBar from '../../components/public/ticket/QuickInfoBar';
import AddToCalendarModal from '../../components/public/ticket/AddToCalendarModal';
import EventDetailsTabs from '../../components/public/ticket/EventDetailsTabs';
import CheckoutDrawer from '../../components/public/ticket/CheckoutDrawer';
import PaymentStepModal from '../../components/public/ticket/PaymentStepModal';
import ETicketCard from '../../components/public/ticket/ETicketCard';

export const PublicEventLanding = () => {
  const { eventId } = useParams();

  // Données de l'événement et catégories
  const [eventData, setEventData] = useState(null);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // État du panier & des étapes ( 'select' | 'success' )
  const [selectedQuantities, setSelectedQuantities] = useState({});
  const [step, setStep] = useState('select');

  // Modals & Tiroirs
  const [isCalendarModalOpen, setIsCalendarModalOpen] = useState(false);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);

  // Time-lock (10 minutes)
  const [lockToken, setLockToken] = useState(null);
  const [timeLeft, setTimeLeft] = useState(600);
  const [isLocking, setIsLocking] = useState(false);
  const [isProcessingPayment, setIsProcessingPayment] = useState(false);

  // Résultats après paiement
  const [purchasedTickets, setPurchasedTickets] = useState([]);
  const [transactionId, setTransactionId] = useState('');
  const [buyerEmail, setBuyerEmail] = useState('');

  // Organisateur : bouton suivre interactif
  const [isFollowing, setIsFollowing] = useState(false);
  const [followersCount, setFollowersCount] = useState(1420);

  // 1. Charger les données publiques de l'événement
  const fetchEventDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const res = await api.get(`/public/event/${eventId}`);
      if (res.data.success) {
        setEventData(res.data.event);
        setCategories(res.data.categories || []);
      } else {
        setError(res.data.message || "Événement introuvable.");
      }
    } catch (err) {
      console.error("Erreur lors du chargement de l'événement:", err);
      setError(err.response?.data?.message || "Impossible de charger la billetterie officielle.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (eventId) {
      fetchEventDetails();
    }
  }, [eventId]);

  // 2. Décompte du timer de 10 minutes lors de la réservation
  useEffect(() => {
    let interval = null;
    if (isPaymentModalOpen && timeLeft > 0) {
      interval = setInterval(() => {
        setTimeLeft((prev) => {
          if (prev <= 1) {
            clearInterval(interval);
            setIsPaymentModalOpen(false);
            setLockToken(null);
            alert("Votre session de réservation de 10 minutes a expiré. Les places ont été libérées.");
            return 600;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(interval);
  }, [isPaymentModalOpen, timeLeft]);

  // 3. Gestion de la quantité par catégorie
  const handleQuantityChange = (catId, delta, maxAvailable) => {
    const current = selectedQuantities[catId] || 0;
    const next = Math.max(0, Math.min(maxAvailable || 10, current + delta));
    setSelectedQuantities((prev) => ({
      ...prev,
      [catId]: next,
    }));
  };

  const totalSelectedTickets = Object.values(selectedQuantities).reduce((a, b) => a + b, 0);

  const calculateSubtotal = () => {
    return categories.reduce((sum, cat) => {
      const qty = selectedQuantities[cat.id] || 0;
      return sum + cat.price * qty;
    }, 0);
  };

  // 4. Verrouillage des billets (Time-Lock 10 min) et ouverture du paiement
  const handleProceedToCheckout = async () => {
    if (totalSelectedTickets === 0) return;

    const items = Object.entries(selectedQuantities)
      .filter(([_, qty]) => qty > 0)
      .map(([ticketCategoryId, quantity]) => ({ ticketCategoryId, quantity }));

    try {
      setIsLocking(true);
      const res = await api.post('/public/tickets/lock', {
        eventId,
        items,
      });

      if (res.data.success) {
        setLockToken(res.data.lockToken);
        setTimeLeft(600);
        setIsPaymentModalOpen(true);
      }
    } catch (err) {
      alert(err.response?.data?.message || "Erreur lors de la réservation des billets.");
    } finally {
      setIsLocking(false);
    }
  };

  // 5. Validation de la commande et paiement final
  const handleCompleteOrder = async (orderPayload) => {
    try {
      setIsProcessingPayment(true);
      const res = await api.post('/public/tickets/checkout', {
        lockToken,
        buyerName: orderPayload.buyerName,
        buyerEmail: orderPayload.buyerEmail,
        buyerPhone: orderPayload.buyerPhone,
        paymentMethod: orderPayload.paymentMethod,
      });

      if (res.data.success) {
        setPurchasedTickets(res.data.tickets || []);
        setTransactionId(res.data.transactionId);
        setBuyerEmail(orderPayload.buyerEmail);
        setIsPaymentModalOpen(false);
        setStep('success');
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }
    } catch (err) {
      alert(err.response?.data?.message || "Échec du traitement du paiement.");
    } finally {
      setIsProcessingPayment(false);
    }
  };

  // 6. Calcul du compte à rebours avant l'événement
  const calculateEventCountdown = () => {
    if (!eventData?.DateDebut) return null;
    const diff = new Date(eventData.DateDebut).getTime() - new Date().getTime();
    if (diff <= 0) return { days: 0, hours: 0, minutes: 0, isPast: true };
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    const hours = Math.floor((diff % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
    const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
    return { days, hours, minutes, isPast: false };
  };

  const countdown = calculateEventCountdown();

  // Skeleton Loader ultra-soigné
  if (loading) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex flex-col items-center justify-center p-6 space-y-6">
        <div className="relative">
          <div className="w-16 h-16 rounded-3xl border-4 border-[#FF5005]/20 border-t-[#FF5005] animate-spin" />
          <div className="absolute inset-0 flex items-center justify-center text-[#FF5005]">
            <Ticket size={20} />
          </div>
        </div>
        <div className="text-center space-y-1.5">
          <h3 className="font-black text-base text-white tracking-wide uppercase">
            Chargement de la billetterie certifiée
          </h3>
          <p className="text-xs text-slate-400">
            Initialisation des stocks et vérification des billets en temps réel...
          </p>
        </div>
      </div>
    );
  }

  // Écran d'erreur
  if (error || !eventData) {
    return (
      <div className="min-h-screen bg-[#090D16] text-white flex items-center justify-center p-6">
        <div className="max-w-md w-full bg-[#0E1522] border border-white/10 rounded-3xl p-8 text-center space-y-6 shadow-2xl">
          <div className="w-16 h-16 rounded-3xl bg-red-500/15 border border-red-500/30 flex items-center justify-center text-red-400 mx-auto">
            <AlertTriangle size={32} />
          </div>
          <div className="space-y-2">
            <h2 className="text-2xl font-black text-white">Billetterie Indisponible</h2>
            <p className="text-xs text-slate-300 leading-relaxed">
              {error || "Cet événement n'est pas disponible ou ses ventes sont temporairement suspendues."}
            </p>
          </div>
          <div className="flex flex-col sm:flex-row gap-3 pt-2">
            <button
              onClick={fetchEventDetails}
              className="flex-1 py-3 bg-white/10 hover:bg-white/15 rounded-2xl text-xs font-bold uppercase tracking-wider transition cursor-pointer flex items-center justify-center gap-2"
            >
              <RefreshCw size={14} /> Réessayer
            </button>
            <Link
              to="/"
              className="flex-1 py-3 bg-[#FF5005] hover:bg-[#ff6420] rounded-2xl text-xs font-bold uppercase tracking-wider text-white transition text-center"
            >
              Accueil
            </Link>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#090D16] text-white font-sans relative overflow-x-hidden selection:bg-[#FF5005] selection:text-white">
      
      {/* Glow Orbs décoratifs d'ambiance */}
      <div className="fixed -top-40 -left-40 w-[550px] h-[550px] bg-[#FF5005]/15 rounded-full blur-[160px] pointer-events-none" />
      <div className="fixed top-1/3 -right-40 w-[600px] h-[600px] bg-[#8B5CF6]/15 rounded-full blur-[170px] pointer-events-none" />
      <div className="fixed -bottom-40 left-1/3 w-[500px] h-[500px] bg-[#06B6D4]/10 rounded-full blur-[150px] pointer-events-none" />

      {/* ============================================================== */}
      {/* 1. HERO HEADER IMMERSIF                                        */}
      {/* ============================================================== */}
      <div className="relative border-b border-white/10 overflow-hidden">
        
        {/* Image de couverture avec dégradé d'assombrissement */}
        <div className="absolute inset-0 z-0">
          {eventData.image ? (
            <img
              src={eventData.image}
              alt={eventData.titre}
              className="w-full h-full object-cover object-center scale-105 filter blur-[2px] opacity-40"
            />
          ) : (
            <div className="w-full h-full bg-gradient-to-br from-[#0E1522] via-[#151D2E] to-[#090D16]" />
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-[#090D16] via-[#090D16]/80 to-transparent" />
          <div className="absolute inset-0 bg-gradient-to-r from-[#090D16] via-[#090D16]/60 to-transparent" />
        </div>

        {/* Contenu du Hero */}
        <div className="max-w-6xl mx-auto px-6 py-16 sm:py-24 relative z-10 space-y-6 text-left">
          
          {/* Badges d'état */}
          <div className="flex flex-wrap items-center gap-3">
            <span className="inline-flex items-center gap-1.5 px-3.5 py-1 bg-[#FF5005]/20 border border-[#FF5005]/40 rounded-full text-[#FF5005] text-xs font-black uppercase tracking-wider shadow-lg shadow-orange-500/10">
              <Sparkles size={13} />
              Billetterie Officielle Certifiée
            </span>

            {eventData.categorie && (
              <span className="px-3.5 py-1 bg-white/10 border border-white/15 rounded-full text-slate-200 text-xs font-bold uppercase tracking-wider">
                {eventData.categorie}
              </span>
            )}

            {countdown && !countdown.isPast && (
              <span className="px-3.5 py-1 bg-amber-500/20 border border-amber-500/30 rounded-full text-amber-300 text-xs font-extrabold flex items-center gap-1.5">
                <Clock size={13} />
                J-{countdown.days} ({countdown.hours}h {countdown.minutes}m)
              </span>
            )}
          </div>

          {/* Titre Principal H1 */}
          <h1 className="text-3xl sm:text-5xl lg:text-6xl font-black text-white tracking-tight max-w-4xl leading-[1.1]">
            {eventData.titre}
          </h1>

          {/* Description courte du hero */}
          {eventData.description && (
            <p className="text-slate-300 text-sm sm:text-base max-w-2xl leading-relaxed line-clamp-2">
              {eventData.description}
            </p>
          )}

          {/* Profil Organisateur */}
          <div className="flex flex-wrap items-center gap-4 pt-2">
            <div className="flex items-center gap-3 bg-white/[0.06] border border-white/15 backdrop-blur-md px-4 py-2 rounded-2xl">
              <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-[#FF5005] to-amber-400 flex items-center justify-center text-white font-black text-base shadow-md">
                {(eventData.titre || 'E')[0].toUpperCase()}
              </div>
              <div>
                <div className="flex items-center gap-1.5">
                  <span className="font-extrabold text-sm text-white">Organisateur Vérifié</span>
                  <UserCheck size={14} className="text-blue-400" />
                </div>
                <span className="text-[11px] text-slate-400">
                  {followersCount.toLocaleString('fr-FR')} abonnés
                </span>
              </div>
            </div>

            <button
              type="button"
              onClick={() => {
                setIsFollowing(!isFollowing);
                setFollowersCount(prev => isFollowing ? prev - 1 : prev + 1);
              }}
              className={`px-4 py-2.5 rounded-2xl text-xs font-extrabold uppercase tracking-wider transition-all cursor-pointer flex items-center gap-1.5 ${
                isFollowing
                  ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                  : 'bg-white/10 hover:bg-white/15 text-white border border-white/15'
              }`}
            >
              <Heart size={14} className={isFollowing ? 'fill-emerald-300 text-emerald-300' : ''} />
              <span>{isFollowing ? 'Abonné' : 'Suivre'}</span>
            </button>
          </div>

        </div>
      </div>

      {/* ============================================================== */}
      {/* 2. CORPS PRINCIPAL DE LA PAGE                                  */}
      {/* ============================================================== */}
      <div className="max-w-6xl mx-auto px-6 py-10 space-y-10 relative z-10">
        
        {/* Barre d'informations rapides */}
        <QuickInfoBar
          event={eventData}
          onOpenCalendar={() => setIsCalendarModalOpen(true)}
        />

        {/* ÉTAPE 1 : CHOIX DES BILLETS & CHECKOUT */}
        {step === 'select' && (
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            
            {/* Colonne Gauche : Billets & Onglets Détails */}
            <div className="lg:col-span-8 space-y-8">
              
              {/* En-tête de section billetterie */}
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight flex items-center gap-2.5">
                    <Ticket className="text-[#FF5005]" size={28} />
                    <span>Sélectionnez vos Billets</span>
                  </h2>
                  <p className="text-xs sm:text-sm text-slate-400 mt-1">
                    Choisissez votre catégorie d'accès nominatif officiel
                  </p>
                </div>
              </div>

              {/* Liste des cartes de tickets */}
              <div className="space-y-5">
                {categories.length === 0 ? (
                  <div className="p-10 rounded-3xl bg-[#0E1522] border border-white/10 text-center space-y-3">
                    <Ticket size={36} className="text-slate-400 mx-auto" />
                    <p className="text-slate-300 font-bold text-sm">
                      Aucune catégorie de billet n'est actuellement en vente pour cet événement.
                    </p>
                  </div>
                ) : (
                  categories.map((category) => (
                    <TicketCard
                      key={category.id}
                      category={category}
                      quantity={selectedQuantities[category.id] || 0}
                      onQuantityChange={handleQuantityChange}
                    />
                  ))
                )}
              </div>

              {/* Système d'onglets Description, Line-up, Accès, FAQ */}
              <div className="pt-6">
                <EventDetailsTabs event={eventData} />
              </div>

            </div>

            {/* Colonne Droite : Sticky Panier & Checkout */}
            <div className="lg:col-span-4">
              <CheckoutDrawer
                categories={categories}
                selectedQuantities={selectedQuantities}
                onProceedToCheckout={handleProceedToCheckout}
                isLocking={isLocking}
              />
            </div>

          </div>
        )}

        {/* ÉTAPE 2 : SUCCÈS & E-TICKETS POST-PAIEMENT */}
        {step === 'success' && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="max-w-3xl mx-auto space-y-8"
          >
            {/* Bannière de félicitations */}
            <div className="bg-emerald-500/10 border border-emerald-500/30 rounded-3xl p-8 sm:p-10 text-center space-y-3 shadow-2xl relative overflow-hidden">
              <div className="w-16 h-16 rounded-3xl bg-emerald-500/20 text-emerald-400 border border-emerald-500/40 flex items-center justify-center mx-auto shadow-lg shadow-emerald-500/20">
                <CheckCircle2 size={36} />
              </div>
              <h2 className="text-2xl sm:text-3xl font-black text-white tracking-tight">
                Commande Validée avec Succès !
              </h2>
              <p className="text-slate-300 text-xs sm:text-sm max-w-md mx-auto leading-relaxed">
                Vos billets officiels avec QR Code sécurisé ont été transmis à l'adresse{' '}
                <strong className="text-white">{buyerEmail}</strong>.
              </p>
              <div className="pt-2">
                <span className="inline-block px-3.5 py-1 bg-black/30 border border-white/10 rounded-full font-mono text-xs text-slate-400">
                  Réf: {transactionId || 'TXN-CONFIRMED'}
                </span>
              </div>
            </div>

            {/* Liste des E-Tickets générés */}
            <div className="space-y-6">
              <div className="flex items-center justify-between">
                <h3 className="text-xl font-black text-white flex items-center gap-2">
                  <Ticket size={22} className="text-[#FF5005]" />
                  <span>Vos Billets d'Accès ({purchasedTickets.length})</span>
                </h3>
              </div>

              <div className="space-y-6">
                {purchasedTickets.map((tkt, idx) => (
                  <ETicketCard
                    key={idx}
                    ticket={tkt}
                    event={eventData}
                    apiBaseUrl={API_BASE_URL}
                  />
                ))}
              </div>
            </div>

            {/* Bouton de retour */}
            <div className="text-center pt-4">
              <button
                type="button"
                onClick={() => {
                  setStep('select');
                  setSelectedQuantities({});
                  window.scrollTo({ top: 0, behavior: 'smooth' });
                }}
                className="px-6 py-3 rounded-2xl bg-white/5 hover:bg-white/10 border border-white/10 text-slate-300 font-extrabold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                ← Retourner à la billetterie
              </button>
            </div>

          </motion.div>
        )}

      </div>

      {/* ============================================================== */}
      {/* 3. MODALS GLOBAUX                                              */}
      {/* ============================================================== */}

      {/* Modal Ajout Agenda */}
      <AddToCalendarModal
        isOpen={isCalendarModalOpen}
        onClose={() => setIsCalendarModalOpen(false)}
        event={eventData}
      />

      {/* Modal de Paiement Sécurisé avec Time-Lock 10 min */}
      <PaymentStepModal
        isOpen={isPaymentModalOpen}
        onClose={() => setIsPaymentModalOpen(false)}
        totalAmount={calculateSubtotal()}
        timeLeft={timeLeft}
        onCompleteOrder={handleCompleteOrder}
        isProcessing={isProcessingPayment}
      />

    </div>
  );
};

export default PublicEventLanding;
