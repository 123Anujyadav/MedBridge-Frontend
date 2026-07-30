// ============================================
// useEmergencyProfile — React Query hooks
// Emergency Profile fetching + mutations
// ============================================
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import emergencyProfileService from "@/lib/emergency-profile-service";
import { useAuth } from "@/context/AuthContext";
import type {
  EmergencyLocationUpdate,
  EmergencyProfileResponse,
  EmergencyProfileUpsert,
} from "@/types/api";

/**
 * The cache key, scoped to the signed-in account.
 *
 * Two deliberate choices, both of which were bugs before.
 *
 * **It carries the user id.** The React Query cache is not cleared when someone
 * signs out, so on a shared browser the next person to sign in — without a page
 * reload — could be served the previous patient's cached entry for as long as
 * it stayed fresh. That entry is a home address and an emergency contact's
 * telephone number. Keying by user id makes one account's data unreachable from
 * another's rather than merely unlikely to be shown.
 *
 * **It does not sit under `["patient"]`.** `useWebSocket` invalidates
 * `PATIENT_KEYS.all` on several unrelated events, and React Query matches
 * invalidation by key prefix — so an appointment or notification message was
 * re-fetching the emergency profile, which none of those events can change.
 */
export const emergencyProfileKey = (userId?: string) =>
  ["emergencyProfile", userId ?? "anonymous"] as const;

/**
 * The signed-in patient's emergency profile.
 *
 * One query for the whole record. Every mutation below writes the server's
 * response straight into this cache entry with `setQueryData` instead of
 * invalidating it, so saving an address or capturing a position costs one
 * request rather than two — the server already returned the updated profile,
 * and re-fetching it would be asking a question that was just answered.
 */
export function useEmergencyProfile() {
  const { user } = useAuth();
  return useQuery<EmergencyProfileResponse | null>({
    queryKey: emergencyProfileKey(user?.id),
    queryFn: () => emergencyProfileService.getProfile(),
    // Nothing to fetch before the session is known, and firing anyway would
    // write an anonymous 401 into the cache that the real entry then has to
    // overwrite.
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
}

/** The key for the account that is currently signed in. */
function useCurrentKey() {
  const { user } = useAuth();
  return emergencyProfileKey(user?.id);
}

export function useSaveEmergencyProfile() {
  const qc = useQueryClient();
  const key = useCurrentKey();
  return useMutation({
    mutationFn: (payload: EmergencyProfileUpsert) =>
      emergencyProfileService.saveProfile(payload),
    onSuccess: (profile) => qc.setQueryData(key, profile),
  });
}

export function useUpdateEmergencyLocation() {
  const qc = useQueryClient();
  const key = useCurrentKey();
  return useMutation({
    mutationFn: (payload: EmergencyLocationUpdate) =>
      emergencyProfileService.updateLocation(payload),
    onSuccess: (profile) => qc.setQueryData(key, profile),
  });
}

export function useClearEmergencyLocation() {
  const qc = useQueryClient();
  const key = useCurrentKey();
  return useMutation({
    mutationFn: () => emergencyProfileService.clearLocation(),
    onSuccess: (profile) => qc.setQueryData(key, profile),
  });
}

export function useDeleteEmergencyProfile() {
  const qc = useQueryClient();
  const key = useCurrentKey();
  return useMutation({
    mutationFn: () => emergencyProfileService.deleteProfile(),
    onSuccess: () => qc.setQueryData(key, null),
  });
}

// ── browser geolocation ──────────────────────────────────────────────────

export interface GeolocationFailure {
  code: "unsupported" | "denied" | "unavailable" | "timeout" | "unknown";
  message: string;
}

/**
 * Ask the browser for the device's position.
 *
 * Resolves to coordinates or rejects with a `GeolocationFailure` carrying a
 * message written for a patient rather than a developer. Every documented
 * failure is named — a denied permission and a timed-out sensor need different
 * advice, and "Could not get location" tells someone neither what happened nor
 * what to do about it.
 *
 * Nothing here throws asynchronously into a render, so a refusal cannot take
 * the page down with it.
 */
export function requestBrowserLocation(): Promise<{
  latitude: number;
  longitude: number;
}> {
  return new Promise((resolve, reject) => {
    if (typeof navigator === "undefined" || !("geolocation" in navigator)) {
      reject({
        code: "unsupported",
        message:
          "This browser cannot provide your location. You can still save your registered address.",
      } satisfies GeolocationFailure);
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) =>
        resolve({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        }),
      (error) => {
        const failures: Record<number, GeolocationFailure> = {
          1: {
            code: "denied",
            message:
              "Location permission was denied. Allow location access in your browser settings, then try again.",
          },
          2: {
            code: "unavailable",
            message:
              "Your position could not be determined right now. Check that location services are switched on.",
          },
          3: {
            code: "timeout",
            message:
              "Locating you took too long. Move somewhere with a better signal and try again.",
          },
        };
        reject(
          failures[error.code] ?? {
            code: "unknown",
            message: "Your location could not be captured. Please try again.",
          }
        );
      },
      // A stale fix is worse than none for an emergency record, so a cached
      // position is not accepted and the attempt is given a bounded budget.
      { enableHighAccuracy: true, timeout: 15000, maximumAge: 0 }
    );
  });
}
