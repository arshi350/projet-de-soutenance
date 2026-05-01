import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  QrCode, 
  Zap, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Users,
  Shield,
  ArrowRight
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAddUser } from '../../hooks/useRegister';
import toast, { Toaster } from 'react-hot-toast';

const initialFormData = {
  first_name: '',
  last_name: '',
  email: '',
  phone: '',
  city: '',        
  password: '',
  confirmPassword: '',
  accept_cgu: false,
};

function getPasswordStrength(password) {
  if (!password) return 'vide';
  let score = 0;
  if (password.length >= 8) score++;
  if (/[A-Z]/.test(password)) score++;
  if (/[0-9]/.test(password)) score++;
  if (/[^A-Za-z0-9]/.test(password)) score++;
  if (score >= 3) return 'fort';
  if (score === 2) return 'moyen';
  return 'faible';
}

const InscriptionPage = () => {
  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const navigate = useNavigate();

  // Utilisation du hook useAddUser
  const { addUser, loading: addLoading, error: addError, success, reset } = useAddUser();

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    // Effacer l'erreur du champ lorsqu'il est modifié
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    
    // Prénom (first_name)
    if (!formData.first_name) errors.first_name = 'Le prénom est requis';
    
    // Nom (last_name)
    if (!formData.last_name) errors.last_name = 'Le nom est requis';
    
    // Email
    if (!formData.email) errors.email = "L'email est requis";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) 
      errors.email = "Email invalide";
    
    // Téléphone (optionnel mais validation si rempli)
    if (formData.phone && !/^\+?\d[\d\s]{7,}$/.test(formData.phone)) 
      errors.phone = 'Numéro invalide';
    
    // Ville (optionnel)
    // Pas de validation obligatoire pour city
    
    // Mot de passe
    if (!formData.password) errors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) 
      errors.password = 'Le mot de passe doit contenir au moins 6 caractères';
    
    // Confirmation mot de passe
    if (!formData.confirmPassword) 
      errors.confirmPassword = 'Confirmation requise';
    else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) 
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    // CGU
    if (!formData.accept_cgu) 
      errors.accept_cgu = 'Vous devez accepter les CGU';
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      // Préparer les données à envoyer à l'API
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || '',
        city: formData.city || '',
        password: formData.password,
      };
      
      try {
        // Appel API avec le hook useAddUser
        await addUser(userData);
        
        // Toast de succès avec design amélioré
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, scale: 0.9 }}
            className="max-w-md w-full bg-green-100 rounded-2xl pointer-events-auto overflow-hidden transform transition-all duration-300 border-2 border-emerald-500 shadow-lg shadow-emerald-500/30"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <motion.div 
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-green-100 border border-green-500"
                    initial={{ scale: 0 }}
                    animate={{ scale: 1 }}
                    transition={{ type: "spring", stiffness: 300 }}
                  >
                    <CheckCircle className="h-6 w-6 text-green-500" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-green-500">
                    ✨ Inscription réussie !
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 text-green-500 hover:text-green-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
              <div className="mt-3 flex items-center gap-2">
                <div className="flex-1 h-1 bg-green-500/20 rounded-full overflow-hidden">
                  <motion.div 
                    className="h-full bg-green-500 rounded-full"
                    initial={{ width: 0 }}
                    animate={{ width: '100%' }}
                    transition={{ duration: 2 }}
                  />
                </div>
              </div>
            </div>
          </motion.div>
        ), {
          duration: 3000,
          position: 'top-center',
        });
        
        // Succès de l'inscription
        setFormData(initialFormData);
        reset(); // Réinitialiser l'état du hook
        
        // Redirection après 2 secondes
        setTimeout(() => {
          navigate('/login');
        }, 2000);
        
      } catch (error) {
        // Toast d'erreur avec design amélioré
        const errorMessage = error.message || 'Erreur lors de l\'inscription. Veuillez réessayer.';
        toast.custom((t) => (
          <motion.div
            initial={{ opacity: 0, x: 100 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: 100 }}
            className="max-w-md w-full bg-red-100 rounded-2xl pointer-events-auto overflow-hidden transform transition-all duration-300 border-2 border-red-500 shadow-lg shadow-red-500/30"
          >
            <div className="p-5">
              <div className="flex items-start gap-4">
                <div className="flex-shrink-0 pt-0.5">
                  <motion.div 
                    className="flex items-center justify-center h-10 w-10 rounded-full bg-red-500/10 border border-red-500"
                    animate={{ rotate: [0, 10, -10, 0] }}
                    transition={{ duration: 0.5 }}
                  >
                    <AlertCircle className="h-6 w-6 text-red-500" />
                  </motion.div>
                </div>
                <div className="flex-1">
                  <p className="text-sm font-bold text-red-500">
                    ❌ Erreur d'inscription
                  </p>
                  <p className="mt-1 text-xs text-red-400 line-clamp-2">
                    {errorMessage}
                  </p>
                </div>
                <button
                  onClick={() => toast.dismiss(t.id)}
                  className="flex-shrink-0 text-red-500 hover:text-red-600 transition-colors"
                >
                  <XCircle className="h-5 w-5" />
                </button>
              </div>
            </div>
          </motion.div>
        ), {
          duration: 4000,
          position: 'top-center',
        });
        console.error('Erreur lors de l\'inscription:', error);
      }
    } else {
      // Toast d'erreur de validation avec design amélioré
      toast.custom((t) => (
        <motion.div
          initial={{ opacity: 0, y: -50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -50 }}
          className="max-w-md w-full bg-amber-100 rounded-2xl pointer-events-auto overflow-hidden transform transition-all duration-300 border-2 border-orange-500 shadow-lg shadow-orange-500/30"
        >
          <div className="p-5">
            <div className="flex items-start gap-4">
              <div className="flex-shrink-0 pt-0.5">
                <motion.div 
                  className="flex items-center justify-center h-10 w-10 rounded-full bg-amber-50 border border-orange-500"
                  animate={{ scale: [1, 1.2, 1] }}
                  transition={{ duration: 0.5 }}
                >
                  <AlertCircle className="h-6 w-6 text-orange-500" />
                </motion.div>
              </div>
              <div className="flex-1">
                <p className="text-sm font-bold text-orange-500">
                  ⚠️ Formulaire incomplet
                </p>
                <p className="mt-1 text-xs text-orange-400">
                  Veuillez corriger les erreurs avant de continuer
                </p>
              </div>
              <button
                onClick={() => toast.dismiss(t.id)}
                className="flex-shrink-0 text-orange-500 hover:text-orange-600 transition-colors"
              >
                <XCircle className="h-5 w-5" />
              </button>
            </div>
          </div>
        </motion.div>
      ), {
        duration: 3000,
        position: 'top-center',
      });
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthLabel = () => {
    if (passwordStrength === 'vide') return 'Vide';
    if (passwordStrength === 'faible') return 'Faible';
    if (passwordStrength === 'moyen') return 'Moyen';
    if (passwordStrength === 'fort') return 'Fort';
    return '';
  };

  const getStrengthColor = () => {
    if (passwordStrength === 'fort') return 'bg-green-500';
    if (passwordStrength === 'moyen') return 'bg-amber-400';
    if (passwordStrength === 'faible') return 'bg-red-400';
    return 'bg-gray-200';
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.15,
        delayChildren: 0.1
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
        duration: 0.6
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
        duration: 0.6
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
        duration: 0.3
      }
    }
  };

  const floatingIconVariants = {
    animate: {
      y: [0, -10, 0],
      transition: {
        duration: 2,
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
      {/* Toaster Component */}
      <Toaster 
        position="top-center"
        reverseOrder={false}
        gutter={8}
        containerClassName=""
        containerStyle={{}}
      />
      
      {/* Main Content */}
      <div className="flex-grow flex flex-col md:flex-row max-w-7xl mx-auto w-full p-6 md:p-12 gap-12 items-center">
        
        {/* COLONNE GAUCHE */}
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
            <div className="font-bold text-3xl text-gray-900 tracking-tight">
              ARSHI<span className="text-[#FF5005]">EVENT</span>
            </div>
          </motion.div>
          
          <motion.div className="space-y-6" variants={itemVariants}>
            <h1 className="text-5xl font-extrabold text-gray-900 leading-tight">
              Créez votre <motion.span 
                className='text-[#016BDC]'
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: 0.3, duration: 0.5 }}
              >
                espace événementiel
              </motion.span>
            </h1>
            <motion.p 
              className="text-gray-600 text-lg max-w-md leading-relaxed"
              variants={itemVariants}
            >
              Automatisez vos invitations, gérez vos invités en temps réel avec QR codes.
            </motion.p>
          </motion.div>

          {/* Illustration Card */}
          <motion.div 
            className="relative bg-gray-200/50 rounded-3xl p-8 aspect-square max-w-md overflow-hidden shadow-inner border border-gray-100/50"
            variants={illustrationVariants}
            whileHover={{ scale: 1.02 }}
            transition={{ type: "spring", stiffness: 300, damping: 20 }}
          >
            <motion.div 
              className="absolute top-4 right-4 bg-slate-800 text-white text-[10px] px-3 py-1 rounded-full flex items-center gap-1.5 font-medium z-10 shadow-sm"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 }}
            >
              <motion.span 
                className="w-2 h-2 bg-green-400 rounded-full"
                animate={{ scale: [1, 1.2, 1] }}
                transition={{ duration: 1, repeat: Infinity }}
              />
              +500 événements gérés
            </motion.div>
            
            <div className="w-full h-full flex flex-col items-center justify-center">
              <motion.div 
                className="w-48 h-80 bg-slate-900 rounded-[3rem] border-8 border-slate-800 shadow-2xl relative flex flex-col items-center justify-center overflow-hidden"
                animate={{ rotateY: [0, 5, 0, -5, 0] }}
                transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
              >
                <div className="text-white/20"><QrCode size={80} /></div>
                <div className="absolute bottom-10 w-3/4 h-1 bg-[#FF5005] rounded-full">
                  <motion.div 
                    className="h-full w-full bg-[#FF5005] rounded-full"
                    animate={{ opacity: [0.4, 1, 0.4] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  />
                </div>
                <p className="text-[10px] text-white/50 mt-4 uppercase tracking-widest font-semibold">Scanning...</p>
              </motion.div>
              
              <motion.div 
                className="absolute bottom-10 left-10 right-10 bg-white/80 backdrop-blur-md p-4 rounded-xl border border-white flex justify-between items-center shadow-lg"
                variants={floatingIconVariants}
                animate="animate"
              >
                <div>
                  <p className="text-[10px] text-gray-500 font-bold uppercase tracking-wider">Présence en direct</p>
                  <p className="text-lg font-bold text-gray-800">842 / 1000</p>
                </div>
                <motion.div 
                  className="w-10 h-10 rounded-full border-4 border-green-500 border-t-transparent flex items-center justify-center text-[11px] font-extrabold text-green-700 bg-white shadow-inner"
                  animate={{ rotate: 360 }}
                  transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
                >
                  84%
                </motion.div>
              </motion.div>
            </div>
          </motion.div>

          <motion.div 
            className="flex items-center gap-3 pt-2"
            variants={itemVariants}
          >
            <div className="flex -space-x-2.5">
              {[
                { icon: Users, color: '#FF5005', delay: 0 },
                { icon: Shield, color: '#016BDC', delay: 0.1 },
                { icon: CheckCircle, color: '#gray-300', delay: 0.2 }
              ].map((item, index) => (
                <motion.div
                  key={index}
                  className="w-9 h-9 rounded-full border-2 border-white flex items-center justify-center"
                  style={{ backgroundColor: item.color }}
                  initial={{ scale: 0, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  transition={{ delay: 0.6 + index * 0.1, type: "spring" }}
                  whileHover={{ scale: 1.1 }}
                >
                  <item.icon size={14} className="text-white" />
                </motion.div>
              ))}
            </div>
            <p className="text-xs text-gray-500 font-medium">+500 organisateurs nous font confiance</p>
          </motion.div>
        </motion.div>

        {/* COLONNE DROITE */}
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
                Créer un compte
              </motion.h2>
              <p className="text-sm text-gray-500 mt-1">Rejoignez l'élite de la gestion événementielle.</p>
            </motion.div>

            <form className="space-y-4 flex-grow" onSubmit={handleSubmit}>
              {/* Ligne 1 : Prénom et Nom */}
              <motion.div className="flex gap-4" variants={itemVariants}>
                <div className="flex-1 space-y-1.5">
                  <motion.div 
                    className="relative"
                    variants={inputVariants}
                    whileFocus="focus"
                    animate={formErrors.first_name ? "error" : ""}
                  >
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="first_name"
                      placeholder="Prénom"
                      value={formData.first_name}
                      onChange={handleChange}
                      className={`w-full p-3 pl-9 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all ${formErrors.first_name ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </motion.div>
                  {formErrors.first_name && (
                    <motion.span 
                      className="text-[10px] text-red-500 ml-1 font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {formErrors.first_name}
                    </motion.span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <motion.div 
                    className="relative"
                    variants={inputVariants}
                    whileFocus="focus"
                    animate={formErrors.last_name ? "error" : ""}
                  >
                    <User size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="text"
                      name="last_name"
                      placeholder="Nom"
                      value={formData.last_name}
                      onChange={handleChange}
                      className={`w-full p-3 pl-9 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all ${formErrors.last_name ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </motion.div>
                  {formErrors.last_name && (
                    <motion.span 
                      className="text-[10px] text-red-500 ml-1 font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {formErrors.last_name}
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Ligne 2 : Email et Téléphone */}
              <motion.div className="flex gap-4" variants={itemVariants}>
                <div className="flex-1 space-y-1.5">
                  <motion.div 
                    className="relative"
                    variants={inputVariants}
                    whileFocus="focus"
                    animate={formErrors.email ? "error" : ""}
                  >
                    <Mail size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="email"
                      name="email"
                      placeholder="Email professionnel"
                      value={formData.email}
                      onChange={handleChange}
                      className={`w-full p-3 pl-9 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all ${formErrors.email ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </motion.div>
                  {formErrors.email && (
                    <motion.span 
                      className="text-[10px] text-red-500 ml-1 font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {formErrors.email}
                    </motion.span>
                  )}
                </div>
                <div className="flex-1 space-y-1.5">
                  <motion.div 
                    className="relative"
                    variants={inputVariants}
                    whileFocus="focus"
                    animate={formErrors.phone ? "error" : ""}
                  >
                    <Phone size={16} className="absolute left-3 top-3 text-gray-400" />
                    <input
                      type="tel"
                      name="phone"
                      placeholder="Téléphone"
                      value={formData.phone}
                      onChange={handleChange}
                      className={`w-full p-3 pl-9 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all ${formErrors.phone ? 'ring-2 ring-red-400' : ''}`}
                    />
                  </motion.div>
                  {formErrors.phone && (
                    <motion.span 
                      className="text-[10px] text-red-500 ml-1 font-medium"
                      initial={{ opacity: 0, y: -10 }}
                      animate={{ opacity: 1, y: 0 }}
                    >
                      {formErrors.phone}
                    </motion.span>
                  )}
                </div>
              </motion.div>

              {/* Ligne 3 : Ville (CITY) */}
              <motion.div className="space-y-1.5" variants={itemVariants}>
                <motion.div 
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                >
                  <MapPin size={16} className="absolute left-3 top-3 text-gray-400" />
                  <input
                    type="text"
                    name="city"
                    placeholder="Ville"
                    value={formData.city}
                    onChange={handleChange}
                    className="w-full p-3 pl-9 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all"
                  />
                </motion.div>
              </motion.div>

              {/* Mot de passe */}
              <motion.div className="space-y-1.5" variants={itemVariants}>
                <label className="text-[10px] uppercase tracking-wider text-gray-500 font-semibold ml-1">
                  Mot de passe
                </label>
                <motion.div 
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                  animate={formErrors.password ? "error" : ""}
                >
                  <input
                    type={showPassword ? 'text' : 'password'}
                    name="password"
                    placeholder="********"
                    value={formData.password}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all ${formErrors.password ? 'ring-2 ring-red-400' : ''}`}
                  />
                  <motion.button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowPassword((v) => !v)}
                    tabIndex={-1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </motion.div>
                
                {/* Indicateur de force du mot de passe */}
                <div className="flex items-center gap-1 pt-1 ml-1">
                  {[0, 1, 2].map((index) => (
                    <motion.div
                      key={index}
                      className={`h-0.5 w-16 rounded-full ${index < (passwordStrength === 'fort' ? 3 : passwordStrength === 'moyen' ? 2 : passwordStrength === 'faible' ? 1 : 0) ? getStrengthColor() : 'bg-gray-200'}`}
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ delay: index * 0.1 }}
                    />
                  ))}
                  <motion.span 
                    className={`text-[8px] font-bold uppercase ml-auto tracking-wider ${
                      passwordStrength === 'fort' ? 'text-green-600' : 
                      passwordStrength === 'moyen' ? 'text-amber-600' : 
                      passwordStrength === 'faible' ? 'text-red-500' : 'text-gray-500'
                    }`}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                  >
                    {getStrengthLabel()}
                  </motion.span>
                </div>
                {formErrors.password && (
                  <motion.span 
                    className="text-[10px] text-red-500 ml-1 font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.password}
                  </motion.span>
                )}
              </motion.div>

              {/* Confirmation mot de passe */}
              <motion.div className="space-y-1.5 pt-1" variants={itemVariants}>
                <label className="text-[10px] font-semibold uppercase tracking-wider text-gray-500 ml-1">
                  Confirmer le mot de passe
                </label>
                <motion.div 
                  className="relative"
                  variants={inputVariants}
                  whileFocus="focus"
                  animate={formErrors.confirmPassword ? "error" : ""}
                >
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    name="confirmPassword"
                    placeholder="********"
                    value={formData.confirmPassword}
                    onChange={handleChange}
                    className={`w-full p-3 bg-gray-100 rounded-xl border-none text-sm focus:ring-2 focus:ring-[#016BDC]/40 outline-none transition-all ${formErrors.confirmPassword ? 'ring-2 ring-red-400' : ''}`}
                  />
                  <motion.button
                    type="button"
                    className="absolute right-3 top-3 text-gray-400 hover:text-gray-600"
                    onClick={() => setShowConfirmPassword((v) => !v)}
                    tabIndex={-1}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                  </motion.button>
                </motion.div>
                {formErrors.confirmPassword && (
                  <motion.span 
                    className="text-[10px] text-red-500 ml-1 font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.confirmPassword}
                  </motion.span>
                )}
              </motion.div>

              {/* CGU */}
              <motion.div className="pt-3" variants={itemVariants}>
                <div className="flex items-center gap-2 pt-1">
                  <div className="flex items-center h-5">
                    <motion.input
                      id="accept_cgu"
                      name="accept_cgu"
                      type="checkbox"
                      checked={formData.accept_cgu}
                      onChange={handleChange}
                      className="h-4 w-4 rounded border-gray-300 focus:ring-[#FF5005] text-[#FF5005] bg-white transition-colors cursor-pointer"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.9 }}
                    />
                  </div>
                  <div className="text-[10px] leading-tight text-gray-600">
                    <label htmlFor="accept_cgu" className="cursor-pointer">
                      J'accepte les <a href="#" style={{ color: '#016BDC' }} className="font-semibold hover:underline">CGU</a> et la{' '}
                      <a href="#" style={{ color: '#016BDC' }} className="font-semibold hover:underline">politique de confidentialité</a>
                    </label>
                  </div>
                </div>
                {formErrors.accept_cgu && (
                  <motion.span 
                    className="text-[10px] text-red-500 ml-1 font-medium"
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                  >
                    {formErrors.accept_cgu}
                  </motion.span>
                )}
              </motion.div>

              {/* Bouton de soumission */}
              <motion.div 
                className="pt-4"
                variants={itemVariants}
              >
                <motion.button 
                  type="submit"
                  disabled={addLoading}
                  style={{ backgroundColor: '#FF5005' }}
                  className="w-full text-white py-4 rounded-xl font-bold flex items-center cursor-pointer justify-center gap-2.5 hover:brightness-110 transition duration-300 shadow-lg shadow-orange-200 text-sm disabled:opacity-50"
                  variants={buttonVariants}
                  whileHover={!addLoading ? "hover" : {}}
                  whileTap={!addLoading ? "tap" : {}}
                >
                  {addLoading ? (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5"
                    >
                      <Loader2 className="h-5 w-5 animate-spin" />
                      Création en cours...
                    </motion.div>
                  ) : (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      className="flex items-center gap-2.5"
                    >
                      Créer mon espace événementiel 
                      <motion.div
                        animate={{ x: [0, 5, 0] }}
                        transition={{ duration: 0.6, repeat: Infinity, repeatDelay: 1 }}
                      >
                        <ArrowRight className="h-4 w-4" />
                      </motion.div>
                    </motion.div>
                  )}
                </motion.button>
              </motion.div>
            </form>

            <motion.div 
              className="relative my-8 text-center"
              variants={itemVariants}
            >
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative px-3 text-[10px] font-semibold text-gray-300 bg-white uppercase tracking-widest">
                ou
              </span>
            </motion.div>

            <motion.button 
              className="w-full border border-gray-200 py-3 rounded-xl font-semibold text-gray-700 flex items-center justify-center gap-3 bg-gray-50 hover:bg-gray-100 transition-all text-sm"
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

            <motion.div 
              className="text-center mt-10 text-xs text-gray-500"
              variants={itemVariants}
            >
              Déjà un compte ?{' '}
              <motion.div
                style={{ display: 'inline-block' }}
                whileHover={{ scale: 1.05, x: 2 }}
              >
                <Link to="/login" style={{ color: '#016BDC' }} className="font-semibold hover:underline">
                  Se connecter
                </Link>
              </motion.div>
            </motion.div>
          </motion.div>
        </motion.div>
      </div>

      {/* Footer */}
      <motion.footer 
        className="p-8 border-t border-blue-100 bg-white/50 flex flex-col md:flex-row justify-between items-center gap-4"
        initial={{ opacity: 0, y: 50 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
      >
        <div className="text-gray-500 text-[10px]">
          <span className="font-bold text-gray-900 block md:inline mr-2">ARSHIEVENT AI</span>
          © 2025 EventFlow AI.
        </div>
        <div className="flex gap-6 text-[10px] font-medium text-gray-400">
          {['Privacy Policy', 'Terms of Service'].map((item, index) => (
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
    </motion.div>
  );
};

export default InscriptionPage;