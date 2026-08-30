import React, { useState, useEffect, useRef } from 'react';
import { 
  Share2, Trash2, CheckCircle2, AlertCircle, 
  RefreshCw, Sparkles, KeyRound, Clock, BadgeCheck, 
  Lock, X, ChevronRight, Check, ArrowRight, ShieldAlert, Mail, User
} from 'lucide-react';
import { 
  FacebookIcon, InstagramIcon, TikTokIcon, LinkedInIcon 
} from '../../../../common/SocialBrandIcons';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  apiGetSocialAccounts, 
  apiAiVerifySocialAccount, 
  apiValidateSocialOtp, 
  apiResendSocialOtp, 
  apiDisconnectSocialAccount 
} from '../../../../../services/socialService';
import { toast } from 'react-hot-toast';

export default function SocialConnectModal({ isOpen, onClose, token, onAccountsUpdated }) {
  const [accounts, setAccounts] = useState([]);
  const [loading, setLoading] = useState(false);

  // Étape du workflow : 1 = Saisie Email & Recherche de Comptes | 2 = Choix du Compte & Validation OTP
  const [step, setStep] = useState(1);

  // Formulaire
  const [selectedPlatform, setSelectedPlatform] = useState('facebook');
  const [email, setEmail] = useState('');
  const [identifier, setIdentifier] = useState('');
  const [errorMessage, setErrorMessage] = useState('');

  // États multi-comptes et OTP
  const [verifyingAI, setVerifyingAI] = useState(false);
  const [discoveredAccounts, setDiscoveredAccounts] = useState([]);
  const [selectedAccount, setSelectedAccount] = useState(null);
  const [sessionId, setSessionId] = useState(null);
  const [maskedEmail, setMaskedEmail] = useState('');

  // Saisie du code OTP (6 chiffres)
  const [otpDigits, setOtpDigits] = useState(['', '', '', '', '', '']);
  const otpInputsRef = useRef([]);
  const [validatingOtp, setValidatingOtp] = useState(false);
  const [resendingOtp, setResendingOtp] = useState(false);
  const [timeLeft, setTimeLeft] = useState(600);
  const [canResend, setCanResend] = useState(false);
  const [resendCooldown, setResendCooldown] = useState(60);

  const platforms = [
    {
      id: 'facebook',
      name: 'Facebook',
      desc: 'Pages & Profils Professionnels',
      icon: FacebookIcon,
      themeBorder: 'border-blue-200',
      themeBg: 'bg-blue-50/70',
      themeBadge: 'bg-[#1877F2] text-white',
      placeholder: 'Ex: Nom ou Page (Optionnel)'
    },
    {
      id: 'instagram',
      name: 'Instagram',
      desc: 'Comptes Créateurs & Entreprise',
      icon: InstagramIcon,
      themeBorder: 'border-pink-200',
      themeBg: 'bg-pink-50/70',
      themeBadge: 'bg-transparent text-white',
      placeholder: 'Ex: @mon_compte (Optionnel)'
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      desc: 'Comptes Créateurs & Vidéos',
      icon: TikTokIcon,
      themeBorder: 'border-slate-300',
      themeBg: 'bg-slate-100',
      themeBadge: 'bg-black text-white',
      placeholder: 'Ex: @mon_tiktok (Optionnel)'
    },
    {
      id: 'linkedin',
      name: 'LinkedIn',
      desc: 'Pages Entreprise & Profils',
      icon: LinkedInIcon,
      themeBorder: 'border-sky-200',
      themeBg: 'bg-sky-50/70',
      themeBadge: 'bg-[#0A66C2] text-white',
      placeholder: 'Ex: https://linkedin.com/in/... (Optionnel)'
    }
  ];

  const currentPlatformObj = platforms.find(p => p.id === selectedPlatform) || platforms[0];

  const fetchAccounts = async () => {
    try {
      setLoading(true);
      const res = await apiGetSocialAccounts(token);
      if (res.success) {
        setAccounts(res.data || []);
      }
    } catch (err) {
      console.error('Erreur chargement comptes:', err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (isOpen) {
      fetchAccounts();
      resetForm();
    }
  }, [isOpen]);

  useEffect(() => {
    let timer;
    if (step === 2 && timeLeft > 0) {
      timer = setInterval(() => {
        setTimeLeft(prev => {
          if (prev <= 1) {
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, timeLeft]);

  useEffect(() => {
    let timer;
    if (step === 2 && resendCooldown > 0 && !canResend) {
      timer = setInterval(() => {
        setResendCooldown(prev => {
          if (prev <= 1) {
            setCanResend(true);
            clearInterval(timer);
            return 0;
          }
          return prev - 1;
        });
      }, 1000);
    }
    return () => clearInterval(timer);
  }, [step, resendCooldown, canResend]);

  const resetForm = () => {
    setStep(1);
    setEmail('');
    setIdentifier('');
    setErrorMessage('');
    setDiscoveredAccounts([]);
    setSelectedAccount(null);
    setSessionId(null);
    setMaskedEmail('');
    setOtpDigits(['', '', '', '', '', '']);
    setTimeLeft(600);
    setCanResend(false);
    setResendCooldown(60);
  };

  if (!isOpen) return null;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, '0')}:${secs.toString().padStart(2, '0')}`;
  };

  // ÉTAPE 1 : Recherche des comptes utilisateurs liés à l'email
  const handleVerifyWithAI = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!email.trim() && !identifier.trim()) {
      const msg = 'Veuillez saisir l\'adresse email de votre compte réseau social.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setVerifyingAI(true);
      setDiscoveredAccounts([]);
      setSelectedAccount(null);

      const res = await apiAiVerifySocialAccount({
        provider: selectedPlatform,
        email: email.trim(),
        identifier: identifier.trim()
      }, token);

      if (res.success && res.data) {
        const found = res.data.accounts || (res.data.accountPreview ? [res.data.accountPreview] : []);
        setDiscoveredAccounts(found);
        setSelectedAccount(found[0] || null);
        setSessionId(res.data.sessionId);
        setMaskedEmail(res.data.maskedEmail);
        setStep(2);
        setTimeLeft(res.data.expiresInSeconds || 600);
        setCanResend(false);
        setResendCooldown(60);

        if (found.length > 1) {
          toast.success(`${found.length} comptes trouvés pour cette adresse email !`);
        } else {
          toast.success(`Compte utilisateur identifié ! Code expédié à ${res.data.maskedEmail}.`);
        }

        setTimeout(() => {
          if (otpInputsRef.current[0]) {
            otpInputsRef.current[0].focus();
          }
        }, 300);
      } else {
        const errorMsg = res.message || 'Aucun compte trouvé avec cette adresse email.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Erreur audit IA:', err);
      const errMsg = err.response?.data?.message || 'Échec de la recherche des comptes.';
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setVerifyingAI(false);
    }
  };

  const handleOtpChange = (index, value) => {
    setErrorMessage('');
    const cleanVal = value.replace(/[^0-9]/g, '');
    const newDigits = [...otpDigits];

    if (cleanVal.length > 1) {
      const pasted = cleanVal.slice(0, 6).split('');
      pasted.forEach((d, i) => {
        newDigits[i] = d;
      });
      setOtpDigits(newDigits);
      const nextFocus = Math.min(pasted.length, 5);
      if (otpInputsRef.current[nextFocus]) {
        otpInputsRef.current[nextFocus].focus();
      }
      return;
    }

    newDigits[index] = cleanVal;
    setOtpDigits(newDigits);

    if (cleanVal && index < 5 && otpInputsRef.current[index + 1]) {
      otpInputsRef.current[index + 1].focus();
    }
  };

  const handleOtpKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otpDigits[index] && index > 0) {
      otpInputsRef.current[index - 1].focus();
    }
  };

  // ÉTAPE 2 : Confirmation du compte sélectionné avec le code OTP
  const handleConfirmOtpSync = async (e) => {
    if (e) e.preventDefault();
    setErrorMessage('');

    if (!selectedAccount) {
      const msg = 'Veuillez sélectionner le compte que vous souhaitez synchroniser.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    const fullOtp = otpDigits.join('').trim();
    if (fullOtp.length !== 6) {
      const msg = 'Veuillez saisir les 6 chiffres du code de vérification reçu par email.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    if (!sessionId) {
      const msg = 'Session introuvable. Veuillez relancer la vérification.';
      setErrorMessage(msg);
      toast.error(msg);
      return;
    }

    try {
      setValidatingOtp(true);
      const res = await apiValidateSocialOtp({
        sessionId,
        otpCode: fullOtp,
        selectedAccountId: selectedAccount.providerAccountId
      }, token);

      if (res.success) {
        toast.success(res.message || `Compte « ${selectedAccount.accountName} » synchronisé avec succès !`);
        resetForm();
        fetchAccounts();
        if (onAccountsUpdated) onAccountsUpdated();
      } else {
        const errorMsg = res.message || 'Code de vérification incorrect.';
        setErrorMessage(errorMsg);
        toast.error(errorMsg);
      }
    } catch (err) {
      console.error('Erreur validation OTP:', err);
      const errMsg = err.response?.data?.message || 'Code incorrect ou expiré.';
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setValidatingOtp(false);
    }
  };

  const handleResendOtp = async () => {
    if (!sessionId || !canResend) return;
    setErrorMessage('');

    try {
      setResendingOtp(true);
      const res = await apiResendSocialOtp({ sessionId }, token);
      if (res.success) {
        toast.success(res.message || 'Nouveau code envoyé dans votre boîte de réception.');
        setTimeLeft(600);
        setCanResend(false);
        setResendCooldown(60);
        setOtpDigits(['', '', '', '', '', '']);
        if (otpInputsRef.current[0]) {
          otpInputsRef.current[0].focus();
        }
      }
    } catch (err) {
      console.error('Erreur renvoi OTP:', err);
      const errMsg = err.response?.data?.message || 'Échec du renvoi de l\'email.';
      setErrorMessage(errMsg);
      toast.error(errMsg);
    } finally {
      setResendingOtp(false);
    }
  };

  const handleDisconnect = async (accountId, accountName) => {
    if (!window.confirm(`Voulez-vous vraiment dissocier le compte « ${accountName} » ?`)) return;
    try {
      const res = await apiDisconnectSocialAccount(accountId, token);
      if (res.success) {
        toast.success('Compte dissocié avec succès.');
        fetchAccounts();
        if (onAccountsUpdated) onAccountsUpdated();
      }
    } catch (err) {
      toast.error('Erreur lors de la dissociation.');
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-md font-sans text-left">
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        className="relative w-full max-w-2xl bg-white border border-gray-200 rounded-3xl shadow-2xl overflow-hidden flex flex-col max-h-[90vh]"
      >
        
        {/* Barre d'accentuation ARSHI EVENT */}
        <div className="h-1.5 w-full bg-gradient-to-r from-[#FF5005] via-[#EFB810] to-[#0B1727]" />

        {/* Header Modal - Thème Clair */}
        <div className="px-6 py-5 border-b border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="w-10 h-10 rounded-2xl bg-orange-50 text-[#FF5005] border border-orange-200/60 flex items-center justify-center shadow-xs">
              <Share2 size={18} />
            </div>
            <div>
              <h3 className="text-base font-extrabold text-gray-900 tracking-tight">
                Synchronisation Réseaux Sociaux
              </h3>
              <p className="text-xs text-gray-400">
                Détection automatique & publication directe pour vos campagnes
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

        {/* Stepper Clair */}
        <div className="px-6 py-3 bg-white border-b border-gray-100 flex items-center justify-center gap-3 text-xs font-bold">
          <div className={`flex items-center gap-1.5 ${step === 1 ? 'text-[#FF5005]' : 'text-emerald-600'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 1 ? 'bg-[#FF5005] text-white font-extrabold shadow-xs' : 'bg-emerald-100 text-emerald-700'
            }`}>
              {step > 1 ? <Check size={11} /> : '1'}
            </span>
            <span>1. Sélection & Email</span>
          </div>

          <ChevronRight size={14} className="text-gray-300" />

          <div className={`flex items-center gap-1.5 ${step === 2 ? 'text-[#FF5005]' : 'text-gray-400'}`}>
            <span className={`w-5 h-5 rounded-full flex items-center justify-center text-[10px] ${
              step === 2 ? 'bg-[#FF5005] text-white font-extrabold shadow-xs' : 'bg-gray-100 text-gray-400'
            }`}>
              2
            </span>
            <span>2. Validation & Code de Sécurité</span>
          </div>
        </div>

        {/* Corps */}
        <div className="p-6 overflow-y-auto space-y-5 flex-1 text-xs">
          
          {/* Message d'erreur */}
          {errorMessage && (
            <div className="p-3.5 bg-red-50 border border-red-200 rounded-2xl flex items-start gap-2.5 text-xs text-red-700 animate-fadeIn">
              <AlertCircle size={15} className="text-red-500 shrink-0 mt-0.5" />
              <div>
                <span className="font-bold">Attention : </span>
                <span>{errorMessage}</span>
              </div>
            </div>
          )}

          {/* ======================================================== */}
          {/* ÉTAPE 1 : CHOIX DU RÉSEAU & EMAIL                       */}
          {/* ======================================================== */}
          {step === 1 && (
            <div className="space-y-4">
              
              <div>
                <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-400 mb-2">
                  1. Choisissez la plateforme à synchroniser
                </label>
                <div className="grid grid-cols-2 gap-2.5">
                  {platforms.map((p) => {
                    const isSelected = selectedPlatform === p.id;
                    const IconComp = p.icon;
                    return (
                      <button
                        key={p.id}
                        type="button"
                        onClick={() => {
                          setSelectedPlatform(p.id);
                          setErrorMessage('');
                        }}
                        className={`p-3 rounded-2xl border flex items-center gap-2.5 transition cursor-pointer text-left ${
                          isSelected
                            ? 'border-[#FF5005] bg-orange-50/40 text-gray-900 shadow-xs ring-1 ring-[#FF5005]'
                            : 'border-gray-200 hover:border-gray-300 bg-gray-50 text-gray-700'
                        }`}
                      >
                        <div className={`w-8 h-8 rounded-xl ${p.themeBadge} flex items-center justify-center text-xs shrink-0 shadow-xs`}>
                          <IconComp size={15} />
                        </div>
                        <div className="min-w-0">
                          <div className="text-xs font-bold text-gray-900 truncate">{p.name}</div>
                          <div className="text-[10px] text-gray-400 truncate">{p.desc}</div>
                        </div>
                      </button>
                    );
                  })}
                </div>
              </div>

              {/* Formulaire Email */}
              <form onSubmit={handleVerifyWithAI} className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                    Adresse Email du compte {currentPlatformObj.name} *
                  </label>
                  <div className="relative">
                    <Mail size={14} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input
                      type="email"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="Ex: moncompte@domaine.com"
                      className="w-full pl-9 pr-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005] focus:ring-2 focus:ring-[#FF5005]/15"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[10px] font-extrabold uppercase tracking-wider text-gray-500 mb-1">
                    Identifiant / Nom du profil (Optionnel)
                  </label>
                  <input
                    type="text"
                    value={identifier}
                    onChange={(e) => setIdentifier(e.target.value)}
                    placeholder={currentPlatformObj.placeholder}
                    className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold text-gray-900 placeholder-gray-400 focus:outline-none focus:border-[#FF5005]"
                  />
                </div>

                <button
                  type="submit"
                  disabled={verifyingAI}
                  className="w-full py-3 px-4 rounded-xl bg-[#FF5005] hover:bg-[#ff6220] text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-orange-500/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                >
                  {verifyingAI ? (
                    <>
                      <RefreshCw size={14} className="animate-spin" />
                      <span>Recherche des comptes associés...</span>
                    </>
                  ) : (
                    <>
                      <span>Rechercher mes Comptes {currentPlatformObj.name}</span>
                      <ArrowRight size={14} />
                    </>
                  )}
                </button>
              </form>

            </div>
          )}

          {/* ======================================================== */}
          {/* ÉTAPE 2 : CHOIX DU COMPTE & VALIDATION OTP               */}
          {/* ======================================================== */}
          {step === 2 && (
            <div className="space-y-4 animate-fadeIn">
              
              {/* Multi-comptes */}
              {discoveredAccounts.length > 1 && (
                <div className="space-y-2">
                  <div className="text-xs font-extrabold text-gray-900 flex items-center justify-between">
                    <span>Comptes {currentPlatformObj.name} trouvés ({discoveredAccounts.length}) :</span>
                    <span className="text-[11px] text-[#FF5005] font-semibold">
                      Sélectionnez le compte à synchroniser
                    </span>
                  </div>

                  <div className="space-y-2 max-h-48 overflow-y-auto pr-1">
                    {discoveredAccounts.map((acc) => {
                      const isChosen = selectedAccount?.providerAccountId === acc.providerAccountId;
                      return (
                        <div
                          key={acc.providerAccountId}
                          onClick={() => setSelectedAccount(acc)}
                          className={`p-3 rounded-2xl border flex items-center justify-between gap-3 cursor-pointer transition ${
                            isChosen
                              ? 'border-[#FF5005] bg-orange-50/50 ring-1 ring-[#FF5005]'
                              : 'border-gray-200 bg-white hover:border-gray-300'
                          }`}
                        >
                          <div className="flex items-center gap-3 min-w-0">
                            <img
                              src={acc.avatarUrl}
                              alt={acc.accountName}
                              className="w-10 h-10 rounded-xl object-cover border border-gray-200 shrink-0"
                            />
                            <div className="min-w-0">
                              <div className="flex items-center gap-1.5">
                                <h4 className="text-xs font-bold text-gray-900 truncate">{acc.accountName}</h4>
                                {acc.verifiedBadge && <BadgeCheck size={13} className="text-blue-500 shrink-0" />}
                              </div>
                              <p className="text-[11px] text-gray-400 truncate">{acc.category || acc.username}</p>
                            </div>
                          </div>

                          <div className={`w-5 h-5 rounded-full border flex items-center justify-center ${
                            isChosen ? 'border-[#FF5005] bg-[#FF5005] text-white' : 'border-gray-300 bg-white'
                          }`}>
                            {isChosen && <Check size={12} />}
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}

              {/* Compte Unique */}
              {selectedAccount && discoveredAccounts.length <= 1 && (
                <div className="p-4 bg-gray-50 border border-gray-200 rounded-2xl space-y-3">
                  <div className="flex items-center justify-between border-b border-gray-200/60 pb-2">
                    <span className="text-xs font-bold text-emerald-700 flex items-center gap-1.5">
                      <BadgeCheck size={15} className="text-emerald-600" />
                      <span>Compte Utilisateur Identifié</span>
                    </span>
                    <span className="text-[10px] bg-white border border-gray-200 text-gray-700 px-2 py-0.5 rounded-full font-extrabold uppercase">
                      {selectedAccount.provider}
                    </span>
                  </div>

                  <div className="flex items-start gap-3">
                    <img
                      src={selectedAccount.avatarUrl}
                      alt={selectedAccount.accountName}
                      className="w-12 h-12 rounded-xl object-cover border border-gray-200 shrink-0"
                    />
                    <div className="min-w-0 flex-1">
                      <h4 className="text-xs font-bold text-gray-900 truncate">
                        {selectedAccount.accountName}
                      </h4>
                      <p className="text-[11px] text-[#FF5005] font-mono font-bold">{selectedAccount.username}</p>
                      <p className="text-[11px] text-gray-500 mt-0.5 line-clamp-2">{selectedAccount.bio}</p>
                    </div>
                  </div>
                </div>
              )}

              {/* Info Code Sécurité */}
              <div className="flex items-center gap-2 text-[11px] text-gray-600 bg-amber-50/70 p-3 rounded-xl border border-amber-200">
                <ShieldAlert size={15} className="text-amber-600 shrink-0" />
                <span>
                  Un code à 6 chiffres a été expédié à <strong>{maskedEmail}</strong> pour sécuriser l'autorisation.
                </span>
              </div>

              {/* Formulaire OTP */}
              <form onSubmit={handleConfirmOtpSync} className="p-4 bg-white border border-gray-200 rounded-2xl space-y-4 shadow-xs">
                <div className="text-center">
                  <div className="text-xs font-bold text-gray-800 flex items-center justify-center gap-1.5">
                    <KeyRound size={14} className="text-[#FF5005]" />
                    <span>Saisissez le code de confirmation</span>
                  </div>
                </div>

                <div className="flex items-center justify-center gap-2 py-1">
                  {otpDigits.map((digit, idx) => (
                    <input
                      key={idx}
                      ref={(el) => (otpInputsRef.current[idx] = el)}
                      type="text"
                      inputMode="numeric"
                      maxLength={6}
                      value={digit}
                      onChange={(e) => handleOtpChange(idx, e.target.value)}
                      onKeyDown={(e) => handleOtpKeyDown(idx, e)}
                      className="w-10 h-12 text-center text-lg font-black font-mono bg-gray-50 border-2 border-gray-200 focus:border-[#FF5005] focus:bg-white rounded-xl text-gray-900 focus:outline-none transition-all shadow-xs"
                    />
                  ))}
                </div>

                <div className="flex items-center justify-between text-xs px-1 text-gray-500">
                  <div className="flex items-center gap-1 font-mono">
                    <Clock size={13} />
                    <span>Expire dans : {formatTime(timeLeft)}</span>
                  </div>

                  <button
                    type="button"
                    onClick={handleResendOtp}
                    disabled={!canResend || resendingOtp}
                    className="text-[#FF5005] hover:underline font-bold cursor-pointer disabled:opacity-40"
                  >
                    {resendingOtp ? 'Envoi...' : canResend ? 'Renvoyer le code' : `Renvoyer (${resendCooldown}s)`}
                  </button>
                </div>

                <div className="flex items-center gap-2 pt-2 border-t border-gray-100">
                  <button
                    type="button"
                    onClick={() => {
                      setStep(1);
                      setErrorMessage('');
                    }}
                    className="px-4 py-2.5 rounded-xl border border-gray-200 bg-gray-50 hover:bg-gray-100 text-gray-700 text-xs font-bold cursor-pointer"
                  >
                    Retour
                  </button>

                  <button
                    type="submit"
                    disabled={validatingOtp || otpDigits.join('').length !== 6 || !selectedAccount}
                    className="flex-1 py-2.5 px-4 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white font-extrabold text-xs uppercase tracking-wider shadow-md shadow-emerald-600/20 transition flex items-center justify-center gap-2 cursor-pointer disabled:opacity-50"
                  >
                    {validatingOtp ? (
                      <>
                        <RefreshCw size={14} className="animate-spin" />
                        <span>Synchronisation en cours...</span>
                      </>
                    ) : (
                      <>
                        <Check size={14} />
                        <span>Confirmer & Lier le Compte</span>
                      </>
                    )}
                  </button>
                </div>

              </form>
            </div>
          )}

          {/* ======================================================== */}
          {/* COMPTES DÉJÀ CONNECTÉS                                  */}
          {/* ======================================================== */}
          <div className="space-y-2.5 pt-3 border-t border-gray-100">
            <div className="text-[10px] font-extrabold text-gray-400 uppercase tracking-wider flex items-center justify-between">
              <span>Mes Comptes Réseaux Sociaux Actifs ({accounts.length})</span>
            </div>

            {loading ? (
              <div className="py-4 text-center text-xs text-gray-400">
                Chargement des comptes...
              </div>
            ) : accounts.length === 0 ? (
              <div className="p-3 bg-gray-50 border border-gray-200 rounded-xl text-center">
                <p className="text-xs text-gray-400">Aucun compte associé pour le moment.</p>
              </div>
            ) : (
              <div className="space-y-2">
                {accounts.map((acc) => {
                  const isFb = acc.provider === 'facebook';
                  const isIg = acc.provider === 'instagram';
                  const isTk = acc.provider === 'tiktok';

                  return (
                    <div
                      key={acc._id}
                      className="p-3 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-between gap-3"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        {acc.avatarUrl ? (
                          <img
                            src={acc.avatarUrl}
                            alt={acc.accountName}
                            className="w-8 h-8 rounded-lg object-cover border border-gray-200 shrink-0"
                          />
                        ) : (
                          <div className={`w-8 h-8 rounded-lg flex items-center justify-center text-white text-xs font-bold shrink-0 ${
                            isFb ? 'bg-[#1877F2]' : isIg ? 'bg-transparent' : isTk ? 'bg-black' : 'bg-[#0A66C2]'
                          }`}>
                            {isFb && <FacebookIcon size={16} />}
                            {isIg && <InstagramIcon size={28} />}
                            {isTk && <TikTokIcon size={16} />}
                            {!isFb && !isIg && !isTk && <LinkedInIcon size={16} />}
                          </div>
                        )}

                        <div className="min-w-0">
                          <div className="flex items-center gap-1.5">
                            <span className="text-xs font-bold text-gray-900 truncate">{acc.accountName}</span>
                            <span className="text-[9px] text-emerald-700 bg-emerald-100 px-1.5 py-0.2 rounded font-extrabold">
                              Vérifié
                            </span>
                          </div>
                          <div className="text-[10px] text-gray-400 capitalize">
                            {acc.provider} {acc.metadata?.syncedEmail ? `(${acc.metadata.syncedEmail})` : ''}
                          </div>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => handleDisconnect(acc._id, acc.accountName)}
                        className="p-1.5 rounded-lg bg-red-50 hover:bg-red-100 text-red-600 text-xs transition cursor-pointer"
                        title="Dissocier ce compte"
                      >
                        <Trash2 size={13} />
                      </button>
                    </div>
                  );
                })}
              </div>
            )}
          </div>

        </div>

        {/* Footer Clair */}
        <div className="px-6 py-3 border-t border-gray-100 bg-gray-50/50 flex items-center justify-between">
          <div className="text-[11px] text-gray-400 flex items-center gap-1">
            <Lock size={12} />
            <span>Sécurité Chiffrée AES-256</span>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="px-4 py-1.5 text-xs font-bold text-gray-500 hover:text-gray-800 transition cursor-pointer"
          >
            Fermer
          </button>
        </div>

      </motion.div>
    </div>
  );
}
