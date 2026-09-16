import { useEffect, useRef, useState } from 'react';

const CountUp = ({
  to,
  from = 0,
  delay = 0,
  duration = 1.2,
  className = '',
  prefix = '',
  suffix = '',
}) => {
  const [value, setValue] = useState(from);
  const startTimeRef = useRef(null);
  const targetValue = typeof to === 'number' ? to : parseFloat(to) || 0;

  useEffect(() => {
    let animationFrameId;
    let timeoutId;

    const easeOutExpo = (x) => (x === 1 ? 1 : 1 - Math.pow(2, -10 * x));

    const step = (timestamp) => {
      if (!startTimeRef.current) startTimeRef.current = timestamp;
      const elapsed = (timestamp - startTimeRef.current) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const easedProgress = easeOutExpo(progress);

      const current = Math.round(from + (targetValue - from) * easedProgress);
      setValue(current);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(step);
      } else {
        setValue(targetValue);
      }
    };

    timeoutId = setTimeout(() => {
      startTimeRef.current = null;
      animationFrameId = requestAnimationFrame(step);
    }, delay * 1000);

    return () => {
      clearTimeout(timeoutId);
      if (animationFrameId) cancelAnimationFrame(animationFrameId);
    };
  }, [to, from, duration, delay, targetValue]);

  const formatted = value.toLocaleString('en-IN');

  return (
    <span className={`count-up ${className}`}>
      {prefix}
      {formatted}
      {suffix}
    </span>
  );
};

export default CountUp;
