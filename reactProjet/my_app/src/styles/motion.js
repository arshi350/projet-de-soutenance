// Moteur physique et chorégraphies d'animations Framer Motion 60fps

export const PRESTIGE_SPRING = {
  type: "spring",
  stiffness: 280,
  damping: 22,
  mass: 0.8
};

export const GENTLE_SPRING = {
  type: "spring",
  stiffness: 180,
  damping: 20
};

export const LUXURY_EASE_OUT = [0.23, 1, 0.32, 1]; // Courbe quintique naturelle

export const containerStagger = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.05
    }
  }
};

export const itemFadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: {
    opacity: 1,
    y: 0,
    transition: {
      duration: 0.5,
      ease: LUXURY_EASE_OUT
    }
  }
};

export const modalBackdropVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: { duration: 0.25, ease: LUXURY_EASE_OUT }
  },
  exit: {
    opacity: 0,
    transition: { duration: 0.2, ease: LUXURY_EASE_OUT }
  }
};

export const modalContentVariants = {
  hidden: { opacity: 0, scale: 0.94, y: 20 },
  visible: {
    opacity: 1,
    scale: 1,
    y: 0,
    transition: PRESTIGE_SPRING
  },
  exit: {
    opacity: 0,
    scale: 0.96,
    y: 10,
    transition: { duration: 0.2, ease: LUXURY_EASE_OUT }
  }
};

export const buttonMotion = {
  whileHover: { scale: 1.02, transition: { duration: 0.2, ease: LUXURY_EASE_OUT } },
  whileTap: { scale: 0.96, transition: { duration: 0.1 } }
};
