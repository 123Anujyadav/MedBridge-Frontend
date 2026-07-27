import { cn } from "@/lib/utils";
import type { ReactNode } from "react";
import { X } from "lucide-react";

interface FilterBarProps {
  filters: {
    label: string;
    options: { value: string; label: string }[];
    value?: string;
    onChange?: (value: string) => void;
  }[];
  className?: string;
}

export function FilterBar({ filters, className }: FilterBarProps) {
  return (
    <div className={cn("flex flex-wrap items-center gap-3", className)}>
      {filters.map((filter) => (
        <div key={filter.label} className="flex items-center gap-2">
          <label className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            {filter.label}
          </label>
          <select
            value={filter.value ?? ""}
            onChange={(e) => filter.onChange?.(e.target.value)}
            className="rounded-lg border border-border-subtle bg-card px-3 py-2 text-body-sm text-foreground transition-all focus:ring-2 focus:ring-primary/20"
          >
            {filter.options.map((opt) => (
              <option key={opt.value} value={opt.value}>{opt.label}</option>
            ))}
          </select>
        </div>
      ))}
    </div>
  );
}

interface ConfirmationDialogProps {
  open: boolean;
  title: string;
  description: string;
  confirmLabel?: string;
  cancelLabel?: string;
  onConfirm: () => void;
  onCancel: () => void;
  variant?: "default" | "destructive";
}

export function ConfirmationDialog({
  open,
  title,
  description,
  confirmLabel = "Confirm",
  cancelLabel = "Cancel",
  onConfirm,
  onCancel,
  variant = "default",
}: ConfirmationDialogProps) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 backdrop-blur-sm animate-fade-in">
      <div className="mx-4 w-full max-w-md rounded-2xl bg-card p-6 shadow-card-lg">
        <div className="flex items-start justify-between">
          <h2 className="font-headline text-headline-md text-foreground">{title}</h2>
          <button onClick={onCancel} className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container">
            <X className="h-5 w-5" />
          </button>
        </div>
        <p className="mt-3 text-body-md text-muted-foreground">{description}</p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            onClick={onCancel}
            className="rounded-xl border border-border-subtle px-5 py-2.5 text-sm font-semibold text-foreground transition-all hover:bg-surface-container"
          >
            {cancelLabel}
          </button>
          <button
            onClick={onConfirm}
            className={cn(
              "rounded-xl px-5 py-2.5 text-sm font-semibold text-white transition-all active:scale-95",
              variant === "destructive" ? "bg-destructive hover:opacity-90" : "bg-primary hover:opacity-90"
            )}
          >
            {confirmLabel}
          </button>
        </div>
      </div>
    </div>
  );
}

interface SectionCardProps {
  title: string;
  subtitle?: string;
  actions?: ReactNode;
  children: ReactNode;
  className?: string;
  noPadding?: boolean;
}

export function SectionCard({ title, subtitle, actions, children, className, noPadding }: SectionCardProps) {
  return (
    <div className={cn("premium-card", className)}>
      <div className="flex items-start justify-between p-6 pb-4">
        <div>
          <h3 className="font-headline text-headline-md text-foreground">{title}</h3>
          {subtitle && <p className="mt-1 text-body-sm text-muted-foreground">{subtitle}</p>}
        </div>
        {actions && <div className="flex items-center gap-2">{actions}</div>}
      </div>
      <div className={noPadding ? "" : "px-6 pb-6"}>{children}</div>
    </div>
  );
}

interface HealthScoreRingProps {
  score: number;
  size?: number;
  label?: string;
}

export function HealthScoreRing({ score, size = 96, label = "Score" }: HealthScoreRingProps) {
  const radius = (size - 16) / 2;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (score / 100) * circumference;
  const color = score >= 80 ? "#16A34A" : score >= 60 ? "#D97706" : "#DC2626";

  return (
    <div className="relative flex items-center justify-center" style={{ width: size, height: size }}>
      <svg className="h-full w-full -rotate-90" viewBox={`0 0 ${size} ${size}`}>
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke="hsl(var(--surface-container))"
          strokeWidth={8}
        />
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="transparent"
          stroke={color}
          strokeWidth={8}
          strokeDasharray={circumference}
          strokeDashoffset={offset}
          strokeLinecap="round"
          className="transition-all duration-1000"
        />
      </svg>
      <div className="absolute flex flex-col items-center">
        <span className="font-headline text-headline-md font-semibold text-foreground">{score}</span>
        <span className="text-[10px] font-bold uppercase tracking-wider text-muted-foreground">{label}</span>
      </div>
    </div>
  );
}

interface TimelineItemProps {
  title: string;
  timestamp: string;
  /** ReactNode so callers can render structured detail (e.g. a before/after
   *  diff) without stringifying it. Existing string callers are unaffected. */
  description?: ReactNode;
  status?: "success" | "warning" | "error" | "info";
  isLast?: boolean;
}

export function TimelineItem({ title, timestamp, description, status = "info", isLast }: TimelineItemProps) {
  const dotColors = {
    success: "bg-success",
    warning: "bg-warning",
    error: "bg-error-edge",
    info: "bg-primary",
  };

  return (
    <div className="relative flex gap-4 pb-6">
      {!isLast && (
        <div className="absolute left-[11px] top-6 bottom-0 w-0.5 bg-border-subtle" />
      )}
      <div className={cn("relative z-10 mt-1 h-6 w-6 flex-shrink-0 rounded-full border-2 border-card", dotColors[status])} />
      <div className="flex-1">
        <p className="font-medium text-foreground">{title}</p>
        <p className="text-body-sm text-muted-foreground">{timestamp}</p>
        {description && <div className="mt-1 text-body-sm text-muted-foreground">{description}</div>}
      </div>
    </div>
  );
}
