import { motion } from 'motion/react';
import { cn } from '@/lib/utils';
import { useMotionSafe } from '../../lib/motion';

/**
 * Doubles as the shadcn `Skeleton` primitive and the app's pre-existing
 * skeleton set. Kept in this single PascalCase file (rather than adding a
 * lowercase `skeleton.jsx`) because the filesystem is case-insensitive and the
 * two would be the same file.
 */
export const Skeleton = ({ className = '', style = {}, ...props }) => (
  <div
    data-slot="skeleton"
    aria-hidden="true"
    className={cn(
      'animate-pulse rounded-md bg-[var(--bg-card-hover)] motion-reduce:animate-none',
      className
    )}
    style={style}
    {...props}
  />
);

export const SkeletonCard = () => (
  <div className="flex items-center gap-4 rounded-xl border border-border bg-card p-5">
    <Skeleton className="size-12 shrink-0 rounded-lg" />
    <div className="flex-1 space-y-2">
      <Skeleton className="h-3.5 w-3/5" />
      <Skeleton className="h-3 w-2/5" />
    </div>
  </div>
);

export const SkeletonGrid = ({ count = 4 }) => {
  const { reduced } = useMotionSafe();
  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {Array.from({ length: count }).map((_, i) => (
        <motion.div
          key={i}
          className="flex items-center gap-4 rounded-xl border border-border bg-card p-5"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={reduced ? { duration: 0.01 } : { delay: i * 0.05 }}
        >
          <Skeleton className="size-12 shrink-0 rounded-lg" />
          <div className="flex-1 space-y-2">
            <Skeleton className="h-6 w-[70%]" />
            <Skeleton className="h-3 w-1/2" />
          </div>
        </motion.div>
      ))}
    </div>
  );
};

export const SkeletonTable = ({ rows = 5, cols = 5 }) => (
  <div className="overflow-hidden rounded-xl border border-border bg-card">
    <div className="divide-y divide-border">
      {Array.from({ length: rows }).map((_, r) => (
        <div
          key={r}
          className="grid gap-4 p-4"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(0, 1fr))` }}
        >
          {Array.from({ length: cols }).map((_, c) => (
            <Skeleton key={c} className="h-3.5" />
          ))}
        </div>
      ))}
    </div>
  </div>
);

export default Skeleton;
