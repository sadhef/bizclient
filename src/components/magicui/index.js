import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '../../lib/utils';

// Animated Counter
export const AnimatedCounter = ({ value, className }) => {
  return (
    <motion.span
      key={value}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.5 }}
      className={cn("inline-block", className)}
    >
      {value}
    </motion.span>
  );
};

// Shimmer Effect
export const Shimmer = ({ className, children }) => {
  return (
    <div className={cn("relative overflow-hidden", className)}>
      <div className="absolute inset-0 -translate-x-full animate-[shimmer_2s_infinite] bg-gradient-to-r from-transparent via-black/20 dark:via-white/20 to-transparent" />
      {children}
    </div>
  );
};

// Floating Elements
export const FloatingElement = ({ children, className, delay = 0 }) => {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ 
        opacity: 1, 
        y: 0,
        transition: {
          duration: 0.6,
          delay,
          type: "spring",
          stiffness: 100
        }
      }}
      whileHover={{ 
        y: -5,
        transition: { duration: 0.3 }
      }}
      className={cn("", className)}
    >
      {children}
    </motion.div>
  );
};

// Pulsing Dot
export const PulsingDot = ({ className, color = "bg-black dark:bg-white" }) => {
  return (
    <div className={cn("relative flex items-center justify-center", className)}>
      <div className={cn("absolute h-2 w-2 rounded-full animate-ping", color)} />
      <div className={cn("h-1.5 w-1.5 rounded-full", color)} />
    </div>
  );
};

// Gradient Border Card
export const GradientBorderCard = ({ children, className, ...props }) => {
  return (
    <div 
      className={cn(
        "relative rounded-xl bg-gradient-to-r from-black via-gray-700 to-black dark:from-white dark:via-gray-300 dark:to-white p-[1px]",
        className
      )}
      {...props}
    >
      <div className="rounded-xl bg-white dark:bg-black h-full w-full p-6">
        {children}
      </div>
    </div>
  );
};

// Glowing Button
export const GlowingButton = ({ children, className, variant = "primary", ...props }) => {
  const variants = {
    primary: "bg-black dark:bg-white text-white dark:text-black shadow-lg shadow-black/25 dark:shadow-white/25 hover:shadow-black/40 dark:hover:shadow-white/40",
    success: "bg-green-600 text-white shadow-lg shadow-green-500/25 hover:shadow-green-500/40",
    danger: "bg-red-600 text-white shadow-lg shadow-red-500/25 hover:shadow-red-500/40",
    warning: "bg-yellow-600 text-white shadow-lg shadow-yellow-500/25 hover:shadow-yellow-500/40",
  };

  return (
    <motion.button
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300",
        variants[variant],
        className
      )}
      {...props}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/10 dark:via-black/10 to-transparent translate-x-[-100%] hover:animate-[shimmer_1s_ease-in-out]" />
      {children}
    </motion.button>
  );
};

// Animated Progress Ring
export const AnimatedProgressRing = ({ 
  progress, 
  size = 120, 
  strokeWidth = 8, 
  className 
}) => {
  const radius = (size - strokeWidth) / 2;
  const circumference = radius * 2 * Math.PI;
  const strokeDasharray = `${circumference} ${circumference}`;
  const strokeDashoffset = circumference - (progress / 100) * circumference;

  return (
    <div className={cn("relative", className)}>
      <svg
        width={size}
        height={size}
        className="transform -rotate-90"
      >
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="currentColor"
          strokeWidth={strokeWidth}
          fill="transparent"
          className="text-gray-300 dark:text-gray-700"
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          stroke="url(#gradient-bw)"
          strokeWidth={strokeWidth}
          fill="transparent"
          strokeDasharray={strokeDasharray}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1, ease: "easeInOut" }}
          strokeLinecap="round"
        />
        <defs>
          <linearGradient id="gradient-bw" x1="0%" y1="0%" x2="100%" y2="100%">
            <stop offset="0%" stopColor="#000000" className="dark:stop-color-white" />
            <stop offset="100%" stopColor="#666666" className="dark:stop-color-gray-300" />
          </linearGradient>
        </defs>
      </svg>
      <div className="absolute inset-0 flex items-center justify-center">
        <span className="text-2xl font-bold text-black dark:text-white">{Math.round(progress)}%</span>
      </div>
    </div>
  );
};

// Typewriter Effect
export const TypewriterEffect = ({ words, className, delay = 50 }) => {
  const [displayText, setDisplayText] = React.useState('');
  const [currentWordIndex, setCurrentWordIndex] = React.useState(0);
  const [currentCharIndex, setCurrentCharIndex] = React.useState(0);

  React.useEffect(() => {
    if (currentWordIndex >= words.length) return;

    const currentWord = words[currentWordIndex];
    
    if (currentCharIndex < currentWord.length) {
      const timer = setTimeout(() => {
        setDisplayText(prev => prev + currentWord[currentCharIndex]);
        setCurrentCharIndex(prev => prev + 1);
      }, delay);
      
      return () => clearTimeout(timer);
    } else {
      const timer = setTimeout(() => {
        setCurrentWordIndex(prev => prev + 1);
        setCurrentCharIndex(0);
        setDisplayText(prev => prev + ' ');
      }, delay * 10);
      
      return () => clearTimeout(timer);
    }
  }, [words, currentWordIndex, currentCharIndex, delay]);

  return (
    <span className={cn("", className)}>
      {displayText}
      <motion.span
        animate={{ opacity: [0, 1, 0] }}
        transition={{ duration: 1, repeat: Infinity }}
        className="inline-block w-0.5 h-6 bg-current ml-1"
      />
    </span>
  );
};

// Particle Background
export const ParticleBackground = ({ particleCount = 50, className }) => {
  const particles = Array.from({ length: particleCount }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    y: Math.random() * 100,
    size: Math.random() * 3 + 1,
    duration: Math.random() * 20 + 10,
  }));

  return (
    <div className={cn("absolute inset-0 overflow-hidden pointer-events-none", className)}>
      {particles.map((particle) => (
        <motion.div
          key={particle.id}
          className="absolute rounded-full bg-black/10 dark:bg-white/10"
          style={{
            left: `${particle.x}%`,
            top: `${particle.y}%`,
            width: `${particle.size}px`,
            height: `${particle.size}px`,
          }}
          animate={{
            y: [0, -100, 0],
            opacity: [0, 0.3, 0],
          }}
          transition={{
            duration: particle.duration,
            repeat: Infinity,
            ease: "easeInOut",
          }}
        />
      ))}
    </div>
  );
};

// Animated Grid Pattern
export const AnimatedGridPattern = ({ className }) => {
  return (
    <div className={cn("absolute inset-0 overflow-hidden opacity-5", className)}>
      <svg className="absolute inset-0 h-full w-full">
        <defs>
          <pattern
            id="grid-bw"
            width="40"
            height="40"
            patternUnits="userSpaceOnUse"
          >
            <path
              d="M 40 0 L 0 0 0 40"
              fill="none"
              stroke="currentColor"
              strokeWidth="1"
              className="text-black dark:text-white"
            />
          </pattern>
        </defs>
        <rect width="100%" height="100%" fill="url(#grid-bw)" />
      </svg>
    </div>
  );
};

// Fade In Container
export const FadeInContainer = ({ children, className, stagger = 0.1 }) => {
  return (
    <motion.div
      initial="hidden"
      animate="visible"
      variants={{
        hidden: { opacity: 0 },
        visible: {
          opacity: 1,
          transition: {
            staggerChildren: stagger,
          },
        },
      }}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div
          key={index}
          variants={{
            hidden: { opacity: 0, y: 20 },
            visible: { opacity: 1, y: 0 },
          }}
          transition={{ duration: 0.6 }}
        >
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

// Animated Number Ticker
export const NumberTicker = ({ value, className, duration = 1000 }) => {
  const [displayValue, setDisplayValue] = React.useState(0);

  React.useEffect(() => {
    const startTime = Date.now();
    const startValue = displayValue;
    const difference = value - startValue;

    const animate = () => {
      const currentTime = Date.now();
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      const easeOutQuart = 1 - Math.pow(1 - progress, 4);
      const newValue = Math.round(startValue + difference * easeOutQuart);
      
      setDisplayValue(newValue);

      if (progress < 1) {
        requestAnimationFrame(animate);
      }
    };

    animate();
  }, [value, duration]);

  return (
    <span className={cn("tabular-nums", className)}>
      {displayValue.toLocaleString()}
    </span>
  );
};

// Loading Dots
export const LoadingDots = ({ className, size = "md" }) => {
  const sizes = {
    sm: "w-1 h-1",
    md: "w-2 h-2",
    lg: "w-3 h-3",
  };

  return (
    <div className={cn("flex space-x-1", className)}>
      {[0, 1, 2].map((index) => (
        <motion.div
          key={index}
          className={cn("rounded-full bg-black dark:bg-white", sizes[size])}
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{
            duration: 1,
            repeat: Infinity,
            delay: index * 0.2,
          }}
        />
      ))}
    </div>
  );
};

// Spotlight Effect
export const SpotlightEffect = ({ children, className }) => {
  return (
    <div className={cn("relative group", className)}>
      <div className="absolute inset-0 bg-gradient-radial from-black/20 dark:from-white/20 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500 rounded-xl" />
      {children}
    </div>
  );
};

// Morphing Button
export const MorphingButton = ({ 
  children, 
  morphTo, 
  isToggled, 
  onToggle, 
  className,
  ...props 
}) => {
  return (
    <motion.button
      layout
      onClick={onToggle}
      className={cn(
        "relative overflow-hidden rounded-lg px-6 py-3 font-medium transition-all duration-300 bg-black dark:bg-white text-white dark:text-black",
        className
      )}
      whileHover={{ scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
      {...props}
    >
      <AnimatePresence mode="wait">
        <motion.span
          key={isToggled ? "morphed" : "default"}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.2 }}
        >
          {isToggled ? morphTo : children}
        </motion.span>
      </AnimatePresence>
    </motion.button>
  );
};

// Ripple Effect
export const RippleEffect = ({ children, className, ...props }) => {
  const [ripples, setRipples] = React.useState([]);

  const addRipple = (event) => {
    const rect = event.currentTarget.getBoundingClientRect();
    const size = Math.max(rect.width, rect.height);
    const x = event.clientX - rect.left - size / 2;
    const y = event.clientY - rect.top - size / 2;
    const newRipple = { x, y, size, id: Date.now() };

    setRipples(prev => [...prev, newRipple]);

    setTimeout(() => {
      setRipples(prev => prev.filter(ripple => ripple.id !== newRipple.id));
    }, 600);
  };

  return (
    <div
      className={cn("relative overflow-hidden cursor-pointer", className)}
      onMouseDown={addRipple}
      {...props}
    >
      {children}
      {ripples.map((ripple) => (
        <motion.span
          key={ripple.id}
          className="absolute bg-black/20 dark:bg-white/20 rounded-full pointer-events-none"
          style={{
            left: ripple.x,
            top: ripple.y,
            width: ripple.size,
            height: ripple.size,
          }}
          initial={{ scale: 0, opacity: 1 }}
          animate={{ scale: 2, opacity: 0 }}
          transition={{ duration: 0.6 }}
        />
      ))}
    </div>
  );
};

// Pulse Animation
export const PulseAnimation = ({ children, className, pulseColor = "black" }) => {
  const colors = {
    black: "shadow-black/50 dark:shadow-white/50",
    green: "shadow-green-500/50",
    red: "shadow-red-500/50",
    yellow: "shadow-yellow-500/50",
  };

  return (
    <motion.div
      className={cn("", className)}
      animate={{
        boxShadow: [
          `0 0 0 0 ${pulseColor === 'black' ? 'rgba(0,0,0,0.7)' : `var(--${pulseColor}-500)`}`,
          `0 0 0 10px transparent`,
          `0 0 0 0 transparent`,
        ],
      }}
      transition={{
        duration: 2,
        repeat: Infinity,
        ease: "easeInOut",
      }}
    >
      {children}
    </motion.div>
  );
};