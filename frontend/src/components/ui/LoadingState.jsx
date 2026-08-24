import { motion } from 'motion/react';
import { SkeletonGrid } from './Skeleton';
import './TruckLoader.css';

const LoadingState = ({ variant = 'spinner' }) => {
  if (variant === 'stats') return <SkeletonGrid count={4} />;
  
  const truckLoader = (
    <div className="truck-loader">
      <div className="truckWrapper">
        <div className="truckBody">
          <svg viewBox="0 0 130 65" width="130" height="65" xmlns="http://www.w3.org/2000/svg">
            <rect x="0" y="10" width="80" height="45" fill="currentColor" rx="4" />
            <path d="M85 25 L110 25 L120 40 L120 55 L85 55 Z" fill="currentColor" />
            <polygon points="88,28 105,28 112,38 88,38" fill="#fff" opacity="0.4" />
          </svg>
        </div>
        <div className="truckTires">
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#282828" />
            <circle cx="12" cy="12" r="4" fill="#fff" />
          </svg>
          <svg viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
            <circle cx="12" cy="12" r="10" fill="#282828" />
            <circle cx="12" cy="12" r="4" fill="#fff" />
          </svg>
        </div>
        <div className="road"></div>
        <div className="lampPost">
           <svg viewBox="0 0 20 90" width="20" height="90" xmlns="http://www.w3.org/2000/svg">
            <rect x="8" y="0" width="4" height="90" fill="#282828" />
            <rect x="0" y="0" width="20" height="5" fill="#282828" />
            <circle cx="18" cy="10" r="4" fill="yellow" />
          </svg>
        </div>
      </div>
    </div>
  );

  if (variant === 'page') {
    return (
      <motion.div
        className="loading-spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        style={{ flexDirection: 'column', gap: '1rem', background: 'transparent' }}
      >
        {truckLoader}
        <p className="loading-text" style={{ marginTop: '1rem' }}>Loading...</p>
      </motion.div>
    );
  }
  
  return (
    <div className="loading-spinner" style={{ background: 'transparent' }}>
      {truckLoader}
    </div>
  );
};

export default LoadingState;
