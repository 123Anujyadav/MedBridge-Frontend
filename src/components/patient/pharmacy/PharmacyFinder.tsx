import { useMemo, useState } from "react";
import { useNavigate } from "react-router-dom";
import { MapPin, Sparkles, Store } from "lucide-react";

import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { LazyMap, type MapMarker } from "@/components/shared/map/LazyMap";
import { useToast } from "@/hooks/use-toast";
import { usePharmacySearch, usePlaceOrder } from "@/hooks/usePharmacy";
import type { PharmacyOffer } from "@/types/pharmacy";

import { OrderReviewDialog } from "./OrderReviewDialog";
import { PharmacyCard } from "./PharmacyCard";
import { useGeolocation } from "./useGeolocation";

interface PharmacyFinderProps {
  prescriptionId: string;
  defaultAddress?: string;
}

/**
 * Badges the API does not assign, derived across the returned set.
 *
 * The backend awards Nearest / Fastest delivery / Lowest price / Open 24×7.
 * "Highest rated" and "Available now" are computed here from fields already in
 * the response rather than asking the backend for them — no new endpoint, and
 * no second source of truth for the underlying numbers.
 */
function deriveBadges(offers: PharmacyOffer[]): Map<string, string[]> {
  const derived = new Map<string, string[]>();
  const orderable = offers.filter((offer) => offer.can_order && offer.fully_available);
  if (orderable.length === 0) return derived;

  const topRated = orderable.reduce((best, offer) =>
    offer.rating > best.rating ? offer : best,
  );
  if (topRated.rating > 0) {
    derived.set(topRated.pharmacy_id, ["Highest rated"]);
  }

  for (const offer of orderable) {
    if (offer.is_open_now && offer.fully_available) {
      derived.set(offer.pharmacy_id, [
        ...(derived.get(offer.pharmacy_id) ?? []),
        "Available now",
      ]);
    }
  }
  return derived;
}

/**
 * Nearby pharmacies for a prescription, with ordering.
 *
 * Mounted lazily by the prescription page so the geolocation prompt and the
 * search only happen when the patient scrolls to this section.
 */
export function PharmacyFinder({ prescriptionId, defaultAddress }: PharmacyFinderProps) {
  const navigate = useNavigate();
  const { toast } = useToast();
  const { coords, error: geoError, isLocating, denied, request } = useGeolocation(true);

  const [selected, setSelected] = useState<PharmacyOffer | null>(null);
  const [orderError, setOrderError] = useState<string | null>(null);

  const {
    data: search,
    isLoading,
    isError,
    error,
    refetch,
  } = usePharmacySearch({
    prescriptionId,
    latitude: coords?.latitude,
    longitude: coords?.longitude,
  });

  const placeOrder = usePlaceOrder();
  // Memoised on the query's own array rather than written as
  // `search?.offers ?? []` inline: the `?? []` allocates a fresh array on every
  // render while `search` is undefined — loading, error, or before coordinates
  // arrive — and that changing identity would defeat the `derivedBadges` memo
  // in precisely those states.
  const offers = useMemo(() => search?.offers ?? [], [search?.offers]);
  const derivedBadges = useMemo(() => deriveBadges(offers), [offers]);

  // Patient plus every ranked pharmacy. Memoised so panning the map does not
  // rebuild the marker list on each render.
  const mapMarkers = useMemo<MapMarker[]>(() => {
    if (!coords) return [];
    return [
      {
        id: "me",
        latitude: coords.latitude,
        longitude: coords.longitude,
        kind: "current",
        title: "You are here",
      },
      ...offers.map((offer) => ({
        id: offer.pharmacy_id,
        latitude: offer.latitude,
        longitude: offer.longitude,
        kind: "pharmacy" as const,
        title: offer.name,
        popup: (
          <div className="space-y-1">
            <p className="font-semibold text-foreground">{offer.name}</p>
            <p className="text-body-sm text-muted-foreground">
              {offer.distance_km} km · ~{offer.eta_minutes} min
            </p>
            <p className="text-body-sm text-muted-foreground">
              {offer.is_open_now ? "Open now" : "Closed"}
              {offer.rating > 0 && ` · ★ ${offer.rating.toFixed(1)}`}
            </p>
            <p className="text-body-sm font-semibold text-primary">
              ₹{offer.grand_total.toFixed(2)}
            </p>
          </div>
        ),
      })),
    ];
  }, [coords, offers]);

  const handleConfirm = async (payload: {
    items: { inventory_id: string; quantity: number; is_generic_substitute?: boolean; substituted_for?: string | null }[];
    deliveryAddress: string;
    deliveryNotes: string;
  }) => {
    if (!selected) return;
    setOrderError(null);
    try {
      const order = await placeOrder.mutateAsync({
        prescription_id: prescriptionId,
        pharmacy_id: selected.pharmacy_id,
        items: payload.items,
        delivery_address: payload.deliveryAddress,
        delivery_latitude: coords?.latitude ?? null,
        delivery_longitude: coords?.longitude ?? null,
        delivery_notes: payload.deliveryNotes,
        distance_km: selected.distance_km,
        eta_minutes: selected.eta_minutes,
      });
      setSelected(null);
      toast({
        title: "Order placed",
        description: `${order.order_number} confirmed with ${order.pharmacy_name}.`,
      });
      navigate(`/patient/orders/${order.id}`);
    } catch (submitError) {
      // Surfaced in the dialog rather than as a toast: the patient is mid-flow
      // and the message usually names the medicine that could not be supplied.
      const message =
        (submitError as { response?: { data?: { detail?: string } } })?.response?.data
          ?.detail ?? (submitError as Error)?.message ?? "The order could not be placed.";
      setOrderError(message);
    }
  };

  if (isLocating) return <LoadingState rows={2} />;

  if (!coords) {
    return (
      <EmptyState
        icon={<MapPin className="h-8 w-8" />}
        title="Share your location to find pharmacies"
        description={
          geoError ??
          "We use your location only to rank nearby pharmacies and estimate delivery."
        }
        action={
          denied ? undefined : (
            <button
              type="button"
              onClick={request}
              className="rounded-xl bg-primary px-5 py-2.5 font-semibold text-primary-foreground"
            >
              Use my location
            </button>
          )
        }
      />
    );
  }

  if (isLoading) return <LoadingState rows={3} />;

  if (isError) {
    return (
      <ErrorState
        title="Could not load pharmacies"
        description={(error as Error)?.message ?? "The pharmacy search failed."}
        onRetry={refetch}
      />
    );
  }

  if (offers.length === 0) {
    return (
      <EmptyState
        icon={<Store className="h-8 w-8" />}
        title="No partner pharmacies nearby"
        description={
          search?.maps_enabled === false
            ? "No MedBridge partner pharmacy was found within range of this location. You can still take this prescription to any chemist."
            : "Nothing was found within range. You can still take this prescription to any chemist."
        }
      />
    );
  }

  return (
    <div className="space-y-4">
      {mapMarkers.length > 1 && (
        <LazyMap markers={mapMarkers} height="300px" ariaLabel="Nearby pharmacies" />
      )}

      {search?.assistant_summary && (
        <div className="flex items-start gap-3 rounded-xl bg-primary/5 p-4">
          <Sparkles className="mt-0.5 h-5 w-5 shrink-0 text-primary" />
          <div>
            <p className="text-body-sm text-foreground">{search.assistant_summary}</p>
            <p className="mt-1 text-body-sm text-muted-foreground">
              AI guidance only — it cannot change your prescription or order for you.
            </p>
          </div>
        </div>
      )}

      {offers.map((offer) => (
        <PharmacyCard
          key={offer.pharmacy_id}
          offer={offer}
          extraBadges={derivedBadges.get(offer.pharmacy_id)}
          onSelect={setSelected}
        />
      ))}

      {selected && (
        <OrderReviewDialog
          offer={selected}
          defaultAddress={defaultAddress}
          onClose={() => {
            setSelected(null);
            setOrderError(null);
          }}
          onConfirm={handleConfirm}
          isSubmitting={placeOrder.isPending}
          error={orderError}
        />
      )}
    </div>
  );
}

export default PharmacyFinder;
