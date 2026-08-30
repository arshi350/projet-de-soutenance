import React from "react";
import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext.jsx";
import { Zap, Sparkles, ArrowRight, User, LogOut, LayoutDashboard, Plus } from "lucide-react";

export function Header() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthContext();

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    };

    const dashboardLink = isAuthenticated ? '/dashboard/vue' : '/login';
    const displayName = user?.first_name || user?.nom || "Organisateur";
    const avatarLetter = displayName?.charAt(0).toUpperCase() || "A";

    return (
        <header className="sticky top-0 z-50 w-full backdrop-blur-xl bg-white/85 dark:bg-[#0B1727]/90 border-b border-gray-200/80 dark:border-white/10 transition-all duration-300 shadow-sm">
            <div className="max-w-7xl mx-auto px-5 h-16 flex items-center justify-between">
                
                {/* LOGO */}
                <Link to="/" className="flex items-center gap-2 group">
                    <motion.div 
                        className="w-8 h-8 rounded-lg bg-gradient-to-tr from-[#FF5005] to-[#FF7B2A] flex items-center justify-center text-white shadow-md shadow-orange-500/25 group-hover:scale-105 transition-transform duration-300"
                        whileHover={{ rotate: 5 }}
                    >
                        <Zap size={18} className="fill-white" />
                    </motion.div>
                    <div className="flex flex-col">
                        <div className="flex items-center text-lg font-extrabold tracking-tight text-gray-900 dark:text-white">
                            <span>ARSHI</span>
                            <span className="text-[#FF5005] ml-1">EVENT</span>
                        </div>
                        <span className="text-[8px] font-bold uppercase tracking-widest text-gray-600 dark:text-gray-300 -mt-1">
                            Smart Event SaaS
                        </span>
                    </div>
                </Link>
                
                {/* NAVIGATION DESKTOP */}
                <nav className="hidden md:flex items-center gap-1 bg-gray-100/80 dark:bg-white/5 p-1 rounded-full border border-gray-200/60 dark:border-white/10 backdrop-blur-md">
                    {[
                        { to: "/", label: "Accueil", isLink: true },
                        { href: "#services", label: "Fonctionnalités", isLink: false },
                        { href: "#concierge", label: "Concierge IA", isLink: false },
                        { href: "#tarifs", label: "Tarification", isLink: false },
                    ].map((item) => (
                        <div key={item.label}>
                            {item.isLink ? (
                                <Link 
                                    to={item.to} 
                                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#FF5005] dark:hover:text-[#FF5005] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all duration-200 block"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a 
                                    href={item.href} 
                                    className="px-3.5 py-1.5 text-xs font-semibold text-gray-600 dark:text-gray-300 hover:text-[#FF5005] dark:hover:text-[#FF5005] hover:bg-white dark:hover:bg-white/10 rounded-full transition-all duration-200 block"
                                >
                                    {item.label}
                                </a>
                            )}
                        </div>
                    ))}
                    
                    {isAuthenticated && (
                        <Link 
                            to="/dashboard/vue" 
                            className="px-3.5 py-1.5 text-xs font-semibold text-[#FF5005] bg-orange-50 dark:bg-orange-950/40 rounded-full hover:bg-orange-100 transition-all flex items-center gap-1.5"
                        >
                            <LayoutDashboard size={13} />
                            Dashboard
                        </Link>
                    )}
                </nav>
                
                {/* ACTIONS & USER PROFILE */}
                <div className="flex items-center gap-2.5">
                    {isAuthenticated ? (
                        <div className="flex items-center gap-2.5 bg-white dark:bg-[#111827] border border-gray-200 dark:border-white/10 rounded-full p-1 pr-3.5 shadow-sm">
                            <motion.div 
                                className="w-7 h-7 rounded-full bg-gradient-to-tr from-[#FF5005] to-orange-400 text-white font-bold flex items-center justify-center text-xs shadow-md shadow-orange-500/20 cursor-pointer"
                                whileHover={{ scale: 1.08 }}
                            >
                                {avatarLetter}
                            </motion.div>
                            <div className="hidden sm:flex flex-col text-left">
                                <span className="font-bold text-xs text-gray-900 dark:text-white line-clamp-1">{displayName}</span>
                                <span className="text-[9px] text-emerald-500 font-medium flex items-center gap-1">
                                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span>
                                    En ligne
                                </span>
                            </div>
                            <Link 
                                to="/dashboard/evenement"
                                className="ml-1 hidden sm:flex items-center gap-1 text-xs font-semibold bg-[#FF5005] text-white px-2.5 py-1 rounded-full hover:bg-orange-600 transition shadow-sm"
                            >
                                <Plus size={12} />
                                Créer
                            </Link>
                            <button
                                onClick={handleLogout}
                                title="Se déconnecter"
                                className="p-1 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-950/30 rounded-full transition ml-0.5 cursor-pointer"
                            >
                                <LogOut size={14} />
                            </button>
                        </div>
                    ) : (
                        <div className="flex items-center gap-2">
                            <Link to="/login">
                                <motion.button 
                                    className="px-3.5 py-2 text-xs font-semibold text-gray-700 dark:text-gray-200 hover:text-[#FF5005] transition-colors cursor-pointer"
                                    whileHover={{ scale: 1.02 }}
                                    whileTap={{ scale: 0.98 }}
                                >
                                    Connexion
                                </motion.button>
                            </Link>
                            <Link to="/register">
                                <motion.button 
                                    className="px-4 py-2 bg-[#FF5005] hover:bg-[#ff6220] text-white text-xs font-bold rounded-lg flex items-center gap-1.5 shadow-md shadow-orange-500/30 cursor-pointer transition-all"
                                    whileHover={{ scale: 1.03, boxShadow: "0 8px 20px -4px rgba(255, 80, 5, 0.45)" }}
                                    whileTap={{ scale: 0.97 }}
                                >
                                    <span>Commencer</span>
                                    <ArrowRight size={13} />
                                </motion.button>
                            </Link>
                        </div>
                    )}
                </div>

            </div>
        </header>
    );
}