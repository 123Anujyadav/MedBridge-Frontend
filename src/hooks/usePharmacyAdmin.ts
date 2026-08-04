// ============================================
// usePharmacyAdmin — React Query hooks
// Pharmacy network administration
// ============================================
import { useEffect, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import pharmacyAdminService from "@/lib/pharmacy-admin-service";
import type {
  AdminInventoryItem,
  AdminPharmacy,
  AdminPharmacyDetail,
  DocumentStatus,
  InventoryFilters,
  OwnerCredential,
  OwnerInvitation,
  PharmacyListFilters,
  PharmacyOwner,
  VerificationStatus,
} from "@/types/pharmacy-admin";

/**
 * Keys are namespaced under `pharmacyAdmin` rather than the shared `admin`
 * prefix, so the existing admin screens' invalidations do not re-fetch this
 * module — and vice versa.
 */
export const pharmacyAdminKeys = {
  all: ["pharmacyAdmin"] as const,
  list: (filters: PharmacyListFilters) => ["pharmacyAdmin", "list", filters] as const,
  detail: (id: string) => ["pharmacyAdmin", "detail", id] as const,
  inventory: (filters: InventoryFilters) =>
    ["pharmacyAdmin", "inventory", filters] as const,
  analytics: (days: number) => ["pharmacyAdmin", "analytics", days] as const,
  audit: (resourceId?: string) => ["pharmacyAdmin", "audit", resourceId ?? "all"] as const,
  expiring: (days: number) => ["pharmacyAdmin", "expiring", days] as const,
};

/**
 * Debounce a fast-changing value.
 *
 * Search boxes fire per keystroke; without this a ten-character query is ten
 * round trips, and the responses can land out of order.
 */
export function useDebounced<T>(value: T, delay = 350): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const timer = setTimeout(() => setDebounced(value), delay);
    return () => clearTimeout(timer);
  }, [value, delay]);
  return debounced;
}

export function usePharmacyList(filters: PharmacyListFilters = {}) {
  return useQuery({
    queryKey: pharmacyAdminKeys.list(filters),
    queryFn: () => pharmacyAdminService.list(filters),
    // Keeps the previous page on screen while the next one loads, so paging
    // and typing do not blank the table on every keystroke.
    placeholderData: (previous) => previous,
    staleTime: 1000 * 30,
  });
}

export function usePharmacyDetail(pharmacyId: string | undefined) {
  return useQuery<AdminPharmacyDetail>({
    queryKey: pharmacyAdminKeys.detail(pharmacyId ?? ""),
    queryFn: () => pharmacyAdminService.get(pharmacyId as string),
    enabled: Boolean(pharmacyId),
  });
}

export function useCreatePharmacy() {
  const queryClient = useQueryClient();
  return useMutation<AdminPharmacyDetail, Error, Partial<AdminPharmacy>>({
    mutationFn: (payload) => pharmacyAdminService.create(payload),
    onSuccess: (created) => {
      queryClient.setQueryData(pharmacyAdminKeys.detail(created.id), created);
      queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.all });
    },
  });
}

export function useUpdatePharmacy(pharmacyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<AdminPharmacyDetail, Error, Partial<AdminPharmacy>>({
    mutationFn: (payload) =>
      pharmacyAdminService.update(pharmacyId as string, payload),
    onSuccess: (updated) => {
      queryClient.setQueryData(pharmacyAdminKeys.detail(updated.id), updated);
      queryClient.invalidateQueries({ queryKey: ["pharmacyAdmin", "list"] });
    },
  });
}

/**
 * Suspend or reactivate, applied optimistically.
 *
 * The row flips immediately and rolls back if the server refuses — the round
 * trip is otherwise long enough that an administrator clicks twice.
 */
export function useSetPharmacyActive() {
  const queryClient = useQueryClient();

  return useMutation<
    AdminPharmacy,
    Error,
    { pharmacyId: string; active: boolean; reason: string },
    { previous: [readonly unknown[], unknown][] }
  >({
    mutationFn: ({ pharmacyId, active, reason }) =>
      pharmacyAdminService.setActive(pharmacyId, active, reason),
    onMutate: async ({ pharmacyId, active }) => {
      await queryClient.cancelQueries({ queryKey: ["pharmacyAdmin", "list"] });
      const previous = queryClient.getQueriesData({ queryKey: ["pharmacyAdmin", "list"] });

      queryClient.setQueriesData<{ items: AdminPharmacy[]; total: number }>(
        { queryKey: ["pharmacyAdmin", "list"] },
        (page) =>
          page
            ? {
                ...page,
                items: page.items.map((row) =>
                  row.id === pharmacyId ? { ...row, is_active: active } : row,
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
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.all });
    },
  });
}

export function useDeletePharmacy() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (pharmacyId) => pharmacyAdminService.remove(pharmacyId),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.all }),
  });
}

export function useBulkSetActive() {
  const queryClient = useQueryClient();
  return useMutation<
    { updated: number; requested: number },
    Error,
    { pharmacyIds: string[]; active: boolean; reason: string }
  >({
    mutationFn: ({ pharmacyIds, active, reason }) =>
      pharmacyAdminService.bulkSetActive(pharmacyIds, active, reason),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.all }),
  });
}

export function useTransitionVerification(pharmacyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<
    AdminPharmacyDetail,
    Error,
    { toStatus: VerificationStatus; note: string }
  >({
    mutationFn: ({ toStatus, note }) =>
      pharmacyAdminService.transitionVerification(pharmacyId as string, toStatus, note),
    onSuccess: (updated) => {
      queryClient.setQueryData(pharmacyAdminKeys.detail(updated.id), updated);
      // Approval flips partner status, which changes the list's badges.
      queryClient.invalidateQueries({ queryKey: ["pharmacyAdmin", "list"] });
    },
  });
}

export function useReviewDocument(pharmacyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<
    unknown,
    Error,
    { documentId: string; status: DocumentStatus; notes: string }
  >({
    mutationFn: ({ documentId, status, notes }) =>
      pharmacyAdminService.reviewDocument(documentId, status, notes),
    onSuccess: () => {
      if (pharmacyId) {
        queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.detail(pharmacyId) });
      }
      queryClient.invalidateQueries({ queryKey: ["pharmacyAdmin", "expiring"] });
    },
  });
}

export function useExpiringDocuments(withinDays = 30) {
  return useQuery({
    queryKey: pharmacyAdminKeys.expiring(withinDays),
    queryFn: () => pharmacyAdminService.expiringDocuments(withinDays),
    staleTime: 1000 * 60 * 5,
  });
}

export function useInventorySearch(filters: InventoryFilters = {}) {
  return useQuery({
    queryKey: pharmacyAdminKeys.inventory(filters),
    queryFn: () => pharmacyAdminService.searchInventory(filters),
    placeholderData: (previous) => previous,
    staleTime: 1000 * 30,
  });
}

export function useUpsertInventory(pharmacyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation<
    AdminInventoryItem,
    Error,
    { itemId?: string; payload: Partial<AdminInventoryItem> }
  >({
    mutationFn: ({ itemId, payload }) =>
      itemId
        ? pharmacyAdminService.updateInventory(pharmacyId as string, itemId, payload)
        : pharmacyAdminService.createInventory(pharmacyId as string, payload),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pharmacyAdmin", "inventory"] }),
  });
}

export function useDeleteInventory() {
  const queryClient = useQueryClient();
  return useMutation<void, Error, string>({
    mutationFn: (itemId) => pharmacyAdminService.deleteInventory(itemId),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pharmacyAdmin", "inventory"] }),
  });
}

export function useImportInventory(pharmacyId: string | undefined) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (csv: string) =>
      pharmacyAdminService.importInventory(pharmacyId as string, csv),
    onSuccess: () =>
      queryClient.invalidateQueries({ queryKey: ["pharmacyAdmin", "inventory"] }),
  });
}

export function usePharmacyAnalytics(days = 30) {
  return useQuery({
    queryKey: pharmacyAdminKeys.analytics(days),
    queryFn: () => pharmacyAdminService.analytics(days),
    staleTime: 1000 * 60 * 2,
  });
}

export function usePharmacyAudit(resourceId?: string, limit = 50) {
  return useQuery({
    queryKey: pharmacyAdminKeys.audit(resourceId),
    queryFn: () => pharmacyAdminService.auditTrail({ resourceId, limit }),
    staleTime: 1000 * 30,
  });
}

// ── owner provisioning ───────────────────────────────────────────────────

export const ownerKeys = {
  list: (pharmacyId: string) => ["pharmacyAdmin", "owners", pharmacyId] as const,
};

export function usePharmacyOwners(pharmacyId: string | undefined) {
  return useQuery({
    queryKey: ownerKeys.list(pharmacyId ?? ""),
    queryFn: () => pharmacyAdminService.listOwners(pharmacyId as string),
    enabled: Boolean(pharmacyId),
  });
}

/**
 * Every owner mutation invalidates the same two things: the owner list, and
 * the pharmacy detail (whose `can_fulfil` and staffing state can change).
 */
function useOwnerMutation<TData, TVars>(
  pharmacyId: string | undefined,
  fn: (vars: TVars) => Promise<TData>,
) {
  const queryClient = useQueryClient();
  return useMutation<TData, Error, TVars>({
    mutationFn: fn,
    onSuccess: () => {
      if (pharmacyId) {
        queryClient.invalidateQueries({ queryKey: ownerKeys.list(pharmacyId) });
        queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.detail(pharmacyId) });
        queryClient.invalidateQueries({ queryKey: pharmacyAdminKeys.audit(pharmacyId) });
      }
    },
  });
}

export function useCreateOwner(pharmacyId: string | undefined) {
  return useOwnerMutation<OwnerCredential, { email: string; password?: string }>(
    pharmacyId,
    ({ email, password }) =>
      pharmacyAdminService.createOwner(pharmacyId as string, email, password),
  );
}

export function useAssignOwner(pharmacyId: string | undefined) {
  return useOwnerMutation<PharmacyOwner, { userId: string }>(pharmacyId, ({ userId }) =>
    pharmacyAdminService.assignOwner(pharmacyId as string, userId),
  );
}

export function useChangeOwner(pharmacyId: string | undefined) {
  return useOwnerMutation<PharmacyOwner, { userId: string; reason: string }>(
    pharmacyId,
    ({ userId, reason }) =>
      pharmacyAdminService.changeOwner(pharmacyId as string, userId, reason),
  );
}

export function useRemoveOwner(pharmacyId: string | undefined) {
  return useOwnerMutation<void, { reason: string }>(pharmacyId, ({ reason }) =>
    pharmacyAdminService.removeOwner(pharmacyId as string, reason),
  );
}

export function useSetOwnerActive(pharmacyId: string | undefined) {
  return useOwnerMutation<
    PharmacyOwner,
    { userId: string; active: boolean; reason: string }
  >(pharmacyId, ({ userId, active, reason }) =>
    pharmacyAdminService.setOwnerActive(userId, active, reason),
  );
}

export function useResetOwnerPassword(pharmacyId: string | undefined) {
  return useOwnerMutation<OwnerCredential, { userId: string }>(pharmacyId, ({ userId }) =>
    pharmacyAdminService.resetOwnerPassword(userId),
  );
}

export function useInviteOwner(pharmacyId: string | undefined) {
  return useOwnerMutation<OwnerInvitation, { userId: string }>(pharmacyId, ({ userId }) =>
    pharmacyAdminService.inviteOwner(userId),
  );
}
