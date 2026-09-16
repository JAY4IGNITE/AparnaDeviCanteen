import { useEffect } from 'react';
import { motionValue, useTransform, useSpring } from 'motion/react';

/**
 * Shared global mouse motion values (singleton, zero re-renders).
 * Used for individual dock button magnification proximity calculations.
 */
export const globalMouseX = motionValue(Infinity);
export const globalMouseY = motionValue(Infinity);

let isListening = false;
export const initGlobalMouseListener = () => {
  if (typeof window === 'undefined' || isListening) return;
  isListening = true;

  window.addEventListener(
    'mousemove',
    (e) => {
      globalMouseX.set(e.clientX);
      globalMouseY.set(e.clientY);
    },
    { passive: true }
  );

  window.addEventListener('mouseleave', () => {
    globalMouseX.set(Infinity);
    globalMouseY.set(Infinity);
  });
};

/**
 * Hook to give any individual button/element an Apple macOS Dock magnification effect.
 * When the cursor approaches the button, it smoothly scales up using spring physics,
 * while keeping its layout position completely static (no x/y displacement).
 *
 * @param {React.RefObject} ref - Reference to the target DOM element
 * @param {Object} options
 * @param {number} options.distance - Pixel threshold to start magnification (default: 75)
 * @param {number} options.magnification - Peak scale factor when cursor is closest (default: 1.08)
 * @param {boolean} options.disabled - Whether dock effect is disabled
 * @param {Object} options.spring - Framer Motion spring configuration
 */
export const useDockEffect = (ref, options = {}) => {
  const {
    distance = 75,
    magnification = 1.08,
    disabled = false,
    spring = { mass: 0.1, stiffness: 240, damping: 15 },
  } = options;

  useEffect(() => {
    initGlobalMouseListener();
  }, []);

  const mouseDistance = useTransform([globalMouseX, globalMouseY], ([x, y]) => {
    if (disabled || !ref.current || x === Infinity || y === Infinity) {
      return Infinity;
    }
    const rect = ref.current.getBoundingClientRect();
    // Fast boundary check before square-root calculation
    if (
      x < rect.left - distance ||
      x > rect.right + distance ||
      y < rect.top - distance ||
      y > rect.bottom + distance
    ) {
      return Infinity;
    }

    // Distance to closest point on the button rectangle
    const dx = Math.max(rect.left - x, 0, x - rect.right);
    const dy = Math.max(rect.top - y, 0, y - rect.bottom);
    return Math.hypot(dx, dy);
  });

  const targetScale = useTransform(
    mouseDistance,
    [0, distance],
    [magnification, 1],
    { clamp: true }
  );

  const scale = useSpring(targetScale, spring);

  return { scale };
};

/**
 * Hook for vertical dock containers (like the Sidebar navigation menu).
 * Takes a container-local mouseY motion value and magnifies items in a fluid wave.
 *
 * @param {React.RefObject} ref - Reference to the menu item DOM element
 * @param {MotionValue} mouseY - MotionValue of cursor Y position
 * @param {Object} options
 * @param {number} options.distance - Vertical distance threshold (default: 85)
 * @param {number} options.magnification - Peak scale factor (default: 1.2)
 * @param {boolean} options.disabled - Whether effect is disabled
 * @param {Object} options.spring - Spring configuration
 */
export const useVerticalDockItem = (ref, mouseY, options = {}) => {
  const {
    distance = 85,
    magnification = 1.2,
    disabled = false,
    spring = { mass: 0.1, stiffness: 220, damping: 14 },
  } = options;

  const mouseDistance = useTransform(mouseY, (y) => {
    if (disabled || !ref.current || y === Infinity) return Infinity;
    const rect = ref.current.getBoundingClientRect();
    const itemCenterY = rect.top + rect.height / 2;
    return Math.abs(y - itemCenterY);
  });

  const targetScale = useTransform(
    mouseDistance,
    [0, distance],
    [magnification, 1],
    { clamp: true }
  );

  const scale = useSpring(targetScale, spring);

  return { scale };
};
