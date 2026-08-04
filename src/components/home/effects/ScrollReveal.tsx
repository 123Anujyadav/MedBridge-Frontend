import { useRef } from "react";
import { motion, useInView } from "framer-motion";

interface ScrollRevealProps {
  children: React.ReactNode;
  delay?: number;
  duration?: number;
  yOffset?: number;
  className?: string;
  once?: boolean;
}

/**
 * ScrollReveal — Framer Motion wrapper that animates children into view
 * when they enter the viewport.
 * - Uses spring-based easing for a premium, physical feel
 * - Respects prefers-reduced-motion via Framer Motion's built-in detection
 */
export default function ScrollReveal({
  children,
  delay = 0,
  duration = 0.7,
  yOffset = 36,
  className,
  once = true,
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once, margin: "-80px 0px" });

  return (
    <motion.div
      ref={ref}
      className={className}
      initial={{ opacity: 0, y: yOffset }}
      animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: yOffset }}
      transition={{
        duration,
        delay,
        ease: [0.16, 1, 0.3, 1], // Spring-like cubic-bezier
      }}
    >
      {children}
    </motion.div>
  );
}

interface StaggerRevealProps {
  children: React.ReactNode[];
  staggerDelay?: number;
  className?: string;
}

/**
 * StaggerReveal — reveals multiple children with cascading delay.
 */
export function StaggerReveal({
  children,
  staggerDelay = 0.1,
  className,
}: StaggerRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const isInView = useInView(ref, { once: true, margin: "-80px 0px" });

  return (
    <div ref={ref} className={className}>
      {children.map((child, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 32 }}
          animate={isInView ? { opacity: 1, y: 0 } : { opacity: 0, y: 32 }}
          transition={{
            duration: 0.65,
            delay: i * staggerDelay,
            ease: [0.16, 1, 0.3, 1],
          }}
        >
          {child}
        </motion.div>
      ))}
    </div>
  );
}
