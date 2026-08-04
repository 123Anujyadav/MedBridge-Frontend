import { useNavigate } from "react-router-dom";
import { Package, Repeat, Store, Truck } from "lucide-react";

import { SectionCard } from "@/components/shared/FilterBar";
import { EmptyState } from "@/components/shared/States";
import { useMedicineOrders } from "@/hooks/usePharmacy";

import { OrderStatusBadge } from "./OrderTimeline";

const IN_FLIGHT = new Set(["received", "preparing", "packed", "out_for_delivery"]);

function currency(value: number, code = "INR"): string {
  return code === "INR" ? `₹${value.toFixed(2)}` : `${value.toFixed(2)} ${code}`;
}

/**
 * Medicine orders on the patient dashboard.
 *
 * Renders nothing at all while loading or when the patient has never ordered —
 * an empty "Current Orders" card on every dashboard is noise for the majority
 * of patients who have not used the pharmacy yet.
 */
export function OrdersDashboardSection() {
  const navigate = useNavigate();
  const { data: orders = [], isLoading } = useMedicineOrders(10);

  if (isLoading || orders.length === 0) return null;

  const active = orders.filter((order) => IN_FLIGHT.has(order.status));
  const recent = orders.filter((order) => !IN_FLIGHT.has(order.status)).slice(0, 3);

  return (
    <div className="mb-8 grid grid-cols-1 gap-6 lg:grid-cols-2">
      <SectionCard
        title="Current orders"
        subtitle={active.length > 0 ? "Live delivery tracking" : undefined}
      >
        {active.length === 0 ? (
          <EmptyState
            icon={<Truck className="h-8 w-8" />}
            title="Nothing in transit"
            description="Orders you place will be tracked here."
          />
        ) : (
          <div className="space-y-3">
            {active.map((order) => (
              <button
                key={order.id}
                type="button"
                onClick={() => navigate(`/patient/orders/${order.id}`)}
                className="w-full rounded-xl border border-border-subtle p-4 text-left transition-all hover:bg-surface-container-low/50"
              >
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <span className="font-semibold text-foreground">
                        {order.order_number}
                      </span>
                      <OrderStatusBadge status={order.status} />
                    </div>
                    <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                      <Store className="h-3.5 w-3.5" />
                      {order.pharmacy_name}
                    </p>
                  </div>
                  <div className="text-right">
                    <p className="font-semibold text-primary">
                      {currency(order.total, order.currency)}
                    </p>
                    {order.eta_minutes && order.status !== "delivered" && (
                      <p className="text-body-sm text-muted-foreground">
                        ~{order.eta_minutes} min
                      </p>
                    )}
                  </div>
                </div>
              </button>
            ))}
          </div>
        )}
      </SectionCard>

      <SectionCard title="Recent orders" subtitle="Reorder in one tap">
        {recent.length === 0 ? (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No past orders"
            description="Completed orders appear here for quick reordering."
          />
        ) : (
          <div className="space-y-3">
            {recent.map((order) => (
              <div
                key={order.id}
                className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border-subtle p-4"
              >
                <div className="min-w-0">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">
                      {order.order_number}
                    </span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 text-body-sm text-muted-foreground">
                    {order.pharmacy_name} · {order.items.length} item(s)
                  </p>
                </div>
                <button
                  type="button"
                  // Reordering routes back to the prescription rather than
                  // cloning the old basket: stock, price and the pharmacy's
                  // opening state all move, so the order is rebuilt against
                  // live availability instead of stale figures.
                  onClick={() =>
                    navigate(`/patient/prescriptions/${order.prescription_id}`)
                  }
                  className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
                >
                  <Repeat className="h-4 w-4" />
                  Repeat
                </button>
              </div>
            ))}
            <button
              type="button"
              onClick={() => navigate("/patient/orders")}
              className="w-full rounded-xl border border-border-subtle px-4 py-2.5 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              View all orders
            </button>
          </div>
        )}
      </SectionCard>
    </div>
  );
}
