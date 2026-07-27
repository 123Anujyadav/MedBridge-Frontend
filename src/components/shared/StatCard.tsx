import { cn } from "@/lib/utils";
import type { LucideIcon } from "lucide-react";

interface StatCardProps {
  label: string;
  value: string | number;
  icon: LucideIcon;
  trend?: { value: number; isPositive: boolean };
  accent?: "primary" | "secondary" | "tertiary" | "success" | "warning" | "destructive";
  className?: string;
}

const accentStyles: Record<NonNullable<StatCardProps["accent"]>, string> = {
  primary: "bg-primary/10 text-primary",
  secondary: "bg-secondary/10 text-secondary",
  tertiary: "bg-tertiary/10 text-tertiary",
  success: "bg-success/10 text-success",
  warning: "bg-warning/10 text-warning",
  destructive: "bg-destructive/10 text-destructive",
};

export function StatCard({ label, value, icon: Icon, trend, accent = "primary", className }: StatCardProps) {
  return (
    <div className={cn("premium-card p-6 transition-all hover:shadow-card-lg", className)}>
      <div className="flex items-start justify-between">
        <div className={cn("flex h-12 w-12 items-center justify-center rounded-xl", accentStyles[accent])}>
          <Icon className="h-6 w-6" />
        </div>
        {trend && (
          <span
            className={cn(
              "text-label-sm font-semibold",
              trend.isPositive ? "text-success" : "text-destructive"
            )}
          >
            {trend.isPositive ? "↑" : "↓"} {Math.abs(trend.value)}%
          </span>
        )}
      </div>
      <div className="mt-4">
        <p className="text-headline-md font-headline font-semibold text-foreground">{value}</p>
        <p className="mt-1 text-body-sm text-muted-foreground">{label}</p>
      </div>
    </div>
  );
}
