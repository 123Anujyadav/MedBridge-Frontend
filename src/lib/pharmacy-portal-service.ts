// ============================================
// Pharmacy Portal Service — MedBridge Platform
// Wraps /api/v1/pharmacy-portal/*
// ============================================
//
// No call takes a pharmacy id. The store is derived server-side from the
// signed-in owner's own user row, so there is no parameter to tamper with to
// reach another store's orders, stock or customers.
import api from "./api";
import type {
  AdminInventoryItem,
  ImportResult,
  InventoryFilters,
  Paged,
} from "@/types/pharmacy-admin";
import type {
  OrderAction,
  PortalAlert,
  PortalAnalytics,
  PortalCustomer,
  PortalDashboard,
  PortalOrder,
  PortalOrderList,
  PrescriptionReviewPack,
  ReviewOutcome,
} from "@/types/pharmacy-portal";

function clean<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, value]) => value !== undefined && value !== ""),
  );
}

/** Download a blob response as a file. */
function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  try {
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    link.remove();
  } finally {
    URL.revokeObjectURL(url);
  }
}

const pharmacyPortalService = {
  async dashboard(): Promise<PortalDashboard> {
    const { data } = await api.get<PortalDashboard>("/pharmacy-portal/dashboard");
    return data;
  },

  async alerts(): Promise<PortalAlert[]> {
    const { data } = await api.get<PortalAlert[]>("/pharmacy-portal/alerts");
    return data;
  },

  async listOrders(params: {
    status?: string;
    search?: string;
    skip?: number;
    limit?: number;
  } = {}): Promise<PortalOrderList> {
    const { data } = await api.get<PortalOrderList>("/pharmacy-portal/orders", {
      params: clean(params),
    });
    return data;
  },

  async getOrder(orderId: string): Promise<PortalOrder> {
    const { data } = await api.get<PortalOrder>(`/pharmacy-portal/orders/${orderId}`);
    return data;
  },

  /** Advance or reject an order along the shared lifecycle. */
  async actOnOrder(
    orderId: string,
    action: OrderAction,
    payload: {
      note?: string;
      delivery_partner_name?: string | null;
      delivery_partner_phone?: string | null;
    } = {},
  ): Promise<PortalOrder> {
    const { data } = await api.post<PortalOrder>(
      `/pharmacy-portal/orders/${orderId}/action`,
      { action, note: payload.note ?? "", ...payload },
    );
    return data;
  },

  /** The read-only dispensing pack: prescriber, medicines, AI review, expiry. */
  async prescriptionPack(orderId: string): Promise<PrescriptionReviewPack> {
    const { data } = await api.get<PrescriptionReviewPack>(
      `/pharmacy-portal/orders/${orderId}/prescription`,
    );
    return data;
  },

  async reviewPrescription(
    orderId: string,
    outcome: ReviewOutcome,
    note: string,
  ): Promise<PortalOrder> {
    const { data } = await api.post<PortalOrder>(
      `/pharmacy-portal/orders/${orderId}/prescription/review`,
      { outcome, note },
    );
    return data;
  },

  async listInventory(
    filters: Omit<InventoryFilters, "pharmacy_id"> = {},
  ): Promise<Paged<AdminInventoryItem>> {
    const { data } = await api.get<Paged<AdminInventoryItem>>(
      "/pharmacy-portal/inventory",
      { params: clean(filters) },
    );
    return data;
  },

  /** Barcode or QR scan at the counter. */
  async lookupByCode(code: string): Promise<AdminInventoryItem> {
    const { data } = await api.get<AdminInventoryItem>(
      "/pharmacy-portal/inventory/lookup",
      { params: { code } },
    );
    return data;
  },

  async createInventory(
    payload: Partial<AdminInventoryItem>,
  ): Promise<AdminInventoryItem> {
    const { data } = await api.post<AdminInventoryItem>(
      "/pharmacy-portal/inventory",
      payload,
    );
    return data;
  },

  async updateInventory(
    itemId: string,
    payload: Partial<AdminInventoryItem>,
  ): Promise<AdminInventoryItem> {
    const { data } = await api.put<AdminInventoryItem>(
      `/pharmacy-portal/inventory/${itemId}`,
      payload,
    );
    return data;
  },

  async deleteInventory(itemId: string): Promise<void> {
    await api.delete(`/pharmacy-portal/inventory/${itemId}`);
  },

  async importInventory(csv: string): Promise<ImportResult> {
    const { data } = await api.post<ImportResult>(
      "/pharmacy-portal/inventory/import",
      csv,
      { headers: { "Content-Type": "text/csv" } },
    );
    return data;
  },

  /**
   * Fetched as a blob because the endpoint needs the bearer token — a bare
   * href would 401, and a token in the query string would leak into history.
   */
  async exportInventory(): Promise<void> {
    const { data } = await api.get<Blob>("/pharmacy-portal/inventory/export", {
      responseType: "blob",
    });
    saveBlob(data, "inventory.csv");
  },

  async analytics(days = 30): Promise<PortalAnalytics> {
    const { data } = await api.get<PortalAnalytics>("/pharmacy-portal/analytics", {
      params: { days },
    });
    return data;
  },

  async customers(limit = 25): Promise<PortalCustomer[]> {
    const { data } = await api.get<PortalCustomer[]>("/pharmacy-portal/customers", {
      params: { limit },
    });
    return data;
  },

  async downloadSalesReport(days = 30): Promise<void> {
    const { data } = await api.get<Blob>("/pharmacy-portal/reports/sales", {
      params: { days },
      responseType: "blob",
    });
    saveBlob(data, `sales-${days}d.csv`);
  },
};

export default pharmacyPortalService;
