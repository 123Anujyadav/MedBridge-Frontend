import { useRef, useEffect } from "react";
import gsap from "gsap";

interface MagneticButtonProps {
  children: React.ReactNode;
  strength?: number;
  className?: string;
}

/**
 * MagneticButton — wraps any element and adds GSAP magnetic hover effect.
 * The element smoothly follows the cursor within its bounds, then springs back.
 * - Uses quickTo for highest performance (avoids layout/paint on non-transform props)
 * - Disabled on touch devices
 */
export default function MagneticButton({
  children,
  strength = 0.4,
  className,
}: MagneticButtonProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const xTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);
  const yTo = useRef<ReturnType<typeof gsap.quickTo> | null>(null);

  useEffect(() => {
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = containerRef.current;
    if (!el) return;

    xTo.current = gsap.quickTo(el, "x", {
      duration: 0.4,
      ease: "power3.out",
    });
    yTo.current = gsap.quickTo(el, "y", {
      duration: 0.4,
      ease: "power3.out",
    });

    const handleMove = (e: MouseEvent) => {
      const rect = el.getBoundingClientRect();
      const cx = rect.left + rect.width / 2;
      const cy = rect.top + rect.height / 2;
      const dx = (e.clientX - cx) * strength;
      const dy = (e.clientY - cy) * strength;
      xTo.current?.(dx);
      yTo.current?.(dy);
    };

    const handleLeave = () => {
      xTo.current?.(0);
      yTo.current?.(0);
    };

    el.addEventListener("mousemove", handleMove);
    el.addEventListener("mouseleave", handleLeave);

    return () => {
      el.removeEventListener("mousemove", handleMove);
      el.removeEventListener("mouseleave", handleLeave);
      gsap.set(el, { x: 0, y: 0 });
    };
  }, [strength]);

  return (
    <div ref={containerRef} className={className} style={{ display: "inline-block" }}>
      {children}
    </div>
  );
}
