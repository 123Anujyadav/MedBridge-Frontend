import React from "react";
import { UserCheck, Calendar, HelpCircle } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

interface SpecialistCardProps {
  specialistName: string | null;
  reason?: string;
  confidence?: string;
  priority?: "Routine" | "Recommended" | "Urgent";
  isLoading?: boolean;
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialistName,
  reason = "Primary triage evaluation",
  confidence = "92% Match",
  priority = "Recommended",
  isLoading = false,
}) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary shadow-xs">
            <UserCheck className="h-4 w-4" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Suggested Specialist</h4>
        </div>

        {specialistName && (
          <span className="rounded-full bg-primary/10 px-2 py-0.5 text-[10px] font-bold text-primary border border-primary/20">
            {confidence}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : specialistName ? (
        <div className="rounded-xl border border-border-subtle/80 bg-surface-container-low p-3 space-y-2 text-xs">
          <div>
            <p className="font-bold text-sm text-foreground">{specialistName}</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">{reason}</p>
          </div>

          <button
            type="button"
            disabled
            className="w-full flex items-center justify-center gap-1.5 rounded-xl border border-primary/30 bg-primary/5 py-2 text-xs font-semibold text-primary opacity-60 cursor-not-allowed"
          >
            <Calendar className="h-3.5 w-3.5" />
            <span>Book Appointment (UI Only)</span>
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 rounded-xl bg-surface-container-low p-3 text-xs text-muted-foreground italic border border-border-subtle/50">
          <HelpCircle className="h-4 w-4 text-muted-foreground/60 shrink-0" />
          <span>No recommendation available.</span>
        </div>
      )}
    </div>
  );
};
