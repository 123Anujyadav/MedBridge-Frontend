// ============================================
// useGeocoding — Nominatim via the MedBridge backend
// ============================================
import { useQuery } from "@tanstack/react-query";

import api from "@/lib/api";
import { useDebounced } from "@/hooks/usePharmacyAdmin";

export interface GeocodeResult {
  display_name: string;
  latitude: number;
  longitude: number;
  type: string | null;
  importance: number;
}

export interface ReverseGeocodeResult {
  latitude: number;
  longitude: number;
  /** Null when unknown — never a fabricated placeholder. */
  address: string | null;
}

/** Below this Nominatim returns noise, and the backend rejects it anyway. */
export const MIN_QUERY_LENGTH = 3;

const geocodingService = {
  async search(query: string, limit = 5): Promise<GeocodeResult[]> {
    const { data } = await api.get<GeocodeResult[]>("/pharmacy/geocode/search", {
      params: { q: query, limit },
    });
    return data;
  },

  async reverse(latitude: number, longitude: number): Promise<ReverseGeocodeResult> {
    const { data } = await api.get<ReverseGeocodeResult>(
      "/pharmacy/geocode/reverse",
      { params: { latitude, longitude } },
    );
    return data;
  },
};

/**
 * Address autocomplete.
 *
 * Debounced, cached and minimum-length gated. React Query's cache means
 * retyping a query that was already searched costs nothing, and the debounce
 * turns a ten-character address into one request rather than eight — which is
 * what Nominatim's usage policy asks for.
 *
 * Retries once: a single transient failure is common on a shared public
 * service, but hammering it after a real outage would be the wrong response.
 */
export function useAddressSearch(query: string, enabled = true) {
  const debounced = useDebounced(query, 400);
  const ready = enabled && debounced.trim().length >= MIN_QUERY_LENGTH;

  return useQuery<GeocodeResult[]>({
    queryKey: ["geocode", "search", debounced],
    queryFn: () => geocodingService.search(debounced.trim()),
    enabled: ready,
    // Addresses do not move. A long cache is both correct and polite.
    staleTime: 1000 * 60 * 30,
    gcTime: 1000 * 60 * 60,
    retry: 1,
    retryDelay: 1200,
    placeholderData: (previous) => previous,
  });
}

/**
 * The address for a coordinate pair.
 *
 * Rounded into the query key so GPS jitter does not defeat the cache — two
 * fixes eleven metres apart resolve to the same street address anyway.
 */
export function useReverseGeocode(
  latitude: number | undefined,
  longitude: number | undefined,
) {
  const ready = typeof latitude === "number" && typeof longitude === "number";

  return useQuery<ReverseGeocodeResult>({
    queryKey: [
      "geocode",
      "reverse",
      ready ? Number(latitude).toFixed(4) : "",
      ready ? Number(longitude).toFixed(4) : "",
    ],
    queryFn: () => geocodingService.reverse(latitude as number, longitude as number),
    enabled: ready,
    staleTime: 1000 * 60 * 30,
    retry: 1,
    retryDelay: 1200,
  });
}

export default geocodingService;
