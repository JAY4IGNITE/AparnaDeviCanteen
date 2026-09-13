import { motion, useScroll, useSpring } from 'motion/react';

/**
 * Top Scroll Progress Bar
 * Displays a sleek gradient progress indicator at the very top of the screen
 * that fills from left to right as the user scrolls, matching the brand colors.
 */
const ScrollProgressBar = () => {
  const { scrollYProgress } = useScroll();

  const scaleX = useSpring(scrollYProgress, {
    stiffness: 280,
    damping: 30,
    restDelta: 0.001,
  });

  return (
    <motion.div
      className="top-scroll-progress-bar"
      style={{ scaleX }}
      aria-hidden="true"
    />
  );
};

export default ScrollProgressBar;
