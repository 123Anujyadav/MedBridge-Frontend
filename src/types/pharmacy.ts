// ============================================
// Pharmacy & Medicine Orders — MedBridge Platform
// Mirrors Backend/app/schemas/pharmacy_api.py
// ============================================

/**
 * `unknown` is distinct from `out_of_stock`: it means nothing was checked,
 * not that nothing is held. The UI must not render the two alike.
 */
export type Availability = "available" | "limited" | "out_of_stock" | "unknown";

export type OrderStatus =
  | "received"
  | "preparing"
  | "packed"
  | "out_for_delivery"
  | "delivered"
  | "cancelled";

/** Forward order of the delivery lifecycle, for progress rendering. */
export const ORDER_STAGES: OrderStatus[] = [
  "received",
  "preparing",
  "packed",
  "out_for_delivery",
  "delivered",
];

export const ORDER_STATUS_LABELS: Record<OrderStatus, string> = {
  received: "Order received",
  preparing: "Preparing",
  packed: "Packed",
  out_for_delivery: "Out for delivery",
  delivered: "Delivered",
  cancelled: "Cancelled",
};

export const AVAILABILITY_LABELS: Record<Availability, string> = {
  available: "Available",
  limited: "Limited stock",
  out_of_stock: "Out of stock",
  unknown: "Not checked",
};

/**
 * A cheaper substitutable product, usually the generic of a prescribed brand.
 *
 * Offered for the patient to choose. Never applied automatically — substituting
 * silently would change what they receive from what the doctor wrote.
 */
export interface MedicineAlternative {
  inventory_id: string;
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  is_generic: boolean;
  unit_price: number;
  mrp: number;
  discount_percent: number;
  stock_quantity: number;
  availability: Availability;
  saving_per_unit: number;
}

export interface MedicineAvailabilityLine {
  requested_name: string;
  rxcui: string | null;
  requested_quantity: number;
  status: Availability;
  inventory_id: string | null;
  matched_name: string | null;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  is_generic: boolean;
  mrp: number;
  unit_price: number;
  discount_percent: number;
  stock_quantity: number;
  restock_expected_at: string | null;
  /** When the pharmacy last confirmed this count. Stale counts are guesses. */
  stock_synced_at: string | null;
  line_total: number;
  savings: number;
  alternatives: MedicineAlternative[];
}

export interface PharmacyOffer {
  pharmacy_id: string;
  name: string;
  address: string;
  phone: string | null;
  latitude: number;
  longitude: number;
  rating: number;
  total_ratings: number;
  is_partner: boolean;
  is_24x7: boolean;
  is_open_now: boolean;
  delivers: boolean;

  distance_km: number;
  travel_minutes: number;
  eta_minutes: number;
  /** `haversine` (local estimate) or `google_distance_matrix` (real roads). */
  distance_source: string;

  delivery_fee: number;
  min_order_value: number;
  subtotal: number;
  total_savings: number;
  grand_total: number;

  items: MedicineAvailabilityLine[];
  /** False for discovered-but-not-partnered shops, which cannot transact. */
  can_order: boolean;
  fully_available: boolean;
  fulfilment_ratio: number;
  unavailable_items: string[];
  badges: string[];
  score: number;
  map_url: string;
  directions_url: string;
}

export interface PharmacySearchResult {
  prescription_id: string;
  latitude: number;
  longitude: number;
  radius_km: number;
  offers: PharmacyOffer[];
  assistant_summary: string;
  /** Lets the UI explain an empty result rather than just showing nothing. */
  maps_enabled: boolean;
  provider: string;
}

export interface OrderSelectionItem {
  inventory_id: string;
  quantity: number;
  medication_id?: string | null;
  is_generic_substitute?: boolean;
  substituted_for?: string | null;
}

export interface PlaceOrderPayload {
  prescription_id: string;
  pharmacy_id: string;
  items: OrderSelectionItem[];
  delivery_address: string;
  delivery_latitude?: number | null;
  delivery_longitude?: number | null;
  delivery_notes?: string;
  distance_km?: number | null;
  eta_minutes?: number | null;
}

export interface OrderItem {
  id: string;
  medicine_name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  quantity: number;
  unit_price: number;
  mrp: number;
  discount_percent: number;
  line_total: number;
  is_generic_substitute: boolean;
  substituted_for: string | null;
}

export interface OrderEvent {
  status: OrderStatus;
  note: string;
  actor_type: string;
  created_at: string;
}

export interface MedicineOrder {
  id: string;
  order_number: string;
  prescription_id: string;
  pharmacy_id: string;
  pharmacy_name: string;
  status: OrderStatus;
  subtotal: number;
  discount_total: number;
  delivery_fee: number;
  total: number;
  currency: string;
  delivery_address: string;
  delivery_notes: string;
  distance_km: number | null;
  eta_minutes: number | null;
  estimated_delivery_at: string | null;
  delivery_partner_name: string | null;
  delivery_partner_phone: string | null;
  placed_at: string | null;
  dispatched_at: string | null;
  delivered_at: string | null;
  cancelled_at: string | null;
  cancellation_reason: string | null;
  /** False once dispatched — after that it is a return, not a cancellation. */
  is_cancellable: boolean;
  created_at: string;
  items: OrderItem[];
  events: OrderEvent[];
}

/** Index of the current stage, or -1 for a cancelled order. */
export function orderStageIndex(status: OrderStatus): number {
  return ORDER_STAGES.indexOf(status);
}
