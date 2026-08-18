import { motion } from 'motion/react';
import { useMotionSafe, fadeUp } from '../../lib/motion';

const StatCard = ({ icon: Icon, value, label, color = 'orange', index = 0, onClick }) => {
  const { transition, hover, tap } = useMotionSafe();
  const Component = onClick ? motion.button : motion.div;

  return (
    <Component
      className={`stat-card ${onClick ? 'stat-card-interactive' : ''}`}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ ...transition, delay: index * 0.06 }}
      whileHover={onClick ? hover : undefined}
      whileTap={onClick ? tap : undefined}
      onClick={onClick}
      type={onClick ? 'button' : undefined}
    >
      <div className={`stat-icon ${color}`}>
        <Icon size={24} />
      </div>
      <div>
        <div className="stat-value">{value}</div>
        <div className="stat-label">{label}</div>
      </div>
    </Component>
  );
};

export default StatCard;
