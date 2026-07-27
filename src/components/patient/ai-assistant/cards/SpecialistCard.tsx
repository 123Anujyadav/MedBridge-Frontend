import React from "react";
import { UserCheck, Calendar } from "lucide-react";
import { useNavigate } from "react-router-dom";

interface SpecialistCardProps {
  specialistName: string;
  reason: string;
  priority?: "Routine" | "Recommended" | "Urgent";
}

export const SpecialistCard: React.FC<SpecialistCardProps> = ({
  specialistName,
  reason,
  priority = "Recommended",
}) => {
  const navigate = useNavigate();

  if (!specialistName) return null;

  const getPriorityBadge = (p: "Routine" | "Recommended" | "Urgent") => {
    switch (p) {
      case "Urgent":
        return "bg-destructive/10 text-destructive border-destructive/20";
      case "Recommended":
        return "bg-primary/10 text-primary border-primary/20";
      case "Routine":
        return "bg-muted/10 text-muted-foreground border-border-subtle";
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-accent text-primary">
            <UserCheck className="h-4 w-4" />
          </div>
          <div>
            <h4 className="font-semibold text-sm text-foreground">Recommended Specialist</h4>
            <p className="text-[10px] text-muted-foreground">Clinical Department Match</p>
          </div>
        </div>

        <span className={`rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${getPriorityBadge(priority)}`}>
          {priority}
        </span>
      </div>

      <div className="rounded-xl border border-border-subtle/80 bg-surface-container-low p-3.5 space-y-2.5 text-xs">
        <div>
          <p className="font-bold text-sm text-foreground">{specialistName}</p>
          <p className="text-[11px] text-muted-foreground mt-0.5">{reason}</p>
        </div>

        <button
          type="button"
          onClick={() => navigate("/patient/appointments")}
          className="w-full flex items-center justify-center gap-2 rounded-xl bg-primary px-4 py-2.5 font-semibold text-xs text-primary-foreground shadow-primary transition-all hover:opacity-90 active:scale-95"
        >
          <Calendar className="h-4 w-4" />
          <span>Book Appointment</span>
        </button>
      </div>
    </div>
  );
};
