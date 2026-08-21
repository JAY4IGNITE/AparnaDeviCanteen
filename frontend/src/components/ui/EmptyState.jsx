import { motion } from 'motion/react';
import { useMotionSafe, fadeUp } from '../../lib/motion';
import Lazy3D from '../3d/Lazy3D';

/**
 * `scene` is optional and additive: pass a `() => import('../3d/SomeScene')`
 * loader to show a decorative 3D visual in place of the icon. When 3D is
 * unavailable (reduced-motion / no WebGL / low-end device) the animated Lucide
 * icon is used as the static fallback, so existing icon-only call sites are
 * completely unchanged.
 */
const EmptyState = ({ icon: Icon, title, description, action, scene }) => {
  const { transition } = useMotionSafe();

  const iconFallback = Icon ? (
    <div className="empty-state-icon">
      <Icon size={56} strokeWidth={1.5} />
    </div>
  ) : null;

  return (
    <motion.div
      className="empty-state"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={transition}
    >
      {scene ? (
        <Lazy3D
          load={scene}
          className="empty-state-3d"
          style={{ width: '180px', height: '180px', margin: '0 auto 0.5rem' }}
          fallback={iconFallback}
        />
      ) : (
        Icon && (
          <motion.div
            className="empty-state-icon"
            animate={{ y: [0, -6, 0] }}
            transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
          >
            <Icon size={56} strokeWidth={1.5} />
          </motion.div>
        )
      )}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action}
    </motion.div>
  );
};

export default EmptyState;
