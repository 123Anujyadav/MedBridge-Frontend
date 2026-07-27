import React from "react";
import { Sparkles } from "lucide-react";

interface DoctorMatchScoreProps {
  score: number; // e.g. 98, 95, 89
  size?: "sm" | "md" | "lg";
}

export const DoctorMatchScore: React.FC<DoctorMatchScoreProps> = ({
  score,
  size = "md",
}) => {
  const radius = size === "lg" ? 28 : size === "md" ? 22 : 18;
  const strokeWidth = size === "lg" ? 4.5 : size === "md" ? 3.5 : 3;
  const circumference = 2 * Math.PI * radius;
  const strokeDashoffset = circumference - (score / 100) * circumference;

  const svgSize = (radius + strokeWidth) * 2;

  // Dynamic colors based on score
  const getScoreColor = () => {
    if (score >= 95) return "text-emerald-600 stroke-emerald-500 bg-emerald-500/10 border-emerald-500/20";
    if (score >= 90) return "text-primary stroke-primary bg-primary/10 border-primary/20";
    return "text-teal-600 stroke-teal-500 bg-teal-500/10 border-teal-500/20";
  };

  return (
    <div className="flex items-center gap-2.5">
      <div className="relative inline-flex items-center justify-center">
        <svg width={svgSize} height={svgSize} className="-rotate-90 transform">
          {/* Background circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className="stroke-surface-container-high fill-none"
            strokeWidth={strokeWidth}
          />
          {/* Progress circle */}
          <circle
            cx={svgSize / 2}
            cy={svgSize / 2}
            r={radius}
            className={`${getScoreColor().split(" ")[1]} fill-none transition-all duration-1000 ease-out`}
            strokeWidth={strokeWidth}
            strokeDasharray={circumference}
            strokeDashoffset={strokeDashoffset}
            strokeLinecap="round"
          />
        </svg>
        <span className="absolute font-headline font-bold text-foreground text-xs md:text-sm">
          {score}%
        </span>
      </div>

      <div className="flex flex-col">
        <span className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getScoreColor()}`}>
          <Sparkles className="h-3 w-3" />
          AI Match
        </span>
        <span className="text-[10px] text-muted-foreground mt-0.5">Symptom Fit</span>
      </div>
    </div>
  );
};
