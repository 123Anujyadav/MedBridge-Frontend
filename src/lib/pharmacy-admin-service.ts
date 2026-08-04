// ============================================
// Pharmacy Admin Service — MedBridge Platform
// Wraps /api/v1/admin/pharmacies/*
// ============================================
//
// Every route is admin-only on the server (the router carries RoleChecker),
// so nothing here needs to pass a role — a patient or doctor token is rejected
// before any handler runs.
import api from "./api";
import type {
  AdminInventoryItem,
  OwnerCredential,
  OwnerInvitation,
  PharmacyOwner,
  AdminPharmacy,
  AdminPharmacyDetail,
  AuditEntry,
  DocumentStatus,
  DocumentType,
  ImportResult,
  InventoryFilters,
  Paged,
  PharmacyAnalytics,
  PharmacyDocument,
  PharmacyListFilters,
  VerificationStatus,
} from "@/types/pharmacy-admin";

/** Strip undefined so axios does not serialise `?search=undefined`. */
function clean<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

const pharmacyAdminService = {
  // ── pharmacies ───────────────────────────────────────────────────────

  async list(filters: PharmacyListFilters = {}): Promise<Paged<AdminPharmacy>> {
    const { data } = await api.get<Paged<AdminPharmacy>>("/admin/pharmacies", {
      params: clean(filters),
    });
    return data;
  },

  async get(pharmacyId: string): Promise<AdminPharmacyDetail> {
    const { data } = await api.get<AdminPharmacyDetail>(
      `/admin/pharmacies/${pharmacyId}`,
    );
    return data;
  },

  async create(payload: Partial<AdminPharmacy>): Promise<AdminPharmacyDetail> {
    const { data } = await api.post<AdminPharmacyDetail>("/admin/pharmacies", payload);
    return data;
  },

  async update(
    pharmacyId: string,
    payload: Partial<AdminPharmacy>,
  ): Promise<AdminPharmacyDetail> {
    const { data } = await api.put<AdminPharmacyDetail>(
      `/admin/pharmacies/${pharmacyId}`,
      payload,
    );
    return data;
  },

  /** Suspend or reactivate. Suspension removes it from patient search. */
  async setActive(
    pharmacyId: string,
    active: boolean,
    reason: string,
  ): Promise<AdminPharmacy> {
    const { data } = await api.post<AdminPharmacy>(
      `/admin/pharmacies/${pharmacyId}/status`,
      { active, reason },
    );
    return data;
  },

  async bulkSetActive(
    pharmacyIds: string[],
    active: boolean,
    reason: string,
  ): Promise<{ updated: number; requested: number }> {
    const { data } = await api.post<{ updated: number; requested: number }>(
      "/admin/pharmacies/bulk/status",
      { pharmacy_ids: pharmacyIds, active, reason },
    );
    return data;
  },

  /** Soft delete — dispensing history is preserved. */
  async remove(pharmacyId: string): Promise<void> {
    await api.delete(`/admin/pharmacies/${pharmacyId}`);
  },

  // ── verification ─────────────────────────────────────────────────────

  async transitionVerification(
    pharmacyId: string,
    toStatus: VerificationStatus,
    note: string,
  ): Promise<AdminPharmacyDetail> {
    const { data } = await api.post<AdminPharmacyDetail>(
      `/admin/pharmacies/${pharmacyId}/verification`,
      { to_status: toStatus, note },
    );
    return data;
  },

  async addDocument(
    pharmacyId: string,
    payload: {
      doc_type: DocumentType;
      file_url: string;
      file_name?: string;
      document_number?: string | null;
      issued_at?: string | null;
      expires_at?: string | null;
    },
  ): Promise<PharmacyDocument> {
    const { data } = await api.post<PharmacyDocument>(
      `/admin/pharmacies/${pharmacyId}/documents`,
      payload,
    );
    return data;
  },

  async reviewDocument(
    documentId: string,
    status: DocumentStatus,
    notes: string,
  ): Promise<PharmacyDocument> {
    const { data } = await api.post<PharmacyDocument>(
      `/admin/pharmacies/documents/${documentId}/review`,
      { status, notes },
    );
    return data;
  },

  /** Documents already expired or lapsing within `withinDays`. */
  async expiringDocuments(withinDays = 30): Promise<PharmacyDocument[]> {
    const { data } = await api.get<PharmacyDocument[]>(
      "/admin/pharmacies/documents/expiring",
      { params: { within_days: withinDays } },
    );
    return data;
  },

  // ── inventory ────────────────────────────────────────────────────────

  async searchInventory(
    filters: InventoryFilters = {},
  ): Promise<Paged<AdminInventoryItem>> {
    const { data } = await api.get<Paged<AdminInventoryItem>>(
      "/admin/pharmacies/inventory",
      { params: clean(filters) },
    );
    return data;
  },

  async createInventory(
    pharmacyId: string,
    payload: Partial<AdminInventoryItem>,
  ): Promise<AdminInventoryItem> {
    const { data } = await api.post<AdminInventoryItem>(
      `/admin/pharmacies/${pharmacyId}/inventory`,
      payload,
    );
    return data;
  },

  async updateInventory(
    pharmacyId: string,
    itemId: string,
    payload: Partial<AdminInventoryItem>,
  ): Promise<AdminInventoryItem> {
    const { data } = await api.put<AdminInventoryItem>(
      `/admin/pharmacies/${pharmacyId}/inventory/${itemId}`,
      payload,
    );
    return data;
  },

  async deleteInventory(itemId: string): Promise<void> {
    await api.delete(`/admin/pharmacies/inventory/${itemId}`);
  },

  /**
   * Download inventory as CSV.
   *
   * Fetched as a blob because the endpoint needs the bearer token — a bare
   * href would 401, and putting the token in a query string would leak it into
   * browser history and server logs.
   */
  async exportInventory(pharmacyId: string, pharmacyName = "inventory"): Promise<void> {
    const { data } = await api.get<Blob>(
      `/admin/pharmacies/${pharmacyId}/inventory/export`,
      { responseType: "blob" },
    );
    const url = URL.createObjectURL(data);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = `${pharmacyName.replace(/[^\w-]+/g, "-")}-inventory.csv`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      URL.revokeObjectURL(url);
    }
  },

  /** Bulk-load stock. Bad rows are reported by line and skipped. */
  async importInventory(pharmacyId: string, csv: string): Promise<ImportResult> {
    const { data } = await api.post<ImportResult>(
      `/admin/pharmacies/${pharmacyId}/inventory/import`,
      csv,
      { headers: { "Content-Type": "text/csv" } },
    );
    return data;
  },

  // ── owner provisioning ───────────────────────────────────────────────

  async listOwners(pharmacyId: string): Promise<PharmacyOwner[]> {
    const { data } = await api.get<PharmacyOwner[]>(
      `/admin/pharmacies/${pharmacyId}/owners`,
    );
    return data;
  },

  /** Link an existing unassigned account to this pharmacy. */
  async assignOwner(pharmacyId: string, userId: string): Promise<PharmacyOwner> {
    const { data } = await api.post<PharmacyOwner>(
      `/admin/pharmacies/${pharmacyId}/owners/assign`,
      { user_id: userId },
    );
    return data;
  },

  /** Create a dedicated owner account. The password is returned once. */
  async createOwner(
    pharmacyId: string,
    email: string,
    password?: string,
  ): Promise<OwnerCredential> {
    const { data } = await api.post<OwnerCredential>(
      `/admin/pharmacies/${pharmacyId}/owners`,
      { email, ...(password ? { password } : {}) },
    );
    return data;
  },

  async changeOwner(
    pharmacyId: string,
    userId: string,
    reason: string,
  ): Promise<PharmacyOwner> {
    const { data } = await api.post<PharmacyOwner>(
      `/admin/pharmacies/${pharmacyId}/owners/change`,
      { user_id: userId, reason },
    );
    return data;
  },

  async removeOwner(pharmacyId: string, reason: string): Promise<void> {
    await api.post(`/admin/pharmacies/${pharmacyId}/owners/remove`, { reason });
  },

  /** Suspend or reactivate without unlinking the store. */
  async setOwnerActive(
    userId: string,
    active: boolean,
    reason: string,
  ): Promise<PharmacyOwner> {
    const { data } = await api.post<PharmacyOwner>(
      `/admin/pharmacies/owners/${userId}/status`,
      { active, reason },
    );
    return data;
  },

  async resetOwnerPassword(userId: string): Promise<OwnerCredential> {
    const { data } = await api.post<OwnerCredential>(
      `/admin/pharmacies/owners/${userId}/reset-password`,
      {},
    );
    return data;
  },

  async inviteOwner(userId: string): Promise<OwnerInvitation> {
    const { data } = await api.post<OwnerInvitation>(
      `/admin/pharmacies/owners/${userId}/invite`,
      {},
    );
    return data;
  },

  // ── analytics & audit ────────────────────────────────────────────────

  async analytics(days = 30): Promise<PharmacyAnalytics> {
    const { data } = await api.get<PharmacyAnalytics>("/admin/pharmacies/analytics", {
      params: { days },
    });
    return data;
  },

  async auditTrail(params: {
    resourceId?: string;
    action?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<Paged<AuditEntry>> {
    const { data } = await api.get<Paged<AuditEntry>>("/admin/pharmacies/audit", {
      params: clean({
        resource_id: params.resourceId,
        action: params.action,
        skip: params.skip,
        limit: params.limit,
      }),
    });
    return data;
  },
};

export default pharmacyAdminService;
