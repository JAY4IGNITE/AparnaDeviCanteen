import { useReducedMotion } from 'motion/react';

export const spring = { type: 'spring', stiffness: 400, damping: 30 };

export const fadeUp = {
  initial: { opacity: 0, y: 8 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -8 },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1 },
  exit: { opacity: 0 },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.96, y: 8 },
  animate: { opacity: 1, scale: 1, y: 0 },
  exit: { opacity: 0, scale: 0.96, y: 8 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.06, delayChildren: 0.04 } },
};

export const useMotionSafe = () => {
  const reduced = useReducedMotion();
  return {
    reduced,
    transition: reduced ? { duration: 0.01 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    spring: reduced ? { duration: 0.01 } : spring,
    hover: reduced ? {} : { y: -2, transition: { duration: 0.2 } },
    tap: reduced ? {} : { scale: 0.98 },
    buttonHover: reduced ? {} : { scale: 1.02 },
  };
};
