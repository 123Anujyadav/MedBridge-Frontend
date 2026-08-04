import {
  CheckCircle2,
  Clock,
  ExternalLink,
  MapPin,
  Navigation,
  Star,
  XCircle,
} from "lucide-react";

import { StatusBadge } from "@/components/shared/StatusBadge";
import { AVAILABILITY_LABELS } from "@/types/pharmacy";
import type { PharmacyOffer } from "@/types/pharmacy";

interface PharmacyCardProps {
  offer: PharmacyOffer;
  /** Badges derived across the whole result set, e.g. "Highest rated". */
  extraBadges?: string[];
  onSelect: (offer: PharmacyOffer) => void;
}

const BADGE_TONE: Record<string, "success" | "info" | "warning" | "neutral"> = {
  Nearest: "info",
  "Fastest delivery": "success",
  "Lowest price": "success",
  "Open 24×7": "info",
  "Highest rated": "info",
  "Available now": "success",
};

function currency(value: number): string {
  return `₹${value.toFixed(2)}`;
}

/**
 * One ranked pharmacy.
 *
 * Every figure shown comes from the API response — distance, ETA, stock, price
 * and savings are all computed server-side against real inventory, so nothing
 * here recalculates or estimates.
 */
export function PharmacyCard({ offer, extraBadges = [], onSelect }: PharmacyCardProps) {
  const badges = [...offer.badges, ...extraBadges];
  const available = offer.items.filter((item) => item.status !== "out_of_stock");
  const missing = offer.items.filter((item) => item.status === "out_of_stock");
  const alternatives = offer.items.flatMap((item) => item.alternatives);

  return (
    <div className="premium-card p-5">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <h4 className="font-headline text-headline-md text-foreground">{offer.name}</h4>
            {offer.is_open_now ? (
              <StatusBadge variant="success" dot>
                Open
              </StatusBadge>
            ) : (
              <StatusBadge variant="neutral" dot>
                Closed
              </StatusBadge>
            )}
          </div>
          {offer.address && (
            <p className="mt-1 flex items-center gap-1.5 text-body-sm text-muted-foreground">
              <MapPin className="h-3.5 w-3.5 shrink-0" />
              {offer.address}
            </p>
          )}
        </div>

        {offer.rating > 0 && (
          <div className="flex items-center gap-1 text-body-sm font-semibold text-foreground">
            <Star className="h-4 w-4 fill-warning text-warning" />
            {offer.rating.toFixed(1)}
            <span className="font-normal text-muted-foreground">
              ({offer.total_ratings})
            </span>
          </div>
        )}
      </div>

      {badges.length > 0 && (
        <div className="mt-3 flex flex-wrap gap-2">
          {badges.map((badge) => (
            <StatusBadge key={badge} variant={BADGE_TONE[badge] ?? "neutral"}>
              {badge}
            </StatusBadge>
          ))}
        </div>
      )}

      <div className="mt-4 grid grid-cols-2 gap-3 sm:grid-cols-4">
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Distance
          </p>
          <p className="mt-0.5 text-body-sm font-medium text-foreground">
            {offer.distance_km} km
          </p>
        </div>
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Travel time
          </p>
          <p className="mt-0.5 text-body-sm font-medium text-foreground">
            {offer.travel_minutes} min
          </p>
        </div>
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Delivery ETA
          </p>
          <p className="mt-0.5 flex items-center gap-1 text-body-sm font-medium text-foreground">
            <Clock className="h-3.5 w-3.5" />
            {offer.eta_minutes} min
          </p>
        </div>
        <div>
          <p className="text-label-sm font-semibold uppercase tracking-wider text-muted-foreground">
            Total
          </p>
          <p className="mt-0.5 text-body-sm font-semibold text-primary">
            {currency(offer.grand_total)}
          </p>
        </div>
      </div>

      <div className="mt-4 space-y-1.5 border-t border-border-subtle pt-3">
        {available.map((item) => (
          <div
            key={item.requested_name}
            className="flex flex-wrap items-center justify-between gap-2 text-body-sm"
          >
            <span className="flex items-center gap-1.5 text-foreground">
              <CheckCircle2 className="h-3.5 w-3.5 text-success" />
              {item.matched_name ?? item.requested_name}
              <span className="text-muted-foreground">× {item.requested_quantity}</span>
              {item.status === "limited" && (
                <StatusBadge variant="warning">
                  {AVAILABILITY_LABELS.limited}
                </StatusBadge>
              )}
            </span>
            <span className="flex items-center gap-2">
              {item.discount_percent > 0 && (
                <span className="text-muted-foreground line-through">
                  {currency(item.mrp * item.requested_quantity)}
                </span>
              )}
              <span className="font-medium text-foreground">
                {currency(item.line_total)}
              </span>
            </span>
          </div>
        ))}

        {missing.map((item) => (
          <div
            key={item.requested_name}
            className="flex items-center gap-1.5 text-body-sm text-muted-foreground"
          >
            <XCircle className="h-3.5 w-3.5 text-error-edge" />
            {item.requested_name}
            <span>— {AVAILABILITY_LABELS.out_of_stock}</span>
            {item.restock_expected_at && (
              <span>
                (restock {new Date(item.restock_expected_at).toLocaleDateString()})
              </span>
            )}
          </div>
        ))}
      </div>

      {alternatives.length > 0 && (
        <p className="mt-3 rounded-lg bg-surface-container-low p-3 text-body-sm text-foreground">
          <span className="font-semibold">
            {alternatives.length} cheaper alternative(s) available.
          </span>{" "}
          You can choose these at the next step — nothing is substituted for you.
        </p>
      )}

      <div className="mt-4 flex flex-wrap items-center justify-between gap-3 border-t border-border-subtle pt-4">
        <div className="text-body-sm">
          {offer.total_savings > 0 && (
            <p className="font-semibold text-success">
              You save {currency(offer.total_savings)}
            </p>
          )}
          <p className="text-muted-foreground">
            {offer.delivery_fee > 0
              ? `+ ${currency(offer.delivery_fee)} delivery`
              : "Free delivery"}
          </p>
        </div>

        <div className="flex flex-wrap items-center gap-2">
          <a
            href={offer.directions_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
          >
            <Navigation className="h-4 w-4" />
            Directions
          </a>
          <a
            href={offer.map_url}
            target="_blank"
            rel="noreferrer noopener"
            className="inline-flex items-center gap-1.5 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container"
          >
            <ExternalLink className="h-4 w-4" />
            Map
          </a>
          <button
            type="button"
            disabled={!offer.can_order}
            onClick={() => onSelect(offer)}
            className="rounded-xl bg-primary px-5 py-2 font-semibold text-primary-foreground transition-all hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
            // Disabled rather than hidden: a patient comparing options should
            // see that this pharmacy exists and why it cannot fulfil.
            title={
              offer.can_order
                ? undefined
                : offer.is_open_now
                  ? "This pharmacy cannot supply this prescription"
                  : "This pharmacy is currently closed"
            }
          >
            Select
          </button>
        </div>
      </div>
    </div>
  );
}
