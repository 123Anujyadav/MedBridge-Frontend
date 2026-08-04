import { useState } from "react";
import { useNavigate, useParams } from "react-router-dom";
import { ArrowLeft, Package, Repeat, Store, Truck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import {
  OrderStatusBadge,
  OrderTimeline,
} from "@/components/patient/pharmacy/OrderTimeline";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useCancelOrder, useMedicineOrders, useTrackOrder } from "@/hooks/usePharmacy";

function currency(value: number, code = "INR"): string {
  return code === "INR" ? `₹${value.toFixed(2)}` : `${value.toFixed(2)} ${code}`;
}

/** Order history list. */
export function PatientOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { data: orders = [], isLoading, isError, error, refetch } = useMedicineOrders();

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="patient"
      userName={user?.email || "Patient"}
      userRole="Patient Portal"
      searchPlaceholder="Search orders..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={3} />);
  if (isError) {
    return shell(
      <ErrorState
        title="Failed to load orders"
        description={(error as Error)?.message || "Your orders could not be retrieved."}
        onRetry={refetch}
      />,
    );
  }

  return shell(
    <>
      <PageHeader
        title="Medicine Orders"
        subtitle="Track deliveries and reorder from your prescriptions."
        breadcrumbs={[{ label: "Patient" }, { label: "Orders" }]}
      />

      {orders.length === 0 ? (
        <SectionCard title="Your orders">
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No orders yet"
            description="Order medicines from a prescription to see deliveries here."
          />
        </SectionCard>
      ) : (
        <div className="space-y-4">
          {orders.map((order) => (
            <button
              key={order.id}
              type="button"
              onClick={() => navigate(`/patient/orders/${order.id}`)}
              className="premium-card w-full p-5 text-left transition-all hover:bg-surface-container-low/50"
            >
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold text-foreground">{order.order_number}</span>
                    <OrderStatusBadge status={order.status} />
                  </div>
                  <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                    <Store className="h-3.5 w-3.5" />
                    {order.pharmacy_name} · {order.items.length} item(s)
                  </p>
                </div>
                <p className="font-semibold text-primary">
                  {currency(order.total, order.currency)}
                </p>
              </div>
            </button>
          ))}
        </div>
      )}
    </>,
  );
}

/** Single order with live delivery tracking. */
export function PatientOrderTracking() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: order, isLoading, isError, error, refetch } = useTrackOrder(id);
  const cancelOrder = useCancelOrder();
  const [reason, setReason] = useState("");
  const [showCancel, setShowCancel] = useState(false);

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="patient"
      userName={user?.email || "Patient"}
      userRole="Patient Portal"
      searchPlaceholder="Search orders..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={3} />);
  if (isError || !order) {
    return shell(
      <ErrorState
        title="Failed to load order"
        description={(error as Error)?.message || "This order could not be retrieved."}
        onRetry={refetch}
      />,
    );
  }

  const handleCancel = async () => {
    try {
      await cancelOrder.mutateAsync({ orderId: order.id, reason: reason.trim() || "Cancelled by patient" });
      setShowCancel(false);
      toast({ title: "Order cancelled", description: "The reserved stock has been released." });
    } catch (cancelError) {
      toast({
        variant: "destructive",
        title: "Could not cancel",
        description:
          (cancelError as { response?: { data?: { detail?: string } } })?.response?.data?.detail ??
          "This order can no longer be cancelled.",
      });
    }
  };

  return shell(
    <>
      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`${order.pharmacy_name} · ${order.items.length} item(s)`}
        breadcrumbs={[{ label: "Patient" }, { label: "Orders" }, { label: order.order_number }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/patient/orders")}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <ArrowLeft className="h-4 w-4" />
              All orders
            </button>
            <button
              type="button"
              onClick={() => navigate(`/patient/prescriptions/${order.prescription_id}`)}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <Repeat className="h-4 w-4" />
              Repeat order
            </button>
          </>
        }
      />

      <div className="space-y-6">
        <SectionCard title="Delivery tracking">
          <OrderTimeline order={order} />
        </SectionCard>

        <SectionCard title="Items">
          <div className="space-y-2">
            {order.items.map((item) => (
              <div
                key={item.id}
                className="flex flex-wrap items-center justify-between gap-2 rounded-xl border border-border-subtle p-4"
              >
                <div>
                  <p className="font-semibold text-foreground">
                    {item.medicine_name}
                    {item.strength && <span className="text-primary"> {item.strength}</span>}
                  </p>
                  <p className="text-body-sm text-muted-foreground">
                    Quantity {item.quantity}
                    {item.is_generic_substitute && item.substituted_for && (
                      <> · generic chosen in place of {item.substituted_for}</>
                    )}
                  </p>
                </div>
                <p className="font-medium text-foreground">
                  {currency(item.line_total, order.currency)}
                </p>
              </div>
            ))}
          </div>

          <div className="mt-4 space-y-1.5 rounded-xl bg-surface-container-low p-4 text-body-sm">
            <div className="flex justify-between">
              <span className="text-muted-foreground">Subtotal</span>
              <span className="text-foreground">{currency(order.subtotal, order.currency)}</span>
            </div>
            {order.discount_total > 0 && (
              <div className="flex justify-between">
                <span className="text-muted-foreground">You saved</span>
                <span className="text-success">
                  −{currency(order.discount_total, order.currency)}
                </span>
              </div>
            )}
            <div className="flex justify-between">
              <span className="text-muted-foreground">Delivery</span>
              <span className="text-foreground">
                {order.delivery_fee > 0 ? currency(order.delivery_fee, order.currency) : "Free"}
              </span>
            </div>
            <div className="flex justify-between border-t border-border-subtle pt-1.5 font-semibold">
              <span className="text-foreground">Total</span>
              <span className="text-primary">{currency(order.total, order.currency)}</span>
            </div>
          </div>

          {order.delivery_address && (
            <p className="mt-4 flex items-start gap-2 text-body-sm text-muted-foreground">
              <Truck className="mt-0.5 h-4 w-4 shrink-0" />
              {order.delivery_address}
            </p>
          )}
        </SectionCard>

        {order.is_cancellable && (
          <SectionCard title="Cancel this order">
            {showCancel ? (
              <div className="space-y-3">
                <input
                  value={reason}
                  onChange={(event) => setReason(event.target.value)}
                  placeholder="Reason for cancelling"
                  className="w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
                />
                <div className="flex flex-wrap gap-3">
                  <button
                    type="button"
                    onClick={handleCancel}
                    disabled={cancelOrder.isPending}
                    className="rounded-xl bg-error-edge px-5 py-2.5 font-semibold text-white transition-all hover:opacity-90 disabled:opacity-60"
                  >
                    Confirm cancellation
                  </button>
                  <button
                    type="button"
                    onClick={() => setShowCancel(false)}
                    className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground"
                  >
                    Keep order
                  </button>
                </div>
              </div>
            ) : (
              <>
                <p className="text-body-sm text-muted-foreground">
                  You can cancel until the order is dispatched. Reserved stock is
                  returned to the pharmacy.
                </p>
                <button
                  type="button"
                  onClick={() => setShowCancel(true)}
                  className="mt-3 rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground transition-all hover:bg-surface-container"
                >
                  Cancel order
                </button>
              </>
            )}
          </SectionCard>
        )}
      </div>
    </>,
  );
}

export default PatientOrders;
