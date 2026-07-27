import React from "react";
import { Activity, Check } from "lucide-react";

export interface CauseItem {
  cause: string;
  confidence: "Low" | "Medium" | "High";
}

interface CausesCardProps {
  causes: CauseItem[];
}

export const CausesCard: React.FC<CausesCardProps> = ({ causes }) => {
  if (!causes || causes.length === 0) return null;

  const getConfidenceBadge = (confidence: "Low" | "Medium" | "High") => {
    switch (confidence) {
      case "High":
        return "bg-success/10 text-success border-success/20";
      case "Medium":
        return "bg-primary/10 text-primary border-primary/20";
      case "Low":
        return "bg-muted/10 text-muted-foreground border-border-subtle";
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary">
          <Activity className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Possible Causes</h4>
      </div>
      <div className="space-y-2">
        {causes.map((item, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-3 rounded-xl border border-border-subtle bg-surface-container-low p-2.5 text-xs font-medium text-foreground"
          >
            <div className="flex items-center gap-2">
              <Check className="h-3.5 w-3.5 text-primary shrink-0 font-bold" />
              <span>{item.cause}</span>
            </div>
            <span
              className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getConfidenceBadge(
                item.confidence
              )}`}
            >
              {item.confidence} Confidence
            </span>
          </div>
        ))}
      </div>
    </div>
  );
};
