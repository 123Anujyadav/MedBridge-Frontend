import { Check, CircleDot, X } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { ORDER_STAGES, ORDER_STATUS_LABELS, orderStageIndex } from "@/types/pharmacy";
import type { MedicineOrder, OrderStatus } from "@/types/pharmacy";

interface OrderTimelineProps {
  order: MedicineOrder;
}

function timestamp(value: string | null | undefined): string {
  if (!value) return "";
  const parsed = new Date(value);
  return Number.isNaN(parsed.getTime())
    ? ""
    : parsed.toLocaleString(undefined, { dateStyle: "medium", timeStyle: "short" });
}

/**
 * The five-stage delivery timeline.
 *
 * Timestamps come from the order's event trail rather than being inferred from
 * the current status: the trail is what actually records when each stage
 * happened, and a status alone cannot say when the order was packed.
 */
export function OrderTimeline({ order }: OrderTimelineProps) {
  const eventTimes = new Map<OrderStatus, string>();
  for (const event of order.events) {
    if (!eventTimes.has(event.status)) eventTimes.set(event.status, event.created_at);
  }

  if (order.status === "cancelled") {
    return (
      <div className="rounded-xl border border-border-subtle p-5">
        <div className="flex items-center gap-3">
          <span className="flex h-9 w-9 items-center justify-center rounded-full bg-error-soft text-error-edge">
            <X className="h-4 w-4" />
          </span>
          <div>
            <p className="font-semibold text-foreground">Order cancelled</p>
            <p className="text-body-sm text-muted-foreground">
              {timestamp(order.cancelled_at)}
              {order.cancellation_reason && ` · ${order.cancellation_reason}`}
            </p>
          </div>
        </div>
      </div>
    );
  }

  const currentIndex = orderStageIndex(order.status);

  return (
    <div className="rounded-xl border border-border-subtle p-5">
      <ol className="space-y-0">
        {ORDER_STAGES.map((stage, index) => {
          const done = index < currentIndex;
          const active = index === currentIndex;
          const time = timestamp(eventTimes.get(stage));
          const isLast = index === ORDER_STAGES.length - 1;

          return (
            <li key={stage} className="flex gap-4">
              <div className="flex flex-col items-center">
                <span
                  className={`flex h-8 w-8 shrink-0 items-center justify-center rounded-full border-2 ${
                    done
                      ? "border-success bg-success text-white"
                      : active
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border-subtle text-muted-foreground"
                  }`}
                >
                  {done ? (
                    <Check className="h-4 w-4" />
                  ) : active ? (
                    <CircleDot className="h-4 w-4" />
                  ) : (
                    <span className="text-body-sm">{index + 1}</span>
                  )}
                </span>
                {!isLast && (
                  <span
                    className={`h-10 w-0.5 ${done ? "bg-success" : "bg-border-subtle"}`}
                    aria-hidden="true"
                  />
                )}
              </div>

              <div className={isLast ? "pb-0" : "pb-3"}>
                <p
                  className={`font-semibold ${
                    done || active ? "text-foreground" : "text-muted-foreground"
                  }`}
                >
                  {ORDER_STATUS_LABELS[stage]}
                </p>
                {time && <p className="text-body-sm text-muted-foreground">{time}</p>}
                {active && stage === "out_for_delivery" && order.delivery_partner_name && (
                  <p className="mt-1 text-body-sm text-foreground">
                    {order.delivery_partner_name}
                    {order.delivery_partner_phone && ` · ${order.delivery_partner_phone}`}
                  </p>
                )}
              </div>
            </li>
          );
        })}
      </ol>

      {order.estimated_delivery_at && order.status !== "delivered" && (
        <p className="mt-4 border-t border-border-subtle pt-3 text-body-sm text-muted-foreground">
          Estimated arrival{" "}
          <span className="font-semibold text-foreground">
            {timestamp(order.estimated_delivery_at)}
          </span>
        </p>
      )}
    </div>
  );
}

/** Compact status chip, for list rows and dashboard cards. */
export function OrderStatusBadge({ status }: { status: OrderStatus }) {
  const tone =
    status === "delivered"
      ? "success"
      : status === "cancelled"
        ? "error"
        : status === "out_for_delivery"
          ? "info"
          : "warning";
  return (
    <StatusBadge variant={tone} dot>
      {ORDER_STATUS_LABELS[status]}
    </StatusBadge>
  );
}
