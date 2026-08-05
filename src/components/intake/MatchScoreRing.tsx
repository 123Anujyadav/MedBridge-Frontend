import React from "react";
import { Sparkles } from "lucide-react";

interface MatchScoreRingProps {
  score: number;
  label?: string;
}

export const MatchScoreRing: React.FC<MatchScoreRingProps> = ({
  score,
  label = "Best Match",
}) => {
  const radius = 24;
  const strokeWidth = 4;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;
  const svgSize = (radius + strokeWidth) * 2;

  return (
    <div className="flex flex-col items-center justify-center shrink-0 space-y-3">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90 transform">
          {/* Background Track */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-surface-container-high fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Animated Gradient Progress Stroke */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-primary fill-none transition-all duration-1000 ease-out"
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-headline font-bold text-foreground text-sm">
          {score}%
        </span>
      </div>

      {/* px-3, not px-4: this pill is the widest thing in the ring column and
          therefore sets how much room the avatar has left beside it. */}
      <span className="inline-flex min-h-8 max-w-full items-center gap-1.5 whitespace-nowrap rounded-full border border-primary/20 bg-primary/10 px-3 py-1 text-[11px] font-bold text-primary">
        <Sparkles className="h-3 w-3 shrink-0" />
        {label}
      </span>
    </div>
  );
};
