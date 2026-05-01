import { Link, useNavigate } from "react-router-dom";
import { motion } from "framer-motion";
import { useAuthContext } from "../../context/AuthContext.jsx";

export function Header() {
    const navigate = useNavigate();
    const { user, isAuthenticated, logout } = useAuthContext();

    const handleLogout = async () => {
        await logout();
        navigate('/', { replace: true });
    };

    const dashboardLink = isAuthenticated ? '/dashboard' : '/login';
    const displayName = user?.first_name;
    const avatarLetter = displayName?.charAt(0).toUpperCase();

    // Animation variants
    const headerVariants = {
        hidden: { y: -100, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 20,
                duration: 0.5
            }
        }
    };

    const logoVariants = {
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: {
            scale: 0.95
        }
    };

    const navItemVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: (i) => ({
            y: 0,
            opacity: 1,
            transition: {
                delay: i * 0.1,
                type: "spring",
                stiffness: 100,
                damping: 12
            }
        }),
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        }
    };

    const buttonVariants = {
        hidden: { scale: 0, opacity: 0 },
        visible: {
            scale: 1,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 200,
                damping: 15
            }
        },
        hover: {
            scale: 1.05,
            transition: {
                type: "spring",
                stiffness: 400,
                damping: 10
            }
        },
        tap: {
            scale: 0.95
        }
    };

    const userSectionVariants = {
        hidden: { x: 50, opacity: 0 },
        visible: {
            x: 0,
            opacity: 1,
            transition: {
                type: "spring",
                stiffness: 100,
                damping: 15
            }
        }
    };

    const avatarVariants = {
        hover: {
            scale: 1.1,
            rotate: [0, -10, 10, -10, 0],
            transition: {
                rotate: { duration: 0.5 },
                scale: { type: "spring", stiffness: 400 }
            }
        }
    };

    const pulseVariants = {
        animate: {
            scale: [1, 1.1, 1],
            transition: {
                duration: 1.5,
                repeat: Infinity,
                repeatDelay: 2
            }
        }
    };

    return (
        <motion.section 
            className="flex z-50 shadow-md justify-between items-center bg-white py-8 px-6 font-semibold text-gray-700"
            variants={headerVariants}
            initial="hidden"
            animate="visible"
        >
            <motion.div
                variants={logoVariants}
                whileHover="hover"
                whileTap="tap"
            >
                <h2 className="uppercase font-bold text-2xl">
                    arshi
                    <motion.span 
                        className="text-[#FF5005]"
                        whileHover={{ 
                            textShadow: "0 0 8px rgba(255, 80, 5, 0.5)",
                            transition: { duration: 0.2 }
                        }}
                    >
                        event
                    </motion.span>
                </h2>
            </motion.div>
            
            <nav>
                <ul className="flex gap-8 items-center">
                    {[
                        { to: "/", label: "Accueil", isLink: true, isAnchor: false },
                        { href: "#services", label: "Services", isLink: false, isAnchor: true },
                        { href: "#apropos", label: "A propos", isLink: false, isAnchor: true },
                        { to: dashboardLink, label: "Tableau de bord", isLink: true, isAnchor: false }
                    ].map((item, index) => (
                        <motion.li
                            key={item.label}
                            custom={index}
                            variants={navItemVariants}
                            initial="hidden"
                            animate="visible"
                            whileHover="hover"
                        >
                            {item.isLink ? (
                                <Link 
                                    to={item.to} 
                                    className="cursor-pointer hover:text-[#FF5005] border-white border-b-2 hover:border-b-[#FF5005] transition duration-300 inline-block"
                                >
                                    {item.label}
                                </Link>
                            ) : (
                                <a 
                                    href={item.href} 
                                    className="cursor-pointer hover:text-[#FF5005] border-white border-b-2 hover:border-b-[#FF5005] transition duration-300 inline-block"
                                >
                                    {item.label}
                                </a>
                            )}
                        </motion.li>
                    ))}
                </ul>
            </nav>
            
            <div className="flex items-center gap-4">
                <motion.button 
                    className="bg-gradient-to-r from-[#004FB7] to-[#0084FF] px-7 py-3 text-white rounded-xl cursor-pointer transition duration-300"
                    variants={buttonVariants}
                    initial="hidden"
                    animate="visible"
                    whileHover="hover"
                    whileTap="tap"
                    whileFocus={{ scale: 1.02 }}
                >
                    + Créer un événement
                </motion.button>

                {isAuthenticated ? (
                    <motion.div 
                        className="flex items-center gap-3 bg-slate-50 border border-gray-200 rounded-full px-4 py-2"
                        variants={userSectionVariants}
                        initial="hidden"
                        animate="visible"
                    >
                        <motion.div 
                            className="flex h-10 w-10 items-center justify-center rounded-full bg-[#FF5005] text-white font-bold cursor-pointer"
                            variants={avatarVariants}
                            whileHover="hover"
                        >
                            {avatarLetter}
                        </motion.div>
                        <div className="flex flex-col text-left text-sm">
                            <motion.span 
                                className="font-semibold text-gray-900"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.3 }}
                            >
                                {displayName}
                            </motion.span>
                            <motion.span 
                                className="text-gray-500 text-xs flex items-center gap-1"
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4 }}
                            >
                                <motion.span 
                                    className="w-2 h-2 bg-green-500 rounded-full inline-block"
                                    variants={pulseVariants}
                                    animate="animate"
                                />
                                Connecté
                            </motion.span>
                        </div>
                        <motion.button
                            onClick={handleLogout}
                            className="ml-4 rounded-full border border-[#FF5005] px-4 py-2 text-[#FF5005] text-sm font-semibold transition"
                            whileHover={{ 
                                scale: 1.05,
                                backgroundColor: "#FF5005",
                                color: "#ffffff",
                                transition: { duration: 0.2 }
                            }}
                            whileTap={{ scale: 0.95 }}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: 0.5 }}
                        >
                            Déconnexion
                        </motion.button>
                    </motion.div>
                ) : (
                    <>
                        <motion.div
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                            custom={0}
                        >
                            <Link to="/register">
                                <motion.button 
                                    className="border-2 border-[#FF5005] px-7 py-3 text-[#FF5005] rounded-xl cursor-pointer transition duration-300"
                                    whileHover={{ 
                                        scale: 1.05,
                                        backgroundColor: "#FF5005",
                                        color: "#ffffff",
                                        transition: { duration: 0.2 }
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                >
                                    S'inscrire
                                </motion.button>
                            </Link>
                        </motion.div>
                        <motion.div
                            variants={buttonVariants}
                            initial="hidden"
                            animate="visible"
                            custom={1}
                        >
                            <Link to="/login">
                                <motion.button 
                                    className="bg-gradient-to-r from-[#FF5005] to-[#FF7B2A] px-7 py-3 text-white rounded-xl cursor-pointer transition duration-300"
                                    whileHover={{ 
                                        scale: 1.05,
                                        boxShadow: "0 10px 25px -5px rgba(255, 80, 5, 0.3)"
                                    }}
                                    whileTap={{ scale: 0.95 }}
                                    whileFocus={{ scale: 1.02 }}
                                >
                                    Se connecter
                                </motion.button>
                            </Link>
                        </motion.div>
                    </>
                )}
            </div>
        </motion.section>
    );
}