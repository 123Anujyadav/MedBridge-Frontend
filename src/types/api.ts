// ============================================
// API Response Types — MedBridge Platform
// Maps 1:1 to backend Pydantic schemas
// ============================================

// ── Auth ──────────────────────────────────────
export interface TokenResponse {
  access_token: string;
  refresh_token: string;
  token_type: string;
}

export interface UserResponse {
  id: string;
  email: string;
  role: "patient" | "doctor" | "admin";
  is_active: boolean;
  is_verified: boolean;
  created_at?: string;
  updated_at?: string;
}

// ── Patient ───────────────────────────────────
export interface PatientResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  date_of_birth: string;
  gender: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  address?: string;
  city?: string;
  state?: string;
  emergency_contact: { name: string; phone: string; relationship: string };
  allergies: string[];
  chronic_conditions: string[];
  medications?: string[];
  insurance_provider?: string;
  insurance_number?: string;
  avatar_url?: string;
  health_score: number;
  consent_flags: Partial<{
    dataSharing: boolean;
    researchParticipation: boolean;
    emergencyAccess: boolean;
    aiProcessing: boolean;
  }>;
}

// ── Appointment ───────────────────────────────
export interface AppointmentResponse {
  id: string;
  patient_id: string;
  doctor_id: string;
  patient_name: string;
  doctor_name: string;
  specialty: string;
  hospital_name: string;
  date: string;
  time: string;
  duration: number;
  type: string;
  status: string;
  reason: string;
  notes: string;
  room_number?: string;
  video_call_link?: string;
  case_id?: string;
}

export interface AppointmentCreateRequest {
  doctor_id: string;
  specialty: string;
  hospital_name: string;
  date: string; // YYYY-MM-DD
  time: string; // HH:MM
  type: "in_person" | "video" | "phone" | "ai_triage";
  reason: string;
}

// ── Medication ────────────────────────────────
export interface MedicationResponse {
  id: string;
  name: string;
  generic_name?: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions: string;
  status: string;
  scheduled_times: string[];
  taken_doses: number;
  total_doses: number;
  start_date: string;
  end_date: string;
  side_effects: string[];
  interactions: string[];
}

// ── Prescription ──────────────────────────────
export interface PrescriptionResponse {
  id: string;
  case_id: string;
  patient_id: string;
  patient_name: string;
  doctor_id: string;
  doctor_name: string;
  diagnosis: string;
  notes: string;
  status: string;
  follow_up_date?: string;
  attachment_url?: string;
  medications: MedicationResponse[];
}

// ── Report ────────────────────────────────────
export interface ReportSummaryResponse {
  id: string;
  type: string;
  title: string;
  summary: string;
  date: string;
  status: string;
  ai_generated: boolean;
}

export interface ReportResponse extends ReportSummaryResponse {
  patient_id: string;
  case_id?: string | null;
  patient_name: string;
  content: string;
  doctor_name?: string;
  hospital_name?: string;
  file_url?: string;
  file_size?: string;
  ai_confidence_score?: number;
  tags: string[];
  vitals?: Record<string, unknown>;
}

// ── Dashboard ─────────────────────────────────
export interface PatientDashboardResponse {
  patient_id: string;
  health_score: number;
  upcoming_appointments: AppointmentResponse[];
  today_medications: MedicationResponse[];
  recent_reports: ReportSummaryResponse[];
  unread_notifications_count: number;
}

// ── Notification ──────────────────────────────
export interface NotificationResponse {
  id: string;
  user_id: string;
  type: string;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: string;
  action_url?: string;
  action_label?: string;
}

// ── Notification Center ───────────────────────
// Mirrors app/schemas/shared_api.py notification schemas.

export type NotificationCategory =
  | "case" | "ai" | "appointment" | "report" | "prescription"
  | "patient" | "system" | "security" | "general";

export interface NotificationCard {
  id: string;
  type: string;
  category: NotificationCategory;
  title: string;
  message: string;
  priority: string;
  timestamp: string;
  read: boolean;
  archived: boolean;
  action_url?: string | null;
  action_label?: string | null;
  case_id?: string | null;
  /** Short case id shown on the card. Null when there is no linked case. */
  case_short_id?: string | null;
  patient_id?: string | null;
  patient_name?: string | null;
  group_key?: string | null;
  read_at?: string | null;
  delivered_at?: string | null;
}

export interface NotificationGroup {
  group_key: string;
  category: string;
  label: string;
  count: number;
  highest_priority: string;
}

export interface NotificationCenterResponse {
  total: number;
  returned: number;
  skip: number;
  limit: number;
  has_more: boolean;
  unread_count: number;
  critical_count: number;
  groups: NotificationGroup[];
  notifications: NotificationCard[];
}

export interface NotificationQuery {
  category?: string;
  unread_only?: boolean;
  critical_only?: boolean;
  include_archived?: boolean;
  search?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

// ── Emergency ─────────────────────────────────
export interface EmergencyLocation {
  lat: number;
  lng: number;
  address: string;
}

export interface EmergencyPanicResponse {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_phone: string;
  location: EmergencyLocation;
  hospital_id?: string;
  hospital_name?: string;
  ambulance_dispatched: boolean;
  ambulance_id?: string;
  status: string;
  eta?: number;
}

// ── Settings ──────────────────────────────────
export interface SettingsResponse {
  theme: string;
  notifications_enabled: boolean;
  email_notifications: boolean;
  marketing_emails: boolean;
}

export interface SettingsUpdateRequest {
  theme?: "light" | "dark";
  notifications_enabled?: boolean;
  email_notifications?: boolean;
  marketing_emails?: boolean;
}

// ── File Upload ───────────────────────────────
export interface UploadResponse {
  filename: string;
  file_url: string;
  content_type: string;
  size_bytes: number;
}

// ── Consent ───────────────────────────────────
export interface ConsentFlagsRequest {
  dataSharing?: boolean;
  researchParticipation?: boolean;
  emergencyAccess?: boolean;
  aiProcessing?: boolean;
}

// ── Patient Update ────────────────────────────
export interface PatientUpdateRequest {
  first_name?: string;
  last_name?: string;
  phone?: string;
  date_of_birth?: string;
  gender?: string;
  blood_type?: string;
  height?: number;
  weight?: number;
  address?: string;
  city?: string;
  state?: string;
  emergency_contact?: { name: string; phone: string; relationship: string };
  allergies?: string[];
  chronic_conditions?: string[];
  insurance_provider?: string;
  insurance_number?: string;
  avatar_url?: string;
}

// ── API Error ─────────────────────────────────
export interface ApiError {
  detail: string;
}

// ============================================
// Doctor Portal
// Mirrors app/schemas/doctor_api.py
// ============================================

export interface DoctorResponse {
  id: string;
  first_name: string;
  last_name: string;
  phone: string;
  specialty: string;
  sub_specialties: string[];
  hospital_id?: string | null;
  hospital_name?: string | null;
  license_number: string;
  years_of_experience: number;
  availability: "available" | "busy" | "offline" | "on_leave";
  next_available?: string | null;
  consultation_fee: number;
  education: string[];
  certifications: string[];
  languages: string[];
  avatar_url?: string | null;
  bio?: string | null;
  rating: number;
  total_patients: number;
  total_cases: number;
  verification_status: string;
  verified_date?: string | null;
  is_verified?: boolean;
}

export interface CaseResponse {
  id: string;
  patient_id: string;
  patient_name: string;
  patient_avatar_url?: string | null;
  patient_age: number;
  patient_gender: string;
  doctor_id?: string | null;
  doctor_name?: string | null;
  specialty: string;
  symptom_summary: string;
  urgency_level: "low" | "medium" | "high" | "critical";
  status: string;
  ai_extracted_symptoms: string[];
  ai_specialty_recommendation?: string | null;
  ai_confidence_score: number;
  attachments: unknown[];
  patient_history?: string | null;
  notes: string;
}

export interface DoctorDashboardResponse {
  doctor_id: string;
  total_patients: number;
  total_consultations_week: number;
  rating: number;
  today_appointments: AppointmentResponse[];
  pending_cases: CaseResponse[];
}

export interface CaseTrendPoint {
  month: string;
  period: string;
  cases: number;
  resolved: number;
}

export interface SpecialtyDistributionPoint {
  name: string;
  value: number;
}

export interface DoctorAnalyticsResponse {
  age_distribution: Record<string, number>;
  status_distribution: Record<string, number>;
  adherence_rate: number;
  /** Monthly case volume derived from real case rows. Empty when none exist. */
  case_trend: CaseTrendPoint[];
  /** Case counts per specialty. Empty when there are no cases. */
  specialty_distribution: SpecialtyDistributionPoint[];

  // Enterprise analytics. Additive — the legacy fields above are unchanged, so
  // existing consumers keep working. Optional because a cached response from
  // before this shipped will not carry them.
  range?: AnalyticsRange;
  summary?: AnalyticsSummary;
  workload?: AnalyticsWorkload;
  patients?: AnalyticsPatients;
  ai?: AnalyticsAI;
  reports?: AnalyticsReports;
  prescriptions?: AnalyticsPrescriptions;
  appointments?: AnalyticsAppointments;
  activity?: AnalyticsActivityEvent[];
  /** Metrics the data model cannot support, with the reason for each. */
  unavailable_metrics?: { metric: string; reason: string }[];
}

export interface UpdateAvailabilityRequest {
  availability: "available" | "busy" | "offline" | "on_leave";
  next_available?: string | null;
}

export interface UpdateCaseNotesRequest {
  notes: string;
}

export interface DiagnoseCaseRequest {
  diagnosis: string;
  notes?: string;
}

export interface CreateMedicationItem {
  name: string;
  generic_name?: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions?: string;
  scheduled_times?: string[];
  start_date: string;
  end_date: string;
  side_effects?: string[];
  interactions?: string[];
}

export interface CreatePrescriptionRequest {
  case_id: string;
  patient_id: string;
  diagnosis: string;
  notes?: string;
  follow_up_date?: string | null;
  attachment_url?: string | null;
  medications: CreateMedicationItem[];
}

export interface CreateReportRequest {
  patient_id: string;
  patient_name: string;
  type: string;
  title: string;
  summary?: string;
  content: string;
  hospital_name?: string | null;
  date: string;
  file_url?: string | null;
  file_size?: string | null;
  ai_generated?: boolean;
  ai_confidence_score?: number | null;
  tags?: string[];
  vitals?: Record<string, unknown> | null;
}

// ── AI-assisted clinical report workflow ──────
// The doctor reviews a pre-filled draft instead of authoring one from scratch.

export interface ReportDraftCandidate {
  case_id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  specialty: string;
  urgency_level: string;
  status: string;
  chief_complaint: string;
  has_ai_intake: boolean;
  created_at?: string | null;
}

export interface DraftAttachment {
  report_id: string;
  title: string;
  type: string;
  date: string;
  summary: string;
  file_url?: string | null;
}

export interface AIReportDraftResponse {
  // Auto-filled — never typed by the doctor
  case_id: string;
  patient_id: string;
  patient_name: string;
  patient_age: number;
  patient_gender: string;
  doctor_name: string;
  hospital_name: string;
  date: string;
  title: string;
  chief_complaint: string;
  ai_summary: string;
  symptoms: string[];
  clinical_findings: string[];
  previous_history: string[];
  uploaded_reports: DraftAttachment[];
  urgency_level: string;
  red_flags: string[];
  ai_confidence_score?: number | null;

  // Doctor-editable, pre-seeded
  diagnosis: string;
  clinical_notes: string;
  prescription: string;
  follow_up_instructions: string;
  recommendations: string[];
  recommended_tests: string[];

  // Provenance
  ai_generated: boolean;
  draft_source: string;
  warnings: string[];
}

export interface IssueAIReportRequest {
  case_id: string;
  title: string;
  summary?: string;
  diagnosis: string;
  clinical_notes?: string;
  prescription?: string;
  follow_up_instructions?: string;
  recommendations?: string[];
  recommended_tests?: string[];
  follow_up_date?: string | null;
  ai_generated?: boolean;
  ai_confidence_score?: number | null;
}

// ── Clinical Review Workspace ─────────────────
// Mirrors app/schemas/clinical_review.py. Every field is optional or defaults
// to empty so the workspace can render "not recorded" instead of a placeholder.

export interface PatientOverview {
  patient_id: string;
  patient_name: string;
  age?: number | null;
  gender?: string | null;
  blood_group?: string | null;
  height_cm?: number | null;
  weight_kg?: number | null;
  bmi?: number | null;
  bmi_category?: string | null;
  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  previous_visits: number;
  appointment_date?: string | null;
  appointment_status?: string | null;
  assigned_doctor?: string | null;
  assigned_doctor_specialty?: string | null;
}

export interface SymptomTimelineEntry {
  name: string;
  severity?: string | null;
  duration?: string | null;
  body_part?: string | null;
}

export interface ConfidenceReading {
  score: number;
  percentage: number;
  level: string;
}

export interface AIClinicalAnalysis {
  chief_complaint: string;
  ai_summary: string;
  extracted_symptoms: string[];
  symptom_timeline: SymptomTimelineEntry[];
  possible_causes: string[];
  severity?: string | null;
  onset?: string | null;
  duration?: string | null;
  urgency_level?: string | null;
  confidence?: ConfidenceReading | null;
  recommended_specialist?: string | null;
  recommendation_reason?: string | null;
  emergency_indicators: string[];
  language_detected?: string | null;
  conversation_summary: string;
  missing_information: string[];
  has_ai_intake: boolean;
}

export interface EvidenceDocument {
  report_id: string;
  title: string;
  type: string;
  category: string;
  date: string;
  summary: string;
  status: string;
  doctor_name?: string | null;
  file_url?: string | null;
  downloadable: boolean;
  ai_generated: boolean;
  ai_confidence_score?: number | null;
}

export interface CaseAttachment {
  name: string;
  type: string;
  url?: string | null;
}

export interface MedicationLine {
  name: string;
  generic_name?: string | null;
  dosage: string;
  frequency: string;
  duration: string;
  special_instructions: string;
  status: string;
  side_effects: string[];
  interactions: string[];
}

export interface PrescriptionSummary {
  prescription_id: string;
  diagnosis: string;
  notes: string;
  status: string;
  doctor_name: string;
  follow_up_date?: string | null;
  created_at?: string | null;
  medications: MedicationLine[];
}

export interface MedicalEvidence {
  uploaded_reports: EvidenceDocument[];
  lab_reports: EvidenceDocument[];
  imaging_and_scans: EvidenceDocument[];
  ai_report_analysis: EvidenceDocument[];
  historical_reports: EvidenceDocument[];
  case_attachments: CaseAttachment[];
  doctor_notes: string;
  previous_prescriptions: PrescriptionSummary[];
}

export interface AISuggestions {
  differential_diagnoses: string[];
  drug_interaction_warnings: string[];
  red_flag_symptoms: string[];
  suggested_lab_tests: string[];
  suggested_imaging: string[];
  clinical_guideline_summary: string;
  possible_contraindications: string[];
  relevant_medical_history: string[];
  medication_alerts: string[];
  source: string;
  generated: boolean;
  notes: string[];
}

export interface TimelineEvent {
  key: string;
  label: string;
  status: string;
  timestamp?: string | null;
  detail: string;
}

export interface DecisionComparison {
  patient_input: string;
  patient_input_source: string;
  ai_interpretation: string;
  ai_interpretation_source: string;
  doctor_decision: string;
  doctor_decision_source: string;
  doctor_has_decided: boolean;
}

export interface ClinicalReviewResponse {
  report_id: string;
  report_title: string;
  report_status: string;
  report_content: string;
  report_file_url?: string | null;
  case_id?: string | null;
  case_status?: string | null;
  patient_overview: PatientOverview;
  ai_analysis: AIClinicalAnalysis;
  medical_evidence: MedicalEvidence;
  ai_suggestions: AISuggestions;
  timeline: TimelineEvent[];
  comparison: DecisionComparison;
  data_gaps: string[];
}

// ── Doctor report cards ───────────────────────
// Mirrors app/schemas/doctor_api.py::DoctorReportCard. A strict superset of
// ReportResponse; optional fields are hidden by the card when absent.

export interface ReportCardIndicator {
  label: string;
  tone: "success" | "warning" | "error" | "info" | "neutral";
}

export interface DoctorReportCard extends ReportResponse {
  patient_age?: number | null;
  patient_gender?: string | null;
  patient_short_id: string;
  appointment_date?: string | null;
  assigned_doctor?: string | null;

  case_status?: string | null;
  chief_complaint?: string | null;
  extracted_symptoms: string[];
  specialty?: string | null;
  urgency_level?: string | null;
  ai_confidence?: ConfidenceReading | null;
  language_detected?: string | null;
  case_created_at?: string | null;
  case_updated_at?: string | null;

  allergies: string[];
  chronic_conditions: string[];
  current_medications: string[];
  uploaded_reports_count: number;
  previous_visits_count: number;
  previous_prescriptions_count: number;

  ai_summary: string;
  indicators: ReportCardIndicator[];
  flagged_for_follow_up: boolean;
}

// ── Bulk report actions ───────────────────────
// Mirrors app/schemas/doctor_api.py. Only clinically safe operations exist here
// by design — no bulk prescribing, no bulk diagnosis finalisation.

export type BulkReportAction =
  | "approve"
  | "reject"
  | "assign_specialist"
  | "flag_follow_up"
  | "archive"
  | "mark_reviewed"
  | "remove_review_flag";

export interface BulkReportActionRequest {
  action: BulkReportAction;
  report_ids: string[];
  reason?: string | null;
  target_doctor_id?: string | null;
}

export interface BulkItemOutcome {
  report_id: string;
  outcome: "completed" | "skipped" | "failed";
  detail: string;
}

export interface BulkJobStatus {
  job_id: string;
  action: string;
  status: "queued" | "running" | "completed";
  total: number;
  completed: number;
  skipped: number;
  failed: number;
  items: BulkItemOutcome[];
  started_at?: string | null;
  finished_at?: string | null;
  message: string;
}

export interface BulkSelectionResponse {
  report_ids: string[];
  total: number;
}

// ── Case timeline / audit trail ───────────────
// Mirrors app/schemas/shared_api.py::CaseTimelineResponse.

export type TimelineActorType = "patient" | "doctor" | "ai" | "admin" | "system";

export interface CaseTimelineEvent {
  id: string;
  event_type: string;
  category: string;
  title: string;
  description: string;
  timestamp: string;
  actor_type: TimelineActorType;
  actor_label: string;
  actor_name: string;
  field_changed?: string | null;
  previous_value?: string | null;
  new_value?: string | null;
  reason?: string | null;
  /** `recorded` (attributable, with before/after) or `derived` (from a row). */
  source: "recorded" | "derived";
}

export interface CaseTimelineResponse {
  case_id: string;
  total: number;
  returned: number;
  skip: number;
  limit: number;
  has_more: boolean;
  events: CaseTimelineEvent[];
}

export interface CaseTimelineQuery {
  case_id: string;
  category?: string[];
  search?: string;
  date_from?: string;
  date_to?: string;
  skip?: number;
  limit?: number;
}

// ── Clinical document versions ────────────────
// Mirrors app/schemas/doctor_api.py version schemas.

export interface ReportVersionSummary {
  version_number: number;
  created_at?: string | null;
  author_name: string;
  author_type: "doctor" | "ai" | "system";
  status: string;
  description: string;
  file_url?: string | null;
  file_size?: string | null;
  content_hash: string;
  approval_note?: string | null;
  rejection_reason?: string | null;
  approved_by_name?: string | null;
  approved_at?: string | null;
  restored_from_version?: number | null;
  is_latest: boolean;
  /** False for historical versions — the database rejects changes to them. */
  is_editable: boolean;
}

export interface ReportVersionListResponse {
  report_id: string;
  report_status: string;
  current_version: number;
  total: number;
  skip: number;
  limit: number;
  has_more: boolean;
  versions: ReportVersionSummary[];
}

export interface DiffSegment {
  type: "equal" | "added" | "removed";
  text: string;
}

export interface VersionFieldDiff {
  field: string;
  label: string;
  change: "added" | "removed" | "modified";
  previous_value: string;
  new_value: string;
  added_items: string[];
  removed_items: string[];
  segments: DiffSegment[];
}

export interface VersionComparisonResponse {
  report_id: string;
  version_a: ReportVersionSummary;
  version_b: ReportVersionSummary;
  changed_by_type: "doctor" | "ai" | "system";
  changed_by_name: string;
  identical: boolean;
  fields: VersionFieldDiff[];
  added_count: number;
  removed_count: number;
  modified_count: number;
}

export interface CreateReportVersionRequest {
  title?: string;
  chief_complaint?: string;
  summary?: string;
  content?: string;
  diagnosis?: string;
  clinical_notes?: string;
  prescription?: string;
  follow_up_instructions?: string;
  ai_findings?: string;
  symptoms?: string[];
  recommended_tests?: string[];
  recommendations?: string[];
  author_type?: "doctor" | "ai";
  status?: string;
  description?: string;
  approval_note?: string;
  rejection_reason?: string;
  restore_from_version?: number;
}

// ── Doctor analytics ──────────────────────────
// Mirrors app/services/doctor_analytics.py. A null metric means "not measured";
// it must never be rendered as 0.

export type AnalyticsRangePreset = "today" | "yesterday" | "7d" | "30d" | "90d" | "custom";

export interface NamedCount {
  name: string;
  value: number;
}

export interface AnalyticsRange {
  preset: string;
  date_from: string;
  date_to: string;
}

export interface AnalyticsSummary {
  todays_appointments: number;
  pending_ai_reviews: number;
  completed_consultations: number;
  pending_reports: number;
  critical_cases: number;
  follow_up_cases: number;
  unread_notifications: number;
  patients_seen_today: number;
}

export interface AnalyticsWorkload {
  cases_opened: number;
  cases_completed: number;
  pending_cases: number;
  avg_consultation_minutes: number | null;
  avg_review_minutes: number | null;
  cases_by_specialty: NamedCount[];
  cases_by_urgency: NamedCount[];
}

export interface AnalyticsPatients {
  new_patients: number;
  returning_patients: number;
  age_distribution: NamedCount[];
  gender_distribution: NamedCount[];
  common_symptoms: NamedCount[];
  common_diagnoses: NamedCount[];
  diagnoses_source: string;
  most_requested_specialties: NamedCount[];
}

export interface AnalyticsAI {
  analyses_generated: number;
  suggestions_reviewed: number;
  suggestions_accepted: number;
  suggestions_modified: number;
  suggestions_rejected: number;
  avg_confidence_percent: number | null;
  avg_processing_time_seconds: number | null;
}

export interface AnalyticsReports {
  generated: number;
  approved: number;
  rejected: number;
  pending: number;
  shared_with_patients: number;
  archived: number;
  by_status: NamedCount[];
  avg_approval_minutes: number | null;
}

export interface AnalyticsPrescriptions {
  issued: number;
  follow_up_prescriptions: number;
  top_medications: NamedCount[];
  medication_categories: NamedCount[];
  trend: { period: string; month: string; value: number }[];
}

export interface AnalyticsAppointments {
  today: number;
  upcoming: number;
  completed: number;
  cancelled: number;
  no_show: number;
  by_status: NamedCount[];
}

export interface AnalyticsActivityEvent {
  id: string;
  event_type: string;
  category: string;
  title: string;
  description: string;
  timestamp: string;
  actor_type: string;
  actor_label: string;
  actor_name: string;
  case_id?: string | null;
}

export interface AnalyticsQuery {
  range?: AnalyticsRangePreset;
  date_from?: string;
  date_to?: string;
}

export interface ReportListFilters {
  status?: string;
  urgency?: string;
  flagged?: boolean;
}

export interface SaveConsultationRequest {
  case_id: string;
  clinical_notes?: string;
  diagnosis?: string | null;
  complete_case?: boolean;
}

export interface SaveConsultationResponse {
  case_id: string;
  status: string;
  notes: string;
  saved_at: string;
  timeline: TimelineEvent[];
}

export interface ApproveAISummaryRequest {
  case_id: string;
  summary: string;
}

export interface ReviewActionResponse {
  case_id: string;
  status: string;
  approved_summary: string;
  approved_at: string;
}

// ============================================
// Admin Portal
// Mirrors app/schemas/admin_api.py
// ============================================

export interface UserStatusUpdateRequest {
  is_active: boolean;
}

export interface VerifyDoctorRequest {
  verification_status: "verified" | "rejected" | "under_review";
}

export interface HospitalCoordinates {
  lat: number;
  lng: number;
}

export interface CreateHospitalRequest {
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email?: string;
  coordinates?: HospitalCoordinates;
  services?: string[];
  emergency_capacity?: "available" | "limited" | "full";
  total_beds?: number;
  available_beds?: number;
  ambulance_count?: number;
  emergency_services?: boolean;
}

export interface HospitalVerificationRequest {
  verification_status: "verified" | "pending" | "rejected" | "under_review";
}

export interface HospitalResponse {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  services: string[];
  ambulance_linked: boolean;
  ambulance_count: number;
  emergency_capacity: string;
  total_doctors: number;
  total_beds: number;
  available_beds: number;
  rating: number;
  coordinates: Record<string, number>;
  logo_url?: string | null;
  verification_status: string;
}

export interface AuditLogResponse {
  id: string;
  user_id?: string | null;
  user_name: string;
  user_role: string;
  action: string;
  resource: string;
  resource_id: string;
  status: string;
  details?: string | null;
  ip_address?: string | null;
  created_at: string;
}

export interface AdminDashboardResponse {
  total_users: number;
  total_doctors: number;
  total_hospitals: number;
  active_emergencies: number;
  system_status: string;
  total_patients: number;
  total_cases: number;
  active_patients: number;
  active_doctors: number;
  active_hospitals: number;
  pending_doctor_verifications: number;
}

export interface AdminAnalyticsResponse {
  users_by_role: Record<string, number>;
  hospitals_by_capacity: Record<string, number>;
  emergency_success_ratio: number;
  ai_reports_summary?: Record<string, unknown> | null;
  avg_case_resolution_hours: number;
  /**
   * Mean self-reported AI confidence (%) across generated reports.
   * Not an accuracy measurement — there is no ground-truth evaluation pipeline.
   */
  avg_ai_confidence: number;
}

export interface ServiceStatus {
  status: string;
  latency_ms?: number | null;
  error?: string | null;
}

export interface SystemMonitorResponse {
  database: ServiceStatus;
  redis: ServiceStatus;
  celery: ServiceStatus;
  cpu_usage: number;
  memory_usage: number;
}


// ============================================
// Vitals & Adherence
// Mirrors app/schemas/vitals_api.py
// Every value originates from the database; empty arrays mean
// "no readings recorded", never placeholder health data.
// ============================================

export type VitalType =
  | "blood_pressure_systolic"
  | "blood_pressure_diastolic"
  | "heart_rate"
  | "temperature"
  | "oxygen_saturation"
  | "weight"
  | "height"
  | "blood_glucose"
  | "respiratory_rate";

export interface VitalReadingResponse {
  id: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  status: "normal" | "warning" | "critical";
}

export interface VitalReadingCreate {
  type: VitalType;
  value: number;
  unit: string;
  timestamp?: string;
}

/** One day on the vitals chart. Measures are null when not recorded that day. */
export interface VitalSeriesPoint {
  day: string;
  date: string;
  systolic?: number | null;
  diastolic?: number | null;
  heartRate?: number | null;
  temperature?: number | null;
  oxygenSaturation?: number | null;
  weight?: number | null;
  bmi?: number | null;
  glucose?: number | null;
}

export interface AdherencePoint {
  day: string;
  date: string;
  adherence: number;
  doses_taken: number;
  doses_expected: number;
}

export interface VitalsDashboardResponse {
  series: VitalSeriesPoint[];
  adherence: AdherencePoint[];
  has_vitals_data: boolean;
  has_adherence_data: boolean;
  latest: Record<string, number>;
  days: number;
}
