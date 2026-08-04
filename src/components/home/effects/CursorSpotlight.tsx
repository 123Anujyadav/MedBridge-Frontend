import { useEffect, useRef } from "react";

/**
 * CursorSpotlight — smooth teal radial gradient that follows the cursor.
 * Uses rAF + direct DOM for 60fps with zero React re-renders.
 * Hidden on touch/mobile devices automatically.
 */
export default function CursorSpotlight() {
  const spotRef = useRef<HTMLDivElement>(null);
  const pos = useRef({ x: -9999, y: -9999 });
  const target = useRef({ x: -9999, y: -9999 });
  const rafId = useRef<number>(0);

  useEffect(() => {
    // Skip on touch-primary devices
    if (window.matchMedia("(pointer: coarse)").matches) return;

    const el = spotRef.current;
    if (!el) return;

    const handleMove = (e: MouseEvent) => {
      target.current = { x: e.clientX, y: e.clientY };
    };

    const handleEnter = () => {
      el.style.opacity = "1";
    };
    const handleLeave = () => {
      el.style.opacity = "0";
    };

    document.addEventListener("mousemove", handleMove);
    document.addEventListener("mouseenter", handleEnter);
    document.addEventListener("mouseleave", handleLeave);

    const animate = () => {
      // Lerp for smooth trailing effect
      pos.current.x += (target.current.x - pos.current.x) * 0.08;
      pos.current.y += (target.current.y - pos.current.y) * 0.08;
      el.style.transform = `translate(${pos.current.x - 300}px, ${pos.current.y - 300}px)`;
      rafId.current = requestAnimationFrame(animate);
    };

    rafId.current = requestAnimationFrame(animate);

    return () => {
      document.removeEventListener("mousemove", handleMove);
      document.removeEventListener("mouseenter", handleEnter);
      document.removeEventListener("mouseleave", handleLeave);
      cancelAnimationFrame(rafId.current);
    };
  }, []);

  return (
    <div
      ref={spotRef}
      aria-hidden="true"
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 600,
        height: 600,
        borderRadius: "50%",
        background:
          "radial-gradient(circle at center, rgba(16,185,129,0.07) 0%, rgba(13,148,136,0.04) 35%, transparent 70%)",
        pointerEvents: "none",
        zIndex: 9999,
        mixBlendMode: "screen" as React.CSSProperties["mixBlendMode"],
        opacity: 0,
        transition: "opacity 0.4s ease",
        willChange: "transform",
      }}
    />
  );
}
