import { motion, AnimatePresence } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';

/**
 * Same API as before (`type` / `children` / `show`). Adds an `aria-live` region
 * so screen readers announce validation / status messages as they appear — a
 * pure accessibility win with no change to the visible behaviour or timing.
 * `type` maps to the existing `.alert-*` classes, so the look is unchanged.
 */
const AlertBanner = ({ type, children, show = true }) => {
  const { transition } = useMotionSafe();
  const assertive = type === 'error';

  return (
    <AnimatePresence>
      {show && children && (
        <motion.div
          className={`alert alert-${type}`}
          role={assertive ? 'alert' : 'status'}
          aria-live={assertive ? 'assertive' : 'polite'}
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
