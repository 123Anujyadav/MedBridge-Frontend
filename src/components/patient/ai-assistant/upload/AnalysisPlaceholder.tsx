import React from "react";
import { Bot, Sparkles } from "lucide-react";

export const AnalysisPlaceholder: React.FC = () => {
  return (
    <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 shadow-card space-y-3 animate-fade-in">
      <div className="flex items-center justify-between gap-2 border-b border-primary/10 pb-2">
        <div className="flex items-center gap-2">
          <div className="flex h-7 w-7 items-center justify-center rounded-lg bg-primary text-primary-foreground shadow-xs">
            <Bot className="h-4 w-4" />
          </div>
          <h4 className="font-bold text-sm text-foreground">AI Report Analysis</h4>
        </div>
        <span className="flex items-center gap-1.5 rounded-full bg-primary/10 px-2.5 py-0.5 text-[10px] font-bold text-primary animate-pulse">
          <Sparkles className="h-3 w-3" />
          Waiting for AI Analysis...
        </span>
      </div>

      {/* Shimmer Skeleton Placeholder Lines */}
      <div className="space-y-2 animate-pulse py-1">
        <div className="h-3.5 w-3/4 rounded bg-primary/20" />
        <div className="h-3 w-full rounded bg-primary/15" />
        <div className="h-3 w-5/6 rounded bg-primary/15" />
      </div>

      <p className="text-[11px] text-muted-foreground italic font-medium">
        AI will automatically extract biomarkers, laboratory metrics, and clinical summaries once analysis begins.
      </p>
    </div>
  );
};
