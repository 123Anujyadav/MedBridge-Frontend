import React from "react";

export type HeaderState = "Idle" | "Analyzing" | "Generating" | "Offline" | "Maintenance";

interface StatusBadgeProps {
  state?: HeaderState;
}

export const StatusBadge: React.FC<StatusBadgeProps> = ({ state = "Idle" }) => {
  const getBadgeDetails = () => {
    switch (state) {
      case "Analyzing":
        return {
          label: "Analyzing Telemetry...",
          dot: "bg-tertiary animate-ping",
          color: "border-tertiary/30 bg-tertiary/10 text-tertiary",
          tooltip: "AI is processing clinical symptoms.",
        };
      case "Generating":
        return {
          label: "Generating Response...",
          dot: "bg-primary animate-ping",
          color: "border-primary/30 bg-primary/10 text-primary",
          tooltip: "Synthesizing triage recommendation.",
        };
      case "Offline":
        return {
          label: "Offline",
          dot: "bg-muted-foreground",
          color: "border-border-subtle bg-surface-container text-muted-foreground",
          tooltip: "AI Assistant is offline.",
        };
      case "Maintenance":
        return {
          label: "System Maintenance",
          dot: "bg-warning",
          color: "border-warning/30 bg-warning/10 text-warning",
          tooltip: "Scheduled clinical knowledge update.",
        };
      case "Idle":
      default:
        return {
          label: "Online",
          dot: "bg-success animate-ping",
          color: "border-success/30 bg-success/10 text-success",
          tooltip: "AI is ready to assist you.",
        };
    }
  };

  const details = getBadgeDetails();

  return (
    <div className="relative group inline-flex">
      <div
        className={`flex items-center gap-1.5 rounded-full border px-2.5 py-0.5 text-[11px] font-bold shadow-xs ${details.color}`}
      >
        <span className="relative flex h-2 w-2">
          <span className={`absolute inline-flex h-full w-full rounded-full opacity-75 ${details.dot}`} />
          <span className="relative inline-flex h-2 w-2 rounded-full bg-current" />
        </span>
        <span>{details.label}</span>
      </div>

      {/* Tooltip */}
      <div className="absolute top-full left-1/2 -translate-x-1/2 mt-1.5 hidden group-hover:flex items-center justify-center whitespace-nowrap rounded-lg bg-foreground px-2.5 py-1 text-[10px] font-semibold text-background shadow-md pointer-events-none z-30 animate-fade-in">
        {details.tooltip}
        <span className="absolute bottom-full left-1/2 -translate-x-1/2 -mb-1 border-4 border-transparent border-b-foreground" />
      </div>
    </div>
  );
};
