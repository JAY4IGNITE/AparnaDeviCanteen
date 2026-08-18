import { motion } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';

const AnimatedTabs = ({ tabs, activeTab, onChange, className = '' }) => {
  const { spring, reduced } = useMotionSafe();

  return (
    <div className={`auth-tabs animated-tabs ${className}`}>
      {tabs.map((tab) => (
        <button
          key={tab.id}
          type="button"
          className={`auth-tab ${activeTab === tab.id ? 'active' : ''}`}
          onClick={() => onChange(tab.id)}
        >
          {activeTab === tab.id && (
            <motion.span
              className="auth-tab-indicator"
              layoutId="tab-indicator"
              transition={reduced ? { duration: 0.01 } : spring}
            />
          )}
          <span className="auth-tab-label">{tab.label}</span>
        </button>
      ))}
    </div>
  );
};

export default AnimatedTabs;
