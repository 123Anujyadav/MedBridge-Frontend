// ============================================
// usePharmacy — React Query hooks
// Pharmacy search, ordering, delivery tracking
// ============================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import pharmacyService from "@/lib/pharmacy-service";
import { useAuth } from "@/context/AuthContext";
import type {
  MedicineOrder,
  PharmacySearchResult,
  PlaceOrderPayload,
} from "@/types/pharmacy";

/**
 * Keys are scoped to the signed-in account for the same reason the emergency
 * profile's are: the React Query cache survives sign-out, so on a shared
 * browser the next person in could otherwise be served the previous patient's
 * orders — medicines, address and prescriber.
 *
 * Kept out from under `["patient"]` so the WebSocket's broad `PATIENT_KEYS.all`
 * invalidations do not re-run a pharmacy search on every unrelated event.
 */
export const pharmacyKeys = {
  search: (prescriptionId: string, lat: number, lng: number, userId?: string) =>
    ["pharmacySearch", userId ?? "anonymous", prescriptionId, lat, lng] as const,
  orders: (userId?: string) => ["medicineOrders", userId ?? "anonymous"] as const,
  order: (orderId: string, userId?: string) =>
    ["medicineOrder", userId ?? "anonymous", orderId] as const,
};

/**
 * Ranked pharmacy offers for a prescription.
 *
 * Disabled until coordinates are known: firing the search with a default
 * location would rank pharmacies around a place the patient is not.
 *
 * Short `staleTime` because stock and opening hours move; this is the one query
 * here where a cached answer goes wrong quickly.
 */
export function usePharmacySearch(params: {
  prescriptionId?: string;
  latitude?: number;
  longitude?: number;
  radiusKm?: number;
  enabled?: boolean;
}) {
  const { user } = useAuth();
  const { prescriptionId, latitude, longitude, radiusKm, enabled = true } = params;
  const ready =
    enabled &&
    Boolean(prescriptionId) &&
    typeof latitude === "number" &&
    typeof longitude === "number";

  return useQuery<PharmacySearchResult>({
    queryKey: pharmacyKeys.search(
      prescriptionId ?? "",
      latitude ?? 0,
      longitude ?? 0,
      user?.id
    ),
    queryFn: () =>
      pharmacyService.search({
        prescriptionId: prescriptionId as string,
        latitude: latitude as number,
        longitude: longitude as number,
        radiusKm,
      }),
    enabled: ready,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Place an order.
 *
 * Invalidates the order list and the pharmacy search: the search result is now
 * wrong, because the stock this order just reserved is no longer available.
 */
export function usePlaceOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MedicineOrder, Error, PlaceOrderPayload>({
    mutationFn: (payload) => pharmacyService.placeOrder(payload),
    onSuccess: (order) => {
      queryClient.setQueryData(pharmacyKeys.order(order.id, user?.id), order);
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.orders(user?.id) });
      queryClient.invalidateQueries({ queryKey: ["pharmacySearch", user?.id ?? "anonymous"] });
    },
  });
}

/** The signed-in patient's medicine order history. */
export function useMedicineOrders(limit = 25) {
  const { user } = useAuth();
  return useQuery<MedicineOrder[]>({
    queryKey: pharmacyKeys.orders(user?.id),
    queryFn: () => pharmacyService.listOrders(limit),
    staleTime: 1000 * 60,
  });
}

/**
 * One order, for delivery tracking.
 *
 * Polls while the order is in flight and stops once it reaches a terminal
 * state — there is nothing further to learn about a delivered or cancelled
 * order, and polling one forever is a background request that never ends.
 */
export function useTrackOrder(orderId: string | undefined, poll = true) {
  const { user } = useAuth();

  return useQuery<MedicineOrder>({
    queryKey: pharmacyKeys.order(orderId ?? "", user?.id),
    queryFn: () => pharmacyService.trackOrder(orderId as string),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.status;
      if (status === "delivered" || status === "cancelled") return false;
      return 1000 * 30;
    },
  });
}

/** Cancel an order before dispatch. */
export function useCancelOrder() {
  const { user } = useAuth();
  const queryClient = useQueryClient();

  return useMutation<MedicineOrder, Error, { orderId: string; reason: string }>({
    mutationFn: ({ orderId, reason }) => pharmacyService.cancelOrder(orderId, reason),
    onSuccess: (order) => {
      queryClient.setQueryData(pharmacyKeys.order(order.id, user?.id), order);
      queryClient.invalidateQueries({ queryKey: pharmacyKeys.orders(user?.id) });
      // Cancelling returns stock, so any cached search is now understated.
      queryClient.invalidateQueries({ queryKey: ["pharmacySearch", user?.id ?? "anonymous"] });
    },
  });
}
