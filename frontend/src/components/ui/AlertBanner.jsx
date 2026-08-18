import { motion, AnimatePresence } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';

const AlertBanner = ({ type, children, show = true }) => {
  const { transition } = useMotionSafe();

  return (
    <AnimatePresence>
      {show && children && (
        <motion.div
          className={`alert alert-${type}`}
          initial={{ opacity: 0, y: -8, height: 0 }}
          animate={{ opacity: 1, y: 0, height: 'auto' }}
          exit={{ opacity: 0, y: -8, height: 0 }}
          transition={transition}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AlertBanner;
