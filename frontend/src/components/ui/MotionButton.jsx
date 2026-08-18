import { motion } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';

const MotionButton = ({ children, className = '', disabled, ...props }) => {
  const { buttonHover, tap } = useMotionSafe();

  return (
    <motion.button
      className={className}
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
