import React from "react";
import { Brain } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

interface ConfidenceCardProps {
  score?: number | null;
  isLoading?: boolean;
}

export const ConfidenceCard: React.FC<ConfidenceCardProps> = ({
  score = null,
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary shadow-xs">
            <Brain className="h-4 w-4" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">AI Confidence</h4>
        </div>

        {isLoading ? (
          <div className="h-6 w-12 rounded-full bg-surface-container animate-pulse" />
        ) : (
          <span className="font-mono font-bold text-sm text-primary">
            {score !== null ? `${score}%` : "--"}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : (
        <div className="mt-3 flex items-center justify-between gap-2 pt-2 border-t border-border-subtle/40 text-xs text-muted-foreground">
          <span>Confidence Meter</span>
          <span className="font-medium italic">
            {score !== null ? "Evaluated against clinical dataset" : "Not Available Yet"}
          </span>
        </div>
      )}
    </div>
  );
};
