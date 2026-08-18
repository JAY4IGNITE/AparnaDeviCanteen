import { motion, AnimatePresence } from 'motion/react';
import { useMotionSafe, scaleIn } from '../../lib/motion';

const AnimatedModal = ({ open, onClose, children, maxWidth = '520px' }) => {
  const { transition } = useMotionSafe();

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="modal-overlay"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={transition}
          onClick={onClose}
        >
          <motion.div
            className="modal"
            style={{ maxWidth }}
            initial={scaleIn.initial}
            animate={scaleIn.animate}
            exit={scaleIn.exit}
            transition={transition}
            onClick={(e) => e.stopPropagation()}
          >
            {children}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AnimatedModal;
