// ============================================
// usePharmacyPortal — React Query hooks
// Pharmacy Owner Portal
// ============================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import pharmacyPortalService from "@/lib/pharmacy-portal-service";
import type { AdminInventoryItem, InventoryFilters, Paged } from "@/types/pharmacy-admin";
import type {
  OrderAction,
  PortalOrder,
  ReviewOutcome,
} from "@/types/pharmacy-portal";

/**
 * Keys are namespaced under `pharmacyPortal`, distinct from both `pharmacyAdmin`
 * and the patient-side `pharmacySearch`, so none of the three invalidates the
 * others. They carry no store id because the server derives it from the session.
 */
export const portalKeys = {
  all: ["pharmacyPortal"] as const,
  dashboard: () => ["pharmacyPortal", "dashboard"] as const,
  alerts: () => ["pharmacyPortal", "alerts"] as const,
  orders: (filters: object) => ["pharmacyPortal", "orders", filters] as const,
  order: (id: string) => ["pharmacyPortal", "order", id] as const,
  prescription: (orderId: string) =>
    ["pharmacyPortal", "prescription", orderId] as const,
  inventory: (filters: object) => ["pharmacyPortal", "inventory", filters] as const,
  analytics: (days: number) => ["pharmacyPortal", "analytics", days] as const,
  customers: (limit: number) => ["pharmacyPortal", "customers", limit] as const,
};

/**
 * The dashboard, refreshed in the background.
 *
 * A counter leaves this screen open all day, so it polls rather than going
 * stale — but only while the tab is visible, since a backgrounded tab polling
 * every half minute is pure waste.
 */
export function usePortalDashboard() {
  return useQuery({
    queryKey: portalKeys.dashboard(),
    queryFn: () => pharmacyPortalService.dashboard(),
    refetchInterval: 1000 * 45,
    refetchIntervalInBackground: false,
    staleTime: 1000 * 20,
  });
}

/** Live operational alerts — derived server-side, so never stale-but-shown. */
export function usePortalAlerts() {
  return useQuery({
    queryKey: portalKeys.alerts(),
    queryFn: () => pharmacyPortalService.alerts(),
    refetchInterval: 1000 * 60,
    refetchIntervalInBackground: false,
  });
}

/**
 * The order queue.
 *
 * Polls on a short interval: a new order arriving is the one event a pharmacy
 * cannot afford to miss, and the counter is not going to hit refresh.
 */
export function usePortalOrders(
  filters: { status?: string; search?: string; skip?: number; limit?: number } = {},
) {
  return useQuery({
    queryKey: portalKeys.orders(filters),
    queryFn: () => pharmacyPortalService.listOrders(filters),
    placeholderData: (previous) => previous,
    refetchInterval: 1000 * 30,
    refetchIntervalInBackground: false,
  });
}

export function usePortalOrder(orderId: string | undefined) {
  return useQuery<PortalOrder>({
    queryKey: portalKeys.order(orderId ?? ""),
    queryFn: () => pharmacyPortalService.getOrder(orderId as string),
    enabled: Boolean(orderId),
  });
}

export function usePrescriptionPack(orderId: string | undefined) {
  return useQuery({
    queryKey: portalKeys.prescription(orderId ?? ""),
    queryFn: () => pharmacyPortalService.prescriptionPack(orderId as string),
    enabled: Boolean(orderId),
    // A signed prescription does not change; only the safety review might.
    staleTime: 1000 * 60 * 5,
  });
}

/**
 * Advance or reject an order, applied optimistically.
 *
 * The card flips immediately and rolls back if the server refuses — the counter
 * is working at speed and a full round trip per tap reads as a dropped click.
 */
export function useOrderAction() {
  const queryClient = useQueryClient();

  return useMutation<
    PortalOrder,
    Error,
    {
      orderId: string;
      action: OrderAction;
      note?: string;
      delivery_partner_name?: string | null;
      delivery_partner_phone?: string | null;
    },
    { previous: [readonly unknown[], unknown][] }
  >({
    mutationFn: ({ orderId, action, ...rest }) =>
      pharmacyPortalService.actOnOrder(orderId, action, rest),
    onMutate: async ({ orderId, action }) => {
      await queryClient.cancelQueries({ queryKey: ["pharmacyPortal", "orders"] });
      const previous = queryClient.getQueriesData({
        queryKey: ["pharmacyPortal", "orders"],
      });

      const optimistic: Record<string, PortalOrder["status"]> = {
        accept: "preparing",
        prepare: "preparing",
        ready: "packed",
        pack: "packed",
        dispatch: "out_for_delivery",
        deliver: "delivered",
        reject: "cancelled",
      };
      const nextStatus = optimistic[action];

      queryClient.setQueriesData<{ items: PortalOrder[] }>(
        { queryKey: ["pharmacyPortal", "orders"] },
        (page) =>
          page
            ? {
                ...page,
                items: page.items.map((row) =>
                  row.id === orderId && nextStatus
                    ? { ...row, status: nextStatus }
                    : row,
                ),
              }
            : page,
      );
      return { previous };
    },
    onError: (_error, _variables, context) => {
      for (const [key, value] of context?.previous ?? []) {
        queryClient.setQueryData(key, value);
      }
    },
    onSettled: (_data, _error, variables) => {
      queryClient.invalidateQueries({ queryKey: ["pharmacyPortal", "orders"] });
      queryClient.invalidateQueries({ queryKey: portalKeys.order(variables.orderId) });
      // Rejecting returns stock, and any transition changes today's counts.
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: portalKeys.alerts() });
    },
  });
}

export function useReviewPrescription() {
  const queryClient = useQueryClient();
  return useMutation<
    PortalOrder,
    Error,
    { orderId: string; outcome: ReviewOutcome; note: string }
  >({
    mutationFn: ({ orderId, outcome, note }) =>
      pharmacyPortalService.reviewPrescription(orderId, outcome, note),
    onSuccess: (_order, variables) => {
      queryClient.invalidateQueries({ queryKey: portalKeys.order(variables.orderId) });
      queryClient.invalidateQueries({ queryKey: ["pharmacyPortal", "orders"] });
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
    },
  });
}

export function usePortalInventory(filters: Omit<InventoryFilters, "pharmacy_id"> = {}) {
  return useQuery<Paged<AdminInventoryItem>>({
    queryKey: portalKeys.inventory(filters),
    queryFn: () => pharmacyPortalService.listInventory(filters),
    placeholderData: (previous) => previous,
    staleTime: 1000 * 20,
  });
}

/**
 * Create or update stock.
 *
 * Invalidates the dashboard and alerts too: a stock correction changes the
 * low-stock counts and can resolve an outstanding alert.
 */
export function useUpsertPortalInventory() {
  const queryClient = useQueryClient();
  return useMutation<
    AdminInventoryItem,
    Error,
    { itemId?: string; payload: Partial<AdminInventoryItem> }
  >({
    mutationFn: ({ itemId, payload }) =>
      itemId
        ? pharmacyPortalService.updateInventory(itemId, payload)
        : pharmacyPortalService.createInventory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacyPortal", "inventory"] });
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
      queryClient.invalidateQueries({ queryKey: portalKeys.alerts() });
    },
  });
}

export function useDeletePortalInventory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (itemId) => pharmacyPortalService.deleteInventory(itemId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacyPortal", "inventory"] });
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
    },
  });
}

export function useImportPortalInventory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) => pharmacyPortalService.importInventory(csv),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pharmacyPortal", "inventory"] });
      queryClient.invalidateQueries({ queryKey: portalKeys.dashboard() });
    },
  });
}

export function usePortalAnalytics(days = 30) {
  return useQuery({
    queryKey: portalKeys.analytics(days),
    queryFn: () => pharmacyPortalService.analytics(days),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePortalCustomers(limit = 25) {
  return useQuery({
    queryKey: portalKeys.customers(limit),
    queryFn: () => pharmacyPortalService.customers(limit),
    staleTime: 1000 * 60 * 5,
  });
}
