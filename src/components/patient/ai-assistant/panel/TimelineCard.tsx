import React from "react";
import { Clock, CheckCircle2, CircleDot, Circle } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

interface TimelineCardProps {
  isLoading?: boolean;
}

const TIMELINE_STEPS = [
  { label: "Conversation Started", status: "completed" },
  { label: "Symptoms Detected", status: "completed" },
  { label: "AI Analysis", status: "active" },
  { label: "Recommendation Ready", status: "pending" },
  { label: "Appointment Suggested", status: "pending" },
];

export const TimelineCard: React.FC<TimelineCardProps> = ({ isLoading = false }) => {
  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center gap-2.5 mb-3">
        <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary shadow-xs">
          <Clock className="h-4 w-4" />
        </div>
        <h4 className="font-semibold text-sm text-foreground">Conversation Timeline</h4>
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : (
        <div className="relative border-l-2 border-border-subtle ml-3.5 space-y-3 py-1 pl-4">
          {TIMELINE_STEPS.map((step, idx) => (
            <div key={idx} className="relative flex items-center gap-2 text-xs">
              <span className="absolute -left-[23px] flex h-3.5 w-3.5 items-center justify-center rounded-full bg-card">
                {step.status === "completed" ? (
                  <CheckCircle2 className="h-3.5 w-3.5 text-success fill-success/10" />
                ) : step.status === "active" ? (
                  <CircleDot className="h-3.5 w-3.5 text-primary animate-pulse" />
                ) : (
                  <Circle className="h-3.5 w-3.5 text-muted-foreground/30" />
                )}
              </span>
              <span
                className={
                  step.status === "completed"
                    ? "font-semibold text-foreground"
                    : step.status === "active"
                    ? "font-bold text-primary"
                    : "text-muted-foreground/60"
                }
              >
                {step.label}
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};
