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

export function useVerifyDoctor() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, verifyIn }: { id: string; verifyIn: VerifyDoctorRequest }) =>
      adminService.verifyDoctor(id, verifyIn),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.pendingDoctors() });
      qc.invalidateQueries({ queryKey: ADMIN_KEYS.dashboard() });
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
