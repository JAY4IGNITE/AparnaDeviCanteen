import { useRef, useState } from 'react';

const SpotlightCard = ({
  children,
  className = '',
  spotlightColor = 'rgba(249, 115, 22, 0.18)',
  spotlightSize = 350,
  ...props
}) => {
  const divRef = useRef(null);
  const [isFocused, setIsFocused] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [opacity, setOpacity] = useState(0);

  const handleMouseMove = (e) => {
    if (!divRef.current || isFocused) return;

    const div = divRef.current;
    const rect = div.getBoundingClientRect();

    setPosition({ x: e.clientX - rect.left, y: e.clientY - rect.top });
  };

  const handleFocus = () => {
    setIsFocused(true);
    setOpacity(1);
  };

  const handleBlur = () => {
    setIsFocused(false);
    setOpacity(0);
  };

  const handleMouseEnter = () => {
    setOpacity(1);
  };

  const handleMouseLeave = () => {
    setOpacity(0);
  };

  return (
    <div
      ref={divRef}
      onMouseMove={handleMouseMove}
      onFocus={handleFocus}
      onBlur={handleBlur}
      onMouseEnter={handleMouseEnter}
      onMouseLeave={handleMouseLeave}
      className={`spotlight-card ${className}`}
      style={{
        position: 'relative',
        overflow: 'hidden',
      }}
      {...props}
    >
      <div
        className="spotlight-layer"
        style={{
          pointerEvents: 'none',
          position: 'absolute',
          inset: 0,
          opacity,
          transition: 'opacity 0.3s ease',
          background: `radial-gradient(${spotlightSize}px circle at ${position.x}px ${position.y}px, ${spotlightColor}, transparent 75%)`,
          zIndex: 1,
        }}
      />
      <div className="spotlight-content" style={{ position: 'relative', zIndex: 2, height: '100%', display: 'flex', flexDirection: 'column' }}>
        {children}
      </div>
    </div>
  );
};

export default SpotlightCard;
