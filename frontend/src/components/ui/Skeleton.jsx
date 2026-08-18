import { motion } from 'motion/react';

export const Skeleton = ({ className = '', style = {} }) => (
  <div className={`skeleton ${className}`} style={style} />
);

export const SkeletonCard = () => (
  <div className="skeleton-card">
    <Skeleton style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }} />
    <div style={{ flex: 1 }}>
      <Skeleton style={{ width: '60%', height: '14px', marginBottom: '8px' }} />
      <Skeleton style={{ width: '40%', height: '12px' }} />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => (
  <div className="stats-grid">
    {Array.from({ length: count }).map((_, i) => (
      <motion.div
        key={i}
        className="stat-card skeleton-stat"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: i * 0.05 }}
      >
        <Skeleton style={{ width: '48px', height: '48px', borderRadius: 'var(--radius-md)' }} />
        <div style={{ flex: 1 }}>
          <Skeleton style={{ width: '70%', height: '24px', marginBottom: '8px' }} />
          <Skeleton style={{ width: '50%', height: '12px' }} />
        </div>
      </motion.div>
    ))}
  </div>
);

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="table-wrapper">
    <div className="skeleton-table">
      {Array.from({ length: rows }).map((_, r) => (
        <div key={r} className="skeleton-table-row" style={{ gridTemplateColumns: `repeat(${cols}, 1fr)` }}>
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} style={{ height: '14px' }} />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
