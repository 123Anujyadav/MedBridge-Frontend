// ============================================
// Patient Service — MedBridge Platform
// Wraps all /api/v1/patient/* API calls
// ============================================
import api from "./api";
import type {
  AppointmentCreateRequest,
  AppointmentResponse,
  ConsentFlagsRequest,
  EmergencyLocation,
  EmergencyPanicResponse,
  MedicationResponse,
  NotificationResponse,
  PatientDashboardResponse,
  PatientResponse,
  PatientUpdateRequest,
  PrescriptionResponse,
  ReportResponse,
  ReportSummaryResponse,
  SettingsResponse,
  SettingsUpdateRequest,
  UploadResponse,
  VitalReadingCreate,
  VitalReadingResponse,
  VitalsDashboardResponse,
  VitalType,
} from "@/types/api";

const patientService = {
  // ── Dashboard ────────────────────────────────
  async getDashboard(): Promise<PatientDashboardResponse> {
    const { data } = await api.get<PatientDashboardResponse>("/patient/dashboard");
    return data;
  },

  // ── Profile ──────────────────────────────────
  async getProfile(): Promise<PatientResponse> {
    const { data } = await api.get<PatientResponse>("/patient/profile");
    return data;
  },

  async updateProfile(profile: PatientUpdateRequest): Promise<PatientResponse> {
    const { data } = await api.put<PatientResponse>("/patient/profile", profile);
    return data;
  },

  async updateConsent(consent: ConsentFlagsRequest): Promise<PatientResponse> {
    const { data } = await api.put<PatientResponse>("/patient/consent", consent);
    return data;
  },

  // ── Appointments ──────────────────────────────
  async listAppointments(): Promise<AppointmentResponse[]> {
    const { data } = await api.get<AppointmentResponse[]>("/patient/appointments");
    return data;
  },

  async bookAppointment(appt: AppointmentCreateRequest): Promise<AppointmentResponse> {
    const { data } = await api.post<AppointmentResponse>("/patient/appointments", appt);
    return data;
  },

  async cancelAppointment(id: string): Promise<AppointmentResponse> {
    const { data } = await api.put<AppointmentResponse>(`/patient/appointments/${id}/cancel`);
    return data;
  },

  // ── Prescriptions ─────────────────────────────
  async listPrescriptions(): Promise<PrescriptionResponse[]> {
    const { data } = await api.get<PrescriptionResponse[]>("/patient/prescriptions");
    return data;
  },

  async getPrescription(id: string): Promise<PrescriptionResponse> {
    const { data } = await api.get<PrescriptionResponse>(`/patient/prescriptions/${id}`);
    return data;
  },

  // ── Medications ───────────────────────────────
  async trackMedication(
    id: string,
    status: "taken" | "missed" | "snoozed"
  ): Promise<MedicationResponse> {
    const { data } = await api.put<MedicationResponse>(`/patient/medications/${id}/track`, {
      status,
    });
    return data;
  },

  // ── Reports ───────────────────────────────────
  async listReports(): Promise<ReportSummaryResponse[]> {
    const { data } = await api.get<ReportSummaryResponse[]>("/patient/reports");
    return data;
  },

  async getReport(id: string): Promise<ReportResponse> {
    const { data } = await api.get<ReportResponse>(`/patient/reports/${id}`);
    return data;
  },

  // ── Notifications ─────────────────────────────
  async listNotifications(): Promise<NotificationResponse[]> {
    const { data } = await api.get<NotificationResponse[]>("/shared/notifications");
    return data;
  },

  async getUnreadCount(): Promise<number> {
    const { data } = await api.get<{ unread_count: number }>(
      "/shared/notifications/unread-count"
    );
    return data.unread_count;
  },

  async markNotificationRead(id: string): Promise<NotificationResponse> {
    const { data } = await api.put<NotificationResponse>(
      `/shared/notifications/${id}/read`
    );
    return data;
  },

  // ── Emergency ─────────────────────────────────
  async triggerEmergency(location: EmergencyLocation): Promise<EmergencyPanicResponse> {
    const { data } = await api.post<EmergencyPanicResponse>("/patient/emergency", {
      location,
    });
    return data;
  },

  async trackEmergency(id: string): Promise<EmergencyPanicResponse> {
    const { data } = await api.get<EmergencyPanicResponse>(`/patient/emergency/${id}`);
    return data;
  },

  // ── Settings ─────────────────────────────────
  async getSettings(): Promise<SettingsResponse> {
    const { data } = await api.get<SettingsResponse>("/shared/settings");
    return data;
  },

  async updateSettings(settings: SettingsUpdateRequest): Promise<SettingsResponse> {
    const { data } = await api.put<SettingsResponse>("/shared/settings", settings);
    return data;
  },

  // ── AI Symptom Intake ─────────────────────────
  async processSymptomIntake(payload: { symptoms: string; age?: string; gender?: string }): Promise<{
    extracted_symptoms?: string[];
    extractedSymptoms?: string[];
    urgency_level?: string;
    urgency?: string;
    recommended_specialty?: string;
    specialty?: string;
    ai_confidence?: number;
    confidence?: number;
    summary?: string;
  }> {
    const { data } = await api.post("/ai/symptom-intake", payload);
    return data;
  },

  // ── Vitals ────────────────────────────────────
  /** Chart-ready vitals + adherence for the dashboard. */
  async getVitalsDashboard(days = 7): Promise<VitalsDashboardResponse> {
    const { data } = await api.get<VitalsDashboardResponse>(
      "/patient/vitals/dashboard",
      { params: { days } }
    );
    return data;
  },

  async listVitals(type?: VitalType, limit = 100): Promise<VitalReadingResponse[]> {
    const { data } = await api.get<VitalReadingResponse[]>("/patient/vitals", {
      params: { ...(type ? { type } : {}), limit },
    });
    return data;
  },

  async recordVital(reading: VitalReadingCreate): Promise<VitalReadingResponse> {
    const { data } = await api.post<VitalReadingResponse>("/patient/vitals", reading);
    return data;
  },

  // ── Profile Photo ─────────────────────────────

  /** Upload or replace the signed-in patient's profile photo. */
  async uploadAvatar(file: File): Promise<PatientResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<PatientResponse>(
      "/patient/profile/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  /** Remove the signed-in patient's profile photo. */
  async removeAvatar(): Promise<PatientResponse> {
    const { data } = await api.delete<PatientResponse>("/patient/profile/avatar");
    return data;
  },

  // ── File Upload ───────────────────────────────

  async uploadFile(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<UploadResponse>("/shared/upload", formData, {
      headers: { "Content-Type": "multipart/form-data" },
    });
    return data;
  },
};

export default patientService;
