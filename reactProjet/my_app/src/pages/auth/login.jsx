import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, QrCode, ArrowRight, Zap, Loader2, Sparkles, CheckCircle2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLogin, useRefreshToken, useGoogleLogin } from '../../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';
import { GoogleLogin } from '@react-oauth/google';

const ConnexionPage = () => {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    rememberMe: true
  });
  
  const [errors, setErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const { login, loading: loginLoading, error: loginError } = useLogin();
  const googleLogin = useGoogleLogin();
  const refreshToken = useRefreshToken();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
  };

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Impossible de récupérer les identifiants Google");
        return;
      }
      const result = await googleLogin(credentialResponse.credential);
      if (!result?.success) {
        throw new Error(result?.error || "Échec de la connexion via Google");
      }
      toast.success("Connexion avec Google réussie !");
      navigate('/dashboard/vue');
    } catch (err) {
      console.error("Erreur Google Login:", err);
      toast.error(err?.message || "Échec de la connexion via Google");
    }
  };

  const validate = () => {
    const newErrors = {};
    if (!formData.email) {
      newErrors.email = "L'email est requis";
    } else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) {
      newErrors.email = "Format d'email invalide";
    }
    if (!formData.password) {
      newErrors.password = "Le mot de passe est requis";
    }
    return newErrors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const validationErrors = validate();
    setErrors(validationErrors);

    if (Object.keys(validationErrors).length === 0) {
      try {
        const user = await login({
          email: formData.email,
          password: formData.password,
        });

        if (user) {
          try {
            await refreshToken();
          } catch (e) {
            // Ignorer l'erreur silencieuse du refresh initial
          }
          toast.success('Connexion réussie !', { position: 'top-center' });
          navigate('/dashboard');
        } else {
          toast.error(loginError || 'Identifiants invalides', { position: 'top-center' });
        }
      } catch (error) {
        toast.error(error?.message || 'Erreur lors de la connexion', { position: 'top-center' });
      }
    } else {
      toast.error('Veuillez corriger les erreurs du formulaire.', { position: 'top-center' });
    }
  };

  return (
    <div className="min-h-screen bg-[#0B1727] flex flex-col justify-between font-sans relative overflow-hidden text-white">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Glow Orbs Background */}
      <div className="absolute -top-32 -left-32 w-96 h-96 bg-[#FF5005]/20 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-[#1E6FD9]/20 rounded-full blur-[140px] pointer-events-none" />

      {/* Header Minimal */}
      <header className="p-6 md:px-12 flex justify-between items-center relative z-10">
        <Link to="/" className="flex items-center gap-2.5">
          <div className="w-9 h-9 rounded-xl bg-gradient-to-tr from-[#FF5005] to-orange-400 flex items-center justify-center text-white shadow-lg shadow-orange-500/25">
            <Zap size={20} className="fill-white" />
          </div>
          <span className="font-extrabold text-xl tracking-tight text-white">
            ARSHI<span className="text-[#FF5005]">EVENT</span>
          </span>
        </Link>
        <Link to="/register" className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition">
          Pas encore de compte ? <span className="text-[#FF5005] font-bold ml-1">S'inscrire</span>
        </Link>
      </header>

      {/* Main Container */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* COLONNE GAUCHE (Visual Identity & Scanner Preview) */}
          <div className="hidden lg:flex lg:col-span-6 flex-col justify-center space-y-8 text-left">
            
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest w-max">
              <Sparkles size={12} />
              Accès Organisateur Sécurisé
            </div>

            <h1 className="text-5xl font-black text-white leading-tight tracking-tight">
              Bienvenue sur votre <br />
              <span className="bg-gradient-to-r from-[#FF5005] to-[#EFB810] bg-clip-text text-transparent">
                Tour de Contrôle.
              </span>
            </h1>

            <p className="text-slate-300 text-base max-w-md leading-relaxed font-normal">
              Pilotez vos billetteries, surveillez les scans en temps réel et activez vos campagnes IA en un clic.
            </p>

            {/* Smartphone Holographic Preview */}
            <div className="relative bg-white/5 rounded-3xl p-8 max-w-sm border border-white/10 backdrop-blur-xl shadow-2xl overflow-hidden flex items-center justify-center">
              <div className="w-44 h-72 bg-[#111827] rounded-[2.5rem] border-4 border-slate-700 shadow-2xl relative flex flex-col items-center justify-center p-4 overflow-hidden">
                <div className="text-white/30 relative">
                  <QrCode size={72} />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#FF5005] shadow-[0_0_15px_#FF5005] animate-scan-laser" />
                </div>
                <span className="text-[9px] text-emerald-400 mt-6 uppercase tracking-widest font-extrabold flex items-center gap-1">
                  <CheckCircle2 size={10} /> Scan instantané actif
                </span>
              </div>
            </div>

          </div>

          {/* COLONNE DROITE (Formulaire de Connexion) */}
          <div className="lg:col-span-6 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="bg-[#111827]/95 p-6 sm:p-7 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-2xl w-full max-w-md text-left"
            >
              <div className="mb-5">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Connexion
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Saisissez vos identifiants pour accéder à vos événements.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Champ Email */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                    Email professionnel
                  </label>
                  <div className="relative">
                    <Mail className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                    <input 
                      name="email"
                      type="email" 
                      value={formData.email}
                      onChange={handleChange}
                      placeholder="nom@entreprise.com" 
                      className={`w-full pl-10 pr-4 py-2.5 bg-white/5 border rounded-lg text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                        errors.email 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                      }`}
                    />
                  </div>
                  {errors.email && (
                    <p className="text-[10px] text-red-400 font-semibold">{errors.email}</p>
                  )}
                </div>

                {/* Champ Mot de Passe */}
                <div className="space-y-1">
                  <div className="flex justify-between items-center">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">
                      Mot de passe
                    </label>
                    <Link to="/forgot-password" className="text-[10px] font-bold text-[#FF5005] hover:underline">
                      Oublié ?
                    </Link>
                  </div>
                  <div className="relative">
                    <Lock className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-400'}`} size={16} />
                    <input 
                      name="password"
                      type={showPassword ? "text" : "password"} 
                      value={formData.password}
                      onChange={handleChange}
                      placeholder="••••••••" 
                      className={`w-full pl-10 pr-10 py-3 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                        errors.password 
                          ? 'border-red-500 focus:ring-red-500' 
                          : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
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
                  {errors.password && (
                    <p className="text-[10px] text-red-400 font-semibold">{errors.password}</p>
                  )}
                </div>

                {/* Remember Me */}
                <div className="flex items-center gap-2 pt-1">
                  <input 
                    name="rememberMe"
                    type="checkbox" 
                    id="remember"
                    checked={formData.rememberMe}
                    onChange={handleChange}
                    className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-[#FF5005] focus:ring-[#FF5005] cursor-pointer"
                  />
                  <label htmlFor="remember" className="text-xs text-gray-400 font-medium cursor-pointer">
                    Se souvenir de cet appareil
                  </label>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <motion.button 
                    type="submit"
                    disabled={loginLoading}
                    whileHover={!loginLoading ? { scale: 1.02, boxShadow: "0 12px 30px -5px rgba(255, 80, 5, 0.45)" } : {}}
                    whileTap={!loginLoading ? { scale: 0.98 } : {}}
                    className="w-full bg-[#FF5005] hover:bg-[#ff6220] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {loginLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Connexion en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Se connecter</span>
                        <ArrowRight size={15} />
                      </div>
                    )}
                  </motion.button>
                </div>

              </form>

              {/* Separator */}
              <div className="relative my-6 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 bg-[#111827]">
                  ou continuer avec
                </span>
              </div>

              {/* Google OAuth */}
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Échec de la connexion avec Google")}
                  text="continue_with"
                  shape="rectangular"
                  width="100%"
                  theme="filled_black"
                  locale="fr"
                />
              </div>

            </motion.div>
          </div>

        </div>
      </div>

      {/* Footer Minimal */}
      <footer className="p-6 text-center text-xs text-gray-500 border-t border-white/10 relative z-10">
        © {new Date().getFullYear()} ARSHI EVENT • Chiffrement de niveau bancaire AES-256
      </footer>

    </div>
  );
};

export default ConnexionPage;