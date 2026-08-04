import { useState } from "react";
import {
  Activity,
  IndianRupee,
  Package,
  Store,
  Timer,
  TrendingUp,
} from "lucide-react";
import {
  Bar,
  BarChart,
  CartesianGrid,
  Cell,
  Pie,
  PieChart,
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
import { useExpiringDocuments, usePharmacyAnalytics } from "@/hooks/usePharmacyAdmin";
import { DOCUMENT_TYPE_LABELS } from "@/types/pharmacy-admin";

// Palette taken from the existing dashboard charts so this screen reads as part
// of the same system rather than a new one.
const SERIES = ["#00685f", "#6bd8cb", "#94a3b8", "#f59e0b", "#b3261e"];

const TOOLTIP_STYLE = {
  borderRadius: 12,
  border: "1px solid #E2E8F0",
  boxShadow: "0 4px 12px rgba(15,23,42,0.08)",
};

const AXIS_TICK = { fontSize: 12, fill: "#6d7a77" };

export default function AdminPharmacyAnalytics() {
  const { user } = useAuth();
  const [days, setDays] = useState(30);

  const { data, isLoading, isError, error, refetch } = usePharmacyAnalytics(days);
  const { data: expiring = [] } = useExpiringDocuments(30);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="admin"
      userName={user?.email || "Administrator"}
      userRole="Admin Portal"
      searchPlaceholder="Search pharmacies..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !data) {
    return shell(
      <ErrorState
        title="Failed to load analytics"
        description={(error as Error)?.message ?? "Network metrics could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const statusSeries = Object.entries(data.orders_by_status).map(([name, value]) => ({
    name,
    value,
  }));

  return shell(
    <>
      <PageHeader
        title="Pharmacy Analytics"
        subtitle="Revenue, fulfilment and inventory across the partner network."
        breadcrumbs={[{ label: "Admin" }, { label: "Pharmacy Analytics" }]}
        actions={
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
        }
      />

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenue"
          value={`₹${data.revenue_total.toFixed(0)}`}
          icon={IndianRupee}
          accent="success"
        />
        <StatCard label="Orders" value={data.orders_total} icon={Package} accent="primary" />
        <StatCard
          label="Delivery conversion"
          value={`${Math.round(data.conversion_rate * 100)}%`}
          icon={TrendingUp}
          accent="tertiary"
        />
        <StatCard
          label="Avg delivery"
          value={`${data.average_delivery_minutes} min`}
          icon={Timer}
          accent="secondary"
        />
      </div>

      <div className="mb-8 grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Partner pharmacies"
          value={`${data.pharmacies_partner} / ${data.pharmacies_total}`}
          icon={Store}
          accent="primary"
        />
        <StatCard
          label="Inventory value"
          value={`₹${data.inventory_value.toFixed(0)}`}
          icon={Package}
          accent="success"
        />
        <StatCard
          label="Delivered"
          value={data.orders_delivered}
          icon={Activity}
          accent="tertiary"
        />
        <StatCard
          label="Cancelled"
          value={data.orders_cancelled}
          icon={Activity}
          accent="secondary"
        />
      </div>

      <div className="grid grid-cols-1 gap-6 lg:grid-cols-2">
        <SectionCard title="Orders by status">
          {statusSeries.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No orders in this window"
              description="Order activity will appear here once patients start ordering."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <PieChart>
                <Pie
                  data={statusSeries}
                  dataKey="value"
                  nameKey="name"
                  innerRadius={55}
                  outerRadius={95}
                  paddingAngle={2}
                >
                  {statusSeries.map((entry, index) => (
                    <Cell key={entry.name} fill={SERIES[index % SERIES.length]} />
                  ))}
                </Pie>
                <Tooltip contentStyle={TOOLTIP_STYLE} />
              </PieChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Top medicines" subtitle="By units dispensed">
          {data.top_medicines.length === 0 ? (
            <EmptyState
              icon={<Package className="h-8 w-8" />}
              title="No dispensing data"
              description="Top medicines appear once orders are delivered."
            />
          ) : (
            <ResponsiveContainer width="100%" height={260}>
              <BarChart data={data.top_medicines}>
                <CartesianGrid strokeDasharray="3 3" stroke="#E2E8F0" vertical={false} />
                <XAxis dataKey="medicine" tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <YAxis tick={AXIS_TICK} axisLine={false} tickLine={false} />
                <Tooltip contentStyle={TOOLTIP_STYLE} />
                <Bar dataKey="units" fill="#00685f" radius={[6, 6, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          )}
        </SectionCard>

        <SectionCard title="Top pharmacies" subtitle="By revenue">
          {data.top_pharmacies.length === 0 ? (
            <EmptyState
              icon={<Store className="h-8 w-8" />}
              title="No revenue yet"
              description="Pharmacy performance appears once orders are placed."
            />
          ) : (
            <div className="space-y-2">
              {data.top_pharmacies.map((row) => (
                <div
                  key={row.pharmacy}
                  className="flex items-center justify-between rounded-xl border border-border-subtle p-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">{row.pharmacy}</p>
                    <p className="text-body-sm text-muted-foreground">
                      {row.orders} order(s)
                    </p>
                  </div>
                  <p className="font-semibold text-primary">₹{row.revenue.toFixed(2)}</p>
                </div>
              ))}
            </div>
          )}
        </SectionCard>

        <SectionCard title="Expiring documents" subtitle="Compliance alerts">
          {expiring.length === 0 ? (
            <EmptyState
              icon={<Activity className="h-8 w-8" />}
              title="Nothing expiring"
              description="No compliance document lapses in the next 30 days."
            />
          ) : (
            <div className="space-y-2">
              {expiring.slice(0, 8).map((document) => (
                <div
                  key={document.id}
                  className="flex items-center justify-between rounded-xl border border-border-subtle p-3"
                >
                  <div>
                    <p className="font-semibold text-foreground">
                      {DOCUMENT_TYPE_LABELS[document.doc_type]}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      {document.expires_at
                        ? new Date(document.expires_at).toLocaleDateString()
                        : "—"}
                    </p>
                  </div>
                  <span
                    className={
                      document.is_expired
                        ? "text-body-sm font-semibold text-error-edge"
                        : "text-body-sm font-semibold text-warning"
                    }
                  >
                    {document.is_expired
                      ? "Expired"
                      : `${document.days_to_expiry ?? 0} days`}
                  </span>
                </div>
              ))}
            </div>
          )}
        </SectionCard>
      </div>
    </>,
  );
}
