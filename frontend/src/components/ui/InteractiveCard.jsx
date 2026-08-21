import { motion } from 'motion/react';
import { useMotionSafe, fadeUp } from '../../lib/motion';

const InteractiveCard = ({ children, onClick, className = '', index = 0 }) => {
  const { transition, hover, tap } = useMotionSafe();

  return (
    <motion.div
      className={`card card-interactive ${className}`}
      initial={fadeUp.initial}
      animate={fadeUp.animate}
      transition={{ ...transition, delay: index * 0.08 }}
      whileHover={hover}
      whileTap={tap}
      onClick={onClick}
      role={onClick ? 'button' : undefined}
      tabIndex={onClick ? 0 : undefined}
      onKeyDown={
        onClick
          ? (e) => {
              // role="button" must activate on Space as well as Enter; Space is
              // preventDefault-ed so it activates instead of scrolling the page.
              if (e.key === 'Enter' || e.key === ' ') {
                e.preventDefault();
                onClick(e);
              }
            }
          : undefined
      }
    >
      {children}
    </motion.div>
  );
};

export default InteractiveCard;
