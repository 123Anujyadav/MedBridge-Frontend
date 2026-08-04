// ============================================
// useNearbyHospitals — emergency facility search
// ============================================
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";

export interface NearbyHospital {
  place_id: string;
  name: string;
  address: string | null;
  latitude: number;
  longitude: number;
  /** Null whenever routing could not answer — never a guessed figure. */
  distance_km: number | null;
  eta_minutes: number | null;
  distance_text: string | null;
  duration_text: string | null;
  phone: string | null;
  directions_url: string;
}

export interface NearbyHospitalsResult {
  available: boolean;
  reason: string | null;
  latitude: number;
  longitude: number;
  hospitals: NearbyHospital[];
}

/**
 * Facilities near a coordinate, nearest first.
 *
 * Rounded into the query key so the small drift a GPS fix produces between
 * readings does not re-run an Overpass search that would return the same
 * hospitals. Five minutes of staleness is right for this: hospitals do not
 * move, and the screen is opened during an emergency where a re-fetch costs
 * seconds the patient does not have.
 *
 * One retry only. Overpass sheds load under pressure and the backend already
 * retries it once with backoff; hammering it from here would make an outage
 * worse rather than shorter.
 */
export function useNearbyHospitals(
  latitude: number | undefined,
  longitude: number | undefined,
  enabled = true,
) {
  const ready =
    enabled && typeof latitude === "number" && typeof longitude === "number";

  return useQuery<NearbyHospitalsResult>({
    queryKey: [
      "hospitals",
      "nearby",
      ready ? latitude!.toFixed(3) : "",
      ready ? longitude!.toFixed(3) : "",
    ],
    queryFn: async () => {
      const { data } = await api.get<NearbyHospitalsResult>(
        "/patient/hospitals/nearby",
        { params: { latitude, longitude, limit: 5 } },
      );
      return data;
    },
    enabled: ready,
    staleTime: 1000 * 60 * 5,
    gcTime: 1000 * 60 * 15,
    retry: 1,
    retryDelay: 1500,
  });
}

export default useNearbyHospitals;
