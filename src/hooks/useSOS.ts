// ============================================
// useSOS — React Query hooks for the SOS workflow
// ============================================
//
// No polling anywhere. Every list and detail below is kept current by the
// WebSocket: `useWebSocket` invalidates these keys when an
// EMERGENCY_SOS_CREATED or EMERGENCY_SOS_UPDATED event arrives. An emergency
// dashboard on a timer would be both slower and a steady load on the API for
// the long stretches when nothing is happening.
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import sosService from "@/lib/sos-service";
import sosCommsService from "@/lib/sos-comms-service";
import { useAuth } from "@/context/AuthContext";
import type {
  SOSActiveResponse,
  SOSCancelRequest,
  SOSCommunicationsResponse,
  SOSEmergencyResponse,
  SOSHospitalResponse,
  SOSStatusUpdateRequest,
  SOSTimelineResponse,
  SOSTriggerRequest,
} from "@/types/api";

/**
 * Cache keys, scoped to the signed-in account.
 *
 * The query cache is not cleared on sign-out, so keying by user id keeps one
 * account's emergency — which carries a name, blood group and home address —
 * unreachable from another's on a shared browser.
 */
export const SOS_KEYS = {
  all: ["sos"] as const,
  active: (userId?: string) => ["sos", "active", userId ?? "anonymous"] as const,
  doctorList: (userId?: string, activeOnly?: boolean) =>
    ["sos", "doctor", userId ?? "anonymous", activeOnly] as const,
  adminList: (userId?: string, activeOnly?: boolean) =>
    ["sos", "admin", userId ?? "anonymous", activeOnly] as const,
};

// ── patient ──────────────────────────────────────────────────────────────

export function useActiveSOS() {
  const { user } = useAuth();
  return useQuery<SOSActiveResponse>({
    queryKey: SOS_KEYS.active(user?.id),
    queryFn: () => sosService.getActive(),
    enabled: !!user?.id && user.role === "patient",
    staleTime: 1000 * 30,
  });
}

export function useTriggerSOS() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: (payload: SOSTriggerRequest) => sosService.trigger(payload),
    onSuccess: (emergency) =>
      qc.setQueryData<SOSActiveResponse>(SOS_KEYS.active(user?.id), {
        active: true,
        emergency,
      }),
  });
}

export function useCancelMySOS() {
  const qc = useQueryClient();
  const { user } = useAuth();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string } & SOSCancelRequest) =>
      sosService.cancelMine(id, { reason }),
    onSuccess: (emergency) =>
      // Cancelled is terminal, so there is no longer an active emergency —
      // but the record is kept so the screen can show how it ended.
      qc.setQueryData<SOSActiveResponse>(SOS_KEYS.active(user?.id), {
        active: false,
        emergency,
      }),
  });
}

// ── clinician ────────────────────────────────────────────────────────────

export function useDoctorEmergencies(activeOnly = true) {
  const { user } = useAuth();
  return useQuery<SOSEmergencyResponse[]>({
    queryKey: SOS_KEYS.doctorList(user?.id, activeOnly),
    queryFn: () => sosService.listForDoctor(activeOnly),
    enabled: !!user?.id && user.role === "doctor",
    staleTime: 1000 * 30,
  });
}

export function useDoctorUpdateEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & SOSStatusUpdateRequest) =>
      sosService.updateStatusAsDoctor(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SOS_KEYS.all }),
  });
}

// ── administrator ────────────────────────────────────────────────────────

export function useAdminEmergencies(activeOnly = true) {
  const { user } = useAuth();
  return useQuery<SOSEmergencyResponse[]>({
    queryKey: SOS_KEYS.adminList(user?.id, activeOnly),
    queryFn: () => sosService.listForAdmin(activeOnly),
    enabled: !!user?.id && user.role === "admin",
    staleTime: 1000 * 30,
  });
}

export function useAdminUpdateEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...payload }: { id: string } & SOSStatusUpdateRequest) =>
      sosService.updateStatusAsAdmin(id, payload),
    onSuccess: () => qc.invalidateQueries({ queryKey: SOS_KEYS.all }),
  });
}

export function useAdminCancelEmergency() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, reason }: { id: string } & SOSCancelRequest) =>
      sosService.cancelAsAdmin(id, { reason }),
    onSuccess: () => qc.invalidateQueries({ queryKey: SOS_KEYS.all }),
  });
}

// ── presentation helpers ─────────────────────────────────────────────────

/**
 * The stages a patient is shown, in order.
 *
 * `cancelled` is not here: it is not a stage on the way to resolution, and
 * rendering it as one would suggest an emergency that ended in a false alarm
 * had progressed through the pipeline.
 */
export const SOS_STAGES = [
  { key: "pending", label: "Emergency Created" },
  { key: "doctor_assigned", label: "Doctor Assigned" },
  { key: "ambulance_dispatched", label: "Ambulance Dispatched" },
  { key: "hospital_reached", label: "Hospital Reached" },
  { key: "resolved", label: "Resolved" },
] as const;

export function stageIndex(status: string): number {
  // `accepted` sits between creation and assignment and has no stage of its
  // own, so it reports as still being at the first one.
  if (status === "accepted") return 0;
  const index = SOS_STAGES.findIndex((s) => s.key === status);
  return index === -1 ? 0 : index;
}

export const SOS_STATUS_LABELS: Record<string, string> = {
  pending: "Pending",
  accepted: "Accepted",
  doctor_assigned: "Doctor Assigned",
  ambulance_dispatched: "Ambulance Dispatched",
  hospital_reached: "Hospital Reached",
  resolved: "Resolved",
  cancelled: "Cancelled",
};

// ── Phase 3: emergency communications ────────────────────────────────────
//
// No polling. The backend pushes `EMERGENCY_COMMS_UPDATED` as each call or
// message is queued, sent, retried or fails, and `useWebSocket` invalidates
// these keys — so the page follows the fan-out live without asking repeatedly.

export const sosCommsKey = (id: string, userId?: string) =>
  ["sos", "communications", id, userId ?? "anonymous"] as const;

export const sosTimelineKey = (id: string, userId?: string) =>
  ["sos", "timeline", id, userId ?? "anonymous"] as const;

export const sosHospitalKey = (id: string, userId?: string) =>
  ["sos", "hospital", id, userId ?? "anonymous"] as const;

export function useSOSCommunications(emergencyId?: string | null) {
  const { user } = useAuth();
  return useQuery<SOSCommunicationsResponse>({
    queryKey: sosCommsKey(emergencyId ?? "", user?.id),
    queryFn: () => sosCommsService.getCommunications(emergencyId as string),
    enabled: !!emergencyId && !!user?.id,
    staleTime: 1000 * 15,
  });
}

export function useSOSTimeline(emergencyId?: string | null) {
  const { user } = useAuth();
  return useQuery<SOSTimelineResponse>({
    queryKey: sosTimelineKey(emergencyId ?? "", user?.id),
    queryFn: () => sosCommsService.getTimeline(emergencyId as string),
    enabled: !!emergencyId && !!user?.id,
    staleTime: 1000 * 15,
  });
}

export function useSOSHospital(emergencyId?: string | null) {
  const { user } = useAuth();
  return useQuery<SOSHospitalResponse>({
    queryKey: sosHospitalKey(emergencyId ?? "", user?.id),
    queryFn: () => sosCommsService.getHospital(emergencyId as string),
    enabled: !!emergencyId && !!user?.id,
    staleTime: 1000 * 30,
  });
}

/** How a communication row is described on screen. */
export const COMMS_CHANNEL_LABELS: Record<string, string> = {
  voice: "Call",
  sms: "SMS",
  whatsapp: "WhatsApp",
};

export const COMMS_ROLE_LABELS: Record<string, string> = {
  emergency_contact: "Emergency contact",
  doctor: "Doctor",
  admin: "Admin",
};

export const COMMS_STATUS_LABELS: Record<string, string> = {
  queued: "Queued",
  sending: "Calling…",
  // Deliberately not "Sent". The provider has taken the request; no network has
  // yet said it carried it. Showing this as sent would tell somebody their
  // family had been reached when they may not have been.
  accepted: "With provider",
  sent: "Sent",
  delivered: "Delivered",
  undelivered: "Not delivered",
  canceled: "Cancelled",
  failed: "Failed",
  skipped: "Not configured",
};
