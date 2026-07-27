import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";

interface ReferencesCardProps {
  references: string[];
}

export const ReferencesCard: React.FC<ReferencesCardProps> = ({ references }) => {
  if (!references || references.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <BookOpen className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Medical References & Guidelines</h4>
      </div>

      <div className="space-y-1.5">
        {references.map((ref, idx) => (
          <div
            key={idx}
            className="flex items-center justify-between gap-2 rounded-xl border border-border-subtle/70 bg-surface-container-low px-3 py-2 text-xs font-medium text-muted-foreground"
          >
            <span className="truncate text-foreground/90">{ref}</span>
            <ExternalLink className="h-3.5 w-3.5 text-primary shrink-0 opacity-70" />
          </div>
        ))}
      </div>
    </div>
  );
};
