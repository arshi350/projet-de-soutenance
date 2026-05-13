import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, QrCode, ArrowRight, Zap, Loader2 } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useLogin, useRefreshToken } from '../../hooks/useAuth';
import toast, { Toaster } from 'react-hot-toast';

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
  const refreshToken = useRefreshToken();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
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
          // Rafraîchir l'access token immédiatement après connexion
          try {
            await refreshToken();
          } catch (e) {
            // Optionnel : afficher une notification d'erreur de refresh
          }
          toast.success('Connexion réussie !', {
            position: 'top-center',
          });
          navigate('/dashboard');
        } else {
          toast.error(loginError || 'Identifiants invalides', {
            position: 'top-center',
          });
        }
      } catch (error) {
        toast.error(error?.message || 'Erreur lors de la connexion', {
          position: 'top-center',
        });
      }
    } else {
      toast.error('Veuillez corriger les erreurs du formulaire.', {
        position: 'top-center',
      });
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.2,
        delayChildren: 0.2
      }
    }
  };

  const itemVariants = {
    hidden: { y: 30, opacity: 0 },
    visible: {
      y: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 12
      }
    }
  };

  const cardVariants = {
    hidden: { x: 100, opacity: 0, rotateY: 30 },
    visible: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const leftColumnVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 0.8
      }
    }
  };

  const illustrationVariants = {
    hidden: { scale: 0.8, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 100,
        damping: 20,
        delay: 0.3
      }
    }
  };

  const buttonVariants = {
    hover: {
      scale: 1.02,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10
      }
    },
    tap: {
      scale: 0.98
    }
  };

  const inputVariants = {
    focus: {
      scale: 1.01,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20
      }
    },
    error: {
      x: [0, -2, 2, -2, 2, 0],
      transition: {
        duration: 0.6
      }
    }
  };

  const floatingIconVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 5,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.div 
      className="min-h-screen bg-[#f0f9ff] flex flex-col font-sans overflow-hidden"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 md:p-12 gap-12 items-center">
        
        {/* COLONNE GAUCHE - Identité Visuelle */}
        <motion.div 
          className="w-full md:w-1/2 space-y-8"
          variants={leftColumnVariants}
        >
          <motion.div 
            className='flex items-center gap-2'
            variants={itemVariants}
          >
            <motion.div 
              className="text-orange-500"
              animate={{ rotate: [0, 5, -5, 0] }}
              transition={{ duration: 0.5, delay: 0.5 }}
            >
              <Zap size={34} fill="currentColor" />
            </motion.div>
            <div className="font-bold text-3xl text-gray-900 tracking-tight">ARSHI<span className="text-[#FF5005]">EVENT</span></div>
          </motion.div>
          
          <motion.div className="space-y-6" variants={itemVariants}>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Ravi de vous <br />
              <motion.span 
                style={{ color: '#016BDC' }}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                revoir.
              </motion.span>
            </h1>
            <motion.p 
              className="text-gray-600 text-lg max-w-md leading-relaxed"
              variants={itemVariants}
            >
              Accédez à votre tableau de bord pour piloter vos événements et suivre vos scans en temps réel.
            </motion.p>
          </motion.div>

          {/* Illustration Card */}
          <motion.div 
            className="relative bg-gray-200/50 rounded-3xl p-8 aspect-square max-w-md overflow-hidden shadow-inner border border-gray-100/50 flex items-center justify-center"
            variants={illustrationVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div 
              className="w-48 h-80 bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden"
              animate={{ rotateY: [0, 5, 0, -5, 0] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
               <div className="text-white/20 relative">
                  <QrCode size={80} />
                  <div className="absolute top-0 left-0 w-full h-0.5 bg-[#FF5005] shadow-[0_0_15px_#FF5005] animate-scan" />
               </div>
               <p className="text-[10px] text-white/50 mt-8 uppercase tracking-widest font-semibold">Accès Sécurisé</p>
            </motion.div>
            
            <motion.div 
              className="absolute bottom-12 right-12 bg-white p-4 rounded-2xl shadow-xl border border-gray-50 flex items-center gap-3"
              variants={floatingIconVariants}
              animate="animate"
            >
              <div className="w-10 h-10 rounded-full flex items-center justify-center bg-blue-50 text-[#016BDC]">
                <Mail size={20} />
              </div>
              <div>
                <p className="text-[10px] text-gray-400 font-bold uppercase">Invitations</p>
                <p className="text-sm font-bold text-gray-800">1,240 envoyées</p>
              </div>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* COLONNE DROITE - Formulaire de Connexion */}
        <motion.div 
          className="w-full md:w-1/2 flex justify-center"
          variants={cardVariants}
        >
          <motion.div 
            className="bg-white p-10 rounded-[2rem] shadow-2xl shadow-blue-900/5 w-full max-w-lg border border-gray-100 flex flex-col"
            initial={{ opacity: 0, y: 50 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            
            <motion.div 
              className="mb-8"
              variants={itemVariants}
            >
              <motion.h2 
                className="text-2xl font-bold text-[#016BDC] tracking-tight"
                initial={{ scale: 0.9 }}
                animate={{ scale: 1 }}
                transition={{ delay: 0.3 }}
              >
                Connexion
              </motion.h2>
              <p className="text-sm text-gray-500 mt-1">Saisissez vos identifiants pour continuer.</p>
            </motion.div>

            <form className="space-y-6 flex-grow" onSubmit={handleSubmit}>
              
              {/* Email */}
              <motion.div className="space-y-1.5" variants={itemVariants}>
                <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400 ml-1">Email professionnel</label>
                <motion.div 
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                  animate={errors.email ? "error" : ""}
                >
                  <Mail className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.email ? 'text-red-400' : 'text-gray-300'}`} size={18} />
                  <input 
                    name="email"
                    type="email" 
                    value={formData.email}
                    onChange={handleChange}
                    placeholder="jean@entreprise.com" 
                    className={`w-full pl-12 pr-4 py-3.5 bg-blue-50/50 rounded-xl border-none text-sm focus:ring-2 outline-none transition-all ${errors.email ? 'ring-2 ring-red-400' : 'focus:ring-[#016BDC]/20'}`} 
                  />
                </motion.div>
                {errors.email && (
                  <motion.p 
                    className="text-[10px] text-red-500 font-medium ml-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.email}
                  </motion.p>
                )}
              </motion.div>

              {/* Mot de Passe */}
              <motion.div className="space-y-1.5" variants={itemVariants}>
                <div className="flex justify-between items-center px-1">
                  <label className="text-[10px] font-bold uppercase tracking-wider text-gray-400">Mot de passe</label>
                  <motion.a 
                    href="#" 
                    style={{ color: '#016BDC' }} 
                    className="text-[10px] font-semibold hover:underline"
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    Oublié ?
                  </motion.a>
                </div>
                <motion.div 
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                  animate={errors.password ? "error" : ""}
                >
                  <Lock className={`absolute left-4 top-1/2 -translate-y-1/2 ${errors.password ? 'text-red-400' : 'text-gray-300'}`} size={18} />
                  <input 
                    name="password"
                    type={showPassword ? "text" : "password"} 
                    value={formData.password}
                    onChange={handleChange}
                    placeholder="********" 
                    className={`w-full pl-12 pr-12 py-3.5 bg-blue-50/50 rounded-xl border-none text-sm focus:ring-2 outline-none transition-all ${errors.password ? 'ring-2 ring-red-400' : 'focus:ring-[#016BDC]/20'}`} 
                  />
                  <motion.button 
                    type="button" 
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </motion.div>
                {errors.password && (
                  <motion.p 
                    className="text-[10px] text-red-500 font-medium ml-1"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {errors.password}
                  </motion.p>
                )}
              </motion.div>

              {/* Se souvenir de moi */}
              <motion.div 
                className="flex items-center gap-2 px-1"
                variants={itemVariants}
              >
                <motion.input 
                  name="rememberMe"
                  type="checkbox" 
                  id="remember"
                  checked={formData.rememberMe}
                  onChange={handleChange}
                  style={{ color: '#FF5005' }}
                  className="h-4 w-4 rounded border-gray-300 focus:ring-[#FF5005] cursor-pointer"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                />
                <label htmlFor="remember" className="text-[11px] text-gray-500 font-medium cursor-pointer">Rester connecté</label>
              </motion.div>

              {/* Bouton Connexion */}
              <motion.div 
                className="pt-2"
                variants={itemVariants}
              >
                <motion.button 
                  type="submit"
                  disabled={loginLoading}
                  style={{ backgroundColor: '#FF5005' }}
                  className="w-full text-white py-4 rounded-xl font-bold flex items-center justify-center gap-2.5 hover:brightness-110 transition-all shadow-lg shadow-orange-200 text-sm disabled:opacity-50"
                  variants={buttonVariants}
                  whileHover={!loginLoading ? "hover" : {}}
                  whileTap={!loginLoading ? "tap" : {}}
                >
                  {loginLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Connexion en cours...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5"
                    >
                      Se connecter 
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 0.8, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <ArrowRight size={18} />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            </form>

            {/* Séparateur */}
            <motion.div 
              className="relative my-10 text-center"
              variants={itemVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative px-3 text-[10px] font-semibold text-gray-300 bg-white uppercase tracking-widest">ou</span>
            </motion.div>

            {/* Google Login */}
            <motion.button 
              className="w-full border border-gray-100 py-3.5 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-3 hover:bg-gray-50 transition-all text-sm shadow-sm"
              variants={buttonVariants}
              whileHover="hover"
              whileTap="tap"
            >
              <motion.img 
                src="https://www.google.com/favicon.ico" 
                className="w-4 h-4" 
                alt="Google"
                whileHover={{ rotate: 360 }}
                transition={{ duration: 0.5 }}
              />
              Continuer avec Google
            </motion.button>

            {/* Redirection Inscription */}
            <motion.div 
              className="text-center mt-12 text-xs text-gray-500"
              variants={itemVariants}
            >
              Nouveau ici ? 
              <motion.div
                style={{ display: 'inline-block' }}
                whileHover={{ scale: 1.05, x: 2 }}
              >
                <Link to="/register" style={{ color: '#016BDC' }} className="font-semibold hover:underline ml-1">
                  Créer un compte gratuitement
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer Minimal */}
      <motion.footer 
        className="p-8 border-t border-blue-100 bg-white/50 flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-gray-500 text-[10px]">
          <span className="font-bold text-gray-900 mr-2">ARSHIEVENT AI</span>
          © 2024 • Sécurisé par chiffrement AES-256
        </div>
        <div className="flex gap-6 text-[10px] font-medium text-gray-400">
          {['Support', 'Mentions Légales'].map((item, index) => (
            <motion.a 
              key={item}
              href="#" 
              className="hover:text-gray-900"
              whileHover={{ scale: 1.1 }}
              whileTap={{ scale: 0.95 }}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.6 + index * 0.1 }}
            >
              {item}
            </motion.a>
          ))}
        </div>
      </motion.footer>

      <style dangerouslySetInnerHTML={{__html: `
        @keyframes scan {
          0% { top: 0; opacity: 0; }
          50% { opacity: 1; }
          100% { top: 100%; opacity: 0; }
        }
        .animate-scan {
          animation: scan 2s linear infinite;
        }
      `}} />
    </motion.div>
  );
};

export default ConnexionPage;