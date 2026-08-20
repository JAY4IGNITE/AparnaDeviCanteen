import { motion } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button-variants';

/**
 * Motion-animated button. Backwards compatible: existing call sites pass the
 * legacy `.btn`/`.btn-primary`/… classes (still defined in index.css) and keep
 * their exact look and behaviour. New markup may instead pass shadcn `variant`
 * and `size` props to opt into the shared button vocabulary. Detection is by
 * presence of a `btn` class token so the two paths never fight.
 */
const MotionButton = ({ children, className = '', variant, size, disabled, ...props }) => {
  const { buttonHover, tap } = useMotionSafe();
  const usesLegacyBtn = /\bbtn\b/.test(className);

  return (
    <motion.button
      className={usesLegacyBtn ? className : cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      whileHover={disabled ? undefined : buttonHover}
      whileTap={disabled ? undefined : tap}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MotionButton;
