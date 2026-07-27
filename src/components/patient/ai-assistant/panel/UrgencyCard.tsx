import React from "react";
import { AlertCircle } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

export type UrgencyStatus = "Low" | "Medium" | "High" | "Emergency" | "Unknown";

interface UrgencyCardProps {
  level?: UrgencyStatus;
  isLoading?: boolean;
}

export const UrgencyCard: React.FC<UrgencyCardProps> = ({
  level = "Unknown",
  isLoading = false,
}) => {
  const getBadgeStyle = (status: UrgencyStatus) => {
    switch (status) {
      case "Emergency":
        return "bg-destructive text-white border-destructive";
      case "High":
        return "bg-warning/20 text-warning border-warning/30";
      case "Medium":
        return "bg-primary/10 text-primary border-primary/20";
      case "Low":
        return "bg-success/10 text-success border-success/20";
      default:
        return "bg-surface-container text-muted-foreground border-border-subtle";
    }
  };

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container text-primary shadow-xs">
            <AlertCircle className="h-4 w-4" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Urgency Level</h4>
        </div>

        {isLoading ? (
          <div className="h-5 w-16 rounded-full bg-surface-container animate-pulse" />
        ) : (
          <span
            className={`rounded-full px-2.5 py-0.5 text-[11px] font-bold border ${getBadgeStyle(
              level
            )}`}
          >
            {level}
          </span>
        )}
      </div>
    </div>
  );
};
