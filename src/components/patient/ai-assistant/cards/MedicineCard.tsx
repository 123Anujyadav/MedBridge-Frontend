import React from "react";
import { Pill, AlertCircle, Info } from "lucide-react";

export interface MedicineGuidanceItem {
  name: string;
  purpose: string;
  sideEffects: string[];
  precautions: string;
  type: "OTC" | "Prescription";
}

interface MedicineCardProps {
  medicines: MedicineGuidanceItem[];
}

export const MedicineCard: React.FC<MedicineCardProps> = ({ medicines }) => {
  if (!medicines || medicines.length === 0) return null;

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
          <Pill className="h-4 w-4" />
        </div>
        <div>
          <h4 className="font-semibold text-sm text-foreground">Medicine Guidance</h4>
          <p className="text-[10px] text-muted-foreground">General information • Not a formal prescription</p>
        </div>
      </div>

      <div className="space-y-3">
        {medicines.map((med, idx) => (
          <div
            key={idx}
            className="rounded-xl border border-border-subtle/80 bg-surface-container-low p-3.5 space-y-2 text-xs"
          >
            {/* Header with Type Badge */}
            <div className="flex items-center justify-between">
              <span className="font-bold text-sm text-foreground">{med.name}</span>
              <span
                className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${
                  med.type === "OTC"
                    ? "bg-success/10 text-success border-success/20"
                    : "bg-primary/10 text-primary border-primary/20"
                }`}
              >
                {med.type} Information
              </span>
            </div>

            {/* Purpose */}
            <div className="flex items-start gap-1.5 text-muted-foreground">
              <Info className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" />
              <span>
                <strong className="text-foreground">Purpose:</strong> {med.purpose}
              </span>
            </div>

            {/* Common Side Effects */}
            {med.sideEffects && med.sideEffects.length > 0 && (
              <div className="space-y-1">
                <span className="font-semibold text-foreground">Common Side Effects:</span>
                <div className="flex flex-wrap gap-1">
                  {med.sideEffects.map((se, sIdx) => (
                    <span
                      key={sIdx}
                      className="rounded bg-card px-2 py-0.5 text-[10px] text-muted-foreground border border-border-subtle"
                    >
                      {se}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {/* General Precautions */}
            {med.precautions && (
              <div className="flex items-start gap-1.5 rounded-lg bg-card p-2 text-[11px] text-muted-foreground border border-border-subtle">
                <AlertCircle className="h-3.5 w-3.5 text-warning shrink-0 mt-0.5" />
                <span>
                  <strong className="text-foreground">Precaution:</strong> {med.precautions}
                </span>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
};
