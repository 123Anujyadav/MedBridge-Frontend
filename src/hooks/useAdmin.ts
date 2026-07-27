// ============================================
// useAdmin — React Query hooks for Administrators
// Data fetching + mutations with caching & retries
// ============================================
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import adminService from "@/lib/admin-service";
import type {
  CreateHospitalRequest,
  HospitalVerificationRequest,
  UserStatusUpdateRequest,
  VerifyDoctorRequest,
} from "@/types/api";

export const ADMIN_KEYS = {
  all: ["admin"] as const,
  dashboard: () => [...ADMIN_KEYS.all, "dashboard"] as const,
  analytics: () => [...ADMIN_KEYS.all, "analytics"] as const,
  monitor: () => [...ADMIN_KEYS.all, "monitor"] as const,
  users: (role?: string) => [...ADMIN_KEYS.all, "users", role] as const,
  pendingDoctors: () => [...ADMIN_KEYS.all, "pendingDoctors"] as const,
  doctorsForReview: (status?: string, page?: number, size?: number) =>
    [...ADMIN_KEYS.all, "doctorsForReview", status, page, size] as const,
  adminAccountCap: () => [...ADMIN_KEYS.all, "adminAccountCap"] as const,
  hospitals: () => [...ADMIN_KEYS.all, "hospitals"] as const,
  auditLogs: (limit?: number) => [...ADMIN_KEYS.all, "auditLogs", limit] as const,
};

export function useAdminDashboard() {
  return useQuery({
    queryKey: ADMIN_KEYS.dashboard(),
    queryFn: () => adminService.getDashboard(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useAdminAnalytics() {
  return useQuery({
    queryKey: ADMIN_KEYS.analytics(),
    queryFn: () => adminService.getAnalytics(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useAdminCases() {
  return useQuery({
    queryKey: [...ADMIN_KEYS.all, "cases"],
    queryFn: () => adminService.listCases(),
    staleTime: 1000 * 60 * 2,
  });
}

export function useSystemMonitor() {
  return useQuery({
    queryKey: ADMIN_KEYS.monitor(),
    queryFn: () => adminService.getSystemMonitor(),
    staleTime: 1000 * 15, // 15 sec poll for live monitoring
    refetchInterval: 1000 * 30,
  });
}

export function useAdminUsers(role?: "patient" | "doctor" | "admin") {
  return useQuery({
    queryKey: ADMIN_KEYS.users(role),
    queryFn: () => adminService.listUsers(role),
    staleTime: 1000 * 60 * 5,
  });
}

export function useUpdateUserStatus() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, statusIn }: { id: string; statusIn: UserStatusUpdateRequest }) =>
      adminService.updateUserStatus(id, statusIn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.users() });
    },
  });
}

export function useDeleteUser() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => adminService.deleteUser(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.users() });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard() });
    },
  });
}


export function usePendingDoctors() {
  return useQuery({
    queryKey: ADMIN_KEYS.pendingDoctors(),
    queryFn: () => adminService.listPendingDoctors(),
    staleTime: 1000 * 60 * 2,
  });
}

/**
 * One page of clinicians, whatever their verification status.
 *
 * `staleTime: 0` — unlike the other admin lists this one is the surface an
 * administrator acts on, and a cached row would show an approval that has
 * already been revoked in another tab.
 *
 * `placeholderData` keeps the previous page on screen while the next one
 * loads, so paging does not flash the empty state between requests.
 */
export function useDoctorsForReview(
  verificationStatus?: string,
  page: number = 1,
  size: number = 25
) {
  return useQuery({
    queryKey: ADMIN_KEYS.doctorsForReview(verificationStatus, page, size),
    queryFn: () => adminService.listDoctorsForReview(verificationStatus, page, size),
    staleTime: 0,
    placeholderData: (previous) => previous,
  });
}

export function useAdminAccountCap() {
  return useQuery({
    queryKey: ADMIN_KEYS.adminAccountCap(),
    queryFn: () => adminService.getAdminAccountCap(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useVerifyDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verifyIn }: { id: string; verifyIn: VerifyDoctorRequest }) =>
      adminService.verifyDoctor(id, verifyIn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.pendingDoctors() });
      qc.invalidateQueries({ queryKey: [...ADMIN_KEYS.all, "doctorsForReview"] });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard() });
    },
  });
}

/**
 * Suspend or reinstate a clinician's account.
 *
 * Reuses the existing user-status route rather than adding a doctor-specific
 * one: suspension is an account-level switch — `is_active` — and every
 * authenticated request already re-reads it, so this takes effect immediately.
 */
export function useSetDoctorAccountActive() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, isActive }: { id: string; isActive: boolean }) =>
      adminService.updateUserStatus(id, { is_active: isActive }),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [...ADMIN_KEYS.all, "doctorsForReview"] });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.users() });
    },
  });
}

export function useAdminHospitals() {
  return useQuery({
    queryKey: ADMIN_KEYS.hospitals(),
    queryFn: () => adminService.listHospitals(),
    staleTime: 1000 * 60 * 5,
  });
}

export function useRegisterHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (hospitalIn: CreateHospitalRequest) => adminService.registerHospital(hospitalIn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.hospitals() });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard() });
    },
  });
}

export function useVerifyHospital() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verifyIn }: { id: string; verifyIn: HospitalVerificationRequest }) =>
      adminService.verifyHospital(id, verifyIn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.hospitals() });
    },
  });
}

export function useAuditLogs(limit: number = 100) {
  return useQuery({
    queryKey: ADMIN_KEYS.auditLogs(limit),
    queryFn: () => adminService.getAuditLogs(limit),
    staleTime: 1000 * 60 * 5,
  });
}
