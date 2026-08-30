import React from 'react';
import { 
  ShoppingBag, ArrowRight, ShieldCheck, Clock, 
  Sparkles, Lock, CheckCircle2, Ticket 
} from 'lucide-react';
import { motion } from 'framer-motion';

/**
 * Récapitulatif de Commande Flottant (Desktop Sticky Card & Mobile Floating Bottom Bar)
 */
export const CheckoutDrawer = ({
  categories = [],
  selectedQuantities = {},
  onProceedToCheckout,
  isLocking = false,
  currency = 'FCFA'
}) => {
  const totalSelectedTickets = Object.values(selectedQuantities).reduce((a, b) => a + b, 0);

  const calculateSubtotal = () => {
    return categories.reduce((sum, cat) => {
      const qty = selectedQuantities[cat.id] || 0;
      return sum + (cat.price * qty);
    }, 0);
  };

  const subtotal = calculateSubtotal();

  const selectedBreakdown = categories
    .filter(cat => (selectedQuantities[cat.id] || 0) > 0)
    .map(cat => ({
      name: cat.name,
      quantity: selectedQuantities[cat.id],
      total: cat.price * selectedQuantities[cat.id]
    }));

  return (
    <>
      {/* 1. Version Desktop (Sticky Card dans la colonne latérale) */}
      <div className="hidden lg:block">
        <div className="bg-[#0E1522]/95 border border-white/10 backdrop-blur-xl rounded-3xl p-6 sm:p-7 shadow-2xl sticky top-8 space-y-6 text-left">
          
          <div className="flex items-center justify-between border-b border-white/10 pb-4">
            <h3 className="font-black text-lg text-white flex items-center gap-2">
              <ShoppingBag size={20} className="text-[#FF5005]" />
              Mon Panier
            </h3>
            <span className="text-xs font-extrabold bg-white/10 px-2.5 py-1 rounded-full text-slate-300">
              {totalSelectedTickets} billet{totalSelectedTickets > 1 ? 's' : ''}
            </span>
          </div>

          {/* Liste des billets sélectionnés */}
          {totalSelectedTickets === 0 ? (
            <div className="py-8 text-center space-y-3">
              <div className="w-12 h-12 rounded-2xl bg-white/[0.04] border border-white/10 flex items-center justify-center text-slate-400 mx-auto">
                <Ticket size={24} />
              </div>
              <p className="text-xs text-slate-400">
                Sélectionnez un ou plusieurs billets pour continuer votre réservation.
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              {selectedBreakdown.map((item, idx) => (
                <div key={idx} className="flex justify-between items-center text-xs py-1">
                  <div className="text-slate-300">
                    <span className="font-bold text-white">{item.quantity}x</span> {item.name}
                  </div>
                  <div className="font-black text-white">
                    {item.total === 0 ? 'Gratuit' : `${item.total.toLocaleString('fr-FR')} ${currency}`}
                  </div>
                </div>
              ))}

              <div className="border-t border-white/10 pt-4 space-y-2 text-xs">
                <div className="flex justify-between text-slate-400">
                  <span>Sous-total billets</span>
                  <span className="font-bold text-white">{subtotal.toLocaleString('fr-FR')} {currency}</span>
                </div>
                <div className="flex justify-between text-slate-400">
                  <span>Frais de réservation & TVA</span>
                  <span className="font-bold text-emerald-400">Inclus (0 {currency})</span>
                </div>

                <div className="border-t border-white/10 pt-3 flex justify-between items-baseline">
                  <div>
                    <span className="font-black text-sm text-white block">Total à payer</span>
                    <span className="text-[10px] text-slate-400">Paiement 100% sécurisé</span>
                  </div>
                  <div className="text-right">
                    <span className="text-2xl sm:text-3xl font-black text-white">
                      {subtotal.toLocaleString('fr-FR')}
                    </span>
                    <span className="text-sm sm:text-base font-bold text-[#FF5005] ml-1">{currency}</span>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* Bouton d'action */}
          <motion.button
            type="button"
            disabled={totalSelectedTickets === 0 || isLocking}
            onClick={onProceedToCheckout}
            whileHover={totalSelectedTickets > 0 ? { scale: 1.02, boxShadow: '0 10px 30px -5px rgba(255, 80, 5, 0.4)' } : {}}
            whileTap={totalSelectedTickets > 0 ? { scale: 0.98 } : {}}
            className="w-full py-4 bg-gradient-to-r from-[#FF5005] to-[#FF7A00] hover:from-[#ff5e19] hover:to-[#ff8819] text-white font-extrabold text-xs uppercase tracking-wider rounded-2xl shadow-xl shadow-orange-500/25 flex items-center justify-center gap-2 transition disabled:opacity-35 disabled:cursor-not-allowed cursor-pointer"
          >
            {isLocking ? (
              <div className="flex items-center gap-2">
                <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                <span>Réservation en cours...</span>
              </div>
            ) : (
              <>
                <span>Valider mes {totalSelectedTickets} billet{totalSelectedTickets > 1 ? 's' : ''}</span>
                <ArrowRight size={16} />
              </>
            )}
          </motion.button>

          {/* Réassurance & Badges */}
          <div className="pt-2 border-t border-white/10 space-y-2 text-[11px] text-slate-400">
            <div className="flex items-center gap-2">
              <ShieldCheck size={15} className="text-emerald-400 shrink-0" />
              <span>Chiffrement SSL 256-bit & QR Code unique</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
              <span>Remboursement garanti si report ou annulation</span>
            </div>
          </div>

        </div>
      </div>

      {/* 2. Version Mobile (Sticky Floating Bottom Bar) */}
      <div className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#090D16]/95 backdrop-blur-2xl border-t border-white/15 p-4 shadow-2xl">
        <div className="max-w-md mx-auto flex items-center justify-between gap-4">
          <div>
            <span className="text-[10px] font-extrabold uppercase text-slate-400 block">
              {totalSelectedTickets} billet{totalSelectedTickets > 1 ? 's' : ''} sélectionné{totalSelectedTickets > 1 ? 's' : ''}
            </span>
            <div className="flex items-baseline gap-1">
              <span className="text-2xl font-black text-white">
                {subtotal.toLocaleString('fr-FR')}
              </span>
              <span className="text-xs sm:text-sm font-bold text-[#FF5005]">{currency}</span>
            </div>
          </div>

          <button
            type="button"
            disabled={totalSelectedTickets === 0 || isLocking}
            onClick={onProceedToCheckout}
            className="flex-1 max-w-[200px] py-3.5 bg-[#FF5005] hover:bg-[#ff6420] text-white font-black text-xs uppercase tracking-wider rounded-xl shadow-lg shadow-orange-500/30 flex items-center justify-center gap-1.5 transition disabled:opacity-40 cursor-pointer active:scale-95"
          >
            {isLocking ? (
              <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
            ) : (
              <>
                <span>Commander</span>
                <ArrowRight size={14} />
              </>
            )}
          </button>
        </div>
      </div>
    </>
  );
};

export default CheckoutDrawer;
