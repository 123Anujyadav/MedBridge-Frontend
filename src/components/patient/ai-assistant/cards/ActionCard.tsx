import React from "react";
import { CheckCircle2 } from "lucide-react";

interface ActionCardProps {
  actions: string[];
}

export const ActionCard: React.FC<ActionCardProps> = ({ actions }) => {
  if (!actions || actions.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-success/10 text-success">
          <CheckCircle2 className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Recommended Actions</h4>
      </div>
      <div className="space-y-2">
        {actions.map((action, idx) => (
          <div
            key={idx}
            className="flex items-start gap-2.5 rounded-xl border border-border-subtle/70 bg-surface-container-low p-2.5 text-xs font-medium text-foreground"
          >
            <CheckCircle2 className="h-4 w-4 text-success shrink-0 mt-0.5" />
            <span className="leading-relaxed">{action}</span>
          </div>
        ))}
      </div>
    </div>
  );
};
