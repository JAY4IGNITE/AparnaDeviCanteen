import { motion } from 'motion/react';
import { useLocation } from 'react-router-dom';
import { useMotionSafe } from '../../lib/motion';

const PageTransition = ({ children, className = '' }) => {
  const location = useLocation();
  const { reduced } = useMotionSafe();

  return (
    <motion.div
      key={location.pathname}
      className={className}
      initial={reduced ? { opacity: 1 } : { opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={{ duration: 0.18, ease: 'easeOut' }}
    >
      {children}
    </motion.div>
  );
};

export default PageTransition;
