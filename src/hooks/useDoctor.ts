// ============================================
// useDoctor — React Query hooks for Clinicians
// Data fetching + mutations with caching & retries
// ============================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import doctorService from "@/lib/doctor-service";
import type {
  ApproveAISummaryRequest,
  BulkReportActionRequest,
  AnalyticsQuery,
  NotificationQuery,
  CaseTimelineQuery,
  CreateReportVersionRequest,
  ReportListFilters,
  CreatePrescriptionRequest,
  CreateReportRequest,
  DiagnoseCaseRequest,
  IssueAIReportRequest,
  SaveConsultationRequest,
  UpdateAvailabilityRequest,
  UpdateCaseNotesRequest,
} from "@/types/api";

export const DOCTOR_KEYS = {
  all: ["doctor"] as const,
  profile: () => [...DOCTOR_KEYS.all, "profile"] as const,
  dashboard: () => [...DOCTOR_KEYS.all, "dashboard"] as const,
  analytics: () => [...DOCTOR_KEYS.all, "analytics"] as const,
  patients: () => [...DOCTOR_KEYS.all, "patients"] as const,
  patient: (id: string) => [...DOCTOR_KEYS.all, "patient", id] as const,
  appointments: () => [...DOCTOR_KEYS.all, "appointments"] as const,
  cases: () => [...DOCTOR_KEYS.all, "cases"] as const,
  case: (id: string) => [...DOCTOR_KEYS.all, "case", id] as const,
  prescriptions: () => [...DOCTOR_KEYS.all, "prescriptions"] as const,
  reports: () => [...DOCTOR_KEYS.all, "reports"] as const,
  notifications: () => [...DOCTOR_KEYS.all, "notifications"] as const,
  draftCandidates: () => [...DOCTOR_KEYS.all, "report-draft-candidates"] as const,
  clinicalReview: (reportId: string) =>
    [...DOCTOR_KEYS.all, "clinical-review", reportId] as const,
};

export function useDoctorDashboard() {
  return useQuery({
    queryKey: DOCTOR_KEYS.dashboard(),
    queryFn: () => doctorService.getDashboard(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDoctorAnalytics(query: AnalyticsQuery = {}) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.analytics(), query],
    queryFn: () => doctorService.getAnalytics(query),
    // Analytics are aggregates, not live counters; a 5-minute cache keeps
    // range switching instant without hammering the aggregate queries.
    staleTime: 1000 * 60 * 5,
    placeholderData: (previous) => previous,
  });
}

export function useDoctorProfile() {
  return useQuery({
    queryKey: DOCTOR_KEYS.profile(),
    queryFn: () => doctorService.getProfile(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateAvailability() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (avail: UpdateAvailabilityRequest) => doctorService.updateAvailability(avail),
    onSuccess: (data) => {
      qc.setQueryData(DOCTOR_KEYS.profile(), data);
    },
  });
}

export function useDoctorPatients() {
  return useQuery({
    queryKey: DOCTOR_KEYS.patients(),
    queryFn: () => doctorService.listPatients(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useDoctorPatient(id: string) {
  return useQuery({
    queryKey: DOCTOR_KEYS.patient(id),
    queryFn: () => doctorService.getPatientProfile(id),
    enabled: !!id,
  });
}

export function useDoctorAppointments() {
  return useQuery({
    queryKey: DOCTOR_KEYS.appointments(),
    queryFn: () => doctorService.listAppointments(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useUpdateAppointmentStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusStr }: { id: string; statusStr: string }) =>
      doctorService.updateAppointmentStatus(id, statusStr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.appointments() });
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.dashboard() });
    },
  });
}

export function useDoctorCases() {
  return useQuery({
    queryKey: DOCTOR_KEYS.cases(),
    queryFn: () => doctorService.listCases(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useDoctorCase(id: string) {
  return useQuery({
    queryKey: DOCTOR_KEYS.case(id),
    queryFn: () => doctorService.getCase(id),
    enabled: !!id,
  });
}

export function useUpdateCaseNotes() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, notesIn }: { id: string; notesIn: UpdateCaseNotesRequest }) =>
      doctorService.updateCaseNotes(id, notesIn),
    onSuccess: (data) => {
      qc.setQueryData(DOCTOR_KEYS.case(data.id), data);
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.cases() });
    },
  });
}

export function useDiagnoseCase() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, diagnoseIn }: { id: string; diagnoseIn: DiagnoseCaseRequest }) =>
      doctorService.diagnoseCase(id, diagnoseIn),
    onSuccess: (data) => {
      qc.setQueryData(DOCTOR_KEYS.case(data.id), data);
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.cases() });
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.dashboard() });
    },
  });
}

export function useDoctorPrescriptions() {
  return useQuery({
    queryKey: DOCTOR_KEYS.prescriptions(),
    queryFn: () => doctorService.listPrescriptions(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useWritePrescription() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (rx: CreatePrescriptionRequest) => doctorService.writePrescription(rx),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.prescriptions() });
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.cases() });
    },
  });
}

export function useWriteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (report: CreateReportRequest) => doctorService.writeReport(report),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.reports() });
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.dashboard() });
    },
  });
}

export function useDoctorReports(filters: ReportListFilters = {}) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.reports(), filters],
    queryFn: () => doctorService.listReports(filters),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Resolve "select all matching current filters" server-side.
 *
 * A mutation rather than a query: it fires on an explicit click, and caching a
 * selection set that the next bulk action invalidates would be misleading.
 */
export function useSelectAllMatching() {
  return useMutation({
    mutationFn: (filters: ReportListFilters) => doctorService.listReportIds(filters),
  });
}

export function useBulkReportAction() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: BulkReportActionRequest) => doctorService.runBulkAction(req),
    onSuccess: () => {
      // A batch can touch reports, cases and the patient-facing record.
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

/**
 * Poll a queued batch until it finishes.
 *
 * Only enabled while a job is actually running, so a completed batch stops
 * costing requests immediately.
 */
export function useBulkJob(jobId: string | null, active: boolean) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.all, "bulk-job", jobId],
    queryFn: () => doctorService.getBulkJob(jobId!),
    enabled: !!jobId && active,
    refetchInterval: active ? 1500 : false,
    staleTime: 0,
  });
}

export function useUpdateReportStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusStr }: { id: string; statusStr: string }) =>
      doctorService.updateReportStatus(id, statusStr),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.reports() });
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

/** Cases the doctor may issue an AI clinical report for. */
export function useReportDraftCandidates(enabled = true) {
  return useQuery({
    queryKey: DOCTOR_KEYS.draftCandidates(),
    queryFn: () => doctorService.listReportDraftCandidates(),
    enabled,
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * Build the pre-filled report draft for a case.
 *
 * A mutation rather than a query: drafting is an explicit, billable LLM call
 * that must fire when the doctor selects a case, not on cache revalidation.
 */
export function useGenerateReportDraft() {
  return useMutation({
    mutationFn: (caseId: string) => doctorService.generateReportDraft(caseId),
  });
}

export function useIssueAIReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: IssueAIReportRequest) => doctorService.issueAIReport(req),
    onSuccess: () => {
      // The issued report lands on the doctor's list, the patient's record and
      // their notifications, and closes out the case.
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}

/**
 * The Clinical Review Workspace payload for one report.
 *
 * Cached for the session so reopening the same report does not re-run the LLM
 * suggestion pass; it is invalidated whenever the doctor writes to the case.
 */
export function useClinicalReview(reportId: string | null) {
  return useQuery({
    queryKey: DOCTOR_KEYS.clinicalReview(reportId ?? ""),
    queryFn: () => doctorService.getClinicalReview(reportId!),
    enabled: !!reportId,
    staleTime: 1000 * 60 * 10,
    retry: false,
  });
}

/**
 * One page of a case's timeline.
 *
 * Keyed on the full query so changing a filter fetches rather than reusing a
 * differently-filtered page; `keepPreviousData` avoids the list blanking while
 * the next page loads.
 */
export function useCaseTimeline(query: CaseTimelineQuery | null) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.all, "case-timeline", query],
    queryFn: () => doctorService.getCaseTimeline(query!),
    enabled: !!query?.case_id,
    placeholderData: (previous) => previous,
    staleTime: 1000 * 30,
  });
}

/** Version history for a document, lazily paged. */
export function useReportVersions(reportId: string | null, limit = 20) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.all, "report-versions", reportId, limit],
    queryFn: () => doctorService.listReportVersions(reportId!, 0, limit),
    enabled: !!reportId,
    placeholderData: (previous) => previous,
    staleTime: 1000 * 30,
  });
}

/** Diff between two versions. Skipped until both are chosen and differ. */
export function useVersionComparison(
  reportId: string | null,
  a: number | null,
  b: number | null
) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.all, "version-compare", reportId, a, b],
    queryFn: () => doctorService.compareReportVersions(reportId!, a!, b!),
    enabled: !!reportId && !!a && !!b && a !== b,
    staleTime: 1000 * 60 * 5,
  });
}

export function useCreateReportVersion(reportId: string | null) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: CreateReportVersionRequest) =>
      doctorService.createReportVersion(reportId!, req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
    },
  });
}

// ── Notification Center ──────────────────────

/**
 * The notification feed.
 *
 * No polling interval: the existing WebSocket invalidates this key when a
 * notification arrives, so an idle doctor costs zero requests.
 */
export function useNotificationCenter(query: NotificationQuery = {}) {
  return useQuery({
    queryKey: [...DOCTOR_KEYS.notifications(), query],
    queryFn: () => doctorService.getNotificationCenter(query),
    placeholderData: (previous) => previous,
    staleTime: 1000 * 30,
  });
}

export function useNotificationMutations() {
  const qc = useQueryClient();
  const invalidate = () => {
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.notifications() });
    qc.invalidateQueries({ queryKey: ["shared", "unread-count"] });
  };

  return {
    markRead: useMutation({
      mutationFn: (id: string) => doctorService.markNotificationRead(id),
      onSuccess: invalidate,
    }),
    markAllRead: useMutation({
      mutationFn: () => doctorService.markAllNotificationsRead(),
      onSuccess: invalidate,
    }),
    markSelectedRead: useMutation({
      mutationFn: (ids: string[]) => doctorService.markSelectedNotificationsRead(ids),
      onSuccess: invalidate,
    }),
    archive: useMutation({
      mutationFn: (id: string) => doctorService.archiveNotification(id),
      onSuccess: invalidate,
    }),
    open: useMutation({
      mutationFn: (id: string) => doctorService.openNotification(id),
      onSuccess: invalidate,
    }),
  };
}

export function useSaveConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: SaveConsultationRequest) => doctorService.saveConsultation(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
      qc.invalidateQueries({ queryKey: ["patient"] });
    },
  });
}

export function useApproveAISummary() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: ApproveAISummaryRequest) => doctorService.approveAISummary(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
    },
  });
}

export function useCompleteConsultation() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (req: {
      case_id: string;
      diagnosis: string;
      clinical_notes: string;
      medications?: any[];
      recommended_tests?: string[];
      follow_up_date?: string;
      doctor_remarks?: string;
    }) => doctorService.completeConsultation(req),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: DOCTOR_KEYS.all });
      qc.invalidateQueries({ queryKey: ["patient"] });
      qc.invalidateQueries({ queryKey: ["admin"] });
    },
  });
}


