import React, { useState, useRef, useEffect } from 'react';
import { ShieldCheck, ArrowLeft, ArrowRight, Zap, Loader2, RefreshCw, KeyRound, Sparkles } from 'lucide-react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { verifyOtpService, forgotPasswordService } from '../../services/authservice';

const VerifyOTPPage = () => {
  const [otp, setOtp] = useState(['', '', '', '', '', '']);
  const [loading, setLoading] = useState(false);
  const [resending, setResending] = useState(false);
  const [timer, setTimer] = useState(60);
  const inputRefs = useRef([]);
  const navigate = useNavigate();
  const location = useLocation();

  const email = location.state?.email || '';

  useEffect(() => {
    if (!email) {
      toast.error("Veuillez d'abord saisir votre email", { position: 'top-center' });
      navigate('/forgot-password');
    }
  }, [email, navigate]);

  useEffect(() => {
    let interval = null;
    if (timer > 0) {
      interval = setInterval(() => setTimer((prev) => prev - 1), 1000);
    }
    return () => clearInterval(interval);
  }, [timer]);

  const handleChange = (index, value) => {
    if (isNaN(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value.substring(value.length - 1);
    setOtp(newOtp);

    if (value && index < 5) {
      inputRefs.current[index + 1].focus();
    }
  };

  const handleKeyDown = (index, e) => {
    if (e.key === 'Backspace' && !otp[index] && index > 0) {
      inputRefs.current[index - 1].focus();
    }
  };

  const handlePaste = (e) => {
    e.preventDefault();
    const pastedData = e.clipboardData.getData('text').trim();
    if (/^\d{6}$/.test(pastedData)) {
      const digits = pastedData.split('');
      setOtp(digits);
      inputRefs.current[5].focus();
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const otpCode = otp.join('');

    if (otpCode.length !== 6) {
      toast.error("Veuillez saisir les 6 chiffres du code OTP", { position: 'top-center' });
      return;
    }

    setLoading(true);
    try {
      const res = await verifyOtpService(email, otpCode);
      toast.success("Code vérifié avec succès !", { position: 'top-center' });
      navigate('/reset-password', { state: { resetSessionToken: res.resetSessionToken } });
    } catch (err) {
      toast.error(err?.message || "Code invalide ou expiré", { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (timer > 0) return;
    setResending(true);
    try {
      await forgotPasswordService(email);
      toast.success("Nouveau code envoyé par email !", { position: 'top-center' });
      setTimer(60);
    } catch (err) {
      toast.error(err?.message || "Impossible de renvoyer le code", { position: 'top-center' });
    } finally {
      setResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1727] flex flex-col justify-between font-sans relative overflow-hidden text-white">
      <Toaster position="top-center" />

      {/* Background glow */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF5005]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-[500px] h-[500px] bg-[#1E6FD9]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header */}
      <header className="p-6 md:px-12 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5005] to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Zap size={20} className="fill-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            ARSHI<span className="text-[#FF5005]">EVENT</span>
          </span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111827]/95 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-2xl w-full max-w-md text-center"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldCheck size={32} />
            </div>
          </div>

          <h2 className="text-2xl font-black text-white tracking-tight">Vérification de Sécurité</h2>
          <p className="text-xs text-gray-400 mt-2 mb-8 leading-relaxed">
            Saisissez le code à 6 chiffres transmis à l'adresse <br />
            <span className="text-[#FF5005] font-bold">{email}</span>
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            
            {/* 6 OTP Inputs */}
            <div className="flex justify-center gap-2.5" onPaste={handlePaste}>
              {otp.map((digit, index) => (
                <motion.input
                  key={index}
                  type="text"
                  maxLength={1}
                  ref={(el) => (inputRefs.current[index] = el)}
                  value={digit}
                  onChange={(e) => handleChange(index, e.target.value)}
                  onKeyDown={(e) => handleKeyDown(index, e)}
                  whileFocus={{ scale: 1.08 }}
                  className="w-12 h-14 text-center text-xl font-black bg-white/5 rounded-2xl border border-white/15 focus:border-[#FF5005] focus:ring-2 focus:ring-[#FF5005]/30 focus:bg-white/10 outline-none transition-all text-white shadow-inner"
                />
              ))}
            </div>

            {/* Submit Button */}
            <motion.button 
              type="submit"
              disabled={loading}
              whileHover={!loading ? { scale: 1.02, boxShadow: "0 12px 30px -5px rgba(255, 80, 5, 0.45)" } : {}}
              whileTap={!loading ? { scale: 0.98 } : {}}
              className="w-full bg-[#FF5005] hover:bg-[#ff6220] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
            >
              {loading ? (
                <div className="flex items-center gap-2">
                  <Loader2 className="h-4 w-4 animate-spin" />
                  <span>Vérification...</span>
                </div>
              ) : (
                <div className="flex items-center gap-2">
                  <span>Valider le code de sécurité</span>
                  <ArrowRight size={15} />
                </div>
              )}
            </motion.button>

          </form>

          {/* Resend Code Timer */}
          <div className="mt-6 text-center">
            <button
              onClick={handleResend}
              disabled={timer > 0 || resending}
              className="text-xs font-semibold text-gray-400 hover:text-[#FF5005] disabled:text-gray-600 inline-flex items-center gap-1.5 transition-colors cursor-pointer"
            >
              <RefreshCw size={13} className={resending ? "animate-spin" : ""} />
              {timer > 0 ? `Renvoyer le code (${timer}s)` : "Renvoyer un nouveau code"}
            </button>
          </div>

          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <Link to="/forgot-password" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={13} />
              Modifier l'adresse email
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-gray-500 border-t border-white/10 relative z-10">
        © {new Date().getFullYear()} ARSHI EVENT • Chiffrement de session certifié
      </footer>
    </div>
  );
};

export default VerifyOTPPage;
