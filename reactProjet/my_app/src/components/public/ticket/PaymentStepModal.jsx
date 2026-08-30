import React, { useState } from 'react';
import { 
  CreditCard, Smartphone, ShieldCheck, Lock, 
  Clock, ArrowLeft, CheckCircle2, AlertCircle, 
  Sparkles, Check, ChevronRight 
} from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

/**
 * Tunnel d'Achat Sécurisé & Paiement (Cartes, Mobile Money, Apple Pay)
 */
export const PaymentStepModal = ({
  isOpen,
  onClose,
  totalAmount = 0,
  timeLeft = 600,
  onCompleteOrder,
  isProcessing = false,
  currency = 'FCFA'
}) => {
  const [buyerInfo, setBuyerInfo] = useState({
    name: '',
    email: '',
    confirmEmail: '',
    phone: '',
    paymentMethod: 'card', // 'card' | 'momo' | 'applepay'
    momoProvider: 'orange', // 'orange' | 'mtn' | 'wave'
    momoPhone: ''
  });

  const [formErrors, setFormErrors] = useState({});

  if (!isOpen) return null;

  const validateForm = () => {
    const errors = {};
    if (!buyerInfo.name.trim()) errors.name = "Veuillez renseigner votre nom complet.";
    if (!buyerInfo.email.trim() || !/\S+@\S+\.\S+/.test(buyerInfo.email)) {
      errors.email = "Adresse email invalide.";
    }
    if (buyerInfo.email.trim() !== buyerInfo.confirmEmail.trim()) {
      errors.confirmEmail = "Les adresses emails ne correspondent pas.";
    }
    if (buyerInfo.paymentMethod === 'momo' && !buyerInfo.momoPhone.trim()) {
      errors.momoPhone = "Veuillez renseigner votre numéro Mobile Money.";
    }
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    onCompleteOrder({
      buyerName: buyerInfo.name.trim(),
      buyerEmail: buyerInfo.email.trim(),
      buyerPhone: buyerInfo.phone.trim(),
      paymentMethod: buyerInfo.paymentMethod
    });
  };

  const minutes = Math.floor(timeLeft / 60);
  const seconds = (timeLeft % 60).toString().padStart(2, '0');
  const isTimeCritical = timeLeft < 120;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={!isProcessing ? onClose : undefined}
        className="fixed inset-0 bg-black/85 backdrop-blur-md"
      />

      {/* Modal Container */}
      <motion.div
        initial={{ scale: 0.95, opacity: 0, y: 20 }}
        animate={{ scale: 1, opacity: 1, y: 0 }}
        exit={{ scale: 0.95, opacity: 0, y: 20 }}
        className="relative bg-[#0E1522] border border-white/15 rounded-3xl p-6 sm:p-8 max-w-xl w-full shadow-2xl text-left z-10 my-8 space-y-6"
      >
        
        {/* En-tête avec Minuteur Time-Lock */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-white/10 pb-5">
          <div>
            <span className="text-[11px] font-black uppercase tracking-widest text-[#FF5005] block">
              Étape finale • Validation de commande
            </span>
            <h2 className="text-xl font-black text-white">Coordonnées & Paiement</h2>
          </div>

          <div
            className={`flex items-center gap-2 px-3.5 py-1.5 rounded-2xl border ${
              isTimeCritical
                ? 'bg-red-500/15 text-red-400 border-red-500/30 animate-pulse'
                : 'bg-amber-500/15 text-amber-300 border-amber-500/30'
            }`}
          >
            <Clock size={16} />
            <span className="font-mono font-black text-sm">{minutes}:{seconds}</span>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          
          {/* Section 1 : Informations Acheteur */}
          <div className="space-y-4">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              1. Titulaire de la commande
            </h3>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Nom & Prénom complets *
              </label>
              <input
                type="text"
                required
                value={buyerInfo.name}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, name: e.target.value }))}
                placeholder="Ex: Alexandre Dubois"
                className="w-full bg-[#090D16] border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5005] transition"
              />
              {formErrors.name && (
                <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                  <AlertCircle size={12} /> {formErrors.name}
                </p>
              )}
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Adresse E-mail (Réception des billets) *
                </label>
                <input
                  type="email"
                  required
                  value={buyerInfo.email}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, email: e.target.value }))}
                  placeholder="alexandre@example.com"
                  className="w-full bg-[#090D16] border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5005] transition"
                />
                {formErrors.email && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {formErrors.email}
                  </p>
                )}
              </div>

              <div>
                <label className="block text-xs font-bold text-slate-300 mb-1.5">
                  Confirmez votre adresse E-mail *
                </label>
                <input
                  type="email"
                  required
                  value={buyerInfo.confirmEmail}
                  onChange={(e) => setBuyerInfo(prev => ({ ...prev, confirmEmail: e.target.value }))}
                  placeholder="alexandre@example.com"
                  className="w-full bg-[#090D16] border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5005] transition"
                />
                {formErrors.confirmEmail && (
                  <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                    <AlertCircle size={12} /> {formErrors.confirmEmail}
                  </p>
                )}
              </div>
            </div>

            <div>
              <label className="block text-xs font-bold text-slate-300 mb-1.5">
                Numéro de Téléphone (Pour alertes SMS / WhatsApp)
              </label>
              <input
                type="tel"
                value={buyerInfo.phone}
                onChange={(e) => setBuyerInfo(prev => ({ ...prev, phone: e.target.value }))}
                placeholder="+33 6 12 34 56 78"
                className="w-full bg-[#090D16] border border-white/15 rounded-2xl px-4 py-3 text-sm text-white focus:outline-none focus:border-[#FF5005] transition"
              />
            </div>
          </div>

          {/* Section 2 : Mode de Paiement Sécurisé */}
          <div className="space-y-4 pt-2 border-t border-white/10">
            <h3 className="text-xs font-black uppercase tracking-wider text-slate-400">
              2. Mode de paiement sécurisé
            </h3>

            {/* Onglets des modes de paiement */}
            <div className="grid grid-cols-3 gap-2.5">
              
              {/* Carte Bancaire */}
              <button
                type="button"
                onClick={() => setBuyerInfo(prev => ({ ...prev, paymentMethod: 'card' }))}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  buyerInfo.paymentMethod === 'card'
                    ? 'bg-[#FF5005]/15 border-[#FF5005] text-white shadow-lg shadow-orange-500/15'
                    : 'bg-[#090D16] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <CreditCard size={20} className={buyerInfo.paymentMethod === 'card' ? 'text-[#FF5005]' : ''} />
                <span className="text-xs font-extrabold">Carte Bancaire</span>
              </button>

              {/* Mobile Money */}
              <button
                type="button"
                onClick={() => setBuyerInfo(prev => ({ ...prev, paymentMethod: 'momo' }))}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  buyerInfo.paymentMethod === 'momo'
                    ? 'bg-amber-500/15 border-amber-500 text-white shadow-lg shadow-amber-500/15'
                    : 'bg-[#090D16] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <Smartphone size={20} className={buyerInfo.paymentMethod === 'momo' ? 'text-amber-400' : ''} />
                <span className="text-xs font-extrabold">Mobile Money</span>
              </button>

              {/* Apple Pay / Google Pay */}
              <button
                type="button"
                onClick={() => setBuyerInfo(prev => ({ ...prev, paymentMethod: 'applepay' }))}
                className={`p-3 rounded-2xl border text-center transition cursor-pointer flex flex-col items-center gap-1.5 ${
                  buyerInfo.paymentMethod === 'applepay'
                    ? 'bg-blue-500/15 border-blue-500 text-white shadow-lg shadow-blue-500/15'
                    : 'bg-[#090D16] border-white/10 text-slate-400 hover:text-white'
                }`}
              >
                <span className="text-lg font-bold">Pay</span>
                <span className="text-xs font-extrabold">1-Click Express</span>
              </button>

            </div>

            {/* Champs contextuels selon le mode sélectionné */}
            {buyerInfo.paymentMethod === 'card' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <div className="flex items-center justify-between text-xs text-slate-300">
                  <span>Cartes acceptées :</span>
                  <span className="font-extrabold text-white">CB, Visa, Mastercard, AMEX</span>
                </div>
                <p className="text-[11px] text-slate-400 leading-relaxed">
                  Vous allez être redirigé vers l'interface de paiement bancaire sécurisée avec authentification 3D Secure.
                </p>
              </div>
            )}

            {buyerInfo.paymentMethod === 'momo' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 space-y-3">
                <label className="block text-xs font-bold text-slate-300">
                  Opérateur Mobile Money :
                </label>
                <div className="flex gap-2">
                  {[
                    { id: 'orange', label: 'Orange Money' },
                    { id: 'mtn', label: 'MTN MoMo' },
                    { id: 'wave', label: 'Wave' }
                  ].map(op => (
                    <button
                      key={op.id}
                      type="button"
                      onClick={() => setBuyerInfo(prev => ({ ...prev, momoProvider: op.id }))}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition cursor-pointer border ${
                        buyerInfo.momoProvider === op.id
                          ? 'bg-amber-500/20 text-amber-300 border-amber-500/40'
                          : 'bg-black/30 text-slate-400 border-white/10'
                      }`}
                    >
                      {op.label}
                    </button>
                  ))}
                </div>
                <div>
                  <label className="block text-xs font-bold text-slate-300 mb-1">
                    Numéro de compte {buyerInfo.momoProvider.toUpperCase()} :
                  </label>
                  <input
                    type="tel"
                    value={buyerInfo.momoPhone}
                    onChange={(e) => setBuyerInfo(prev => ({ ...prev, momoPhone: e.target.value }))}
                    placeholder="Ex: 07 12 34 56 78"
                    className="w-full bg-[#090D16] border border-white/15 rounded-xl px-4 py-2 text-sm text-white focus:outline-none focus:border-amber-400"
                  />
                  {formErrors.momoPhone && (
                    <p className="text-[11px] text-red-400 mt-1 flex items-center gap-1">
                      <AlertCircle size={12} /> {formErrors.momoPhone}
                    </p>
                  )}
                </div>
              </div>
            )}

            {buyerInfo.paymentMethod === 'applepay' && (
              <div className="p-4 rounded-2xl bg-white/[0.03] border border-white/10 text-center space-y-2">
                <p className="text-xs text-slate-300">
                  Validation instantanée via Face ID / Touch ID sur votre appareil Apple.
                </p>
              </div>
            )}

          </div>

          {/* Récapitulatif Total & Boutons d'Action */}
          <div className="border-t border-white/10 pt-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div>
              <span className="text-[10px] font-extrabold uppercase tracking-wider text-slate-400 block">
                Montant total débité
              </span>
              <div className="flex items-baseline gap-1">
                <span className="text-2xl sm:text-3xl font-black text-white">
                  {totalAmount.toLocaleString('fr-FR')}
                </span>
                <span className="text-sm sm:text-base font-bold text-[#FF5005] ml-1">{currency}</span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              <button
                type="button"
                disabled={isProcessing}
                onClick={onClose}
                className="px-5 py-3 rounded-2xl bg-white/5 hover:bg-white/10 text-slate-300 font-bold text-xs uppercase tracking-wider transition cursor-pointer"
              >
                Retour
              </button>

              <motion.button
                type="submit"
                disabled={isProcessing}
                whileHover={!isProcessing ? { scale: 1.02, boxShadow: '0 10px 25px -5px rgba(255, 80, 5, 0.4)' } : {}}
                whileTap={!isProcessing ? { scale: 0.98 } : {}}
                className="px-7 py-3.5 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5f1b] hover:to-[#ff861b] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition disabled:opacity-50 cursor-pointer"
              >
                {isProcessing ? (
                  <div className="flex items-center gap-2">
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    <span>Sécurisation & Émission...</span>
                  </div>
                ) : (
                  <>
                    <Lock size={14} />
                    <span>Payer & Recevoir mes Billets</span>
                  </>
                )}
              </motion.button>
            </div>
          </div>

          {/* Badges de confiance */}
          <div className="flex flex-wrap items-center justify-center gap-4 pt-2 text-[10px] text-slate-400 font-medium">
            <span className="flex items-center gap-1">
              <ShieldCheck size={13} className="text-emerald-400" /> Chiffrement SSL 256-bit
            </span>
            <span>•</span>
            <span>Conforme PCI-DSS Level 1</span>
            <span>•</span>
            <span>Protocole 3D Secure v2</span>
          </div>

        </form>

      </motion.div>
    </div>
  );
};

export default PaymentStepModal;
