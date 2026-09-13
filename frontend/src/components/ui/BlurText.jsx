import { motion } from 'motion/react';

const BlurText = ({
  text = '',
  delay = 50,
  className = '',
  animateBy = 'words', // 'words' or 'letters'
  direction = 'top',
  onAnimationComplete,
}) => {
  const elements = animateBy === 'words' ? text.split(' ') : text.split('');

  const defaultVariants = {
    hidden: {
      filter: 'blur(8px)',
      opacity: 0,
      y: direction === 'top' ? -12 : 12,
    },
    visible: (i) => ({
      filter: 'blur(0px)',
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.35,
        delay: (i * delay) / 1000,
        ease: [0.22, 1, 0.36, 1],
      },
    }),
  };

  return (
    <span className={`blur-text-wrap ${className}`} style={{ display: 'inline-flex', flexWrap: 'wrap', gap: animateBy === 'words' ? '0.3em' : '0' }}>
      {elements.map((element, i) => (
        <motion.span
          key={i}
          custom={i}
          initial="hidden"
          animate="visible"
          variants={defaultVariants}
          onAnimationComplete={i === elements.length - 1 ? onAnimationComplete : undefined}
          style={{ display: 'inline-block', willChange: 'transform, filter, opacity' }}
        >
          {element}
        </motion.span>
      ))}
    </span>
  );
};

export default BlurText;
