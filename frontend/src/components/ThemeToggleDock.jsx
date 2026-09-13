import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { useRef, useState, useEffect } from 'react';
import { Sun } from 'lucide-react';
import { useTheme } from '../context/ThemeContext';
import './ThemeToggleDock.css';

/* Professional filled crescent moon — cleaner than Lucide's outline version */
const CrescentMoon = ({ size = 16 }) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 24 24"
    fill="currentColor"
    xmlns="http://www.w3.org/2000/svg"
    style={{ display: 'block' }}
  >
    <path d="M21 12.79A9 9 0 1 1 11.21 3a7 7 0 0 0 9.79 9.79z" />
  </svg>
);

function ThemeDockItem({ mouseX, theme, onClick, spring, distance, baseItemSize, magnification }) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);
  const [showLabel, setShowLabel] = useState(false);

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? { x: 0, width: baseItemSize };
    return val - rect.x - baseItemSize / 2;
  });

  const targetSize = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const size = useSpring(targetSize, spring);

  useEffect(() => {
    const unsub = isHovered.on('change', (v) => setShowLabel(v === 1));
    return unsub;
  }, [isHovered]);

  const isDark = theme === 'dark';

  return (
    <motion.button
      ref={ref}
      style={{ width: size, height: size }}
      whileTap={{ scale: 0.9 }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onClick={onClick}
      className="theme-dock-btn"
      aria-label={isDark ? 'Switch to light mode' : 'Switch to dark mode'}
      title={isDark ? 'Light Mode' : 'Dark Mode'}
    >
      <AnimatePresence mode="wait" initial={false}>
        <motion.span
          key={theme}
          initial={{ opacity: 0, rotate: -30, scale: 0.7 }}
          animate={{ opacity: 1, rotate: 0, scale: 1 }}
          exit={{ opacity: 0, rotate: 30, scale: 0.7 }}
          transition={{ duration: 0.22, ease: 'easeInOut' }}
          className="theme-dock-icon"
        >
          {isDark ? (
            <Sun size={14} strokeWidth={2.2} />
          ) : (
            <CrescentMoon size={13} />
          )}
        </motion.span>
      </AnimatePresence>

      {/* Tooltip */}
      <AnimatePresence>
        {showLabel && (
          <motion.div
            initial={{ opacity: 0, y: 6 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 6 }}
            transition={{ duration: 0.15 }}
            className="theme-dock-tooltip"
          >
            {isDark ? 'Light Mode' : 'Dark Mode'}
          </motion.div>
        )}
      </AnimatePresence>
    </motion.button>
  );
}

export default function ThemeToggleDock() {
  const { theme, toggleTheme } = useTheme();
  const mouseX = useMotionValue(Infinity);

  const spring = { mass: 0.12, stiffness: 180, damping: 14 };
  const baseItemSize = 28;
  const magnification = 38;
  const distance = 90;

  return (
    <div className="theme-toggle-dock-wrapper">
      <motion.div
        className="theme-toggle-dock-panel"
        onMouseMove={(e) => mouseX.set(e.clientX)}
        onMouseLeave={() => mouseX.set(Infinity)}
        initial={{ opacity: 0, y: -12, scale: 0.9 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.35, ease: [0.34, 1.56, 0.64, 1] }}
      >
        <ThemeDockItem
          mouseX={mouseX}
          theme={theme}
          onClick={toggleTheme}
          spring={spring}
          distance={distance}
          baseItemSize={baseItemSize}
          magnification={magnification}
        />
      </motion.div>
    </div>
  );
}
