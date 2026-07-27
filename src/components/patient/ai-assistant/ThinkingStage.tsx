import React, { useState, useEffect } from "react";
import { Check, CircleDot, Circle } from "lucide-react";

export const STAGES = [
  { label: "Understanding your question", icon: "🧠" },
  { label: "Identifying symptoms", icon: "🩺" },
  { label: "Reading trusted medical knowledge", icon: "📚" },
  { label: "Searching clinical guidelines", icon: "🔍" },
  { label: "Evaluating possible conditions", icon: "⚕" },
  { label: "Reviewing treatment guidance", icon: "💊" },
  { label: "Identifying appropriate specialist", icon: "👨‍⚕" },
  { label: "Preparing personalized response", icon: "📋" },
  { label: "Finalizing recommendation", icon: "✨" },
];

interface ThinkingStageProps {
  onStageChange?: (index: number) => void;
}

export const ThinkingStage: React.FC<ThinkingStageProps> = ({ onStageChange }) => {
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentIndex((prev) => {
        const next = prev < STAGES.length - 1 ? prev + 1 : prev;
        onStageChange?.(next);
        return next;
      });
    }, 450);

    return () => clearInterval(interval);
  }, [onStageChange]);

  const currentStage = STAGES[currentIndex];

  return (
    <div className="space-y-3 w-full">
      {/* Current Active Stage Badge */}
      <div className="flex items-center gap-2.5 rounded-xl border border-primary/20 bg-primary/5 px-3.5 py-2.5 shadow-sm">
        <span className="text-base animate-bounce shrink-0">{currentStage.icon}</span>
        <span className="text-sm font-semibold text-primary animate-pulse truncate">
          {currentStage.label}...
        </span>
      </div>

      {/* Thinking Timeline List */}
      <div className="space-y-1.5 px-1 py-1">
        {STAGES.slice(0, 4).map((stage, idx) => {
          const isDone = idx < currentIndex;
          const isActive = idx === currentIndex;

          return (
            <div key={idx} className="flex items-center gap-2 text-xs">
              {isDone ? (
                <Check className="h-3.5 w-3.5 text-success shrink-0 font-bold" />
              ) : isActive ? (
                <CircleDot className="h-3.5 w-3.5 text-primary shrink-0 animate-spin" />
              ) : (
                <Circle className="h-3.5 w-3.5 text-muted-foreground/40 shrink-0" />
              )}
              <span
                className={
                  isDone
                    ? "text-muted-foreground font-medium line-through opacity-75"
                    : isActive
                    ? "font-bold text-foreground"
                    : "text-muted-foreground/60"
                }
              >
                {stage.label}
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
};
