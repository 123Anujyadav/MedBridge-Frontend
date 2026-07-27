import { cn } from "@/lib/utils";
import type { ReactNode } from "react";

interface StatusBadgeProps {
  variant: "success" | "warning" | "error" | "info" | "neutral";
  children: ReactNode;
  className?: string;
  dot?: boolean;
}

const variantStyles: Record<StatusBadgeProps["variant"], string> = {
  success: "bg-success-soft text-success",
  warning: "bg-warning-soft text-warning",
  error: "bg-error-soft text-error-edge",
  info: "bg-accent text-primary",
  neutral: "bg-surface-container text-muted-foreground",
};

const dotColors: Record<StatusBadgeProps["variant"], string> = {
  success: "bg-success",
  warning: "bg-warning",
  error: "bg-error-edge",
  info: "bg-primary",
  neutral: "bg-muted-foreground",
};

export function StatusBadge({ variant, children, className, dot = false }: StatusBadgeProps) {
  return (
    <span
      className={cn(
        "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 text-xs font-semibold",
        variantStyles[variant],
        className
      )}
    >
      {dot && <span className={cn("h-1.5 w-1.5 rounded-full", dotColors[variant])} />}
      {children}
    </span>
  );
}

export function UrgencyBadge({ level }: { level: string }) {
  const map: Record<string, StatusBadgeProps["variant"]> = {
    low: "success",
    medium: "warning",
    high: "error",
    critical: "error",
  };
  return (
    <StatusBadge variant={map[level] ?? "neutral"} dot>
      {level.charAt(0).toUpperCase() + level.slice(1)} Urgency
    </StatusBadge>
  );
}

export function CaseStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: StatusBadgeProps["variant"]; label: string }> = {
    intake: { variant: "neutral", label: "Intake" },
    ai_processing: { variant: "info", label: "AI Processing" },
    routed: { variant: "info", label: "Routed" },
    in_consultation: { variant: "warning", label: "In Consultation" },
    prescribed: { variant: "info", label: "Prescribed" },
    report_generated: { variant: "success", label: "Report Generated" },
    completed: { variant: "success", label: "Completed" },
    archived: { variant: "neutral", label: "Archived" },
  };
  const config = map[status] ?? { variant: "neutral" as const, label: status };
  return <StatusBadge variant={config.variant} dot>{config.label}</StatusBadge>;
}

export function VerificationBadge({ status }: { status: string }) {
  const map: Record<string, { variant: StatusBadgeProps["variant"]; label: string }> = {
    verified: { variant: "success", label: "Verified" },
    pending: { variant: "warning", label: "Pending" },
    rejected: { variant: "error", label: "Rejected" },
    expired: { variant: "error", label: "Expired" },
    under_review: { variant: "info", label: "Under Review" },
  };
  const config = map[status] ?? { variant: "neutral" as const, label: status };
  return <StatusBadge variant={config.variant} dot>{config.label}</StatusBadge>;
}

export function AppointmentStatusBadge({ status }: { status: string }) {
  const map: Record<string, { variant: StatusBadgeProps["variant"]; label: string }> = {
    scheduled: { variant: "info", label: "Scheduled" },
    confirmed: { variant: "success", label: "Confirmed" },
    in_progress: { variant: "warning", label: "In Progress" },
    completed: { variant: "success", label: "Completed" },
    cancelled: { variant: "error", label: "Cancelled" },
    no_show: { variant: "error", label: "No Show" },
  };
  const config = map[status] ?? { variant: "neutral" as const, label: status };
  return <StatusBadge variant={config.variant} dot>{config.label}</StatusBadge>;
}
