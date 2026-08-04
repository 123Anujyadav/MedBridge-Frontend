import { useNavigate } from "react-router-dom";
import {
  AlertTriangle,
  Clock,
  IndianRupee,
  Package,
  Star,
  Timer,
  TriangleAlert,
} from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { usePortalAlerts, usePortalDashboard } from "@/hooks/usePharmacyPortal";
import { ORDER_STATUS_LABELS, type OrderStatus } from "@/types/pharmacy";

const SEVERITY_TONE = {
  critical: "error",
  warning: "warning",
  info: "info",
} as const;

export default function PharmacyDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data, isLoading, isError, error, refetch } = usePortalDashboard();
  const { data: alerts = [] } = usePortalAlerts();

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="pharmacy"
      userName={user?.email || "Pharmacy"}
      userRole="Pharmacy Portal"
      searchPlaceholder="Search orders, medicines..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !data) {
    return shell(
      <ErrorState
        title="Failed to load dashboard"
        description={(error as Error)?.message ?? "Your store data could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const statusEntries = Object.entries(data.orders_by_status) as [OrderStatus, number][];

  return shell(
    <>
      <PageHeader
        title={data.pharmacy_name}
        subtitle="Today's orders, revenue and stock health."
        breadcrumbs={[{ label: "Pharmacy" }, { label: "Dashboard" }]}
      />

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Orders today"
          value={data.orders_today}
          icon={Package}
          accent="primary"
        />
        <StatCard
          label="Revenue today"
          value={`₹${data.revenue_today.toFixed(0)}`}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard
          label="Awaiting acceptance"
          value={data.pending_prescriptions}
          icon={Clock}
          accent="tertiary"
        />
        <StatCard
          label="Customer rating"
          value={data.customer_rating > 0 ? data.customer_rating.toFixed(1) : "—"}
          icon={Star}
          accent="secondary"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue this week"
          value={`₹${data.revenue_week.toFixed(0)}`}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard
          label="Revenue this month"
          value={`₹${data.revenue_month.toFixed(0)}`}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard
          label="Avg preparation"
          value={`${data.average_prep_minutes} min`}
          icon={Timer}
          accent="tertiary"
        />
        <StatCard
          label="Avg delivery"
          value={`${data.average_delivery_minutes} min`}
          icon={Timer}
          accent="secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Today's order pipeline">
          {statusEntries.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No orders yet today"
              description="New orders appear here the moment a patient places one."
            />
          ) : (
            <div className="space-y-2">
              {statusEntries.map(([status, count]) => (
                <button
                  key={status}
                  type="button"
                  onClick={() => navigate(`/pharmacy/orders?status=${status}`)}
                  className="flex w-full items-center justify-between rounded-xl border border-border-subtle p-3 text-left transition-all hover:bg-surface-container-low/50"
                >
                  <span className="text-body-sm font-medium text-foreground">
                    {ORDER_STATUS_LABELS[status] ?? status}
                  </span>
                  <span className="font-semibold text-primary">{count}</span>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Stock health"
          subtitle={`${data.catalogue_size} item(s) · ₹${data.inventory_value.toFixed(0)} value`}
        >
          <div className="grid grid-cols-2 gap-3">
            {(
              [
                ["Low stock", data.stock_low, "warning"],
                ["Critical", data.stock_critical, "warning"],
                ["Out of stock", data.stock_out, "error"],
                ["Near expiry", data.stock_near_expiry, "warning"],
                ["Expired", data.stock_expired, "error"],
              ] as const
            ).map(([label, count, tone]) => (
              <button
                key={label}
                type="button"
                onClick={() => navigate("/pharmacy/inventory")}
                className="rounded-xl border border-border-subtle p-3 text-left transition-all hover:bg-surface-container-low/50"
              >
                <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                  {label}
                </p>
                <p className="mt-1 flex items-center gap-2">
                  <span className="font-headline text-headline-md text-foreground">
                    {count}
                  </span>
                  {count > 0 && <StatusBadge variant={tone}>action</StatusBadge>}
                </p>
              </button>
            ))}
          </div>
        </SectionCard>

        <div className="lg:col-span-2">
          <SectionCard title="Alerts" subtitle="Live — resolves itself when you act">
            {alerts.length === 0 ? (
              <EmptyState
                icon={<AlertTriangle className="h-8 w-8" />}
                title="Nothing needs attention"
                description="New orders, shortages and expiries will surface here."
              />
            ) : (
              <div className="space-y-2">
                {alerts.slice(0, 12).map((alert) => (
                  <div
                    key={`${alert.type}-${alert.reference_id}`}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle p-3"
                  >
                    <div className="flex items-start gap-3">
                      <TriangleAlert
                        className={
                          alert.severity === "critical"
                            ? "mt-0.5 h-4 w-4 shrink-0 text-error-edge"
                            : alert.severity === "warning"
                              ? "mt-0.5 h-4 w-4 shrink-0 text-warning"
                              : "mt-0.5 h-4 w-4 shrink-0 text-primary"
                        }
                      />
                      <div>
                        <p className="font-semibold text-foreground">{alert.title}</p>
                        <p className="text-body-sm text-muted-foreground">{alert.detail}</p>
                      </div>
                    </div>
                    <StatusBadge variant={SEVERITY_TONE[alert.severity]}>
                      {alert.severity}
                    </StatusBadge>
                  </div>
                ))}
              </div>
            )}
          </SectionCard>
        </div>
      </div>
    </>,
  );
}
