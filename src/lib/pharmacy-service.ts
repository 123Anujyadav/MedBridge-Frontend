// ============================================
// Pharmacy Service — MedBridge Platform
// Wraps /api/v1/pharmacy/*
// ============================================
//
// Every route is patient-scoped on the server from the bearer token, so none of
// these calls takes a patient id — there is no parameter to tamper with to
// reach another patient's prescription or order.
import api from "./api";
import type {
  MedicineOrder,
  PharmacySearchResult,
  PlaceOrderPayload,
} from "@/types/pharmacy";

const pharmacyService = {
  /**
   * Nearby pharmacies ranked for a prescription.
   *
   * Availability, distance, ETA, rating and price are computed server-side
   * before the assistant summary is written, so the summary explains the
   * result rather than producing it.
   */
  async search(params: {
    prescriptionId: string;
    latitude: number;
    longitude: number;
    radiusKm?: number;
    limit?: number;
  }): Promise<PharmacySearchResult> {
    const { data } = await api.get<PharmacySearchResult>("/pharmacy/search", {
      params: {
        prescription_id: params.prescriptionId,
        latitude: params.latitude,
        longitude: params.longitude,
        radius_km: params.radiusKm ?? 10,
        limit: params.limit ?? 5,
      },
    });
    return data;
  },

  /**
   * Place an order. Stock is reserved server-side in the same transaction, so
   * a 4xx here means the basket genuinely could not be filled.
   */
  async placeOrder(payload: PlaceOrderPayload): Promise<MedicineOrder> {
    const { data } = await api.post<MedicineOrder>("/pharmacy/orders", payload);
    return data;
  },

  /** The signed-in patient's order history, newest first. */
  async listOrders(limit = 25): Promise<MedicineOrder[]> {
    const { data } = await api.get<MedicineOrder[]>("/pharmacy/orders", {
      params: { limit },
    });
    return data;
  },

  /** One order with its full status trail, for delivery tracking. */
  async trackOrder(orderId: string): Promise<MedicineOrder> {
    const { data } = await api.get<MedicineOrder>(`/pharmacy/orders/${orderId}`);
    return data;
  },

  /**
   * Cancel before dispatch. Refused by the server once the order is out for
   * delivery, so callers should hide the action when `is_cancellable` is false
   * rather than relying on the error.
   */
  async cancelOrder(orderId: string, reason: string): Promise<MedicineOrder> {
    const { data } = await api.post<MedicineOrder>(
      `/pharmacy/orders/${orderId}/cancel`,
      { reason }
    );
    return data;
  },
};

export default pharmacyService;
