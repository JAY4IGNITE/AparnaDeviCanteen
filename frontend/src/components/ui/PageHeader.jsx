import { motion } from 'motion/react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft } from 'lucide-react';
import { useMotionSafe } from '../../lib/motion';
import MotionButton from './MotionButton';

const PageHeader = ({ title, subtitle, actions, badge, showBack = false, backTo, onBack }) => {
  const { transition } = useMotionSafe();
  const navigate = useNavigate();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backTo) {
      navigate(backTo);
    } else if (typeof window !== 'undefined' && window.history?.state?.idx > 0) {
      navigate(-1);
    } else {
      navigate('/customer/home');
    }
  };

  return (
    <motion.header
      className="page-header page-header-flex"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      transition={transition}
    >
      <div className="page-header-content" style={{ display: 'flex', alignItems: 'flex-start', gap: '0.75rem', flexWrap: 'wrap' }}>
        {showBack && (
          <MotionButton
            type="button"
            className="page-header-back-btn"
            onClick={handleBack}
            whileHover={{ x: -2, scale: 1.04 }}
            whileTap={{ scale: 0.92 }}
            title="Go back"
            aria-label="Go back to previous page"
            style={{ marginTop: '0.15rem' }}
          >
            <ArrowLeft size={18} />
          </MotionButton>
        )}
        <div style={{ flex: 1, minWidth: 0 }}>
          <h1 style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', margin: 0, flexWrap: 'wrap' }}>
            <span>{title}</span>
            {badge && <span className="page-header-badge">{badge}</span>}
          </h1>
          {subtitle && <p style={{ margin: '0.25rem 0 0' }}>{subtitle}</p>}
        </div>
      </div>
      {actions && <div className="page-header-actions" style={{ flexWrap: 'wrap' }}>{actions}</div>}
    </motion.header>
  );
};

export default PageHeader;
