import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import { 
  CheckCircle2, 
  XCircle, 
  Calendar, 
  MapPin, 
  Clock, 
  Download, 
  Sparkles, 
  AlertTriangle, 
  Loader2, 
  ShieldCheck, 
  QrCode,
  HeartHandshake,
  Zap,
  ArrowRight,
  Share2,
  Check
} from 'lucide-react';
import { motion } from 'framer-motion';
import { getRsvpDetails, confirmRsvp, declineRsvp } from '../../services/rsvpService';
import { toast, Toaster } from 'react-hot-toast';

export default function RsvpPage() {
  const { token } = useParams();
  const [searchParams] = useSearchParams();
  const initialAction = searchParams.get('action');

  const [loading, setLoading] = useState(true);
  const [submitting, setSubmitting] = useState(false);
  const [invitation, setInvitation] = useState(null);
  const [event, setEvent] = useState(null);
  const [error, setError] = useState(null);
  const [currentStatus, setCurrentStatus] = useState('en attente');

  useEffect(() => {
    if (!token) return;

    const fetchDetails = async () => {
      try {
        setLoading(true);
        const data = await getRsvpDetails(token);
        if (data.success) {
          setInvitation(data.invitation);
          setEvent(data.event);
          setCurrentStatus(data.invitation.rsvpStatus || data.invitation.status || 'en attente');

          if (initialAction === 'confirm' && data.invitation.rsvpStatus !== 'confirmé') {
            handleConfirm();
          } else if (initialAction === 'decline' && data.invitation.rsvpStatus !== 'refusé') {
            handleDecline();
          }
        } else {
          setError(data.message || 'Invitation introuvable');
        }
      } catch (err) {
        console.error('Erreur chargement RSVP:', err);
        setError(err.response?.data?.message || 'Impossible de charger votre invitation.');
      } finally {
        setLoading(false);
      }
    };

    fetchDetails();
  }, [token, initialAction]);

  const handleConfirm = async () => {
    try {
      setSubmitting(true);
      const res = await confirmRsvp(token);
      if (res.success) {
        setCurrentStatus('confirmé');
        toast.success('Présence confirmée avec succès !', { position: 'top-center' });
      }
    } catch (err) {
      console.error('Erreur confirmation:', err);
      toast.error(err.response?.data?.message || 'Erreur lors de la confirmation.', { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  const handleDecline = async () => {
    if (!window.confirm("Êtes-vous sûr(e) de vouloir signaler votre absence ? Votre QR Code sera invalidé.")) return;
    try {
      setSubmitting(true);
      const res = await declineRsvp(token);
      if (res.success) {
        setCurrentStatus('refusé');
        toast.success("Votre absence a bien été enregistrée. Le QR code a été révoqué.", { position: 'top-center' });
      }
    } catch (err) {
      console.error('Erreur refus:', err);
      toast.error(err.response?.data?.message || "Erreur lors de l'enregistrement du refus.", { position: 'top-center' });
    } finally {
      setSubmitting(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex flex-col items-center justify-center text-gray-900 p-4 font-sans">
        <div className="w-16 h-16 rounded-3xl bg-orange-50 border border-orange-200 flex items-center justify-center mb-4 shadow-sm">
          <Loader2 className="w-8 h-8 animate-spin text-[#FF5005]" />
        </div>
        <p className="text-xs uppercase tracking-widest font-extrabold text-gray-500">
          Chargement sécurisé de votre invitation...
        </p>
      </div>
    );
  }

  if (error || !invitation) {
    return (
      <div className="min-h-screen bg-[#F8FAFC] flex items-center justify-center p-6 font-sans">
        <div className="bg-white border border-gray-200 rounded-3xl p-8 max-w-md w-full text-center shadow-xl">
          <div className="w-16 h-16 bg-red-50 text-red-500 rounded-2xl flex items-center justify-center mx-auto mb-4 border border-red-200">
            <XCircle className="w-8 h-8" />
          </div>
          <h2 className="text-xl font-extrabold text-gray-900 mb-2">Invitation Introuvable</h2>
          <p className="text-xs text-gray-500 mb-6 leading-relaxed">
            {error || "Ce lien d'invitation est invalide ou a expiré."}
          </p>
        </div>
      </div>
    );
  }

  const isVip = (invitation.guestStatus || invitation.status || '').toLowerCase() === 'vip';
  const isRevoked = currentStatus === 'refusé' || invitation.isRevoked === true;
  const isConfirmed = currentStatus === 'confirmé';
  const guestFullName = `${invitation.prenom || ''} ${invitation.nom || ''}`.trim() || 'Cher(e) Invité(e)';
  const formattedDate = event?.DateDebut 
    ? new Date(event.DateDebut).toLocaleDateString('fr-FR', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' }) 
    : 'Date à confirmer';

  return (
    <div className="min-h-screen bg-[#F8FAFC] text-gray-900 flex flex-col justify-between py-10 px-4 font-sans relative overflow-hidden">
      <Toaster position="top-center" />
      
      {/* Background ambient orbs */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-orange-500/5 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-blue-500/5 rounded-full blur-[100px] pointer-events-none" />

      {/* Conteneur Central VIP Thème Clair */}
      <motion.div 
        initial={{ opacity: 0, y: 15 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4 }}
        className="max-w-xl mx-auto w-full bg-white border border-gray-200 rounded-3xl overflow-hidden shadow-xl relative z-10"
      >
        {/* Bandeau Lumineux Supérieur */}
        <div className={`h-2 bg-gradient-to-r ${
          isVip 
            ? 'from-[#EFB810] via-[#FF5005] to-[#0B1727]' 
            : 'from-[#FF5005] via-[#EFB810] to-[#0B1727]'
        }`} />

        {/* En-tête Protocolaire */}
        <div className="p-6 sm:p-8 text-center border-b border-gray-100 bg-gray-50/40">
          <span className={`inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-wider ${
            isVip 
              ? 'bg-amber-50 text-[#B45309] border border-amber-200' 
              : 'bg-orange-50 text-[#FF5005] border border-orange-200'
          }`}>
            <Sparkles size={12} />
            {isVip ? 'INVITATION PRIVILÈGE VIP' : 'INVITATION OFFICIELLE'}
          </span>

          <h1 className="text-2xl sm:text-3xl font-black text-gray-900 tracking-tight mt-3 mb-2">
            {event?.titre || 'Événement Exclusif'}
          </h1>

          <p className="text-xs sm:text-sm text-gray-500 font-medium">
            Bonjour <span className="text-[#FF5005] font-extrabold">{guestFullName}</span>, veuillez confirmer votre présence.
          </p>
        </div>

        {/* Visuel du Billet Personnalisé IA si disponible */}
        {invitation.finalInvitationUrl && (
          <div className="px-6 pt-6">
            <div className="relative rounded-2xl overflow-hidden border border-gray-200 shadow-md group">
              <img 
                src={invitation.finalInvitationUrl} 
                alt="Billet d'invitation" 
                className="w-full max-h-72 object-cover transition-transform duration-500 group-hover:scale-105"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent pointer-events-none" />
              <div className="absolute bottom-3 left-3 right-3 flex items-center justify-between text-[11px] font-bold text-white">
                <span className="bg-black/60 backdrop-blur-md px-3 py-1 rounded-lg border border-white/20 flex items-center gap-1">
                  <Sparkles className="w-3 h-3 text-[#EFB810]" /> Pass Numérique Officiel
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Détails de l'Événement (Lieu, Date, Heure) */}
        <div className="p-6 space-y-3">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shrink-0">
                <Calendar className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Date</div>
                <div className="text-xs font-bold text-gray-900 capitalize truncate">{formattedDate}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-amber-50 text-[#B45309] border border-amber-200/60 flex items-center justify-center shrink-0">
                <Clock className="w-4 h-4" />
              </div>
              <div className="text-left">
                <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Horaire</div>
                <div className="text-xs font-bold text-gray-900">{event?.heureDebut || '19h00'}</div>
              </div>
            </div>

            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-3.5 flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-50 text-emerald-600 border border-emerald-200/60 flex items-center justify-center shrink-0">
                <MapPin className="w-4 h-4" />
              </div>
              <div className="truncate text-left">
                <div className="text-[9px] font-extrabold text-gray-400 uppercase tracking-wider">Lieu</div>
                <div className="text-xs font-bold text-gray-900 truncate">{event?.lieu || 'Lieu communiqué'}</div>
              </div>
            </div>
          </div>
        </div>

        {/* Section QR Code & Statut */}
        <div className="px-6 pb-6 text-center">
          {isRevoked ? (
            <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
              <AlertTriangle className="w-8 h-8 mx-auto mb-2 text-red-500" />
              <h3 className="text-sm font-extrabold text-red-900 mb-1">Pass d'Accès Invalidé</h3>
              <p className="text-xs text-red-600 leading-relaxed mb-4">
                Vous avez signalé votre absence à cet événement. Votre QR code a été révoqué.
              </p>
              <button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                className="px-5 py-2 rounded-xl bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-extrabold uppercase tracking-wider shadow-sm transition cursor-pointer"
              >
                {submitting ? 'Réactivation...' : 'Changer d\'avis & Confirmer ma présence'}
              </button>
            </div>
          ) : (
            <div className="bg-gray-50 border border-gray-200 rounded-2xl p-6 flex flex-col items-center">
              <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-widest mb-3">
                Votre QR Code d'Accès Sécurisé
              </div>

              {(() => {
                const rawQr = invitation.qrCodeImage || invitation.qrCodeDataUrl || invitation.qrCode?.qrCodeDataUrl;
                const qrPayload = JSON.stringify({
                  _id: invitation.inviteId || invitation._id,
                  idEvent: invitation.eventId,
                  nom: invitation.nom,
                  prenom: invitation.prenom
                });
                const fallbackQrUrl = `https://api.qrserver.com/v1/create-qr-code/?size=300x300&margin=10&data=${encodeURIComponent(qrPayload)}`;

                let qrSrc = fallbackQrUrl;
                if (rawQr && typeof rawQr === 'string') {
                  const cleanQr = rawQr.trim();
                  qrSrc = cleanQr.startsWith('data:image') || cleanQr.startsWith('http://') || cleanQr.startsWith('https://')
                    ? cleanQr
                    : `data:image/png;base64,${cleanQr}`;
                }

                return (
                  <div className="bg-white p-4 rounded-2xl shadow-md border border-gray-200 inline-block">
                    <img 
                      src={qrSrc} 
                      alt="QR Code d'accès officiel" 
                      className="w-44 h-44 object-contain rounded-xl"
                      onError={(e) => { e.target.src = fallbackQrUrl; }}
                    />
                  </div>
                );
              })()}

              <p className="text-[11px] text-gray-500 mt-3 font-semibold">
                Présentez ce QR Code directement à l'accueil le jour de l'événement.
              </p>
            </div>
          )}
        </div>

        {/* Panneau d'Actions Interactives RSVP */}
        <div className="p-6 bg-gray-50/80 border-t border-gray-200">
          <div className="text-center mb-4">
            <h3 className="text-[10px] font-extrabold uppercase tracking-widest text-gray-400">
              Statut de votre présence :
            </h3>
            <div className="mt-1">
              {isConfirmed ? (
                <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 border border-emerald-200 px-3.5 py-1 rounded-full text-xs font-extrabold">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" /> Présence Confirmée
                </span>
              ) : isRevoked ? (
                <span className="inline-flex items-center gap-1.5 text-red-700 bg-red-50 border border-red-200 px-3.5 py-1 rounded-full text-xs font-extrabold">
                  <XCircle className="w-4 h-4 text-red-600" /> Absence Enregistrée
                </span>
              ) : (
                <span className="inline-flex items-center gap-1.5 text-orange-700 bg-orange-50 border border-orange-200 px-3.5 py-1 rounded-full text-xs font-extrabold">
                  <Clock className="w-4 h-4 text-[#FF5005]" /> En attente de votre réponse
                </span>
              )}
            </div>
          </div>

          {/* Boutons d'Action */}
          <div className="space-y-2.5">
            {!isConfirmed && (
              <motion.button
                type="button"
                onClick={handleConfirm}
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.02 } : {}}
                whileTap={!submitting ? { scale: 0.98 } : {}}
                className="w-full py-3.5 px-6 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
              >
                {submitting ? <Loader2 className="w-4 h-4 animate-spin" /> : <CheckCircle2 className="w-4 h-4" />}
                <span>Confirmer ma présence</span>
              </motion.button>
            )}

            {!isRevoked && (
              <motion.button
                type="button"
                onClick={handleDecline}
                disabled={submitting}
                whileHover={!submitting ? { scale: 1.01 } : {}}
                whileTap={!submitting ? { scale: 0.99 } : {}}
                className="w-full py-3 px-6 rounded-xl bg-white hover:bg-red-50 border border-gray-200 hover:border-red-200 text-gray-600 hover:text-red-600 font-bold text-xs transition-all flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50 shadow-xs"
              >
                <XCircle className="w-4 h-4 text-red-500" />
                <span>Signaler mon absence</span>
              </motion.button>
            )}
          </div>
        </div>

      </motion.div>

      {/* Footer minimaliste */}
      <footer className="text-center text-gray-400 text-xs mt-8 relative z-10">
        <p className="flex items-center justify-center gap-1.5">
          <HeartHandshake className="w-3.5 h-3.5 text-[#FF5005]" />
          Plateforme Intelligente de Gestion d'Événements • <strong>ARSHI EVENT</strong>
        </p>
      </footer>

    </div>
  );
}
