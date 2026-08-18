import { motion } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';

const PageHeader = ({ title, subtitle, actions, badge }) => {
  const { transition } = useMotionSafe();

  return (
    <motion.header
      className="page-header page-header-flex"
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={transition}
    >
      <div className="page-header-content">
        <h1>
          {title}
          {badge && <span className="page-header-badge">{badge}</span>}
        </h1>
        {subtitle && <p>{subtitle}</p>}
      </div>
      {actions && <div className="page-header-actions">{actions}</div>}
    </motion.header>
  );
};

export default PageHeader;
