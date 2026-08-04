import { useState } from "react";
import { Download, IndianRupee, Package, ShoppingBasket, TrendingDown } from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from "recharts";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatCard } from "@/components/shared/StatCard";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { usePortalAnalytics, usePortalCustomers } from "@/hooks/usePharmacyPortal";
import pharmacyPortalService from "@/lib/pharmacy-portal-service";

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
};
const AXIS_TICK = { fontSize: 12, fill: "#6d7a77" };

export function PharmacyAnalytics() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, error, refetch } = usePortalAnalytics(days);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="pharmacy"
      userName={user?.email || "Pharmacy"}
      userRole="Pharmacy Portal"
      searchPlaceholder="Search..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !data) {
    return shell(
      <ErrorState
        title="Failed to load analytics"
        description={(error as Error)?.message ?? "Your metrics could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const download = async () => {
    try {
      await pharmacyPortalService.downloadSalesReport(days);
      toast({ title: "Sales report downloaded", description: "Includes per-line GST." });
    } catch {
      toast({ variant: "destructive", title: "Download failed" });
    }
  };

  return shell(
    <>
      <PageHeader
        title="Analytics"
        subtitle="Revenue, movement and inventory health for your store."
        breadcrumbs={[{ label: "Pharmacy" }, { label: "Analytics" }]}
        actions={
          <>
            <select
              value={days}
              onChange={(event) => setDays(Number(event.target.value))}
              className="rounded-xl border border-border-subtle bg-background px-3 py-2.5 text-body-sm text-foreground outline-none focus:border-primary"
            >
              <option value={7}>Last 7 days</option>
              <option value={30}>Last 30 days</option>
              <option value={90}>Last 90 days</option>
              <option value={365}>Last year</option>
            </select>
            <button
              type="button"
              onClick={download}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <Download className="h-4 w-4" />
              Sales report
            </button>
          </>
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={`₹${data.revenue.toFixed(0)}`}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard label="Orders" value={data.orders} icon={Package} accent="primary" />
        <StatCard
          label="Average basket"
          value={`₹${data.average_basket.toFixed(0)}`}
          icon={ShoppingBasket}
          accent="tertiary"
        />
        <StatCard
          label="Expiry loss"
          value={`₹${data.expiry_loss.toFixed(0)}`}
          icon={TrendingDown}
          accent="secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Fastest moving" subtitle="By units dispensed">
          {data.fastest_moving.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No sales in this window"
              description="Movement appears once orders are placed."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.fastest_moving}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="medicine" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="units" fill="#00685f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Peak hours" subtitle="When orders arrive">
          {data.peak_hours.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No timing data"
              description="Order times build up as you trade."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.peak_hours}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis
                  dataKey="hour"
                  tick={AXIS_TICK}
                  axisLine={false}
                  tickLine={false}
                  tickFormatter={(hour: number) => `${hour}:00`}
                />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="orders" fill="#6bd8cb" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard
          title="Slow moving"
          subtitle="Tying up shelf space and capital"
        >
          {data.slowest_moving.length === 0 ? (
            <EmptyState
              icon={<TrendingDown className="h-8 w-8" />}
              title="Nothing to review"
              description="Slow movers appear once you have sales history."
            />
          ) : (
            <div className="space-y-2">
              {data.slowest_moving.map((row) => (
                <div
                  key={row.medicine}
                  className="flex items-center justify-between rounded-xl border border-border-subtle p-3"
                >
                  <span className="text-body-sm font-medium text-foreground">
                    {row.medicine}
                  </span>
                  <span className="text-body-sm text-muted-foreground">
                    {row.units} unit(s)
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard
          title="Inventory value"
          subtitle={`${data.catalogue_size} item(s) in catalogue`}
        >
          <div className="rounded-xl bg-surface-container-low p-6 text-center">
            <p className="font-headline text-display-lg text-primary">
              ₹{data.inventory_value.toFixed(0)}
            </p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              Stock on hand at selling price
            </p>
            {data.expiry_loss > 0 && (
              <p className="mt-3 rounded-lg bg-warning-soft p-3 text-body-sm text-warning">
                ₹{data.expiry_loss.toFixed(0)} of that is already expired.
              </p>
            )}
          </div>
        </SectionCard>
      </div>
    </>,
  );
}

/** Who buys here, ranked by spend. */
export function PharmacyCustomers() {
  const { user } = useAuth();
  const { data = [], isLoading, isError, error, refetch } = usePortalCustomers(50);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="pharmacy"
      userName={user?.email || "Pharmacy"}
      userRole="Pharmacy Portal"
      searchPlaceholder="Search customers..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={3} />);
  if (isError) {
    return shell(
      <ErrorState
        title="Failed to load customers"
        description={(error as Error)?.message ?? "Customer data could not be read."}
        onRetry={refetch}
      />,
    );
  }

  return shell(
    <>
      <PageHeader
        title="Customers"
        subtitle="Repeat buyers and spend, from delivered orders."
        breadcrumbs={[{ label: "Pharmacy" }, { label: "Customers" }]}
      />

      <SectionCard title="Top customers" subtitle={`${data.length} shown`}>
        {data.length === 0 ? (
          <EmptyState
            icon={<ShoppingBasket className="h-8 w-8" />}
            title="No customers yet"
            description="Patients appear here once they order from your store."
          />
        ) : (
          <div className="space-y-2">
            {data.map((customer) => (
              <div
                key={customer.patient_id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">{customer.name}</p>
                  <p className="text-body-sm text-muted-foreground">
                    {customer.orders} order(s)
                    {customer.last_order_at &&
                      ` · last ${new Date(customer.last_order_at).toLocaleDateString()}`}
                  </p>
                </div>
                <div className="text-right">
                  <p className="font-semibold text-primary">
                    ₹{customer.total_spend.toFixed(2)}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    avg ₹{customer.average_spend.toFixed(2)}
                  </p>
                </div>
              </div>
            ))}
          </div>
        )}
      </SectionCard>
    </>,
  );
}

export default PharmacyAnalytics;
