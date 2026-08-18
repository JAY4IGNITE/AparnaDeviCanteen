import { motion } from 'motion/react';
import { useMotionSafe, fadeUp } from '../../lib/motion';

const PageTransition = ({ children, className = '' }) => {
  const { transition } = useMotionSafe();

  return (
    <motion.div
      className={className}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={transition}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
