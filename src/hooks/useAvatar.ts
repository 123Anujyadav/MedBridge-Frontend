/**
 * Profile photo state.
 *
 * A photo appears in many places at once — the top bar, the profile page, case
 * queues, appointment lists, doctor cards. Rather than each surface fetching
 * its own copy, they all read the profile queries that already exist, and these
 * mutations write the fresh profile straight into that cache and invalidate
 * everything that embeds a copy of the avatar. That is what makes the new photo
 * appear everywhere without a page refresh.
 */

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import { useAuth } from "@/context/AuthContext";
import doctorService from "@/lib/doctor-service";
import patientService from "@/lib/patient-service";
import type { DoctorResponse, PatientResponse } from "@/types/api";

import { DOCTOR_KEYS } from "./useDoctor";
import { PATIENT_KEYS } from "./usePatient";

/**
 * Everything that carries a denormalised copy of an avatar.
 *
 * The backend refreshes those copies in the same transaction as the upload, so
 * the client only has to stop trusting what it already cached.
 */
function invalidateAvatarConsumers(
  qc: ReturnType<typeof useQueryClient>,
  role: "patient" | "doctor"
) {
  if (role === "patient") {
    qc.invalidateQueries({ queryKey: PATIENT_KEYS.dashboard() });
    qc.invalidateQueries({ queryKey: PATIENT_KEYS.appointments() });
    qc.invalidateQueries({ queryKey: PATIENT_KEYS.reports() });
    qc.invalidateQueries({ queryKey: PATIENT_KEYS.notifications() });
  } else {
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.dashboard() });
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.appointments() });
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.cases() });
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.patients() });
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.reports() });
    qc.invalidateQueries({ queryKey: DOCTOR_KEYS.notifications() });
  }
}

// ── Patient ───────────────────────────────────────────────────────────────

export function useUploadPatientAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => patientService.uploadAvatar(file),
    onSuccess: (profile: PatientResponse) => {
      qc.setQueryData(PATIENT_KEYS.profile(), profile);
      invalidateAvatarConsumers(qc, "patient");
    },
  });
}

export function useRemovePatientAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => patientService.removeAvatar(),
    onSuccess: (profile: PatientResponse) => {
      qc.setQueryData(PATIENT_KEYS.profile(), profile);
      invalidateAvatarConsumers(qc, "patient");
    },
  });
}

// ── Doctor ────────────────────────────────────────────────────────────────

export function useUploadDoctorAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (file: File) => doctorService.uploadAvatar(file),
    onSuccess: (profile: DoctorResponse) => {
      qc.setQueryData(DOCTOR_KEYS.profile(), profile);
      invalidateAvatarConsumers(qc, "doctor");
    },
  });
}

export function useRemoveDoctorAvatar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => doctorService.removeAvatar(),
    onSuccess: (profile: DoctorResponse) => {
      qc.setQueryData(DOCTOR_KEYS.profile(), profile);
      invalidateAvatarConsumers(qc, "doctor");
    },
  });
}

/**
 * The signed-in user's own photo, for chrome that is rendered on every page.
 *
 * Deliberately reuses the existing profile query keys rather than adding a
 * parallel one: an upload updates that cache entry, so the top bar re-renders
 * from the same write that updates the profile page. Admins have no clinical
 * profile, so nothing is fetched for them.
 */
export function useCurrentUserAvatar(): {
  avatarUrl?: string | null;
  displayName?: string;
} {
  const { role, isAuthenticated, user } = useAuth();

  const patient = useQuery({
    queryKey: PATIENT_KEYS.profile(),
    queryFn: () => patientService.getProfile(),
    enabled: isAuthenticated && role === "patient",
    staleTime: 1000 * 60 * 5,
  });

  const doctor = useQuery({
    queryKey: DOCTOR_KEYS.profile(),
    queryFn: () => doctorService.getProfile(),
    enabled: isAuthenticated && role === "doctor",
    staleTime: 1000 * 60 * 5,
  });

  if (role === "patient" && patient.data) {
    return {
      avatarUrl: patient.data.avatar_url,
      displayName: `${patient.data.first_name} ${patient.data.last_name}`.trim(),
    };
  }
  if (role === "doctor" && doctor.data) {
    return {
      avatarUrl: doctor.data.avatar_url,
      displayName: `Dr. ${doctor.data.first_name} ${doctor.data.last_name}`.trim(),
    };
  }
  return { avatarUrl: undefined, displayName: user?.email };
}
