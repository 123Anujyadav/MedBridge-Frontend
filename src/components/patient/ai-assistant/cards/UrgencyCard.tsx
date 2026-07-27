import React from "react";
import { AlertTriangle } from "lucide-react";

export type UrgencyLevel = "Low" | "Medium" | "High" | "Emergency";

interface UrgencyCardProps {
  level: UrgencyLevel;
  explanation: string;
}

export const UrgencyCard: React.FC<UrgencyCardProps> = ({ level, explanation }) => {
  const getUrgencyBadge = (lvl: UrgencyLevel) => {
    switch (lvl) {
      case "Emergency":
        return { badge: "bg-destructive text-white border-destructive", iconColor: "text-destructive" };
      case "High":
        return { badge: "bg-warning/20 text-warning border-warning/30", iconColor: "text-warning" };
      case "Medium":
        return { badge: "bg-primary/10 text-primary border-primary/20", iconColor: "text-primary" };
      case "Low":
        return { badge: "bg-success/10 text-success border-success/20", iconColor: "text-success" };
    }
  };

  const style = getUrgencyBadge(level);

  return (
    <div className="rounded-2xl border border-border-subtle bg-card p-4 shadow-card transition-all hover:border-primary/30">
      <div className="flex items-center justify-between gap-2 mb-2">
        <div className="flex items-center gap-2.5">
          <div className={`flex h-8 w-8 items-center justify-center rounded-lg bg-surface-container ${style.iconColor}`}>
            <AlertTriangle className="h-4 w-4" />
          </div>
          <h4 className="font-semibold text-sm text-foreground">Urgency Level</h4>
        </div>

        <span className={`rounded-full px-3 py-1 text-xs font-bold border ${style.badge}`}>
          {level} Urgency
        </span>
      </div>

      <p className="text-xs text-muted-foreground leading-relaxed pl-10">
        {explanation}
      </p>
    </div>
  );
};
