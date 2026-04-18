import React, { ReactNode } from "react";
import { motion, Variants } from "framer-motion";
import { useScrollReveal } from "@/hooks/useScrollReveal";

interface ScrollRevealProps {
  children: ReactNode;
  delay?: number;
  direction?: "up" | "down" | "left" | "right" | "fade";
  distance?: number;
  duration?: number;
  stagger?: number;
  className?: string;
  threshold?: number;
  triggerOnce?: boolean;
}

/**
 * Reusable component for scroll-triggered reveal animations
 * Wraps children with framer-motion animations that trigger on scroll
 */
export const ScrollReveal: React.FC<ScrollRevealProps> = ({
  children,
  delay = 0,
  direction = "up",
  distance = 50,
  duration = 0.6,
  stagger = 0,
  className = "",
  threshold = 0.1,
  triggerOnce = true,
}) => {
  const { ref, isVisible } = useScrollReveal({
    threshold,
    triggerOnce,
    delay,
  });

  const getVariants = (): Variants => {
    const baseVariants: Variants = {
      hidden: {
        opacity: 0,
      },
      visible: {
        opacity: 1,
        transition: {
          duration,
          ease: [0.25, 0.46, 0.45, 0.94], // Custom easing for smooth animation
        },
      },
    };

    switch (direction) {
      case "up":
        return {
          hidden: {
            ...baseVariants.hidden,
            y: distance,
          },
          visible: {
            ...baseVariants.visible,
            y: 0,
          },
        };
      case "down":
        return {
          hidden: {
            ...baseVariants.hidden,
            y: -distance,
          },
          visible: {
            ...baseVariants.visible,
            y: 0,
          },
        };
      case "left":
        return {
          hidden: {
            ...baseVariants.hidden,
            x: distance,
          },
          visible: {
            ...baseVariants.visible,
            x: 0,
          },
        };
      case "right":
        return {
          hidden: {
            ...baseVariants.hidden,
            x: -distance,
          },
          visible: {
            ...baseVariants.visible,
            x: 0,
          },
        };
      case "fade":
      default:
        return baseVariants;
    }
  };

  const variants = getVariants();

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={variants}
      className={className}
    >
      {children}
    </motion.div>
  );
};

/**
 * Component for staggered child animations
 */
interface StaggerRevealProps {
  children: ReactNode;
  staggerDelay?: number;
  className?: string;
  threshold?: number;
}

export const StaggerReveal: React.FC<StaggerRevealProps> = ({
  children,
  staggerDelay = 0.1,
  className = "",
  threshold = 0.1,
}) => {
  const { ref, isVisible } = useScrollReveal({
    threshold,
    triggerOnce: true,
  });

  const containerVariants: Variants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        staggerChildren: staggerDelay,
      },
    },
  };

  const itemVariants: Variants = {
    hidden: {
      opacity: 0,
      y: 20,
    },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.5,
        ease: [0.25, 0.46, 0.45, 0.94],
      },
    },
  };

  return (
    <motion.div
      ref={ref as React.RefObject<HTMLDivElement>}
      initial="hidden"
      animate={isVisible ? "visible" : "hidden"}
      variants={containerVariants}
      className={className}
    >
      {React.Children.map(children, (child, index) => (
        <motion.div key={index} variants={itemVariants}>
          {child}
        </motion.div>
      ))}
    </motion.div>
  );
};

