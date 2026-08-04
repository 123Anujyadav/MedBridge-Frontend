// ============================================
// Pharmacy Owner Portal — MedBridge Platform
// Mirrors Backend/app/schemas/pharmacy_portal_api.py
// ============================================
import type { OrderEvent, OrderItem, OrderStatus } from "@/types/pharmacy";

/**
 * Counter actions, mapped server-side onto the shared order lifecycle:
 * accept→preparing, ready→packed, dispatch→out_for_delivery,
 * reject→cancelled (which returns the reserved stock).
 *
 * These are labels over the existing state machine, not new states — the
 * patient's tracking timeline is driven by the same transitions.
 */
export type OrderAction =
  | "accept"
  | "prepare"
  | "ready"
  | "pack"
  | "dispatch"
  | "deliver"
  | "reject";

export type ReviewOutcome = "approved" | "clarification_requested" | "rejected";

export const ORDER_ACTION_LABELS: Record<OrderAction, string> = {
  accept: "Accept order",
  prepare: "Start preparing",
  ready: "Mark ready",
  pack: "Mark packed",
  dispatch: "Out for delivery",
  deliver: "Mark delivered",
  reject: "Reject order",
};

/** Which action is offered next, given the order's current status. */
export const NEXT_ACTIONS: Record<OrderStatus, OrderAction[]> = {
  received: ["accept", "reject"],
  preparing: ["ready"],
  packed: ["dispatch"],
  out_for_delivery: ["deliver"],
  delivered: [],
  cancelled: [],
};

export interface PortalDashboard {
  pharmacy_id: string;
  pharmacy_name: string;
  orders_today: number;
  orders_by_status: Record<string, number>;
  orders_active: number;
  revenue_today: number;
  revenue_week: number;
  revenue_month: number;
  average_delivery_minutes: number;
  average_prep_minutes: number;
  orders_delivered_total: number;
  customer_rating: number;
  total_ratings: number;
  pending_prescriptions: number;
  stock_low: number;
  stock_critical: number;
  stock_out: number;
  stock_near_expiry: number;
  stock_expired: number;
  catalogue_size: number;
  inventory_value: number;
}

/**
 * An order as the counter sees it.
 *
 * Note the absence of patient name and phone — the store needs the delivery
 * address and the prescription, not the medical identity of the person.
 */
export interface PortalOrder {
  id: string;
  order_number: string;
  prescription_id: string;
  patient_id: string;
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
  is_cancellable: boolean;
  created_at: string;
  items: OrderItem[];
  events: OrderEvent[];
}

export interface PortalOrderList {
  items: PortalOrder[];
  total: number;
  skip: number;
  limit: number;
}

export interface PrescriberSummary {
  doctor_name: string;
  specialty: string | null;
  qualification: string | null;
  hospital: string | null;
  registration_number: string | null;
  experience_years: number | null;
  avatar_url: string | null;
}

export interface ReviewMedication {
  name: string;
  generic_name: string | null;
  brand_name: string | null;
  strength: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  food_instruction: string | null;
  route: string | null;
  quantity: number | null;
  special_instructions: string;
}

export interface ReviewFinding {
  category: string;
  severity: string;
  title: string;
  detail: string;
  recommendation: string;
  medications_involved: string[];
  source: string;
  evidence: { source: string; section: string; excerpt: string; reference: string }[];
}

export interface ReviewVerification {
  verdict: string;
  status: string;
  confidence: number;
  summary: string;
  unchecked_medications: string[];
  findings: ReviewFinding[];
}

export interface ExpiryAlert {
  medicine_name: string;
  batch_number: string | null;
  expiry_date: string | null;
  state: string;
}

/** Read-only dispensing pack. Nothing here is writable through the portal. */
export interface PrescriptionReviewPack {
  order_id: string;
  order_number: string;
  prescription_id: string;
  diagnosis: string;
  notes: string;
  issued_at: string;
  signed_at: string | null;
  pdf_url: string | null;
  prescription_image_url: string | null;
  prescriber: PrescriberSummary;
  patient_name: string;
  patient_allergies: string[];
  medications: ReviewMedication[];
  verification: ReviewVerification | null;
  expiry_alerts: ExpiryAlert[];
}

export interface PortalAlert {
  type: string;
  severity: "info" | "warning" | "critical";
  title: string;
  detail: string;
  reference_id: string;
  created_at: string;
}

export interface PortalAnalytics {
  window_days: number;
  orders: number;
  revenue: number;
  average_basket: number;
  fastest_moving: { medicine: string; units: number; revenue: number }[];
  slowest_moving: { medicine: string; units: number; revenue: number }[];
  peak_hours: { hour: number; orders: number }[];
  top_customers: { patient_id: string; orders: number; spend: number }[];
  inventory_value: number;
  expiry_loss: number;
  catalogue_size: number;
}

export interface PortalCustomer {
  patient_id: string;
  name: string;
  orders: number;
  total_spend: number;
  average_spend: number;
  last_order_at: string | null;
}
