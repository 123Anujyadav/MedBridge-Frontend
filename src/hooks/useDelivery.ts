// ============================================
// useDelivery — React Query hooks
// Delivery & Logistics
// ============================================
import { useEffect, useRef } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import deliveryService from "@/lib/delivery-service";
import type {
  AdvanceTarget,
  DeliveryAssignment,
  DeliveryPartner,
  DeliveryTracking,
} from "@/types/delivery";

/** Namespaced so no other module's invalidations reach these. */
export const deliveryKeys = {
  all: ["delivery"] as const,
  me: () => ["delivery", "me"] as const,
  dashboard: () => ["delivery", "dashboard"] as const,
  orders: (filters: object) => ["delivery", "orders", filters] as const,
  order: (id: string) => ["delivery", "order", id] as const,
  route: (id: string) => ["delivery", "route", id] as const,
  tracking: (orderId: string) => ["delivery", "tracking", orderId] as const,
  partners: (filters: object) => ["delivery", "partners", filters] as const,
  fleet: (days: number) => ["delivery", "fleet", days] as const,
};

export function useDeliveryProfile() {
  return useQuery<DeliveryPartner>({
    queryKey: deliveryKeys.me(),
    queryFn: () => deliveryService.me(),
    staleTime: 1000 * 60,
  });
}

/**
 * The rider's dashboard, refreshed in the background while the tab is visible.
 *
 * A rider leaves this open through a shift; polling a backgrounded tab is pure
 * waste, so it stops when they switch away.
 */
export function useDeliveryDashboard() {
  return useQuery({
    queryKey: deliveryKeys.dashboard(),
    queryFn: () => deliveryService.dashboard(),
    refetchInterval: 1000 * 45,
    refetchIntervalInBackground: false,
  });
}

export function useSetOnline() {
  const queryClient = useQueryClient();
  return useMutation<DeliveryPartner, Error, boolean>({
    mutationFn: (online) => deliveryService.setOnline(online),
    onSuccess: (partner) => {
      queryClient.setQueryData(deliveryKeys.me(), partner);
      queryClient.invalidateQueries({ queryKey: deliveryKeys.dashboard() });
    },
  });
}

/**
 * Push the rider's position while they are carrying an order.
 *
 * Deliberately not a `setInterval` in a component: mounted twice it would
 * double the write rate. The ref guards against overlapping pushes when a fix
 * is slow.
 */
export function useLocationBroadcast(enabled: boolean, intervalMs = 20_000) {
  const inFlight = useRef(false);

  useEffect(() => {
    if (!enabled || typeof navigator === "undefined" || !navigator.geolocation) {
      return;
    }

    const push = () => {
      if (inFlight.current) return;
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          inFlight.current = true;
          try {
            await deliveryService.pushLocation(
              position.coords.latitude,
              position.coords.longitude,
            );
          } catch {
            // A dropped position update is not worth interrupting a delivery
            // for; the next tick will carry the newer fix anyway.
          } finally {
            inFlight.current = false;
          }
        },
        () => undefined,
        { enableHighAccuracy: true, timeout: 15_000, maximumAge: 10_000 },
      );
    };

    push();
    const timer = setInterval(push, intervalMs);
    return () => clearInterval(timer);
  }, [enabled, intervalMs]);
}

export function useMyDeliveries(
  filters: { status?: string; skip?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: deliveryKeys.orders(filters),
    queryFn: () => deliveryService.listDeliveries(filters),
    placeholderData: (previous) => previous,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
  });
}

export function useDelivery(assignmentId: string | undefined) {
  return useQuery<DeliveryAssignment>({
    queryKey: deliveryKeys.order(assignmentId ?? ""),
    queryFn: () => deliveryService.getDelivery(assignmentId as string),
    enabled: Boolean(assignmentId),
  });
}

export function useDeliveryRoute(assignmentId: string | undefined) {
  return useQuery({
    queryKey: deliveryKeys.route(assignmentId ?? ""),
    queryFn: () => deliveryService.route(assignmentId as string),
    enabled: Boolean(assignmentId),
    // Distance Matrix is billed per call and the rider is moving, so this is
    // refreshed on a slower cadence than the assignment itself.
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
  });
}

/** Advance a leg, applied optimistically — a rider taps while moving. */
export function useAdvanceDelivery() {
  const queryClient = useQueryClient();

  return useMutation<
    DeliveryAssignment,
    Error,
    { assignmentId: string; target: AdvanceTarget; latitude?: number; longitude?: number },
    { previous: [readonly unknown[], unknown][] }
  >({
    mutationFn: ({ assignmentId, target, ...position }) =>
      deliveryService.advance(assignmentId, target, position),
    onMutate: async ({ assignmentId, target }) => {
      await queryClient.cancelQueries({ queryKey: ["delivery", "orders"] });
      const previous = queryClient.getQueriesData({ queryKey: ["delivery", "orders"] });

      queryClient.setQueriesData<{ items: DeliveryAssignment[] }>(
        { queryKey: ["delivery", "orders"] },
        (page) =>
          page
            ? {
                ...page,
                items: page.items.map((row) =>
                  row.id === assignmentId ? { ...row, status: target } : row,
                ),
              }
            : page,
      );
      return { previous };
    },
    onError: (_error, _vars, context) => {
      for (const [key, value] of context?.previous ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delivery", "orders"] });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.order(variables.assignmentId) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.route(variables.assignmentId) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.dashboard() });
    },
  });
}

/**
 * Confirm handover.
 *
 * Not optimistic: an OTP is the one action that must not appear to succeed
 * before the server agrees.
 */
export function useVerifyOtp() {
  const queryClient = useQueryClient();
  return useMutation<
    DeliveryAssignment,
    Error,
    { assignmentId: string; code: string; latitude?: number; longitude?: number }
  >({
    mutationFn: ({ assignmentId, code, ...position }) =>
      deliveryService.verifyOtp(assignmentId, code, position),
    onSuccess: (_data, variables) => {
      queryClient.invalidateQueries({ queryKey: ["delivery", "orders"] });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.order(variables.assignmentId) });
      queryClient.invalidateQueries({ queryKey: deliveryKeys.dashboard() });
    },
  });
}

export function useCaptureProof() {
  const queryClient = useQueryClient();
  return useMutation<
    DeliveryAssignment,
    Error,
    {
      assignmentId: string;
      photo_url?: string | null;
      signature_url?: string | null;
      notes?: string;
      latitude?: number;
      longitude?: number;
    }
  >({
    mutationFn: ({ assignmentId, ...payload }) =>
      deliveryService.captureProof(assignmentId, payload),
    onSuccess: (_data, variables) =>
      queryClient.invalidateQueries({ queryKey: deliveryKeys.order(variables.assignmentId) }),
  });
}

export function useFailDelivery() {
  const queryClient = useQueryClient();
  return useMutation<
    DeliveryAssignment,
    Error,
    { assignmentId: string; reason: string; latitude?: number; longitude?: number }
  >({
    mutationFn: ({ assignmentId, reason, ...position }) =>
      deliveryService.fail(assignmentId, reason, position),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: deliveryKeys.all }),
  });
}

/**
 * Live tracking for a patient.
 *
 * Polls while the rider is moving and stops once the delivery reaches a
 * terminal state — there is nothing further to learn, and polling forever is a
 * background request that never ends.
 */
export function useTrackDelivery(orderId: string | undefined, poll = true) {
  return useQuery<DeliveryTracking | null>({
    queryKey: deliveryKeys.tracking(orderId ?? ""),
    queryFn: () => deliveryService.track(orderId as string),
    enabled: Boolean(orderId),
    refetchInterval: (query) => {
      if (!poll) return false;
      const status = query.state.data?.status;
      if (!status) return 1000 * 60;
      if (status === "delivered" || status === "cancelled" || status === "failed") {
        return false;
      }
      return 1000 * 20;
    },
    refetchIntervalInBackground: false,
  });
}

// ── admin fleet ──────────────────────────────────────────────────────────

export function useDeliveryPartners(filters: object = {}) {
  return useQuery({
    queryKey: deliveryKeys.partners(filters),
    queryFn: () => deliveryService.listPartners(filters),
    staleTime: 1000 * 30,
  });
}

export function useAvailablePartners() {
  return useQuery({
    queryKey: deliveryKeys.partners({ available: true }),
    queryFn: () => deliveryService.availablePartners(),
    staleTime: 1000 * 15,
  });
}

export function useFleetAnalytics(days = 30) {
  return useQuery({
    queryKey: deliveryKeys.fleet(days),
    queryFn: () => deliveryService.fleetAnalytics(days),
    staleTime: 1000 * 60 * 2,
  });
}
