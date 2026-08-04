import { forwardRef } from "react";
import CardTilt from "./CardTilt";

interface GlassCardProps {
  children: React.ReactNode;
  className?: string;
  variant?: "light" | "dark" | "tinted";
  tilt?: boolean;
  animatedBorder?: boolean;
  innerGlow?: boolean;
  style?: React.CSSProperties;
}

/**
 * GlassCard — Premium glassmorphism card with:
 * - Frosted glass background + backdrop blur
 * - Subtle reflection highlight at top edge
 * - Animated conic-gradient border on hover
 * - 3D tilt effect via CardTilt
 * - Inner glow on hover
 * - Holographic shimmer overlay
 *
 * Preserves all children's functionality — this is purely a visual wrapper.
 */
const GlassCard = forwardRef<HTMLDivElement, GlassCardProps>(
  (
    {
      children,
      className = "",
      variant = "light",
      tilt = true,
      animatedBorder = true,
      innerGlow = true,
      style,
    },
    ref
  ) => {
    const variantClass =
      variant === "dark"
        ? "glass-card-dark"
        : variant === "tinted"
          ? "glass-card"
          : "glass-card-light";

    const classes = [
      variantClass,
      animatedBorder ? "gradient-border" : "",
      innerGlow ? "inner-glow" : "",
      "relative overflow-hidden",
      className,
    ]
      .filter(Boolean)
      .join(" ");

    const content = (
      <div ref={ref} className={classes} style={style}>
        {/* Top reflection highlight */}
        <div
          aria-hidden="true"
          style={{
            position: "absolute",
            top: 0,
            left: "10%",
            right: "10%",
            height: "1px",
            background:
              "linear-gradient(90deg, transparent, rgba(255,255,255,0.7) 50%, transparent)",
            zIndex: 2,
            pointerEvents: "none",
          }}
        />
        {/* Holographic shimmer on dark variant */}
        {variant === "dark" && (
          <div
            aria-hidden="true"
            className="holo-shimmer"
            style={{
              position: "absolute",
              inset: 0,
              zIndex: 1,
              pointerEvents: "none",
              borderRadius: "inherit",
            }}
          />
        )}
        <div style={{ position: "relative", zIndex: 2 }}>{children}</div>
      </div>
    );

    return tilt ? <CardTilt className={className}>{content}</CardTilt> : content;
  }
);

GlassCard.displayName = "GlassCard";
export default GlassCard;
