import React from "react";
import { BookOpen, ExternalLink } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

interface ReferenceCardProps {
  references?: string[];
  isLoading?: boolean;
}

export const ReferenceCard: React.FC<ReferenceCardProps> = ({
  references = ["WHO Clinical Protocols", "CDC Assessment Guidelines", "AHA Evidence Triage"],
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-xs">
          <BookOpen className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Medical References</h4>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : references && references.length > 0 ? (
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
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 text-xs text-muted-foreground italic border border-border-subtle/50">
          <BookOpen className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span>Trusted medical references will appear here.</span>
        </div>
      )}
    </div>
  );
};
