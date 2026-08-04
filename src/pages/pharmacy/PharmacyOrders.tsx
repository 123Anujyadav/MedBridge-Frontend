import { useMemo, useState } from "react";
import { useNavigate, useParams, useSearchParams } from "react-router-dom";
import { ArrowLeft, MapPin, Package, Search, Truck } from "lucide-react";

import { AppShell } from "@/components/layout/AppShell";
import { PageHeader } from "@/components/shared/PageHeader";
import { SectionCard } from "@/components/shared/FilterBar";
import { StatusBadge } from "@/components/shared/StatusBadge";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { OrderTimeline, OrderStatusBadge } from "@/components/patient/pharmacy/OrderTimeline";
import { PrescriptionReviewPanel } from "@/components/pharmacy/PrescriptionReviewPanel";
import { useAuth } from "@/context/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useDebounced } from "@/hooks/usePharmacyAdmin";
import { useOrderAction, usePortalOrder, usePortalOrders } from "@/hooks/usePharmacyPortal";
import { ORDER_STATUS_LABELS, type MedicineOrder, type OrderStatus } from "@/types/pharmacy";
import { NEXT_ACTIONS, ORDER_ACTION_LABELS, type OrderAction } from "@/types/pharmacy-portal";

const PAGE_SIZE = 25;

const STATUS_TABS: { value: string; label: string }[] = [
  { value: "active", label: "In flight" },
  { value: "received", label: "New" },
  { value: "preparing", label: "Preparing" },
  { value: "packed", label: "Packed" },
  { value: "out_for_delivery", label: "Out for delivery" },
  { value: "delivered", label: "Delivered" },
  { value: "cancelled", label: "Cancelled" },
];

function currency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

/** The store's live order queue. */
export function PharmacyOrders() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [params, setParams] = useSearchParams();

  const status = params.get("status") ?? "active";
  const [searchInput, setSearchInput] = useState("");
  const [page, setPage] = useState(0);
  const search = useDebounced(searchInput);

  const filters = useMemo(
    () => ({ status, search: search || undefined, skip: page * PAGE_SIZE, limit: PAGE_SIZE }),
    [status, search, page],
  );

  const { data, isLoading, isError, error, refetch } = usePortalOrders(filters);
  const act = useOrderAction();

  const rows = data?.items ?? [];
  const total = data?.total ?? 0;
  const pageCount = Math.max(1, Math.ceil(total / PAGE_SIZE));

  const handleAction = async (orderId: string, action: OrderAction) => {
    try {
      await act.mutateAsync({ orderId, action });
      toast({
        title: ORDER_ACTION_LABELS[action],
        description: "The patient's tracking screen has been updated.",
      });
    } catch (actionError) {
      toast({
        variant: "destructive",
        title: "Action refused",
        description:
          (actionError as { response?: { data?: { detail?: string } } })?.response?.data
            ?.detail ?? "That transition is not allowed from the current status.",
      });
    }
  };

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="pharmacy"
      userName={user?.email || "Pharmacy"}
      userRole="Pharmacy Portal"
      searchPlaceholder="Search orders..."
    >
      {children}
    </AppShell>
  );

  if (isError) {
    return shell(
      <ErrorState
        title="Failed to load orders"
        description={(error as Error)?.message ?? "Your order queue could not be read."}
        onRetry={refetch}
      />,
    );
  }

  return shell(
    <>
      <PageHeader
        title="Orders"
        subtitle="Accept, prepare and dispatch. Updates reach the patient immediately."
        breadcrumbs={[{ label: "Pharmacy" }, { label: "Orders" }]}
      />

      <SectionCard title="Order queue" subtitle={`${total} order(s)`}>
        <div className="mb-4 flex flex-wrap items-center gap-2">
          {STATUS_TABS.map((tab) => (
            <button
              key={tab.value}
              type="button"
              onClick={() => {
                setParams(tab.value === "active" ? {} : { status: tab.value });
                setPage(0);
              }}
              className={
                status === tab.value
                  ? "rounded-xl bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground"
                  : "rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
              }
            >
              {tab.label}
            </button>
          ))}

          <div className="relative ml-auto min-w-[200px] flex-1">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <input
              value={searchInput}
              onChange={(event) => {
                setSearchInput(event.target.value);
                setPage(0);
              }}
              placeholder="Order number or address"
              className="w-full rounded-xl border border-border-subtle bg-background py-2.5 pl-9 pr-3 text-body-sm text-foreground outline-none focus:border-primary"
            />
          </div>
        </div>

        {isLoading && rows.length === 0 ? (
          <LoadingState rows={3} />
        ) : rows.length === 0 ? (
          <EmptyState
            icon={<Package className="h-8 w-8" />}
            title="No orders here"
            description="Orders matching this filter will appear as they arrive."
          />
        ) : (
          <div className="space-y-3">
            {rows.map((order) => {
              const actions = NEXT_ACTIONS[order.status] ?? [];
              return (
                <div key={order.id} className="rounded-xl border border-border-subtle p-4">
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <button
                      type="button"
                      onClick={() => navigate(`/pharmacy/orders/${order.id}`)}
                      className="text-left"
                    >
                      <div className="flex flex-wrap items-center gap-2">
                        <span className="font-semibold text-foreground">
                          {order.order_number}
                        </span>
                        <OrderStatusBadge status={order.status} />
                      </div>
                      <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
                        <MapPin className="h-3.5 w-3.5 shrink-0" />
                        {order.delivery_address}
                      </p>
                      <p className="text-body-sm text-muted-foreground">
                        {order.items.length} item(s) · {currency(order.total)}
                        {order.eta_minutes ? ` · ETA ${order.eta_minutes} min` : ""}
                      </p>
                    </button>

                    <div className="flex flex-wrap items-center gap-2">
                      {actions.map((action) => (
                        <button
                          key={action}
                          type="button"
                          disabled={act.isPending}
                          onClick={() => handleAction(order.id, action)}
                          className={
                            action === "reject"
                              ? "rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-error-soft hover:text-error-edge disabled:opacity-60"
                              : "rounded-xl bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
                          }
                        >
                          {ORDER_ACTION_LABELS[action]}
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => navigate(`/pharmacy/orders/${order.id}`)}
                        className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
                      >
                        Review
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}

            {pageCount > 1 && (
              <div className="flex items-center justify-between border-t border-border-subtle pt-4">
                <span className="text-body-sm text-muted-foreground">
                  Page {page + 1} of {pageCount}
                </span>
                <div className="flex gap-2">
                  <button
                    type="button"
                    disabled={page === 0}
                    onClick={() => setPage((p) => Math.max(0, p - 1))}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground disabled:opacity-50"
                  >
                    Previous
                  </button>
                  <button
                    type="button"
                    disabled={page + 1 >= pageCount}
                    onClick={() => setPage((p) => p + 1)}
                    className="rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground disabled:opacity-50"
                  >
                    Next
                  </button>
                </div>
              </div>
            )}
          </div>
        )}
      </SectionCard>
    </>,
  );
}

/** One order: timeline, items, and the prescription review pack. */
export function PharmacyOrderDetail() {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const { toast } = useToast();

  const { data: order, isLoading, isError, error, refetch } = usePortalOrder(id);
  const act = useOrderAction();

  const shell = (children: React.ReactNode) => (
    <AppShell
      portal="pharmacy"
      userName={user?.email || "Pharmacy"}
      userRole="Pharmacy Portal"
      searchPlaceholder="Search orders..."
    >
      {children}
    </AppShell>
  );

  if (isLoading) return shell(<LoadingState rows={4} />);
  if (isError || !order) {
    return shell(
      <ErrorState
        title="Failed to load order"
        description={(error as Error)?.message ?? "This order could not be read."}
        onRetry={refetch}
      />,
    );
  }

  const actions = NEXT_ACTIONS[order.status] ?? [];

  return shell(
    <>
      <PageHeader
        title={`Order ${order.order_number}`}
        subtitle={`${order.items.length} item(s) · ${currency(order.total)}`}
        breadcrumbs={[{ label: "Pharmacy" }, { label: "Orders" }, { label: order.order_number }]}
        actions={
          <>
            <button
              type="button"
              onClick={() => navigate("/pharmacy/orders")}
              className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
            >
              <ArrowLeft className="h-4 w-4" />
              Queue
            </button>
            {actions.map((action) => (
              <button
                key={action}
                type="button"
                disabled={act.isPending}
                onClick={() =>
                  act
                    .mutateAsync({ orderId: order.id, action })
                    .then(() =>
                      toast({ title: ORDER_ACTION_LABELS[action] }),
                    )
                    .catch((actionError) =>
                      toast({
                        variant: "destructive",
                        title: "Action refused",
                        description:
                          (actionError as { response?: { data?: { detail?: string } } })
                            ?.response?.data?.detail ?? "Not allowed from this status.",
                      }),
                    )
                }
                className={
                  action === "reject"
                    ? "rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-error-soft hover:text-error-edge disabled:opacity-60"
                    : "rounded-xl bg-primary px-4 py-2 text-body-sm font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:opacity-60"
                }
              >
                {ORDER_ACTION_LABELS[action]}
              </button>
            ))}
          </>
        }
      />

      <div className="space-y-6">
        <SectionCard title="Dispensing pack" subtitle="Read-only — verify before you dispense">
          {id && <PrescriptionReviewPanel orderId={id} />}
        </SectionCard>

        <SectionCard title="Fulfilment timeline">
          {/* The same component the patient's tracking screen renders, driven by
              the same event trail — so both sides always show one story. */}
          <OrderTimeline order={order as unknown as MedicineOrder} />
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
                <p className="font-medium text-foreground">{currency(item.line_total)}</p>
              </div>
            ))}
          </div>

          <div className="mt-4 flex flex-wrap items-start justify-between gap-3 rounded-xl bg-surface-container-low p-4 text-body-sm">
            <div>
              <p className="flex items-center gap-1.5 text-muted-foreground">
                <Truck className="h-4 w-4" />
                {order.delivery_address}
              </p>
              {order.delivery_notes && (
                <p className="mt-1 text-muted-foreground">Note: {order.delivery_notes}</p>
              )}
              {order.delivery_partner_name && (
                <p className="mt-1 text-foreground">
                  Rider: {order.delivery_partner_name}
                  {order.delivery_partner_phone && ` · ${order.delivery_partner_phone}`}
                </p>
              )}
            </div>
            <div className="text-right">
              <p className="text-muted-foreground">Subtotal {currency(order.subtotal)}</p>
              <p className="text-muted-foreground">
                Delivery {order.delivery_fee > 0 ? currency(order.delivery_fee) : "Free"}
              </p>
              <p className="font-semibold text-primary">Total {currency(order.total)}</p>
            </div>
          </div>
        </SectionCard>
      </div>
    </>,
  );
}

export default PharmacyOrders;
