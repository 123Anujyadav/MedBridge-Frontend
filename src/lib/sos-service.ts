// ============================================
// SOS Service — MedBridge Platform
// Wraps the Phase 2 emergency workflow endpoints
// ============================================
//
// Records and tracks an emergency. Nothing here sends an SMS, places a call or
// dispatches a vehicle — those are Phase 3, behind the notifier interface on
// the server.
//
// Every route is scoped on the server from the bearer token. The patient calls
// take no identifier at all; the clinician and administrator calls take an
// emergency id, and the server decides whether that caller may reach it.
import api from "./api";
import type {
  SOSActiveResponse,
  SOSCancelRequest,
  SOSEmergencyResponse,
  SOSStatusUpdateRequest,
  SOSTriggerRequest,
} from "@/types/api";

const sosService = {
  // ── patient ──────────────────────────────────
  async trigger(payload: SOSTriggerRequest): Promise<SOSEmergencyResponse> {
    const { data } = await api.post<SOSEmergencyResponse>("/patient/sos", payload);
    return data;
  },

  /** Whether this patient already has an emergency open — one request. */
  async getActive(): Promise<SOSActiveResponse> {
    const { data } = await api.get<SOSActiveResponse>("/patient/sos/active");
    return data;
  },

  async cancelMine(
    id: string,
    payload: SOSCancelRequest = {}
  ): Promise<SOSEmergencyResponse> {
    const { data } = await api.post<SOSEmergencyResponse>(
      `/patient/sos/${id}/cancel`,
      payload
    );
    return data;
  },

  // ── clinician ────────────────────────────────
  async listForDoctor(activeOnly = true): Promise<SOSEmergencyResponse[]> {
    const { data } = await api.get<SOSEmergencyResponse[]>("/doctor/emergencies", {
      params: { active_only: activeOnly },
    });
    return data;
  },

  async updateStatusAsDoctor(
    id: string,
    payload: SOSStatusUpdateRequest
  ): Promise<SOSEmergencyResponse> {
    const { data } = await api.put<SOSEmergencyResponse>(
      `/doctor/emergencies/${id}/status`,
      payload
    );
    return data;
  },

  // ── administrator ────────────────────────────
  async listForAdmin(activeOnly = true): Promise<SOSEmergencyResponse[]> {
    const { data } = await api.get<SOSEmergencyResponse[]>("/admin/emergencies", {
      params: { active_only: activeOnly },
    });
    return data;
  },

  async updateStatusAsAdmin(
    id: string,
    payload: SOSStatusUpdateRequest
  ): Promise<SOSEmergencyResponse> {
    const { data } = await api.put<SOSEmergencyResponse>(
      `/admin/emergencies/${id}/status`,
      payload
    );
    return data;
  },

  async cancelAsAdmin(
    id: string,
    payload: SOSCancelRequest = {}
  ): Promise<SOSEmergencyResponse> {
    const { data } = await api.post<SOSEmergencyResponse>(
      `/admin/emergencies/${id}/cancel`,
      payload
    );
    return data;
  },
};

export default sosService;
