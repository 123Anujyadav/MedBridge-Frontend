import { useMemo, useState } from "react";
import { Clock, Loader2, MapPin, Truck } from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import type {
  MedicineAvailabilityLine,
  OrderSelectionItem,
  PharmacyOffer,
} from "@/types/pharmacy";

interface OrderReviewDialogProps {
  offer: PharmacyOffer;
  onClose: () => void;
  onConfirm: (payload: {
    items: OrderSelectionItem[];
    deliveryAddress: string;
    deliveryNotes: string;
  }) => void;
  isSubmitting: boolean;
  error?: string | null;
  defaultAddress?: string;
}

function currency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

/** Which product the patient chose for a line — the prescribed one, or a generic. */
interface LineChoice {
  inventoryId: string;
  unitPrice: number;
  isSubstitute: boolean;
}

/**
 * Review, choose substitutions, and confirm.
 *
 * Substitution is opt-in and per line. The prescribed product is preselected
 * every time; a cheaper generic is only ordered because the patient explicitly
 * picked it here, which is the difference between an offer and a swap.
 */
export function OrderReviewDialog({
  offer,
  onClose,
  onConfirm,
  isSubmitting,
  error,
  defaultAddress = "",
}: OrderReviewDialogProps) {
  const orderable = useMemo(
    () => offer.items.filter((item) => item.status !== "out_of_stock" && item.inventory_id),
    [offer.items],
  );

  const [choices, setChoices] = useState<Record<string, LineChoice>>(() => {
    const initial: Record<string, LineChoice> = {};
    for (const item of orderable) {
      initial[item.requested_name] = {
        inventoryId: item.inventory_id as string,
        unitPrice: item.unit_price,
        isSubstitute: false,
      };
    }
    return initial;
  });

  const [address, setAddress] = useState(defaultAddress);
  const [notes, setNotes] = useState("");

  const subtotal = orderable.reduce((sum, item) => {
    const choice = choices[item.requested_name];
    return sum + (choice?.unitPrice ?? item.unit_price) * item.requested_quantity;
  }, 0);

  const deliveryFee =
    offer.delivery_fee > 0 && subtotal < offer.grand_total + 1 ? offer.delivery_fee : offer.delivery_fee;
  const total = subtotal + deliveryFee;
  const belowMinimum = subtotal < offer.min_order_value;

  const choose = (item: MedicineAvailabilityLine, choice: LineChoice) =>
    setChoices((previous) => ({ ...previous, [item.requested_name]: choice }));

  const handleConfirm = () => {
    const items: OrderSelectionItem[] = orderable.map((item) => {
      const choice = choices[item.requested_name];
      return {
        inventory_id: choice.inventoryId,
        quantity: item.requested_quantity,
        is_generic_substitute: choice.isSubstitute,
        substituted_for: choice.isSubstitute
          ? (item.matched_name ?? item.requested_name)
          : null,
      };
    });
    onConfirm({ items, deliveryAddress: address.trim(), deliveryNotes: notes.trim() });
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-center justify-center bg-black/30 p-4 backdrop-blur-sm animate-fade-in"
      onClick={onClose}
      role="dialog"
      aria-modal="true"
      aria-label="Review your order"
    >
      <div
        className="custom-scrollbar max-h-[85vh] w-full max-w-2xl overflow-y-auto rounded-2xl bg-card p-6 shadow-card-lg"
        onClick={(event) => event.stopPropagation()}
      >
        <div className="mb-5 flex items-start justify-between">
          <div>
            <h2 className="font-headline text-headline-lg text-foreground">Review your order</h2>
            <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5" />
              {offer.name} · {offer.distance_km} km
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg p-1 text-muted-foreground hover:bg-surface-container"
            aria-label="Close"
          >
            ✕
          </button>
        </div>

        <div className="space-y-3">
          {orderable.map((item) => {
            const choice = choices[item.requested_name];
            return (
              <div key={item.requested_name} className="rounded-xl border border-border-subtle p-4">
                <div className="flex flex-wrap items-start justify-between gap-2">
                  <div>
                    <p className="font-semibold text-foreground">
                      {item.matched_name ?? item.requested_name}
                    </p>
                    <p className="text-body-sm text-muted-foreground">
                      Quantity {item.requested_quantity}
                      {item.strength && ` · ${item.strength}`}
                    </p>
                  </div>
                  <p className="font-semibold text-foreground">
                    {currency((choice?.unitPrice ?? item.unit_price) * item.requested_quantity)}
                  </p>
                </div>

                {item.alternatives.length > 0 && (
                  <div className="mt-3 space-y-2 border-t border-border-subtle pt-3">
                    <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
                      Choose a product
                    </p>

                    <label className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2 hover:bg-surface-container-low">
                      <span className="flex items-center gap-2 text-body-sm text-foreground">
                        <input
                          type="radio"
                          name={`choice-${item.requested_name}`}
                          checked={!choice?.isSubstitute}
                          onChange={() =>
                            choose(item, {
                              inventoryId: item.inventory_id as string,
                              unitPrice: item.unit_price,
                              isSubstitute: false,
                            })
                          }
                        />
                        As prescribed — {item.matched_name ?? item.requested_name}
                      </span>
                      <span className="text-body-sm font-medium">{currency(item.unit_price)}</span>
                    </label>

                    {item.alternatives.map((alternative) => (
                      <label
                        key={alternative.inventory_id}
                        className="flex cursor-pointer items-center justify-between gap-3 rounded-lg p-2 hover:bg-surface-container-low"
                      >
                        <span className="flex items-center gap-2 text-body-sm text-foreground">
                          <input
                            type="radio"
                            name={`choice-${item.requested_name}`}
                            checked={choice?.inventoryId === alternative.inventory_id}
                            onChange={() =>
                              choose(item, {
                                inventoryId: alternative.inventory_id,
                                unitPrice: alternative.unit_price,
                                isSubstitute: true,
                              })
                            }
                          />
                          {alternative.name}
                          {alternative.is_generic && (
                            <StatusBadge variant="info">Generic</StatusBadge>
                          )}
                        </span>
                        <span className="text-body-sm font-medium text-success">
                          {currency(alternative.unit_price)}
                        </span>
                      </label>
                    ))}

                    <p className="text-body-sm text-muted-foreground">
                      Generics contain the same active ingredient. Your pharmacist can
                      advise if you are unsure.
                    </p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {offer.unavailable_items.length > 0 && (
          <p className="mt-3 rounded-xl bg-warning-soft p-3 text-body-sm text-warning">
            Not available here and not included in this order:{" "}
            {offer.unavailable_items.join(", ")}.
          </p>
        )}

        <div className="mt-5 space-y-3">
          <div>
            <label
              htmlFor="delivery-address"
              className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Delivery address
            </label>
            <textarea
              id="delivery-address"
              value={address}
              onChange={(event) => setAddress(event.target.value)}
              rows={2}
              className="mt-1 w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
              placeholder="Flat, street, landmark, city"
            />
          </div>
          <div>
            <label
              htmlFor="delivery-notes"
              className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground"
            >
              Delivery notes (optional)
            </label>
            <input
              id="delivery-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              className="mt-1 w-full rounded-xl border border-border-subtle bg-background p-3 text-body-sm text-foreground outline-none focus:border-primary"
              placeholder="Gate code, preferred time…"
            />
          </div>
        </div>

        <div className="mt-5 space-y-1.5 rounded-xl bg-surface-container-low p-4 text-body-sm">
          <div className="flex justify-between">
            <span className="text-muted-foreground">Subtotal</span>
            <span className="text-foreground">{currency(subtotal)}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-muted-foreground">Delivery</span>
            <span className="text-foreground">
              {deliveryFee > 0 ? currency(deliveryFee) : "Free"}
            </span>
          </div>
          <div className="flex justify-between border-t border-border-subtle pt-1.5 font-semibold">
            <span className="text-foreground">Total</span>
            <span className="text-primary">{currency(total)}</span>
          </div>
          <p className="flex items-center gap-1.5 pt-1 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            Estimated delivery in about {offer.eta_minutes} minutes
          </p>
        </div>

        {belowMinimum && (
          <p className="mt-3 rounded-xl bg-warning-soft p-3 text-body-sm text-warning">
            This pharmacy has a minimum order of {currency(offer.min_order_value)}.
          </p>
        )}

        {error && (
          <p className="mt-3 rounded-xl bg-error-soft p-3 text-body-sm text-error-edge">{error}</p>
        )}

        <div className="mt-5 flex flex-wrap justify-end gap-3">
          <button
            type="button"
            onClick={onClose}
            className="rounded-xl border border-border-subtle px-5 py-2.5 font-semibold text-foreground"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={handleConfirm}
            disabled={isSubmitting || belowMinimum || !address.trim() || orderable.length === 0}
            className="inline-flex items-center gap-2 rounded-xl bg-primary px-6 py-2.5 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {isSubmitting ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <Truck className="h-4 w-4" />
            )}
            Confirm order
          </button>
        </div>
      </div>
    </div>
  );
}
