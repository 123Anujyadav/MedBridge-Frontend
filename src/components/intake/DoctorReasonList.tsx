import React from "react";
import { CheckCircle2, Sparkles } from "lucide-react";

interface DoctorReasonListProps {
  reasons: string[];
}

export const DoctorReasonList: React.FC<DoctorReasonListProps> = ({ reasons }) => {
  return (
    <div className="space-y-1.5">
      <div className="flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-muted-foreground">
        <Sparkles className="h-3 w-3 text-primary" />
        Why AI Recommended:
      </div>
      <div className="flex flex-wrap gap-1.5">
        {reasons.map((reason, idx) => (
          <span
            key={idx}
            className="inline-flex items-center gap-1 rounded-lg bg-surface-container-low px-2.5 py-1 text-xs font-medium text-foreground border border-border-subtle hover:border-primary/30 transition-colors"
          >
            <CheckCircle2 className="h-3 w-3 text-emerald-600 shrink-0" />
            {reason}
          </span>
        ))}
      </div>
    </div>
  );
};
