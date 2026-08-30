import React, { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  QrCode, 
  Zap, 
  CheckCircle2, 
  XCircle, 
  AlertCircle,
  Loader2,
  Mail,
  Phone,
  MapPin,
  User,
  Shield,
  ArrowRight,
  Sparkles,
  Lock
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { useAddUser } from '../../hooks/useRegister';
import { useGoogleLogin } from '../../hooks/useAuth';
import { GoogleLogin } from '@react-oauth/google';
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

  const { addUser, loading: addLoading, error: addError, success, reset } = useAddUser();
  const googleLogin = useGoogleLogin();

  const handleGoogleSuccess = async (credentialResponse) => {
    try {
      if (!credentialResponse.credential) {
        toast.error("Impossible de récupérer les identifiants Google");
        return;
      }
      const result = await googleLogin(credentialResponse.credential);
      if (!result?.success) {
        throw new Error(result?.error || "Échec de l'inscription via Google");
      }
      toast.success("Connexion avec Google réussie !");
      navigate('/dashboard/vue');
    } catch (err) {
      console.error("Erreur Google Login:", err);
      toast.error(err?.message || "Échec de l'inscription via Google");
    }
  };

  const handleChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value,
    }));
    if (formErrors[name]) {
      setFormErrors((prev) => ({ ...prev, [name]: '' }));
    }
  };

  const validate = () => {
    const errors = {};
    if (!formData.first_name) errors.first_name = 'Le prénom est requis';
    if (!formData.last_name) errors.last_name = 'Le nom est requis';
    if (!formData.email) errors.email = "L'email est requis";
    else if (!/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(formData.email)) 
      errors.email = "Email invalide";
    
    if (formData.phone && !/^\+?\d[\d\s]{7,}$/.test(formData.phone)) 
      errors.phone = 'Numéro invalide';
    
    if (!formData.password) errors.password = 'Mot de passe requis';
    else if (formData.password.length < 6) 
      errors.password = 'Minimum 6 caractères requis';
    
    if (!formData.confirmPassword) 
      errors.confirmPassword = 'Confirmation requise';
    else if (formData.password && formData.confirmPassword && formData.password !== formData.confirmPassword) 
      errors.confirmPassword = 'Les mots de passe ne correspondent pas';
    
    if (!formData.accept_cgu) 
      errors.accept_cgu = 'Vous devez accepter les conditions';
    
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const errors = validate();
    setFormErrors(errors);
    
    if (Object.keys(errors).length === 0) {
      const userData = {
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone || '',
        city: formData.city || '',
        password: formData.password,
      };
      
      try {
        await addUser(userData);
        toast.success("Inscription réussie ! Redirection...", { position: 'top-center' });
        setFormData(initialFormData);
        reset();
        setTimeout(() => {
          navigate('/login');
        }, 1800);
      } catch (error) {
        toast.error(error.message || "Erreur lors de l'inscription", { position: 'top-center' });
      }
    } else {
      toast.error('Veuillez renseigner tous les champs obligatoires.', { position: 'top-center' });
    }
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const getStrengthBarColor = (index) => {
    if (passwordStrength === 'fort') return 'bg-emerald-500';
    if (passwordStrength === 'moyen') return index < 2 ? 'bg-amber-400' : 'bg-white/10';
    if (passwordStrength === 'faible') return index < 1 ? 'bg-red-400' : 'bg-white/10';
    return 'bg-white/10';
  };

  return (
    <div className="min-h-screen bg-[#0B1727] flex flex-col justify-between font-sans relative overflow-hidden text-white">
      <Toaster position="top-center" reverseOrder={false} />
      
      {/* Background glow orbs */}
      <div className="absolute -top-32 -right-32 w-96 h-96 bg-[#FF5005]/20 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute -bottom-32 -left-32 w-[500px] h-[500px] bg-[#1E6FD9]/20 rounded-full blur-[140px] pointer-events-none" />

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
        <Link to="/login" className="text-xs font-semibold text-gray-300 hover:text-white bg-white/5 hover:bg-white/10 px-4 py-2 rounded-full border border-white/10 transition">
          Déjà inscrit ? <span className="text-[#FF5005] font-bold ml-1">Se connecter</span>
        </Link>
      </header>

      {/* Main Content */}
      <div className="flex-grow flex items-center justify-center p-6 md:p-12 relative z-10">
        <div className="max-w-6xl w-full grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
          
          {/* COLONNE GAUCHE (Prestige Presentation) */}
          <div className="hidden lg:flex lg:col-span-5 flex-col justify-center space-y-6 text-left">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-white/5 border border-white/10 text-orange-400 text-xs font-bold uppercase tracking-widest w-max">
              <Sparkles size={12} />
              Création d'espace Organisateur
            </div>

            <h1 className="text-4xl sm:text-5xl font-black text-white leading-tight tracking-tight">
              Prenez le contrôle de vos <br />
              <span className="bg-gradient-to-r from-[#FF5005] via-[#ff7b2a] to-[#EFB810] bg-clip-text text-transparent">
                événements VIP.
              </span>
            </h1>

            <p className="text-slate-300 text-sm leading-relaxed">
              Génération automatique de QR codes sécurisés, pilotage de billetterie et diffusion intelligente auprès de vos invités.
            </p>

            {/* Stepper 3 Étapes */}
            <div className="space-y-4 pt-4 border-t border-white/10 max-w-sm">
              {[
                { step: "01", title: "Compte Organisateur", desc: "Configuration de votre profil en 1 min" },
                { step: "02", title: "Création d'Événements", desc: "Importez vos listes & personnalisez vos billets" },
                { step: "03", title: "Scan & Suivi Live", desc: "Scannez à l'accueil à 60fps sans attente" }
              ].map((item, i) => (
                <div key={i} className="flex items-start gap-3.5">
                  <div className="w-8 h-8 rounded-xl bg-white/10 text-[#FF5005] font-black text-xs flex items-center justify-center border border-white/10 shrink-0">
                    {item.step}
                  </div>
                  <div>
                    <h4 className="text-xs font-bold text-white">{item.title}</h4>
                    <p className="text-[11px] text-gray-400">{item.desc}</p>
                  </div>
                </div>
              ))}
            </div>

          </div>

          {/* COLONNE DROITE (Formulaire d'Inscription) */}
          <div className="lg:col-span-7 flex justify-center">
            <motion.div 
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.5 }}
              className="bg-[#111827]/95 p-5 sm:p-7 rounded-2xl shadow-2xl border border-white/10 backdrop-blur-2xl w-full max-w-lg text-left"
            >
              <div className="mb-4">
                <h2 className="text-xl font-extrabold text-white tracking-tight">
                  Créer un compte
                </h2>
                <p className="text-xs text-gray-400 mt-0.5">
                  Accédez instantanément à toute la suite logicielle ARSHI EVENT.
                </p>
              </div>

              <form onSubmit={handleSubmit} className="space-y-3.5">
                
                {/* Ligne 1 : Prénom & Nom */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Prénom</label>
                    <div className="relative">
                      <User size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${formErrors.first_name ? 'text-red-400' : 'text-gray-400'}`} />
                      <input 
                        type="text"
                        name="first_name"
                        value={formData.first_name}
                        onChange={handleChange}
                        placeholder="Jean"
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                          formErrors.first_name ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                        }`}
                      />
                    </div>
                    {formErrors.first_name && <p className="text-[9px] text-red-400 font-semibold">{formErrors.first_name}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Nom</label>
                    <div className="relative">
                      <User size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${formErrors.last_name ? 'text-red-400' : 'text-gray-400'}`} />
                      <input 
                        type="text"
                        name="last_name"
                        value={formData.last_name}
                        onChange={handleChange}
                        placeholder="Dupont"
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                          formErrors.last_name ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                        }`}
                      />
                    </div>
                    {formErrors.last_name && <p className="text-[9px] text-red-400 font-semibold">{formErrors.last_name}</p>}
                  </div>
                </div>

                {/* Ligne 2 : Email & Téléphone */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Email professionnel</label>
                    <div className="relative">
                      <Mail size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${formErrors.email ? 'text-red-400' : 'text-gray-400'}`} />
                      <input 
                        type="email"
                        name="email"
                        value={formData.email}
                        onChange={handleChange}
                        placeholder="nom@societe.com"
                        className={`w-full pl-10 pr-3 py-2.5 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                          formErrors.email ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                        }`}
                      />
                    </div>
                    {formErrors.email && <p className="text-[9px] text-red-400 font-semibold">{formErrors.email}</p>}
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Téléphone</label>
                    <div className="relative">
                      <Phone size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                      <input 
                        type="tel"
                        name="phone"
                        value={formData.phone}
                        onChange={handleChange}
                        placeholder="+33 6 12 34 56 78"
                        className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005] transition-all"
                      />
                    </div>
                  </div>
                </div>

                {/* Ligne 3 : Ville */}
                <div className="space-y-1">
                  <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Ville / Siège</label>
                  <div className="relative">
                    <MapPin size={15} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-gray-400" />
                    <input 
                      type="text"
                      name="city"
                      value={formData.city}
                      onChange={handleChange}
                      placeholder="Paris, France"
                      className="w-full pl-10 pr-3 py-2.5 bg-white/5 border border-white/10 rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:border-[#FF5005] focus:ring-1 focus:ring-[#FF5005] transition-all"
                    />
                  </div>
                </div>

                {/* Ligne 4 : Mot de passe & Confirmation */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Mot de passe</label>
                    <div className="relative">
                      <Lock size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${formErrors.password ? 'text-red-400' : 'text-gray-400'}`} />
                      <input 
                        type={showPassword ? 'text' : 'password'}
                        name="password"
                        value={formData.password}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-8 py-2.5 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                          formErrors.password ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>

                  <div className="space-y-1">
                    <label className="text-[10px] font-extrabold uppercase tracking-wider text-gray-400">Confirmation</label>
                    <div className="relative">
                      <Lock size={15} className={`absolute left-3.5 top-1/2 -translate-y-1/2 ${formErrors.confirmPassword ? 'text-red-400' : 'text-gray-400'}`} />
                      <input 
                        type={showConfirmPassword ? 'text' : 'password'}
                        name="confirmPassword"
                        value={formData.confirmPassword}
                        onChange={handleChange}
                        placeholder="••••••••"
                        className={`w-full pl-10 pr-8 py-2.5 bg-white/5 border rounded-xl text-xs text-white placeholder:text-gray-500 focus:outline-none focus:ring-1 transition-all ${
                          formErrors.confirmPassword ? 'border-red-500 focus:ring-red-500' : 'border-white/10 focus:border-[#FF5005] focus:ring-[#FF5005]'
                        }`}
                      />
                      <button 
                        type="button" 
                        onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                        className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                      >
                        {showConfirmPassword ? <EyeOff size={14} /> : <Eye size={14} />}
                      </button>
                    </div>
                  </div>
                </div>

                {/* Password Strength Bars */}
                {formData.password && (
                  <div className="flex items-center gap-1.5 pt-1">
                    {[0, 1, 2].map((idx) => (
                      <div key={idx} className={`h-1 flex-1 rounded-full transition-all duration-300 ${getStrengthBarColor(idx)}`} />
                    ))}
                    <span className="text-[9px] font-bold uppercase tracking-wider text-gray-400 ml-2">
                      Force : {passwordStrength}
                    </span>
                  </div>
                )}
                {formErrors.password && <p className="text-[9px] text-red-400 font-semibold">{formErrors.password}</p>}
                {formErrors.confirmPassword && <p className="text-[9px] text-red-400 font-semibold">{formErrors.confirmPassword}</p>}

                {/* CGU Checkbox */}
                <div className="pt-2">
                  <div className="flex items-center gap-2">
                    <input 
                      type="checkbox"
                      id="accept_cgu"
                      name="accept_cgu"
                      checked={formData.accept_cgu}
                      onChange={handleChange}
                      className="h-3.5 w-3.5 rounded border-white/20 bg-white/5 text-[#FF5005] focus:ring-[#FF5005] cursor-pointer"
                    />
                    <label htmlFor="accept_cgu" className="text-[11px] text-gray-400 cursor-pointer">
                      J'accepte les conditions d'utilisation et la politique de confidentialité
                    </label>
                  </div>
                  {formErrors.accept_cgu && <p className="text-[9px] text-red-400 font-semibold mt-1">{formErrors.accept_cgu}</p>}
                </div>

                {/* Submit Button */}
                <div className="pt-3">
                  <motion.button 
                    type="submit"
                    disabled={addLoading}
                    whileHover={!addLoading ? { scale: 1.02, boxShadow: "0 12px 30px -5px rgba(255, 80, 5, 0.45)" } : {}}
                    whileTap={!addLoading ? { scale: 0.98 } : {}}
                    className="w-full bg-[#FF5005] hover:bg-[#ff6220] text-white py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider flex items-center justify-center gap-2 shadow-lg shadow-orange-500/25 transition-all cursor-pointer disabled:opacity-50"
                  >
                    {addLoading ? (
                      <div className="flex items-center gap-2">
                        <Loader2 className="h-4 w-4 animate-spin" />
                        <span>Création en cours...</span>
                      </div>
                    ) : (
                      <div className="flex items-center gap-2">
                        <span>Créer mon espace événementiel</span>
                        <ArrowRight size={15} />
                      </div>
                    )}
                  </motion.button>
                </div>

              </form>

              {/* Separator */}
              <div className="relative my-5 text-center">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-white/10"></div>
                </div>
                <span className="relative px-3 text-[10px] font-extrabold uppercase tracking-widest text-gray-500 bg-[#111827]">
                  ou
                </span>
              </div>

              {/* Google OAuth */}
              <div className="flex justify-center w-full">
                <GoogleLogin
                  onSuccess={handleGoogleSuccess}
                  onError={() => toast.error("Échec de l'inscription avec Google")}
                  text="signup_with"
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
        © {new Date().getFullYear()} ARSHI EVENT • Plateforme SaaS sécurisée
      </footer>

    </div>
  );
};

export default InscriptionPage;