import React from "react";
import { Stethoscope } from "lucide-react";

interface SymptomsCardProps {
  symptoms: string[];
}

export const SymptomsCard: React.FC<SymptomsCardProps> = ({ symptoms }) => {
  if (!symptoms || symptoms.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-secondary/10 text-secondary">
          <Stethoscope className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Detected Symptoms</h4>
      </div>
      <div className="flex flex-wrap gap-2">
        {symptoms.map((symptom, idx) => (
          <span
            key={idx}
            className="rounded-full bg-secondary/10 px-3 py-1 text-xs font-semibold text-secondary border border-secondary/20 shadow-xs"
          >
            {symptom}
          </span>
        ))}
      </div>
    </div>
  );
};
