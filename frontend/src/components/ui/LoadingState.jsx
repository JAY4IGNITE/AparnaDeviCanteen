import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { SkeletonGrid } from './Skeleton';

const DOT_FRAMES = ['.', '..', '...'];

const LoadingState = ({
  variant = 'spinner',
  text = 'Loading',
  minHeight,
  className = '',
}) => {
  const [frameIndex, setFrameIndex] = useState(0);

  useEffect(() => {
    const timer = setInterval(() => {
      setFrameIndex((prev) => (prev + 1) % DOT_FRAMES.length);
    }, 400);

    return () => clearInterval(timer);
  }, []);

  if (variant === 'stats') return <SkeletonGrid count={4} />;

  const showText = text !== null && text !== false;
  const baseText =
    typeof text === 'string' && text.trim()
      ? text.replace(/\.+$/, '')
      : 'Loading';

  return (
    <motion.div
      className={`loading-spinner ${className}`}
      initial={{ opacity: 0, scale: 0.98 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.25, ease: 'easeOut' }}
      style={minHeight ? { minHeight } : undefined}
      role="status"
      aria-live="polite"
    >
      <div className="loading-content-center">
        {/* Precision Modern SVG Arc Spinner */}
        <div className="premium-spinner-wrap" aria-hidden="true">
          <svg className="premium-spinner-svg" viewBox="0 0 50 50">
            <circle
              className="spinner-track"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3.2"
            />
            <circle
              className="spinner-arc"
              cx="25"
              cy="25"
              r="20"
              fill="none"
              strokeWidth="3.2"
              strokeLinecap="round"
            />
          </svg>
        </div>

        {/* Geometrically Centered Label with Anchored Dot Frames */}
        {showText && (
          <div className="loading-label-container">
            <span className="loading-label-text">
              {baseText}
              <span className="loading-dots-anchor" aria-hidden="true">
                <span className="loading-dots-content">
                  {DOT_FRAMES[frameIndex]}
                </span>
              </span>
            </span>
          </div>
        )}
      </div>
    </motion.div>
  );
};

export default LoadingState;
