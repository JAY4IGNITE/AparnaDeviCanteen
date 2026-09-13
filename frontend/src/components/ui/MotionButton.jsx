import { useRef } from 'react';
import { motion } from 'motion/react';
import { useMotionSafe } from '../../lib/motion';
import { useDockEffect } from '../../lib/dock';
import { cn } from '@/lib/utils';
import { buttonVariants } from './button-variants';

/**
 * MotionButton with Individual Dock Magnification Effect.
 *
 * Implements an Apple macOS / ReactBits individual Dock effect:
 * - As the cursor approaches or hovers the button, it smoothly magnifies with spring physics.
 * - Button layout position stays completely anchored (no x/y displacement).
 * - Click provides immediate tactile compression feedback via whileTap.
 */
const MotionButton = ({
  children,
  className = '',
  variant,
  size,
  disabled = false,
  dockEffect = true,
  dockDistance = 75,
  dockMagnification,
  whileTap,
  style = {},
  ...props
}) => {
  const buttonRef = useRef(null);
  const { tap } = useMotionSafe();
  const hasCustomClass = Boolean(className && !variant && !size);
  const usesLegacyBtn = /\bbtn\b/.test(className) || hasCustomClass;
  const isFullWidth = style?.width === '100%' || /\b(w-full|auth-submit-btn)\b/.test(className);

  const effectiveMag = dockMagnification ?? (isFullWidth ? 1.035 : 1.08);

  const { scale: dockScale } = useDockEffect(buttonRef, {
    disabled: disabled || !dockEffect,
    distance: dockDistance,
    magnification: effectiveMag,
  });

  const defaultTapAnim = isFullWidth
    ? { scale: 0.98, transition: { duration: 0.1, ease: 'easeOut' } }
    : (whileTap !== undefined ? whileTap : tap);

  return (
    <motion.button
      ref={buttonRef}
      className={usesLegacyBtn ? className : cn(buttonVariants({ variant, size }), className)}
      disabled={disabled}
      style={{
        ...style,
        scale: dockEffect && !disabled ? dockScale : undefined,
        transformOrigin: 'center center',
      }}
      whileTap={disabled ? undefined : defaultTapAnim}
      {...props}
    >
      {children}
    </motion.button>
  );
};

export default MotionButton;
