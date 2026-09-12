'use client';

import { motion, useMotionValue, useSpring, useTransform, AnimatePresence } from 'motion/react';
import { Children, cloneElement, useEffect, useMemo, useRef, useState } from 'react';
import './Dock.css';

export function DockItem({
  children,
  className = '',
  onClick,
  mouseX,
  spring,
  distance,
  magnification,
  baseItemSize,
  baseWidth,
  magnificationWidth,
  label,
  text,
  icon,
  isPill = false,
  showLabel = true,
}) {
  const ref = useRef(null);
  const isHovered = useMotionValue(0);

  const effectiveBaseWidth = isPill && baseWidth ? baseWidth : baseItemSize;
  const effectiveMagWidth = isPill && magnificationWidth ? magnificationWidth : magnification;

  const mouseDistance = useTransform(mouseX, (val) => {
    const rect = ref.current?.getBoundingClientRect() ?? {
      x: 0,
      width: effectiveBaseWidth,
    };
    return val - rect.x - effectiveBaseWidth / 2;
  });

  const targetHeight = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [baseItemSize, magnification, baseItemSize]
  );
  const height = useSpring(targetHeight, spring);

  const targetWidth = useTransform(
    mouseDistance,
    [-distance, 0, distance],
    [effectiveBaseWidth, effectiveMagWidth, effectiveBaseWidth]
  );
  const width = useSpring(targetWidth, spring);

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      onClick?.(e);
    }
  };

  const handleClick = (e) => {
    e.stopPropagation();
    onClick?.(e);
  };

  return (
    <motion.div
      ref={ref}
      style={{
        width,
        height,
      }}
      onHoverStart={() => isHovered.set(1)}
      onHoverEnd={() => isHovered.set(0)}
      onFocus={() => isHovered.set(1)}
      onBlur={() => isHovered.set(0)}
      onClick={handleClick}
      className={`dock-item ${isPill ? 'dock-item-pill' : ''} ${className}`}
      tabIndex={0}
      role="button"
      aria-haspopup={!isPill && showLabel ? 'true' : undefined}
      aria-label={label || text}
      onKeyDown={handleKeyDown}
    >
      {isPill ? (
        <div className="dock-pill-content">
          {icon && <DockIcon>{icon}</DockIcon>}
          <span className="dock-pill-text">{text || label}</span>
        </div>
      ) : children ? (
        Children.map(children, (child) => cloneElement(child, { isHovered }))
      ) : (
        <>
          <DockIcon>{icon}</DockIcon>
          {showLabel && label && <DockLabel isHovered={isHovered}>{label}</DockLabel>}
        </>
      )}
    </motion.div>
  );
}

export function DockLabel({ children, className = '', ...rest }) {
  const { isHovered } = rest;
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    if (!isHovered) return;
    const unsubscribe = isHovered.on('change', (latest) => {
      setIsVisible(latest === 1);
    });
    return () => unsubscribe();
  }, [isHovered]);

  return (
    <AnimatePresence>
      {isVisible && (
        <motion.div
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -4 }}
          transition={{ duration: 0.18 }}
          className={`dock-label ${className}`}
          role="tooltip"
          style={{ x: '-50%' }}
        >
          {children}
        </motion.div>
      )}
    </AnimatePresence>
  );
}

export function DockIcon({ children, className = '' }) {
  return <div className={`dock-icon ${className}`}>{children}</div>;
}

export default function Dock({
  items,
  className = '',
  spring = { mass: 0.1, stiffness: 160, damping: 13 },
  magnification = 58,
  distance = 150,
  panelHeight = 56,
  baseItemSize = 42,
}) {
  const mouseX = useMotionValue(Infinity);
  const isHovered = useMotionValue(0);

  return (
    <div className="dock-outer">
      <motion.div
        onMouseMove={(e) => {
          isHovered.set(1);
          mouseX.set(e.clientX);
        }}
        onMouseLeave={() => {
          isHovered.set(0);
          mouseX.set(Infinity);
        }}
        className={`dock-panel ${className}`}
        style={{ minHeight: panelHeight }}
        role="toolbar"
        aria-label="Application dock"
      >
        {items.map((item, index) => {
          if (item.isDivider) {
            return <div key={index} className="dock-divider" />;
          }

          return (
            <DockItem
              key={index}
              onClick={item.onClick}
              className={item.className}
              mouseX={mouseX}
              spring={spring}
              distance={distance}
              magnification={magnification}
              baseItemSize={baseItemSize}
              baseWidth={item.baseWidth}
              magnificationWidth={item.magnificationWidth}
              label={item.label}
              text={item.text}
              icon={item.icon}
              isPill={item.isPill}
              showLabel={item.showLabel !== false}
            >
              {item.children}
            </DockItem>
          );
        })}
      </motion.div>
    </div>
  );
}
