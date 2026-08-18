import { motion } from 'motion/react';
import { useMotionSafe, fadeUp } from '../../lib/motion';

const EmptyState = ({ icon: Icon, title, description, action }) => {
  const { transition } = useMotionSafe();

  return (
    <motion.div
      className="empty-state"
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={transition}
    >
      {Icon && (
        <motion.div
          className="empty-state-icon"
          animate={{ y: [0, -6, 0] }}
          transition={{ duration: 3, repeat: Infinity, ease: 'easeInOut' }}
        >
          <Icon size={56} strokeWidth={1.5} />
        </motion.div>
      )}
      {title && <h3>{title}</h3>}
      {description && <p>{description}</p>}
      {action}
    </motion.div>
  );
};

export default EmptyState;
