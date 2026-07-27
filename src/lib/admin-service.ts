// ============================================
// Admin Service — MedBridge Platform
// Wraps all /api/v1/admin/* API calls
// ============================================
import api from "./api";
import type {
  CaseResponse,
  AdminAnalyticsResponse,
  AdminDashboardResponse,
  AuditLogResponse,
  CreateHospitalRequest,
  DoctorResponse,
  HospitalResponse,
  HospitalVerificationRequest,
  SystemMonitorResponse,
  UserResponse,
  UserStatusUpdateRequest,
  VerifyDoctorRequest,
} from "@/types/api";

const adminService = {
  /**
   * Platform-wide case list.
   *
   * The admin Cases screen previously called the doctor-scoped list, which is
   * gated to the doctor role and returned 403 for every administrator.
   */
  async listCases(): Promise<CaseResponse[]> {
    const { data } = await api.get<CaseResponse[]>("/admin/cases");
    return data;
  },

  // ── Dashboard & Monitor ──────────────────────
  async getDashboard(): Promise<AdminDashboardResponse> {
    const { data } = await api.get<AdminDashboardResponse>("/admin/dashboard");
    return data;
  },

  async getAnalytics(): Promise<AdminAnalyticsResponse> {
    const { data } = await api.get<AdminAnalyticsResponse>("/admin/analytics");
    return data;
  },

  async getSystemMonitor(): Promise<SystemMonitorResponse> {
    const { data } = await api.get<SystemMonitorResponse>("/admin/monitor");
    return data;
  },

  // ── Users & Doctors ──────────────────────────
  async listUsers(role?: "patient" | "doctor" | "admin"): Promise<UserResponse[]> {
    const { data } = await api.get<UserResponse[]>("/admin/users", {
      params: role ? { role } : undefined,
    });
    return data;
  },

  async updateUserStatus(id: string, statusIn: UserStatusUpdateRequest): Promise<UserResponse> {
    const { data } = await api.put<UserResponse>(`/admin/users/${id}/status`, statusIn);
    return data;
  },

  async deleteUser(id: string): Promise<{ message: string; user_id: string }> {
    const { data } = await api.delete<{ message: string; user_id: string }>(`/admin/users/${id}`);
    return data;
  },


  async listPendingDoctors(): Promise<DoctorResponse[]> {
    const { data } = await api.get<DoctorResponse[]>("/admin/doctors/pending");
    return data;
  },

  async verifyDoctor(id: string, verifyIn: VerifyDoctorRequest): Promise<DoctorResponse> {
    const { data } = await api.put<DoctorResponse>(`/admin/doctors/${id}/verify`, verifyIn);
    return data;
  },

  // ── Hospitals ────────────────────────────────
  async listHospitals(): Promise<HospitalResponse[]> {
    const { data } = await api.get<HospitalResponse[]>("/admin/hospitals");
    return data;
  },

  async registerHospital(hospitalIn: CreateHospitalRequest): Promise<HospitalResponse> {
    const { data } = await api.post<HospitalResponse>("/admin/hospitals", hospitalIn);
    return data;
  },

  async verifyHospital(id: string, verifyIn: HospitalVerificationRequest): Promise<HospitalResponse> {
    const { data } = await api.put<HospitalResponse>(`/admin/hospitals/${id}/verify`, verifyIn);
    return data;
  },

  // ── Audit Logs ───────────────────────────────
  async getAuditLogs(limit: number = 100): Promise<AuditLogResponse[]> {
    const { data } = await api.get<AuditLogResponse[]>("/admin/audit-logs", {
      params: { limit },
    });
    return data;
  },
};

export default adminService;
