import { useRef } from "react";
import gsap from "gsap";

interface CardTiltProps {
  children: React.ReactNode;
  maxTilt?: number;
  scale?: number;
  className?: string;
}

/**
 * CardTilt — CSS 3D perspective tilt that follows the cursor within the card.
 * Uses GSAP quickTo for buttery smooth animations without React re-renders.
 * - maxTilt: max degrees of rotation (default 8°)
 * - Automatically resets on mouse leave with spring easing
 * - Adds a moving highlight "glare" effect
 */
export default function CardTilt({
  children,
  maxTilt = 8,
  scale = 1.02,
  className,
}: CardTiltProps) {
  const cardRef = useRef<HTMLDivElement>(null);
  const glareRef = useRef<HTMLDivElement>(null);

  const rotXTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const rotYTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const scaleTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  const initQuickTo = () => {
    const el = cardRef.current;
    if (!el || rotXTo.current) return;
    rotXTo.current = gsap.quickTo(el, "rotateX", { duration: 0.3, ease: "power2.out" });
    rotYTo.current = gsap.quickTo(el, "rotateY", { duration: 0.3, ease: "power2.out" });
    scaleTo.current = gsap.quickTo(el, "scale", { duration: 0.3, ease: "power2.out" });
  };

  const handleMove = (e: React.MouseEvent<HTMLDivElement>) => {
    if (window.matchMedia("(pointer: coarse)").matches) return;
    initQuickTo();

    const el = cardRef.current;
    if (!el) return;

    const rect = el.getBoundingClientRect();
    const cx = rect.left + rect.width / 2;
    const cy = rect.top + rect.height / 2;
    const relX = (e.clientX - cx) / (rect.width / 2);
    const relY = (e.clientY - cy) / (rect.height / 2);

    rotXTo.current?.(-relY * maxTilt);
    rotYTo.current?.(relX * maxTilt);
    scaleTo.current?.(scale);

    // Move glare
    if (glareRef.current) {
      const glareX = ((e.clientX - rect.left) / rect.width) * 100;
      const glareY = ((e.clientY - rect.top) / rect.height) * 100;
      glareRef.current.style.background = `radial-gradient(circle at ${glareX}% ${glareY}%, rgba(255,255,255,0.15) 0%, transparent 60%)`;
    }
  };

  const handleLeave = () => {
    const el = cardRef.current;
    if (!el) return;
    rotXTo.current?.(0);
    rotYTo.current?.(0);
    scaleTo.current?.(1);
    if (glareRef.current) {
      glareRef.current.style.background = "transparent";
    }
  };

  return (
    <div
      ref={cardRef}
      className={className}
      onMouseMove={handleMove}
      onMouseLeave={handleLeave}
      style={{
        transformStyle: "preserve-3d",
        willChange: "transform",
        position: "relative",
      }}
    >
      {children}
      {/* Glare overlay */}
      <div
        ref={glareRef}
        aria-hidden="true"
        style={{
          position: "absolute",
          inset: 0,
          borderRadius: "inherit",
          pointerEvents: "none",
          transition: "background 0.1s ease",
          zIndex: 1,
        }}
      />
    </div>
  );
}
