// ============================================
// Doctor Service — MedBridge Platform
// Wraps all /api/v1/doctor/* API calls
// ============================================
import api, { describeDownloadFailure } from "./api";
import type {
  AIReportDraftResponse,
  ApproveAISummaryRequest,
  BulkJobStatus,
  BulkReportActionRequest,
  BulkSelectionResponse,
  AnalyticsQuery,
  NotificationCenterResponse,
  NotificationQuery,
  CaseTimelineQuery,
  CaseTimelineResponse,
  CreateReportVersionRequest,
  ReportVersionListResponse,
  ReportVersionSummary,
  VersionComparisonResponse,
  ReportListFilters,
  ClinicalReviewResponse,
  ReviewActionResponse,
  SaveConsultationRequest,
  SaveConsultationResponse,
  AppointmentResponse,
  CaseResponse,
  CreatePrescriptionRequest,
  CreateReportRequest,
  DiagnoseCaseRequest,
  DoctorAnalyticsResponse,
  DoctorDashboardResponse,
  DoctorReportCard,
  DoctorResponse,
  IssueAIReportRequest,
  PatientResponse,
  PrescriptionResponse,
  ReportDraftCandidate,
  ReportResponse,
  UpdateAvailabilityRequest,
  UpdateCaseNotesRequest,
} from "@/types/api";

const doctorService = {
  // ── Profile & Availability ───────────────────
  async getProfile(): Promise<DoctorResponse> {
    const { data } = await api.get<DoctorResponse>("/doctor/profile");
    return data;
  },

  /** Upload or replace the signed-in doctor's profile photo. */
  async uploadAvatar(file: File): Promise<DoctorResponse> {
    const formData = new FormData();
    formData.append("file", file);
    const { data } = await api.post<DoctorResponse>(
      "/doctor/profile/avatar",
      formData,
      { headers: { "Content-Type": "multipart/form-data" } }
    );
    return data;
  },

  /** Remove the signed-in doctor's profile photo. */
  async removeAvatar(): Promise<DoctorResponse> {
    const { data } = await api.delete<DoctorResponse>("/doctor/profile/avatar");
    return data;
  },

  async updateAvailability(availability: UpdateAvailabilityRequest): Promise<DoctorResponse> {
    const { data } = await api.put<DoctorResponse>("/doctor/schedule/availability", availability);
    return data;
  },

  // ── Dashboard & Analytics ────────────────────
  async getDashboard(): Promise<DoctorDashboardResponse> {
    const { data } = await api.get<DoctorDashboardResponse>("/doctor/dashboard");
    return data;
  },

  async getAnalytics(query: AnalyticsQuery = {}): Promise<DoctorAnalyticsResponse> {
    const { data } = await api.get<DoctorAnalyticsResponse>("/doctor/analytics", {
      params: query,
    });
    return data;
  },

  /**
   * Export the dashboard analytics.
   *
   * Reads the same service the dashboard reads and renders PDFs through the
   * platform's existing generator, so an export cannot disagree with the screen.
   */
  async exportAnalytics(
    query: AnalyticsQuery,
    format: "csv" | "pdf"
  ): Promise<{ blob: Blob; filename: string }> {
    const response = await api.get("/doctor/analytics/export", {
      params: { ...query, format },
      responseType: "blob",
      timeout: 60000,
    });
    const stamp = new Date().toISOString().slice(0, 10);
    return {
      blob: response.data as Blob,
      filename: `analytics-${stamp}.${format === "csv" ? "csv" : "pdf"}`,
    };
  },

  // ── Patient Patients & Directory ─────────────
  async listPatients(): Promise<PatientResponse[]> {
    const { data } = await api.get<PatientResponse[]>("/doctor/patients");
    return data;
  },

  async getPatientProfile(id: string): Promise<PatientResponse> {
    const { data } = await api.get<PatientResponse>(`/doctor/patients/${id}`);
    return data;
  },

  // ── Appointments ─────────────────────────────
  async listAppointments(): Promise<AppointmentResponse[]> {
    const { data } = await api.get<AppointmentResponse[]>("/doctor/appointments");
    return data;
  },

  async updateAppointmentStatus(id: string, statusStr: string): Promise<AppointmentResponse> {
    const { data } = await api.put<AppointmentResponse>(`/doctor/appointments/${id}/status`, null, {
      params: { status_str: statusStr },
    });
    return data;
  },

  // ── Cases & Consultation ─────────────────────
  async listCases(): Promise<CaseResponse[]> {
    const { data } = await api.get<CaseResponse[]>("/doctor/cases");
    return data;
  },

  async getCase(id: string): Promise<CaseResponse> {
    const { data } = await api.get<CaseResponse>(`/doctor/cases/${id}`);
    return data;
  },

  async updateCaseNotes(id: string, notesIn: UpdateCaseNotesRequest): Promise<CaseResponse> {
    const { data } = await api.put<CaseResponse>(`/doctor/cases/${id}/notes`, notesIn);
    return data;
  },

  async diagnoseCase(id: string, diagnoseIn: DiagnoseCaseRequest): Promise<CaseResponse> {
    const { data } = await api.post<CaseResponse>(`/doctor/cases/${id}/diagnose`, diagnoseIn);
    return data;
  },

  // ── Prescriptions & Reports ──────────────────
  async writePrescription(prescriptionIn: CreatePrescriptionRequest): Promise<PrescriptionResponse> {
    const { data } = await api.post<PrescriptionResponse>("/doctor/prescriptions", prescriptionIn);
    return data;
  },

  async listPrescriptions(): Promise<PrescriptionResponse[]> {
    const { data } = await api.get<PrescriptionResponse[]>("/doctor/prescriptions");
    return data;
  },

  async writeReport(reportIn: CreateReportRequest): Promise<ReportResponse> {
    const { data } = await api.post<ReportResponse>("/doctor/reports", reportIn);
    return data;
  },

  /**
   * Enriched report cards.
   *
   * The backend assembles patient, case, AI intake and record counts in one
   * bulk-loaded pass, so the list needs no follow-up request per card.
   */
  async listReports(filters: ReportListFilters = {}): Promise<DoctorReportCard[]> {
    const { data } = await api.get<DoctorReportCard[]>("/doctor/reports", {
      params: filters,
    });
    return data;
  },

  // ── Bulk actions ─────────────────────────────
  /** Every report id matching the current filters, resolved server-side. */
  async listReportIds(filters: ReportListFilters = {}): Promise<BulkSelectionResponse> {
    const { data } = await api.get<BulkSelectionResponse>("/doctor/reports/ids", {
      params: filters,
    });
    return data;
  },

  /**
   * Find clinicians to refer to.
   *
   * Reuses the existing unified search rather than adding a doctor-directory
   * endpoint; it already returns doctors with their specialty.
   */
  async searchSpecialists(q: string): Promise<{ id: string; label: string }[]> {
    if (!q.trim()) return [];
    const { data } = await api.get<
      { id: string; type: string; name: string; details: string }[]
    >("/shared/search", { params: { q } });
    return data
      .filter((r) => r.type === "doctor")
      .map((r) => ({ id: r.id, label: `${r.name} — ${r.details}` }));
  },

  async runBulkAction(req: BulkReportActionRequest): Promise<BulkJobStatus> {
    const { data } = await api.post<BulkJobStatus>("/doctor/reports/bulk", req, {
      timeout: 120000,
    });
    return data;
  },

  async getBulkJob(jobId: string): Promise<BulkJobStatus> {
    const { data } = await api.get<BulkJobStatus>(`/doctor/reports/bulk/${jobId}`);
    return data;
  },

  /**
   * Download a selection as CSV metadata or a ZIP of stored PDFs.
   *
   * Returns the skipped count from the response header so the UI can report
   * "3 had no PDF" rather than shipping a quietly smaller bundle.
   */
  async exportReports(
    reportIds: string[],
    format: "csv" | "pdf"
  ): Promise<{ blob: Blob; filename: string; skipped: number }> {
    const response = await api.post(
      "/doctor/reports/bulk/export",
      { report_ids: reportIds },
      { params: { format }, responseType: "blob", timeout: 120000 }
    );
    const stamp = new Date().toISOString().slice(0, 10);
    return {
      blob: response.data as Blob,
      filename: format === "csv" ? `reports-${stamp}.csv` : `reports-${stamp}.zip`,
      skipped: Number(response.headers?.["x-skipped-count"] ?? 0),
    };
  },

  // ── AI-assisted clinical reports ─────────────
  // The doctor picks a case; the backend assembles the draft from the patient
  // record and AI intake. Nothing here is hand-typed.
  async listReportDraftCandidates(): Promise<ReportDraftCandidate[]> {
    const { data } = await api.get<ReportDraftCandidate[]>("/doctor/reports/draft-candidates");
    return data;
  },

  async generateReportDraft(caseId: string): Promise<AIReportDraftResponse> {
    // Drafting runs an LLM pass over the full case record, which routinely
    // outruns the 15s client default.
    const { data } = await api.post<AIReportDraftResponse>(
      "/doctor/reports/ai-draft",
      { case_id: caseId },
      { timeout: 60000 }
    );
    return data;
  },

  async issueAIReport(req: IssueAIReportRequest): Promise<ReportResponse> {
    const { data } = await api.post<ReportResponse>("/doctor/reports/issue", req, {
      timeout: 60000,
    });
    return data;
  },

  /**
   * A case's chronological history.
   *
   * Reuses the existing /shared/timeline endpoint, which now serves the merged
   * recorded-plus-derived timeline with filters, search and pagination.
   */
  async getCaseTimeline(query: CaseTimelineQuery): Promise<CaseTimelineResponse> {
    const { data } = await api.get<CaseTimelineResponse>("/shared/timeline", {
      params: query,
      // Repeat the key for array filters: ?category=ai&category=doctor
      paramsSerializer: { indexes: null },
    });
    return data;
  },

  // ── Notification Center ──────────────────────
  // Reuses the shared notification routes; nothing doctor-specific is needed
  // because ownership is the notification's own user_id.
  async getNotificationCenter(query: NotificationQuery = {}): Promise<NotificationCenterResponse> {
    const { data } = await api.get<NotificationCenterResponse>(
      "/shared/notifications/center", { params: query }
    );
    return data;
  },

  async markNotificationRead(id: string): Promise<void> {
    await api.put(`/shared/notifications/${id}/read`);
  },

  async markAllNotificationsRead(): Promise<number> {
    const { data } = await api.put<{ updated: number }>("/shared/notifications/read-all");
    return data.updated;
  },

  async markSelectedNotificationsRead(ids: string[]): Promise<number> {
    const { data } = await api.put<{ updated: number }>(
      "/shared/notifications/read-selected", { notification_ids: ids }
    );
    return data.updated;
  },

  async archiveNotification(id: string): Promise<void> {
    await api.put(`/shared/notifications/${id}/archive`);
  },

  /** Records that the doctor followed the action link, then navigates. */
  async openNotification(id: string): Promise<void> {
    await api.put(`/shared/notifications/${id}/opened`);
  },

  // ── Clinical Review Workspace ────────────────
  /**
   * Assemble the four-section review for a report.
   *
   * Runs an LLM pass for the AI suggestion panel, so it needs more than the
   * 15s client default.
   */
  async getClinicalReview(reportId: string): Promise<ClinicalReviewResponse> {
    const { data } = await api.get<ClinicalReviewResponse>(
      `/doctor/reports/${reportId}/clinical-review`,
      { timeout: 60000 }
    );
    return data;
  },

  async saveConsultation(req: SaveConsultationRequest): Promise<SaveConsultationResponse> {
    const { data } = await api.post<SaveConsultationResponse>(
      "/doctor/cases/review/save",
      req
    );
    return data;
  },

  async approveAISummary(req: ApproveAISummaryRequest): Promise<ReviewActionResponse> {
    const { data } = await api.post<ReviewActionResponse>(
      "/doctor/cases/review/approve-summary",
      req
    );
    return data;
  },

  // ── Clinical document lifecycle ──────────────
  async listReportVersions(
    reportId: string,
    skip = 0,
    limit = 20
  ): Promise<ReportVersionListResponse> {
    const { data } = await api.get<ReportVersionListResponse>(
      `/doctor/reports/${reportId}/versions`,
      { params: { skip, limit } }
    );
    return data;
  },

  async compareReportVersions(
    reportId: string,
    a: number,
    b: number
  ): Promise<VersionComparisonResponse> {
    const { data } = await api.get<VersionComparisonResponse>(
      `/doctor/reports/${reportId}/versions/compare`,
      { params: { a, b } }
    );
    return data;
  },

  async createReportVersion(
    reportId: string,
    req: CreateReportVersionRequest
  ): Promise<ReportVersionSummary> {
    const { data } = await api.post<ReportVersionSummary>(
      `/doctor/reports/${reportId}/versions`,
      req,
      { timeout: 60000 }
    );
    return data;
  },

  /**
   * The rendered PDF for in-app preview.
   *
   * Same route and same bytes as the download, requested `inline` — so the
   * preview can never drift from the file the patient receives.
   */
  async previewReportPdf(reportId: string, version?: number): Promise<Blob> {
    const { data } = await api.get<Blob>(`/shared/reports/${reportId}/download`, {
      params: { disposition: "inline", ...(version ? { version } : {}) },
      responseType: "blob",
      timeout: 60000,
    });
    return data;
  },

  /**
   * Fetch an issued report's PDF as a blob.
   *
   * The download route is authenticated, so a plain <a href> gets a 401 — the
   * bearer token only travels on the axios client.
   */
  async downloadReportPdf(id: string): Promise<Blob> {
    try {
      const { data } = await api.get<Blob>(`/shared/reports/${id}/download`, {
        responseType: "blob",
      });
      return data;
    } catch (error) {
      // See `describeDownloadFailure`: a blob request loses the API's own
      // error message, so callers were shown axios's raw status text.
      throw new Error(await describeDownloadFailure(error));
    }
  },

  async updateReportStatus(id: string, statusStr: string): Promise<ReportResponse> {
    const { data } = await api.put<ReportResponse>(`/doctor/reports/${id}/status`, null, {
      params: { status_str: statusStr },
    });
    return data;
  },

  async completeConsultation(req: {
    case_id: string;
    diagnosis: string;
    clinical_notes: string;
    medications?: any[];
    recommended_tests?: string[];
    follow_up_date?: string;
    doctor_remarks?: string;
  }): Promise<ReportResponse> {
    const { data } = await api.post<ReportResponse>("/doctor/cases/complete", req);
    return data;
  },
};

export default doctorService;


