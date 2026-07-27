// ============================================
// usePatient — React Query hooks
// All patient data fetching + mutations with
// caching, retry, loading, and error states
// ============================================
import {
  useQuery,
  useMutation,
  useQueryClient,
  type UseQueryOptions,
} from "@tanstack/react-query";
import patientService from "@/lib/patient-service";
import type {
  AppointmentCreateRequest,
  ConsentFlagsRequest,
  EmergencyLocation,
  PatientUpdateRequest,
  SettingsUpdateRequest,
  VitalReadingCreate,
} from "@/types/api";

// ── Query Keys ────────────────────────────────
export const PATIENT_KEYS = {
  all: ["patient"] as const,
  dashboard: () => [...PATIENT_KEYS.all, "dashboard"] as const,
  profile: () => [...PATIENT_KEYS.all, "profile"] as const,
  appointments: () => [...PATIENT_KEYS.all, "appointments"] as const,
  prescriptions: () => [...PATIENT_KEYS.all, "prescriptions"] as const,
  prescription: (id: string) => [...PATIENT_KEYS.all, "prescription", id] as const,
  reports: () => [...PATIENT_KEYS.all, "reports"] as const,
  report: (id: string) => [...PATIENT_KEYS.all, "report", id] as const,
  notifications: () => [...PATIENT_KEYS.all, "notifications"] as const,
  unreadCount: () => [...PATIENT_KEYS.all, "unreadCount"] as const,
  settings: () => [...PATIENT_KEYS.all, "settings"] as const,
  emergency: (id: string) => [...PATIENT_KEYS.all, "emergency", id] as const,
  vitals: (days: number) => [...PATIENT_KEYS.all, "vitals", days] as const,
} as const;

// ── Dashboard ─────────────────────────────────
export function usePatientDashboard() {
  return useQuery({
    queryKey: PATIENT_KEYS.dashboard(),
    queryFn: () => patientService.getDashboard(),
    staleTime: 1000 * 60 * 2, // 2 min cache
    retry: 2,
  });
}

// ── Profile ───────────────────────────────────
export function usePatientProfile() {
  return useQuery({
    queryKey: PATIENT_KEYS.profile(),
    queryFn: () => patientService.getProfile(),
    staleTime: 1000 * 60 * 5, // 5 min cache
  });
}

export function useUpdateProfile() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (profile: PatientUpdateRequest) => patientService.updateProfile(profile),
    onSuccess: (data) => {
      qc.setQueryData(PATIENT_KEYS.profile(), data);
    },
  });
}

export function useUpdateConsent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (consent: ConsentFlagsRequest) => patientService.updateConsent(consent),
    onSuccess: (data) => {
      qc.setQueryData(PATIENT_KEYS.profile(), data);
    },
  });
}

// ── Appointments ──────────────────────────────
export function usePatientAppointments() {
  return useQuery({
    queryKey: PATIENT_KEYS.appointments(),
    queryFn: () => patientService.listAppointments(),
    staleTime: 1000 * 60 * 2,
  });
}

/** Verified, bookable clinicians for the booking form. */
export function useBookableDoctors(specialty?: string) {
  return useQuery({
    queryKey: [...PATIENT_KEYS.all, "bookableDoctors", specialty ?? "all"] as const,
    queryFn: () => patientService.listBookableDoctors(specialty),
    staleTime: 1000 * 60 * 5,
  });
}

export function useBookAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (appt: AppointmentCreateRequest) => patientService.bookAppointment(appt),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.appointments() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

export function useCancelAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.cancelAppointment(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.appointments() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

export function useRescheduleAppointment() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, date, time }: { id: string; date: string; time: string }) =>
      patientService.rescheduleAppointment(id, { date, time }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.appointments() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

// ── Prescriptions ─────────────────────────────
export function usePatientPrescriptions() {
  return useQuery({
    queryKey: PATIENT_KEYS.prescriptions(),
    queryFn: () => patientService.listPrescriptions(),
    staleTime: 1000 * 60 * 5,
  });
}

export function usePrescription(id: string) {
  return useQuery({
    queryKey: PATIENT_KEYS.prescription(id),
    queryFn: () => patientService.getPrescription(id),
    enabled: !!id,
  });
}

export function useTrackMedication() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, status }: { id: string; status: "taken" | "missed" | "snoozed" }) =>
      patientService.trackMedication(id, status),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.prescriptions() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
      // Adherence is derived server-side from dose counts, so the chart on the
      // reminders page is stale the moment a dose is tracked.
      qc.invalidateQueries({ queryKey: [...PATIENT_KEYS.all, "vitals"] });
    },
  });
}

// ── Reports ───────────────────────────────────
export function usePatientReports() {
  return useQuery({
    queryKey: PATIENT_KEYS.reports(),
    queryFn: () => patientService.listReports(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useReport(id: string) {
  return useQuery({
    queryKey: PATIENT_KEYS.report(id),
    queryFn: () => patientService.getReport(id),
    enabled: !!id,
  });
}

// ── Notifications ─────────────────────────────
export function usePatientNotifications() {
  return useQuery({
    queryKey: PATIENT_KEYS.notifications(),
    queryFn: () => patientService.listNotifications(),
    staleTime: 1000 * 30, // 30 sec cache — notifications refresh frequently
  });
}

export function useUnreadNotificationCount() {
  return useQuery({
    queryKey: PATIENT_KEYS.unreadCount(),
    queryFn: () => patientService.getUnreadCount(),
    staleTime: 1000 * 30,
    refetchInterval: 1000 * 60, // Poll every minute for new notifications
  });
}

export function useMarkNotificationRead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.markNotificationRead(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.notifications() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.unreadCount() });
    },
  });
}

// ── Settings ──────────────────────────────────
export function usePatientSettings() {
  return useQuery({
    queryKey: PATIENT_KEYS.settings(),
    queryFn: () => patientService.getSettings(),
    staleTime: 1000 * 60 * 10,
  });
}

export function useUpdateSettings() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (settings: SettingsUpdateRequest) => patientService.updateSettings(settings),
    onSuccess: (data) => {
      qc.setQueryData(PATIENT_KEYS.settings(), data);
    },
  });
}

// ── Emergency ─────────────────────────────────
export function useTriggerEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (location: EmergencyLocation) => patientService.triggerEmergency(location),
    onSuccess: () => {
      // Triggering an alert writes notifications server-side; without this the
      // bell badge stayed stale until the next poll.
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.notifications() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.unreadCount() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

export function useTrackEmergency(id: string) {
  return useQuery({
    queryKey: PATIENT_KEYS.emergency(id),
    queryFn: () => patientService.trackEmergency(id),
    enabled: !!id,
    refetchInterval: 5000, // Poll every 5s for ETA updates
  });
}

// ── Vitals ────────────────────────────────────
/**
 * Live vitals + adherence for the dashboard charts.
 *
 * Invalidated by `useRecordVital`, so a newly recorded reading appears on the
 * chart without a manual refresh.
 */
export function useVitalsDashboard(days = 7) {
  return useQuery({
    queryKey: PATIENT_KEYS.vitals(days),
    queryFn: () => patientService.getVitalsDashboard(days),
    staleTime: 1000 * 60 * 2,
  });
}

export function useRecordVital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (reading: VitalReadingCreate) => patientService.recordVital(reading),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...PATIENT_KEYS.all, "vitals"] });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

// ── File Upload ───────────────────────────────
// `useUploadFile` was removed along with `patientService.uploadFile`. It posted
// to `/shared/upload`, which stores bytes and persists no row, so anything
// uploaded through it was invisible to every screen and unrecoverable. Use
// `useUploadMedicalRecord` below, which commits the record.

/**
 * Upload a document as a medical record.
 *
 * Invalidates reports and the dashboard so the new record appears without a
 * manual refetch, and medical history (which is assembled from reports and
 * prescriptions) stays in step.
 */
export function useUploadMedicalRecord() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      patientService.uploadMedicalRecord(file, title),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.reports() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

export function useDeleteReport() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => patientService.deleteReport(id),
    onSuccess: (_data, id) => {
      // Drop the detail entry too, so reopening a deleted record cannot be
      // served a stale cached copy.
      qc.removeQueries({ queryKey: PATIENT_KEYS.report(id) });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.reports() });
      qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    },
  });
}

export function useDownloadReport() {
  return useMutation({
    mutationFn: ({ id, filename }: { id: string; filename?: string }) =>
      patientService.downloadReport(id, filename),
  });
}
