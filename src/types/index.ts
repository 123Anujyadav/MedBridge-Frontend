// ============================================
// MedBridge — Domain Types
// AI-based Patient-Doctor Reporting & Care System
// ============================================

/**
 * `pharmacy` is a verified partner operating their own store. It joins the
 * existing roles rather than starting a second identity system — the same
 * login, the same token, the same route guards.
 */
export type UserRole =
  | "patient"
  | "doctor"
  | "admin"
  | "pharmacy"
  | "delivery_partner";

export type UrgencyLevel = "low" | "medium" | "high" | "critical";

export type CaseStatus =
  | "intake"
  | "ai_processing"
  | "routed"
  | "in_consultation"
  | "prescribed"
  | "report_generated"
  | "completed"
  | "archived";

export type AppointmentStatus =
  | "scheduled"
  | "confirmed"
  | "in_progress"
  | "completed"
  | "cancelled"
  | "no_show";

export type PrescriptionStatus =
  | "draft"
  | "ai_parsing"
  | "parsed"
  | "verified"
  | "active"
  | "completed"
  | "cancelled";

export type MedicationStatus = "pending" | "taken" | "missed" | "snoozed" | "active";

export type ReportType =
  | "lab_result"
  | "ai_report"
  | "prescription"
  | "imaging"
  | "discharge_summary"
  | "vital_signs"
  | "allergy_test"
  | "vaccination_record";

export type NotificationType =
  | "appointment"
  | "medication"
  | "report"
  | "emergency"
  | "system"
  | "prescription"
  | "case_update";

export type VerificationStatus =
  | "verified"
  | "pending"
  | "rejected"
  | "expired"
  | "under_review";

// ---- Entities ----

export interface Patient {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  dateOfBirth: string;
  gender: "male" | "female" | "other";
  bloodType: string;
  height: number; // cm
  weight: number; // kg
  address: string;
  city: string;
  state: string;
  emergencyContact: {
    name: string;
    phone: string;
    relationship: string;
  };
  allergies: string[];
  chronicConditions: string[];
  medications: string[];
  insuranceProvider: string;
  insuranceNumber: string;
  avatarUrl: string;
  healthScore: number;
  registeredDate: string;
  lastVisit: string;
  consentFlags: {
    dataSharing: boolean;
    researchParticipation: boolean;
    emergencyAccess: boolean;
    aiProcessing: boolean;
  };
}

export interface Doctor {
  id: string;
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  specialty: string;
  subSpecialties: string[];
  hospitalId: string;
  hospitalName: string;
  licenseNumber: string;
  yearsOfExperience: number;
  rating: number;
  totalPatients: number;
  totalCases: number;
  availability: "available" | "busy" | "offline" | "on_leave";
  nextAvailable: string;
  consultationFee: number;
  education: string[];
  certifications: string[];
  languages: string[];
  avatarUrl: string;
  verificationStatus: VerificationStatus;
  verifiedDate: string;
  bio: string;
}

export interface Hospital {
  id: string;
  name: string;
  address: string;
  city: string;
  state: string;
  phone: string;
  email: string;
  services: string[];
  ambulanceLinked: boolean;
  ambulanceCount: number;
  emergencyCapacity: "available" | "limited" | "full";
  totalDoctors: number;
  totalBeds: number;
  availableBeds: number;
  rating: number;
  distance: number; // km
  coordinates: { lat: number; lng: number };
  logoUrl: string;
  verificationStatus: VerificationStatus;
}

export interface Symptom {
  id: string;
  name: string;
  severity: "mild" | "moderate" | "severe";
  duration: string;
  bodyPart?: string;
}

export interface Case {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatarUrl: string;
  patientAge: number;
  patientGender: string;
  doctorId: string | null;
  doctorName: string | null;
  specialty: string;
  symptoms: Symptom[];
  symptomSummary: string;
  urgencyLevel: UrgencyLevel;
  status: CaseStatus;
  aiExtractedSymptoms: string[];
  aiSpecialtyRecommendation: string;
  aiConfidenceScore: number;
  attachments: { name: string; type: string; url: string }[];
  patientHistory: string;
  createdAt: string;
  updatedAt: string;
  assignedAt: string | null;
  completedAt: string | null;
  notes: string;
}

export interface Medication {
  id: string;
  name: string;
  genericName: string;
  dosage: string;
  frequency: string;
  duration: string;
  specialInstructions: string;
  status: MedicationStatus;
  scheduledTimes: string[];
  takenDoses: number;
  totalDoses: number;
  startDate: string;
  endDate: string;
  sideEffects: string[];
  interactions: string[];
}

export interface Prescription {
  id: string;
  caseId: string;
  patientId: string;
  patientName: string;
  doctorId: string;
  doctorName: string;
  diagnosis: string;
  notes: string;
  medications: Medication[];
  status: PrescriptionStatus;
  aiParsed: boolean;
  aiParseConfidence: number;
  createdAt: string;
  verifiedAt: string | null;
  followUpDate: string | null;
  attachmentUrl?: string;
}

export interface Appointment {
  id: string;
  patientId: string;
  patientName: string;
  patientAvatarUrl: string;
  doctorId: string;
  doctorName: string;
  doctorAvatarUrl: string;
  specialty: string;
  hospitalName: string;
  date: string;
  time: string;
  duration: number; // minutes
  type: "in_person" | "video" | "phone" | "ai_triage";
  status: AppointmentStatus;
  reason: string;
  notes: string;
  roomNumber?: string;
  videoCallLink?: string;
}

export interface Report {
  id: string;
  patientId: string;
  patientName: string;
  type: ReportType;
  title: string;
  summary: string;
  content: string;
  doctorName: string | null;
  hospitalName: string | null;
  date: string;
  status: "pending" | "ready" | "reviewed" | "shared";
  fileUrl?: string;
  fileSize?: string;
  aiGenerated: boolean;
  aiConfidenceScore?: number;
  tags: string[];
  vitals?: {
    bloodPressureSystolic?: number;
    bloodPressureDiastolic?: number;
    heartRate?: number;
    temperature?: number;
    oxygenSaturation?: number;
    bloodSugar?: number;
    weight?: number;
  };
}

export interface NotificationItem {
  id: string;
  type: NotificationType;
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  priority: "low" | "medium" | "high" | "urgent";
  actionUrl?: string;
  actionLabel?: string;
}

export interface EmergencyRequest {
  id: string;
  patientId: string;
  patientName: string;
  patientPhone: string;
  location: { lat: number; lng: number; address: string };
  hospitalId: string | null;
  hospitalName: string | null;
  ambulanceDispatched: boolean;
  ambulanceId?: string;
  status: "active" | "dispatched" | "arrived" | "completed" | "cancelled";
  createdAt: string;
  ETA?: number; // minutes
}

export interface AuditLog {
  id: string;
  userId: string;
  userName: string;
  userRole: UserRole;
  action: string;
  resource: string;
  resourceId: string;
  timestamp: string;
  ipAddress: string;
  status: "success" | "failed" | "warning";
  details: string;
}

export interface ConsentRecord {
  id: string;
  patientId: string;
  patientName: string;
  consentType: string;
  granted: boolean;
  grantedAt: string;
  expiresAt: string | null;
  version: string;
  details: string;
}

export interface VitalReading {
  id: string;
  patientId: string;
  type: string;
  value: number;
  unit: string;
  timestamp: string;
  status: "normal" | "warning" | "critical";
}

export interface SystemHealth {
  service: string;
  status: "operational" | "degraded" | "outage";
  uptime: number;
  responseTime: number;
  lastIncident: string | null;
}
