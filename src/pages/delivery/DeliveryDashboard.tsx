import { useNavigate } from "react-router-dom";
import { IndianRupee, MapPin, Package, Route, Star, Timer } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatCard } from "@/components/shared/StatCard";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import {
  useDeliveryDashboard,
  useLocationBroadcast,
  useMyDeliveries,
  useSetOnline,
} from "@/hooks/useDelivery";
import { DELIVERY_STATUS_LABELS, type DeliveryStatus } from "@/types/delivery";

export default function DeliveryDashboard() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const { data, isLoading, isError, error, refetch } = useDeliveryDashboard();
  const { data: active } = useMyDeliveries({ status: "active", limit: 10 });
  const setOnline = useSetOnline();

  // Broadcast position only while carrying work — a parked rider does not need
  // their location on the wire every twenty seconds.
  useLocationBroadcast(Boolean(data?.is_online && (data?.active_count ?? 0) > 0));

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="delivery"
      userName={user?.email || "Delivery Partner"}
      userRole="Delivery Portal"
      searchPlaceholder="Search deliveries..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !data) {
    return shell(
      <ErrorState
        title="Failed to load dashboard"
        description={(error as Error)?.message ?? "Your delivery data could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const toggle = async () => {
    try {
      await setOnline.mutateAsync(!data.is_online);
      toast({
        title: data.is_online ? "You are offline" : "You are online",
        description: data.is_online
          ? "You will not receive new offers. Deliveries you already accepted are unaffected."
          : "You can now receive delivery offers.",
      });
    } catch {
      toast({ variant: "destructive", title: "Could not change your status" });
    }
  };

  const statuses = Object.entries(data.by_status) as [DeliveryStatus, number][];

  return shell(
    <>
      <PageHeader
        title={data.full_name}
        subtitle="Today's deliveries, earnings and distance."
        breadcrumbs={[{ label: "Delivery" }, { label: "Dashboard" }]}
        actions={
          <button
            type="button"
            onClick={toggle}
            disabled={setOnline.isPending}
            className={
              data.is_online
                ? "rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground transition-all hover:bg-surface-container disabled:opacity-60"
                : "rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
            }
          >
            {data.is_online ? "Go offline" : "Go online"}
          </button>
        }
      />

      <div className="mb-6 flex flex-wrap items-center gap-3">
        <StatusBadge variant={data.is_online ? "success" : "neutral"} dot>
          {data.is_online ? "Online" : "Offline"}
        </StatusBadge>
        <StatusBadge
          variant={data.verification_status === "approved" ? "success" : "warning"}
        >
          {data.verification_status}
        </StatusBadge>
        {data.active_count > 0 && (
          <StatusBadge variant="info">{data.active_count} in progress</StatusBadge>
        )}
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Deliveries today"
          value={data.deliveries_today}
          icon={Package}
          accent="primary"
        />
        <StatCard
          label="Earnings today"
          value={`₹${data.earnings_today.toFixed(0)}`}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard
          label="Distance today"
          value={`${data.distance_today_km.toFixed(1)} km`}
          icon={Route}
          accent="tertiary"
        />
        <StatCard
          label="Rating"
          value={data.rating > 0 ? data.rating.toFixed(1) : "—"}
          icon={Star}
          accent="secondary"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Avg delivery time"
          value={`${data.average_delivery_minutes} min`}
          icon={Timer}
          accent="tertiary"
        />
        <StatCard
          label="Completion rate"
          value={`${Math.round(data.completion_rate * 100)}%`}
          icon={Package}
          accent="success"
        />
        <StatCard
          label="Lifetime deliveries"
          value={data.lifetime_deliveries}
          icon={Package}
          accent="primary"
        />
        <StatCard
          label="Lifetime earnings"
          value={`₹${data.lifetime_earnings.toFixed(0)}`}
          icon={IndianRupee}
          accent="secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="In progress" subtitle="Tap to open navigation">
          {(active?.items.length ?? 0) === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="Nothing in progress"
              description={
                data.is_online
                  ? "New offers will appear here."
                  : "Go online to start receiving offers."
              }
            />
          ) : (
            <div className="space-y-3">
              {active?.items.map((assignment) => (
                <button
                  key={assignment.id}
                  type="button"
                  onClick={() => navigate(`/delivery/orders/${assignment.id}`)}
                  className="w-full rounded-xl border border-border-subtle p-4 text-left transition-all hover:bg-surface-container-low/50"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div className="min-w-0">
                      <StatusBadge variant="info" dot>
                        {DELIVERY_STATUS_LABELS[assignment.status]}
                      </StatusBadge>
                      <p className="mt-1.5 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {assignment.drop_address}
                      </p>
                    </div>
                    <div className="text-right">
                      <p className="font-semibold text-primary">
                        ₹{assignment.partner_earning.toFixed(2)}
                      </p>
                      {assignment.eta_minutes && (
                        <p className="text-body-sm text-muted-foreground">
                          ~{assignment.eta_minutes} min
                        </p>
                      )}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Today by stage">
          {statuses.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No deliveries yet today"
              description="Your completed legs will be summarised here."
            />
          ) : (
            <div className="space-y-2">
              {statuses.map(([status, count]) => (
                <div
                  key={status}
                  className="flex items-center justify-between rounded-xl border border-border-subtle p-3"
                >
                  <span className="text-body-sm font-medium text-foreground">
                    {DELIVERY_STATUS_LABELS[status] ?? status}
                  </span>
                  <span className="font-semibold text-primary">{count}</span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>,
  );
}
