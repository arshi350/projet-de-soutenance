import React, { useState } from 'react';
import { Mail, ArrowLeft, ArrowRight, Zap, Loader2, KeyRound } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { forgotPasswordService } from '../../services/authservice';

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    if (!email) {
      setError("L'adresse email est requise");
      toast.error("Veuillez saisir votre email", { position: 'top-center' });
      return;
    }

    if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) {
      setError("Format d'email invalide");
      toast.error("Format d'email invalide", { position: 'top-center' });
      return;
    }

    setLoading(true);
    try {
      await forgotPasswordService(email);
      toast.success("Code de vérification envoyé !", { position: 'top-center' });
      navigate('/verify-otp', { state: { email } });
    } catch (err) {
      toast.error(err?.message || "Une erreur est survenue", { position: 'top-center' });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1727] flex flex-col justify-between font-sans relative overflow-hidden text-white">
      <Toaster position="top-center" />

      {/* Glow Orbs */}
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

      {/* Form Container */}
      <div className="flex-grow flex items-center justify-center p-5 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111827]/95 p-6 sm:p-7 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-2xl w-full max-w-md text-left"
        >
          <div className="mb-4 flex justify-center">
            <div className="w-12 h-12 bg-white/5 border border-white/10 text-[#FF5005] rounded-xl flex items-center justify-center shadow-inner">
              <KeyRound size={26} />
            </div>
          </div>

          <div className="text-center mb-6">
            <h2 className="text-xl font-black text-white tracking-tight">Mot de passe oublié</h2>
            <p className="text-xs text-gray-400 mt-1.5 leading-relaxed">
              Indiquez l'adresse email associée à votre compte pour recevoir votre code OTP de sécurité.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-3.5">
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Adresse Email
              </label>
              <div className="relative">
                <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${error ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input 
                  type="email" 
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="nom@entreprise.com"
                  className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                    error ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                  }`}
                />
              </div>
              {error && <p className="text-[10px] text-red-400 font-semibold">{error}</p>}
            </div>

            <div className="pt-2">
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
                    <span>Envoi du code...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Recevoir le code OTP</span>
                    <ArrowRight size={15} />
                  </div>
                )}
              </motion.button>
            </div>
          </form>

          <div className="mt-8 pt-4 border-t border-white/10 text-center">
            <Link to="/login" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-white transition-colors">
              <ArrowLeft size={13} />
              Retour à la connexion
            </Link>
          </div>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-gray-500 border-t border-white/10 relative z-10">
        © {new Date().getFullYear()} ARSHI EVENT • Chiffrement sécurisé
      </footer>
    </div>
  );
};

export default ForgotPasswordPage;
