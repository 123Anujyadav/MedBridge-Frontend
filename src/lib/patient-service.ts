// ============================================
// Patient Service — MedBridge Platform
// Wraps all /api/v1/patient/* API calls
// ============================================
import api, { describeDownloadFailure } from "./api";
import type {
  AppointmentCreateRequest,
  AppointmentResponse,
  BookableDoctorResponse,
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

  async listBookableDoctors(specialty?: string): Promise<BookableDoctorResponse[]> {
    const { data } = await api.get<BookableDoctorResponse[]>("/patient/doctors", {
      params: specialty ? { specialty } : undefined,
    });
    return data;
  },

  async rescheduleAppointment(
    id: string,
    slot: { date: string; time: string }
  ): Promise<AppointmentResponse> {
    const { data } = await api.put<AppointmentResponse>(
      `/patient/appointments/${id}/reschedule`,
      slot
    );
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

  async deleteReport(id: string): Promise<void> {
    await api.delete(`/patient/reports/${id}`);
  },

  /**
   * Upload a document and register it as a medical record.
   *
   * Targets `/patient/records` rather than `/shared/upload`: the latter only
   * writes bytes to disk and persists no row, so nothing it returned ever
   * appeared in the records list or survived a refresh.
   */
  async uploadMedicalRecord(file: File, title?: string): Promise<ReportResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const query = title ? `?title=${encodeURIComponent(title)}` : "";
    const { data } = await api.post<ReportResponse>(
      `/patient/records${query}`,
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  /**
   * Download a report through the authenticated client.
   *
   * The download used to be a plain `<a href>`, which a browser issues as a
   * top-level navigation with no `Authorization` header — so it always came back
   * 401. Fetching as a blob keeps the bearer token attached, then the object URL
   * is handed to a synthetic anchor.
   */
  async downloadReport(id: string, filename?: string): Promise<void> {
    let data: Blob;
    try {
      ({ data } = await api.get<Blob>(`/shared/reports/${id}/download`, {
        responseType: "blob",
      }));
    } catch (error) {
      // Raised as a plain message the caller can show directly. Without this
      // the caller surfaced axios's "Request failed with status code 404".
      throw new Error(await describeDownloadFailure(error));
    }
    const url = window.URL.createObjectURL(data);
    try {
      const link = document.createElement("a");
      link.href = url;
      link.download = filename || `report-${id}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
    } finally {
      // Revoked after the click so the browser has the bytes but the blob is
      // not retained for the lifetime of the page.
      window.URL.revokeObjectURL(url);
    }
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
  // Symptom intake now runs on the production agent — see `intake-service.ts`
  // (`POST /ai/intake/*`). The wrapper for the single-shot `/ai/symptom-intake`
  // endpoint that used to live here has been removed because nothing calls it
  // any more; keeping it would leave two ways into intake, one of which cannot
  // route a case to a specialist. The backend endpoint itself is unchanged.

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

  // `uploadFile` (POST /shared/upload) was removed: it stored bytes on disk and
  // committed no database row, so an upload made through it never appeared in
  // the patient's records and could not be downloaded or deleted. Use
  // `uploadMedicalRecord` above.
};

export default patientService;
