// ============================================
// Pharmacy Administration — MedBridge Platform
// Mirrors Backend/app/schemas/pharmacy_admin_api.py
// ============================================

export type VerificationStatus =
  | "pending"
  | "submitted"
  | "document_review"
  | "approved"
  | "rejected"
  | "suspended";

export type DocumentType =
  | "drug_license"
  | "gst_certificate"
  | "pan_card"
  | "business_registration"
  | "store_image"
  | "owner_id"
  | "pharmacist_certificate"
  | "digital_signature";

export type DocumentStatus =
  | "uploaded"
  | "under_review"
  | "approved"
  | "rejected"
  | "expired";

/** Admin-facing stock health. Richer than the patient-facing `availability`. */
export type StockState =
  | "available"
  | "low"
  | "critical"
  | "out_of_stock"
  | "expired"
  | "near_expiry";

/**
 * Which verification states may follow which — mirrors
 * `VERIFICATION_TRANSITIONS` on the server.
 *
 * Held here so the UI can offer only the actions that will actually succeed;
 * the server remains the authority and re-checks every transition.
 */
export const VERIFICATION_TRANSITIONS: Record<VerificationStatus, VerificationStatus[]> = {
  pending: ["submitted", "rejected"],
  submitted: ["document_review", "rejected"],
  document_review: ["approved", "rejected"],
  approved: ["suspended", "rejected"],
  suspended: ["approved", "rejected"],
  rejected: ["pending"],
};

export const VERIFICATION_LABELS: Record<VerificationStatus, string> = {
  pending: "Pending",
  submitted: "Submitted",
  document_review: "Document review",
  approved: "Approved",
  rejected: "Rejected",
  suspended: "Suspended",
};

export const DOCUMENT_TYPE_LABELS: Record<DocumentType, string> = {
  drug_license: "Drug licence",
  gst_certificate: "GST certificate",
  pan_card: "PAN card",
  business_registration: "Business registration",
  store_image: "Store image",
  owner_id: "Owner ID",
  pharmacist_certificate: "Pharmacist certificate",
  digital_signature: "Digital signature",
};

export const STOCK_STATE_LABELS: Record<StockState, string> = {
  available: "Available",
  low: "Low stock",
  critical: "Critical",
  out_of_stock: "Out of stock",
  expired: "Expired",
  near_expiry: "Near expiry",
};

export interface PharmacyDocument {
  id: string;
  doc_type: DocumentType;
  file_url: string;
  file_name: string;
  document_number: string | null;
  issued_at: string | null;
  expires_at: string | null;
  status: DocumentStatus;
  review_notes: string | null;
  reviewed_at: string | null;
  is_expired: boolean;
  days_to_expiry: number | null;
  created_at: string;
}

export interface VerificationEvent {
  from_status: string | null;
  to_status: string;
  note: string;
  actor_name: string;
  created_at: string;
}

/**
 * Note the absence of bank/UPI fields.
 *
 * They are stored and auditable server-side but never serialised over the API,
 * so there is nothing to model here — the console does not need settlement
 * credentials to operate.
 */
export interface AdminPharmacy {
  id: string;
  name: string;
  address: string;
  city: string | null;
  postal_code: string | null;
  phone: string | null;
  latitude: number;
  longitude: number;
  owner_name: string | null;
  business_name: string | null;
  gst_number: string | null;
  drug_license_number: string | null;
  drug_license_expiry: string | null;
  email: string | null;
  whatsapp: string | null;
  emergency_phone: string | null;
  logo_url: string | null;
  banner_url: string | null;
  store_images: string[];
  rating: number;
  total_ratings: number;
  is_partner: boolean;
  is_active: boolean;
  is_24x7: boolean;
  opens_at: string | null;
  closes_at: string | null;
  holiday_dates: string[];
  delivers: boolean;
  express_delivery: boolean;
  express_delivery_radius_km: number | null;
  pickup_available: boolean;
  delivery_radius_km: number;
  delivery_fee: number;
  free_delivery_above: number | null;
  min_order_value: number;
  avg_prep_minutes: number;
  platform_commission_percent: number;
  verification_status: VerificationStatus;
  verification_notes: string | null;
  verified_at: string | null;
  rejection_reason: string | null;
  suspended_at: string | null;
  suspension_reason: string | null;
  /** Whether patient search will currently dispense from here. */
  can_fulfil: boolean;
  created_at: string;
  updated_at: string;
}

export interface AdminPharmacyDetail extends AdminPharmacy {
  documents: PharmacyDocument[];
  verification_events: VerificationEvent[];
}

export interface AdminInventoryItem {
  id: string;
  pharmacy_id: string;
  sku: string;
  rxcui: string | null;
  medicine_name: string;
  generic_name: string | null;
  brand_name: string | null;
  manufacturer: string | null;
  composition: string | null;
  strength: string | null;
  form: string | null;
  pack_size: string | null;
  drug_schedule: string | null;
  category: string | null;
  barcode: string | null;
  storage_instructions: string | null;
  batch_number: string | null;
  manufacturing_date: string | null;
  expiry_date: string | null;
  is_generic: boolean;
  requires_prescription: boolean;
  mrp: number;
  selling_price: number;
  discount_percent: number;
  gst_percent: number;
  stock_quantity: number;
  low_stock_threshold: number;
  min_stock: number | null;
  max_stock: number | null;
  reorder_level: number | null;
  restock_expected_at: string | null;
  stock_synced_at: string | null;
  availability: string;
  stock_state: StockState;
  inventory_value: number;
  created_at: string;
  updated_at: string;
}

export interface Paged<T> {
  items: T[];
  total: number;
  skip: number;
  limit: number;
}

export interface PharmacyAnalytics {
  window_days: number;
  orders_total: number;
  orders_delivered: number;
  orders_cancelled: number;
  revenue_total: number;
  revenue_delivered: number;
  average_delivery_minutes: number;
  conversion_rate: number;
  orders_by_status: Record<string, number>;
  top_pharmacies: { pharmacy: string; orders: number; revenue: number }[];
  top_cities: { city: string; pharmacies: number }[];
  top_medicines: { medicine: string; units: number; revenue: number }[];
  inventory_value: number;
  pharmacies_total: number;
  pharmacies_partner: number;
}

export interface AuditEntry {
  id: string;
  user_name: string;
  user_role: string;
  action: string;
  resource: string;
  resource_id: string;
  ip_address: string;
  details: string;
  field_changed: string | null;
  previous_value: string | null;
  new_value: string | null;
  created_at: string;
}

export interface ImportResult {
  created: number;
  updated: number;
  errors: { line: number; error: string }[];
}

export interface PharmacyListFilters {
  search?: string;
  verification_status?: VerificationStatus;
  is_active?: boolean;
  is_partner?: boolean;
  city?: string;
  skip?: number;
  limit?: number;
}

export interface InventoryFilters {
  search?: string;
  pharmacy_id?: string;
  category?: string;
  manufacturer?: string;
  stock_state?: StockState;
  min_price?: number;
  max_price?: number;
  skip?: number;
  limit?: number;
}

// ── owner provisioning ───────────────────────────────────────────────────

export interface PharmacyOwner {
  id: string;
  email: string;
  role: string;
  is_active: boolean;
  is_verified: boolean;
  pharmacy_id: string | null;
  created_at: string;
  updated_at: string;
}

/**
 * Returned once, by the endpoints that mint a credential.
 *
 * The plaintext exists only in this response — the server stores a hash and
 * the audit trail records that a reset happened without the value, so it
 * cannot be retrieved again.
 */
export interface OwnerCredential {
  owner: PharmacyOwner;
  temporary_password: string;
  message: string;
}

export interface OwnerInvitation {
  user_id: string;
  email: string;
  pharmacy_name: string;
  temporary_password: string;
  portal_url: string;
  delivery: string;
  /** False today: the platform's email task is a stub with no mail server. */
  email_sent: boolean;
}
