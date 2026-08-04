// ============================================
// Delivery Service — MedBridge Platform
// Wraps /api/v1/delivery/*
// ============================================
//
// No rider call takes a partner id — the profile is resolved server-side from
// the auth gate, so there is no parameter to change to reach another rider's
// work. The admin calls live under /delivery/admin and are role-gated there.
import api from "./api";
import type {
  AssignmentList,
  DeliveryAssignment,
  DeliveryPartner,
  DeliveryRoute,
  DeliveryTracking,
  FleetAnalytics,
  PartnerDashboard,
  PartnerStatus,
  AdvanceTarget,
} from "@/types/delivery";

function clean<T extends object>(params: T): Record<string, unknown> {
  return Object.fromEntries(
    Object.entries(params).filter(([, v]) => v !== undefined && v !== ""),
  );
}

const deliveryService = {
  // ── rider ──────────────────────────────────────────────────────────

  async me(): Promise<DeliveryPartner> {
    const { data } = await api.get<DeliveryPartner>("/delivery/me");
    return data;
  },

  async dashboard(): Promise<PartnerDashboard> {
    const { data } = await api.get<PartnerDashboard>("/delivery/dashboard");
    return data;
  },

  /** Clock on or off. Does not drop work already accepted. */
  async setOnline(online: boolean): Promise<DeliveryPartner> {
    const { data } = await api.post<DeliveryPartner>("/delivery/online", { online });
    return data;
  },

  async pushLocation(latitude: number, longitude: number): Promise<DeliveryPartner> {
    const { data } = await api.post<DeliveryPartner>("/delivery/location", {
      latitude,
      longitude,
    });
    return data;
  },

  async listDeliveries(
    params: { status?: string; skip?: number; limit?: number } = {},
  ): Promise<AssignmentList> {
    const { data } = await api.get<AssignmentList>("/delivery/orders", {
      params: clean(params),
    });
    return data;
  },

  async getDelivery(assignmentId: string): Promise<DeliveryAssignment> {
    const { data } = await api.get<DeliveryAssignment>(
      `/delivery/orders/${assignmentId}`,
    );
    return data;
  },

  /** Move to the next leg. `delivered` is not reachable — use verifyOtp. */
  async advance(
    assignmentId: string,
    target: AdvanceTarget,
    position?: { latitude?: number; longitude?: number; note?: string },
  ): Promise<DeliveryAssignment> {
    const { data } = await api.post<DeliveryAssignment>(
      `/delivery/orders/${assignmentId}/advance`,
      { target, note: position?.note ?? "", ...position },
    );
    return data;
  },

  async fail(
    assignmentId: string,
    reason: string,
    position?: { latitude?: number; longitude?: number },
  ): Promise<DeliveryAssignment> {
    const { data } = await api.post<DeliveryAssignment>(
      `/delivery/orders/${assignmentId}/fail`,
      { reason, ...position },
    );
    return data;
  },

  /** Confirm handover. The only path to a completed delivery. */
  async verifyOtp(
    assignmentId: string,
    code: string,
    position?: { latitude?: number; longitude?: number },
  ): Promise<DeliveryAssignment> {
    const { data } = await api.post<DeliveryAssignment>(
      `/delivery/orders/${assignmentId}/verify-otp`,
      { code, ...position },
    );
    return data;
  },

  async captureProof(
    assignmentId: string,
    payload: {
      photo_url?: string | null;
      signature_url?: string | null;
      notes?: string;
      latitude?: number;
      longitude?: number;
    },
  ): Promise<DeliveryAssignment> {
    const { data } = await api.post<DeliveryAssignment>(
      `/delivery/orders/${assignmentId}/proof`,
      payload,
    );
    return data;
  },

  async route(assignmentId: string): Promise<DeliveryRoute> {
    const { data } = await api.get<DeliveryRoute>(
      `/delivery/orders/${assignmentId}/route`,
    );
    return data;
  },

  // ── patient tracking ───────────────────────────────────────────────

  /** Null until a rider is assigned — a normal state, not an error. */
  async track(orderId: string): Promise<DeliveryTracking | null> {
    const { data } = await api.get<DeliveryTracking | null>(
      `/delivery/tracking/${orderId}`,
    );
    return data ?? null;
  },

  // ── admin fleet ────────────────────────────────────────────────────

  async listPartners(
    params: { verification_status?: PartnerStatus; online_only?: boolean } = {},
  ): Promise<DeliveryPartner[]> {
    const { data } = await api.get<DeliveryPartner[]>("/delivery/admin/partners", {
      params: clean(params),
    });
    return data;
  },

  /** Approved, online, and not already carrying an order. */
  async availablePartners(): Promise<DeliveryPartner[]> {
    const { data } = await api.get<DeliveryPartner[]>(
      "/delivery/admin/partners/available",
    );
    return data;
  },

  async transitionPartner(
    partnerId: string,
    toStatus: PartnerStatus,
    note: string,
  ): Promise<DeliveryPartner> {
    const { data } = await api.post<DeliveryPartner>(
      `/delivery/admin/partners/${partnerId}/verification`,
      { to_status: toStatus, note },
    );
    return data;
  },

  async assignOrder(orderId: string, partnerId: string): Promise<DeliveryAssignment> {
    const { data } = await api.post<DeliveryAssignment>("/delivery/admin/assign", {
      order_id: orderId,
      partner_id: partnerId,
    });
    return data;
  },

  async fleetAnalytics(days = 30): Promise<FleetAnalytics> {
    const { data } = await api.get<FleetAnalytics>("/delivery/admin/analytics", {
      params: { days },
    });
    return data;
  },
};

export default deliveryService;
