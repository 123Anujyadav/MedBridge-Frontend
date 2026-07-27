import React from "react";
import { ShieldAlert, ShieldCheck } from "lucide-react";
import { LoadingCard } from "./LoadingCard";

export type EmergencyState = "Green" | "Yellow" | "Red";

interface EmergencyCardProps {
  state?: EmergencyState;
  description?: string;
  isLoading?: boolean;
}

export const EmergencyCard: React.FC<EmergencyCardProps> = ({
  state = "Green",
  description = "No emergency detected.",
  isLoading = false,
}) => {
  const getBadge = (st: EmergencyState) => {
    switch (st) {
      case "Red":
        return {
          bg: "bg-destructive/10 text-destructive border-destructive/30",
          icon: <ShieldAlert className="h-4 w-4 text-destructive" />,
          dot: "bg-destructive",
          label: "Emergency Red Alert",
        };
      case "Yellow":
        return {
          bg: "bg-warning/20 text-warning border-warning/30",
          icon: <ShieldAlert className="h-4 w-4 text-warning" />,
          dot: "bg-warning",
          label: "Moderate Warning",
        };
      case "Green":
      default:
        return {
          bg: "bg-success/10 text-success border-success/20",
          icon: <ShieldCheck className="h-4 w-4 text-success" />,
          dot: "bg-success",
          label: "Normal Status",
        };
    }
  };

  const info = getBadge(state);

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all duration-200 hover:border-primary/30 hover:shadow-card-md">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container shadow-xs">
            {info.icon}
          </div>
          <h4 className="font-semibold text-sm text-foreground">Emergency Status</h4>
        </div>

        {isLoading ? (
          <div className="h-5 w-20 rounded-full bg-surface-container animate-pulse" />
        ) : (
          <span className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-[10px] font-bold border ${info.bg}`}>
            <span className={`h-2 w-2 rounded-full ${info.dot}`} />
            {info.label}
          </span>
        )}
      </div>

      {isLoading ? (
        <LoadingCard />
      ) : (
        <p className="text-xs text-muted-foreground leading-relaxed pl-10 font-medium">
          {description}
        </p>
      )}
    </div>
  );
};
