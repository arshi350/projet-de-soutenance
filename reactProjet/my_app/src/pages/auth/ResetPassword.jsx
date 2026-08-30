import React, { useState, useEffect } from 'react';
import { Lock, Eye, EyeOff, ArrowRight, Zap, Loader2, CheckCircle2, ShieldCheck } from 'lucide-react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import toast, { Toaster } from 'react-hot-toast';
import { resetPasswordService } from '../../services/authservice';

const ResetPasswordPage = () => {
  const [newPassword, setNewPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const navigate = useNavigate();
  const location = useLocation();

  const resetSessionToken = location.state?.resetSessionToken || '';

  useEffect(() => {
    if (!resetSessionToken) {
      toast.error("Session invalide ou expirée", { position: 'top-center' });
      navigate('/forgot-password');
    }
  }, [resetSessionToken, navigate]);

  const validate = () => {
    const errs = {};
    if (!newPassword) {
      errs.newPassword = "Le nouveau mot de passe est requis";
    } else if (newPassword.length < 8) {
      errs.newPassword = "Au moins 8 caractères requis";
    }

    if (!confirmPassword) {
      errs.confirmPassword = "Veuillez confirmer le mot de passe";
    } else if (newPassword !== confirmPassword) {
      errs.confirmPassword = "Les mots de passe ne correspondent pas";
    }
    return errs;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      setLoading(true);
      try {
        await resetPasswordService(resetSessionToken, newPassword);
        toast.success("Mot de passe réinitialisé avec succès !", { position: 'top-center' });
        setTimeout(() => {
          navigate('/login');
        }, 1500);
      } catch (err) {
        toast.error(err?.message || "Erreur lors de la réinitialisation", { position: 'top-center' });
      } finally {
        setLoading(false);
      }
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
      <div className="flex-grow flex items-center justify-center p-6 relative z-10">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.4 }}
          className="bg-[#111827]/95 p-8 md:p-10 rounded-3xl shadow-2xl border border-white/10 backdrop-blur-2xl w-full max-w-md text-left"
        >
          <div className="mb-6 flex justify-center">
            <div className="w-16 h-16 bg-white/5 border border-white/10 text-emerald-400 rounded-2xl flex items-center justify-center shadow-inner">
              <ShieldCheck size={32} />
            </div>
          </div>

          <div className="text-center mb-8">
            <h2 className="text-2xl font-black text-white tracking-tight">Nouveau mot de passe</h2>
            <p className="text-xs text-gray-400 mt-2 leading-relaxed">
              Sécurisez votre compte avec un nouveau mot de passe d'au moins 8 caractères.
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            
            {/* Nouveau mot de passe */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Nouveau mot de passe
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.newPassword ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.newPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                  }`}
                />
                <button 
                  type="button" 
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                >
                  {showPassword ? <EyeOff size={16} /> : <Eye size={16} />}
                </button>
              </div>
              {errors.newPassword && <p className="text-[10px] text-red-400 font-semibold">{errors.newPassword}</p>}
            </div>

            {/* Confirmation */}
            <div className="space-y-1">
              <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                Confirmer le mot de passe
              </label>
              <div className="relative">
                <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                <input 
                  type={showPassword ? "text" : "password"} 
                  value={confirmPassword}
                  onChange={(e) => setConfirmPassword(e.target.value)}
                  placeholder="••••••••" 
                  className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                    errors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                  }`}
                />
              </div>
              {errors.confirmPassword && <p className="text-[10px] text-red-400 font-semibold">{errors.confirmPassword}</p>}
            </div>

            {/* Submit Button */}
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
                    <span>Mise à jour...</span>
                  </div>
                ) : (
                  <div className="flex items-center gap-2">
                    <span>Valider le nouveau mot de passe</span>
                    <ArrowRight size={15} />
                  </div>
                )}
              </motion.button>
            </div>

          </form>
        </motion.div>
      </div>

      {/* Footer */}
      <footer className="p-6 text-center text-xs text-gray-500 border-t border-white/10 relative z-10">
        © {new Date().getFullYear()} ARSHI EVENT • Chiffrement sécurisé
      </footer>
    </div>
  );
};

export default ResetPasswordPage;
