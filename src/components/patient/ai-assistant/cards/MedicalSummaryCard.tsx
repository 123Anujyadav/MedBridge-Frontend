import React from "react";
import { ClipboardList } from "lucide-react";

interface MedicalSummaryCardProps {
  summary: string;
}

export const MedicalSummaryCard: React.FC<MedicalSummaryCardProps> = ({ summary }) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-2.5">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <ClipboardList className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Medical Summary</h4>
      </div>
      <p className="text-xs text-muted-foreground leading-relaxed font-medium">
        {summary}
      </p>
    </div>
  );
};
