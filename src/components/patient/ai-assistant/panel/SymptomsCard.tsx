import React from "react";
import { Stethoscope, Activity } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

interface SymptomsCardProps {
  symptoms: string[];
  isLoading?: boolean;
}

export const SymptomsCard: React.FC<SymptomsCardProps> = ({ symptoms, isLoading = false }) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-tertiary/10 text-tertiary shadow-xs">
          <Stethoscope className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Detected Symptoms</h4>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : symptoms && symptoms.length > 0 ? (
        <div className="flex flex-wrap gap-1.5">
          {symptoms.map((symptom, idx) => (
            <span
              key={idx}
              className="rounded-full bg-secondary/10 px-2.5 py-1 text-xs font-semibold text-secondary border border-secondary/20 shadow-xs"
            >
              {symptom}
            </span>
          ))}
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 text-xs text-muted-foreground italic border border-border-subtle/50">
          <Activity className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span>No symptoms detected yet.</span>
        </div>
      )}
    </div>
  );
};
