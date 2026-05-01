import { motion, useScroll, useTransform } from "framer-motion";
import { Play } from "lucide-react";
import img from "../../assets/img1.jpg";
import img2 from "../../assets/bg1.png";

export function HeroSection() {
  const { scrollY } = useScroll();
  const y1 = useTransform(scrollY, [0, 300], [0, 100]);
  const y2 = useTransform(scrollY, [0, 300], [0, -50]);

  // Animation variants avec durée de 2 secondes
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: 0.3,
        delayChildren: 0.2,
        duration: .4
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
        stiffness: 80,
        damping: 15,
        duration: .5
      }
    }
  };

  const badgeVariants = {
    hidden: { scale: 0, opacity: 0, rotate: -10 },
    visible: {
      scale: 1,
      opacity: 1,
      rotate: 0,
      transition: {
        type: "spring",
        stiffness: 150,
        damping: 20,
        delay: 0.3,
        duration: 2
      }
    },
    hover: {
      scale: 1.05,
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration: 0.5
      }
    }
  };

  const titleVariants = {
    hidden: { x: -100, opacity: 0 },
    visible: {
      x: 0,
      opacity: 1,
      transition: {
        type: "spring",
        stiffness: 70,
        damping: 20,
        duration: 2,
        delay: 0.2
      }
    }
  };

  const imageVariants = {
    hidden: { 
      x: 200, 
      opacity: 0, 
      rotateY: 60,
      scale: 0.8
    },
    visible: {
      x: 0,
      opacity: 1,
      rotateY: 0,
      scale: 1,
      transition: {
        type: "spring",
        stiffness: 60,
        damping: 20,
        duration: 2.5,
        delay: 0.4
      }
    },
    hover: {
      scale: 1.05,
      rotateY: 5,
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 20,
        duration: 0.6
      }
    }
  };

  const imageBorderVariants = {
    hidden: { 
      borderWidth: "0px",
      borderColor: "rgba(255, 80, 5, 0)"
    },
    visible: {
      borderWidth: "14px",
      borderColor: "#FF5005",
      transition: {
        duration: 2,
        delay: 0.6,
        ease: "easeOut"
      }
    }
  };

  const buttonVariants = {
    hidden: { y: 80, opacity: 0, scale: 0.9 },
    visible: (i) => ({
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.6 + i * 0.2,
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 2
      }
    }),
    hover: {
      scale: 1.08,
      boxShadow: "0 20px 40px rgba(0,0,0,0.15)",
      transition: {
        type: "spring",
        stiffness: 400,
        damping: 10,
        duration: 0.5
      }
    },
    tap: {
      scale: 0.96,
      transition: {
        duration: 0.2
      }
    }
  };

  const floatingCardVariants = {
    hidden: { y: 80, opacity: 0, scale: 0.8 },
    visible: {
      y: 0,
      opacity: 1,
      scale: 1,
      transition: {
        delay: 0.8,
        type: "spring",
        stiffness: 80,
        damping: 15,
        duration: 2
      }
    },
    animate: {
      y: [0, -15, 0],
      transition: {
        duration: 3,
        repeat: Infinity,
        ease: "easeInOut"
      }
    },
    hover: {
      scale: 1.08,
      y: -20,
      boxShadow: "0 25px 50px -12px rgba(0,0,0,0.25)",
      transition: {
        type: "spring",
        stiffness: 300,
        damping: 15,
        duration: 0.5
      }
    }
  };

  const pulseVariants = {
    animate: {
      scale: [1, 1.3, 1],
      opacity: [0.5, 1, 0.5],
      transition: {
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const gradientVariants = {
    animate: {
      scale: [1, 1.2, 1],
      opacity: [0.15, 0.3, 0.15],
      transition: {
        duration: 4,
        repeat: Infinity,
        ease: "easeInOut"
      }
    }
  };

  const iconVariants = {
    animate: {
      x: [0, 6, 0],
      transition: {
        duration: 1.5,
        repeat: Infinity,
        repeatDelay: 0.5,
        ease: "easeInOut"
      }
    }
  };

  return (
    <motion.section 
      className="relative top-[-50px] flex items-center justify-center px-20 py-16 bg-[#f5f5f5] overflow-hidden min-h-screen"
      initial="hidden"
      animate="visible"
      variants={containerVariants}
    >
      {/* Background Image avec parallax et fade in */}
      <motion.img 
        className="absolute z-0 opacity-30 object-cover w-full h-full"
        src={img2} 
        alt=""
        style={{ y: y1 }}
        initial={{ opacity: 0 }}
        animate={{ opacity: 0.3 }}
        transition={{ duration: 2 }}
      />
      
      {/* LEFT */}
      <div className="w-[45%] relative z-10">
        
        {/* Badge */}
        <motion.div 
          className="w-80 gap-3 flex items-center justify-center text-[12px] tracking-wide bg-[#FF5005]/20 px-5 py-1 rounded-xl mb-6 cursor-pointer"
          variants={badgeVariants}
          whileHover="hover"
        >
          <motion.div 
            className="w-3 h-3 bg-[#FF5005] rounded-full text-white font-bold"
            variants={pulseVariants}
            animate="animate"
          />
          <span className="text-[#FF5005] font-semibold">+500 ÉVÉNEMENTS GÉRÉS CE MOIS-CI</span>
        </motion.div>

        {/* TITLE */}
        <motion.div variants={titleVariants}>
          <h1 className="text-7xl uppercase leading-[1.1] font-bold text-gray-800">
            <motion.span 
              className="text-[#FF5005] inline-block"
              whileHover={{ scale: 1.05, x: 8 }}
              transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
            >
              Automatisez
            </motion.span>
            <br />
            <motion.span 
              className="text-gray-700 inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4, duration: 2 }}
            >
              vos invitations.
            </motion.span>
            <br />
            <motion.span 
              className="text-[#1E6FD9] inline-block"
              whileHover={{ scale: 1.05, x: 8 }}
              transition={{ type: "spring", stiffness: 300, duration: 0.5 }}
            >
              Optimisez
            </motion.span>{" "}
            <br />
            <motion.span 
              className="text-gray-700 inline-block"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6, duration: 2 }}
            >
              la présence.
            </motion.span>
          </h1>
        </motion.div>

        {/* TEXT */}
        <motion.p 
          className="mt-6 text-gray-500 text-[16px] leading-relaxed max-w-[480px]"
          variants={itemVariants}
        >
          Gérez vos événements professionnels ou festifs avec
          l'intelligence des QR codes et le suivi invités en temps réel.
          Zéro stress, 100% élégance.
        </motion.p>

        {/* BUTTONS */}
        <div className="mt-8 space-y-4">
          <motion.button 
            className="bg-[#1E6FD9] text-white px-7 py-5 rounded-xl cursor-pointer text-[15px] font-medium shadow-lg relative overflow-hidden group"
            custom={0}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
            whileFocus={{ scale: 1.02 }}
          >
            {/* Effet de ripple au hover */}
            <motion.div 
              className="absolute inset-0 bg-white opacity-0 group-hover:opacity-20"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
            Créer mon premier événement gratuitement
          </motion.button>

          <motion.button 
            className="flex items-center gap-2 px-7 py-5 rounded-xl cursor-pointer border border-[#FF5005] text-[#FF5005] text-[15px] font-medium bg-white hover:bg-[#FF5005]/5 transition-all relative overflow-hidden group"
            custom={1}
            variants={buttonVariants}
            whileHover="hover"
            whileTap="tap"
          >
            <motion.div
              variants={iconVariants}
              animate="animate"
            >
              <Play size={16} />
            </motion.div>
            Regarder la démo (30s)
            <motion.div 
              className="absolute inset-0 bg-[#FF5005] opacity-0 group-hover:opacity-5"
              initial={{ scale: 0 }}
              whileHover={{ scale: 1 }}
              transition={{ duration: 0.5 }}
            />
          </motion.button>
        </div>
      </div>

      {/* RIGHT IMAGE */}
      <motion.div 
        className="relative z-10 w-[40%] flex justify-center perspective-1000"
        variants={imageVariants}
        whileHover="hover"
      >
        <motion.div 
          className="rounded-xl overflow-hidden shadow-2xl bg-black"
          variants={imageBorderVariants}
          style={{ borderStyle: "solid" }}
          whileHover={{ rotate: 3, scale: 1.02 }}
          transition={{ type: "spring", stiffness: 300, damping: 20, duration: 0.6 }}
        >
          <motion.img
            src={img}
            alt="event preview"
            className="w-[85%] object-cover"
            initial={{ scale: 1.1, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            transition={{ duration: 2.5, delay: 0.8, ease: "easeOut" }}
            whileHover={{ scale: 1.08 }}
            transition={{ duration: 0.6 }}
          />
          {/* Overlay au survol */}
          <motion.div 
            className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent opacity-0"
            whileHover={{ opacity: 1 }}
            transition={{ duration: 0.4 }}
          />
        </motion.div>
      </motion.div>

      {/* FLOATING CARD */}
      <motion.div 
        className="absolute z-10 bottom-25 right-[43%] bg-white px-5 py-4 rounded-xl shadow-lg cursor-pointer backdrop-blur-sm bg-white/95"
        variants={floatingCardVariants}
        animate="animate"
        whileHover="hover"
      >
        <p className="text-[11px] font-semibold text-gray-500">
          TAUX DE PRÉSENCE
        </p>

        <div className="flex items-center gap-3 mt-2">
          <motion.span 
            className="text-[28px] font-bold text-[#1E6FD9]"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 1.2, type: "spring", duration: 1.5 }}
          >
            84%
          </motion.span>

          <div className="w-[40px] h-[10px] bg-gray-200 rounded-full overflow-hidden">
            <motion.div 
              className="h-full bg-[#1E6FD9] rounded-full"
              initial={{ width: 0 }}
              animate={{ width: "84%" }}
              transition={{ delay: 1.4, duration: 1.5, ease: "easeOut" }}
            />
          </div>
        </div>
      </motion.div>

      {/* Background Gradients Animés */}
      <motion.div 
        className="absolute top-120 left-0 w-120 h-120 bg-[#FF5005]/15 rounded-full blur-3xl"
        variants={gradientVariants}
        animate="animate"
        style={{ y: y2 }}
      />
      <motion.div 
        className="absolute top-0 left-320 w-120 h-120 bg-[#1E6FD9]/25 rounded-full blur-3xl"
        variants={gradientVariants}
        animate="animate"
        style={{ y: y2 }}
      />

      {/* Particules décoratives améliorées */}
      {[...Array(12)].map((_, i) => (
        <motion.div
          key={i}
          className="absolute w-2 h-2 bg-[#FF5005] rounded-full"
          initial={{
            x: Math.random() * window.innerWidth,
            y: Math.random() * window.innerHeight,
            opacity: 0
          }}
          animate={{
            y: [null, -40, -80],
            opacity: [0, 0.8, 0],
            scale: [0, 1.5, 0]
          }}
          transition={{
            duration: 4 + Math.random() * 3,
            repeat: Infinity,
            delay: Math.random() * 3,
            ease: "easeOut"
          }}
          style={{
            left: `${Math.random() * 100}%`,
            top: `${Math.random() * 100}%`
          }}
        />
      ))}

      {/* Ajout d'un effet de brillance sur l'image */}
      <motion.div
        className="absolute top-1/2 left-1/2 w-96 h-96 bg-gradient-to-r from-[#FF5005]/20 to-[#1E6FD9]/20 rounded-full blur-3xl pointer-events-none"
        animate={{
          scale: [1, 1.5, 1],
          opacity: [0.3, 0.6, 0.3],
          x: ["-50%", "-40%", "-50%"],
          y: ["-50%", "-60%", "-50%"]
        }}
        transition={{
          duration: 8,
          repeat: Infinity,
          ease: "easeInOut"
        }}
        style={{ transform: "translate(-50%, -50%)" }}
      />
    </motion.section>
  );
}

// Ajout du CSS pour la perspective 3D
const style = document.createElement('style');
style.textContent = `
  .perspective-1000 {
    perspective: 1000px;
  }
`;
document.head.appendChild(style);