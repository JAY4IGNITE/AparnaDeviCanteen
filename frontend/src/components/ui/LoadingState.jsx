import { motion } from 'motion/react';
import { SkeletonGrid } from './Skeleton';

const LoadingState = ({ variant = 'spinner' }) => {
  if (variant === 'stats') return <SkeletonGrid count={4} />;
  if (variant === 'page') {
    return (
      <motion.div
        className="loading-spinner"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="spinner" />
        <p className="loading-text">Loading...</p>
      </motion.div>
    );
  }
  return (
    <div className="loading-spinner">
      <div className="spinner" />
    </div>
  );
};

export default LoadingState;
