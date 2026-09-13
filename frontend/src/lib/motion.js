import { useReducedMotion } from 'motion/react';

export const spring = { type: 'spring', stiffness: 400, damping: 30 };
export const springBouncy = { type: 'spring', stiffness: 450, damping: 18 };
export const springSmooth = { type: 'spring', stiffness: 320, damping: 28 };

export const fadeUp = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit: { opacity: 0, y: -10, transition: { duration: 0.2 } },
};

export const fadeIn = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.3 } },
  exit: { opacity: 0, transition: { duration: 0.2 } },
};

export const scaleIn = {
  initial: { opacity: 0, scale: 0.94, y: 10 },
  animate: { opacity: 1, scale: 1, y: 0, transition: springSmooth },
  exit: { opacity: 0, scale: 0.94, y: 10 },
};

export const staggerContainer = {
  animate: { transition: { staggerChildren: 0.08, delayChildren: 0.05 } },
};

export const useMotionSafe = () => {
  const reduced = useReducedMotion();
  return {
    reduced,
    transition: reduced ? { duration: 0.01 } : { duration: 0.25, ease: [0.16, 1, 0.3, 1] },
    spring: reduced ? { duration: 0.01 } : spring,
    springBouncy: reduced ? { duration: 0.01 } : springBouncy,
    springSmooth: reduced ? { duration: 0.01 } : springSmooth,
    hover: reduced ? {} : { y: -3, transition: springSmooth },
    tap: reduced ? {} : { scale: 0.94, transition: { type: 'spring', stiffness: 500, damping: 20 } },
    buttonHover: reduced ? {} : { scale: 1.05, y: -2, transition: springBouncy },
  };
};

