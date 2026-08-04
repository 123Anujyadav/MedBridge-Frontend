// ============================================
// Delivery & Logistics — MedBridge Platform
// Mirrors Backend/app/schemas/delivery_api.py
// ============================================

export type PartnerStatus =
  | "pending"
  | "document_review"
  | "approved"
  | "rejected"
  | "suspended";

export type DeliveryStatus =
  | "offered"
  | "accepted"
  | "en_route_pickup"
  | "at_pharmacy"
  | "picked_up"
  | "out_for_delivery"
  | "at_patient"
  | "delivered"
  | "cancelled"
  | "failed";

/**
 * `delivered` is absent by design — a delivery is completed by verifying the
 * patient's OTP, never by a rider asserting it.
 */
export type AdvanceTarget =
  | "accepted"
  | "en_route_pickup"
  | "at_pharmacy"
  | "picked_up"
  | "out_for_delivery"
  | "at_patient";

export const DELIVERY_STATUS_LABELS: Record<DeliveryStatus, string> = {
  offered: "Offered",
  accepted: "Accepted",
  en_route_pickup: "Heading to pharmacy",
  at_pharmacy: "At pharmacy",
  picked_up: "Medicine picked up",
  out_for_delivery: "Out for delivery",
  at_patient: "At patient",
  delivered: "Delivered",
  cancelled: "Cancelled",
  failed: "Failed",
};

/** The forward journey, for progress rendering. Terminal states excluded. */
export const DELIVERY_JOURNEY: DeliveryStatus[] = [
  "offered",
  "accepted",
  "en_route_pickup",
  "at_pharmacy",
  "picked_up",
  "out_for_delivery",
  "at_patient",
  "delivered",
];

/**
 * The single next action offered at each stage — mirrors the server's
 * transition table. The server re-checks every move regardless.
 */
export const NEXT_TARGET: Partial<Record<DeliveryStatus, AdvanceTarget>> = {
  offered: "accepted",
  accepted: "en_route_pickup",
  en_route_pickup: "at_pharmacy",
  at_pharmacy: "picked_up",
  picked_up: "out_for_delivery",
  out_for_delivery: "at_patient",
};

export const ADVANCE_LABELS: Record<AdvanceTarget, string> = {
  accepted: "Accept delivery",
  en_route_pickup: "Start pickup",
  at_pharmacy: "Reached pharmacy",
  picked_up: "Medicine picked",
  out_for_delivery: "Out for delivery",
  at_patient: "Reached patient",
};

export interface DeliveryPartner {
  id: string;
  user_id: string;
  full_name: string;
  phone: string;
  photo_url: string | null;
  city: string | null;
  vehicle_type: string | null;
  vehicle_number: string | null;
  vehicle_model: string | null;
  driving_licence_number: string | null;
  driving_licence_expiry: string | null;
  verification_status: PartnerStatus;
  verification_notes: string | null;
  suspension_reason: string | null;
  is_online: boolean;
  experience_years: number | null;
  rating: number;
  total_ratings: number;
  completed_deliveries: number;
  failed_deliveries: number;
  completion_rate: number;
  total_distance_km: number;
  total_earnings: number;
  current_latitude: number | null;
  current_longitude: number | null;
  location_updated_at: string | null;
  created_at: string;
}

export interface DeliveryEvent {
  status: DeliveryStatus;
  note: string;
  latitude: number | null;
  longitude: number | null;
  actor_type: string;
  created_at: string;
}

export interface DeliveryAssignment {
  id: string;
  order_id: string;
  partner_id: string;
  pharmacy_id: string;
  status: DeliveryStatus;
  pickup_address: string;
  pickup_latitude: number | null;
  pickup_longitude: number | null;
  drop_address: string;
  drop_latitude: number | null;
  drop_longitude: number | null;
  distance_km: number | null;
  eta_minutes: number | null;
  estimated_arrival_at: string | null;
  delivery_fee: number;
  partner_earning: number;
  /** Whether the code has been satisfied. The code itself is never returned. */
  otp_verified: boolean;
  otp_attempts: number;
  proof_photo_url: string | null;
  proof_signature_url: string | null;
  delivery_notes: string;
  proof_captured_at: string | null;
  offered_at: string | null;
  accepted_at: string | null;
  picked_up_at: string | null;
  delivered_at: string | null;
  failure_reason: string | null;
  created_at: string;
  events: DeliveryEvent[];
}

export interface AssignmentList {
  items: DeliveryAssignment[];
  total: number;
  skip: number;
  limit: number;
}

export interface DeliveryRoute {
  destination_label: string;
  destination_latitude: number | null;
  destination_longitude: number | null;
  heading_to: "pharmacy" | "patient";
  /** False means no Maps key — distance and ETA are local estimates. */
  maps_enabled: boolean;
  distance_km: number | null;
  eta_minutes: number | null;
  distance_text: string | null;
  duration_text: string | null;
  navigation_url: string | null;
  map_url: string | null;
}

export interface PartnerDashboard {
  partner_id: string;
  full_name: string;
  is_online: boolean;
  verification_status: PartnerStatus;
  deliveries_today: number;
  by_status: Record<string, number>;
  active_count: number;
  earnings_today: number;
  distance_today_km: number;
  delivered_today: number;
  average_delivery_minutes: number;
  completion_rate: number;
  rating: number;
  total_ratings: number;
  lifetime_deliveries: number;
  lifetime_distance_km: number;
  lifetime_earnings: number;
}

export interface FleetAnalytics {
  window_days: number;
  assignments: number;
  delivered: number;
  failed: number;
  cancelled: number;
  success_rate: number;
  total_distance_km: number;
  delivery_revenue: number;
  average_eta_minutes: number;
  by_status: Record<string, number>;
  top_partners: { partner: string; deliveries: number; distance_km: number }[];
  partners_approved: number;
  partners_online: number;
}

/** What a patient may see about their rider — deliberately narrow. */
export interface DeliveryTracking {
  assignment_id: string;
  status: DeliveryStatus;
  partner_name: string;
  partner_photo_url: string | null;
  partner_phone: string | null;
  partner_rating: number;
  vehicle_type: string | null;
  vehicle_number: string | null;
  current_latitude: number | null;
  current_longitude: number | null;
  /** Paired with the position so a stale fix reads as stale. */
  location_updated_at: string | null;
  eta_minutes: number | null;
  distance_km: number | null;
  estimated_arrival_at: string | null;
  otp_required: boolean;
  delivered_at: string | null;
  events: { status: string; note: string; created_at: string }[];
}
