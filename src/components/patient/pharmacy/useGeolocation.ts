import { useCallback, useEffect, useState } from "react";

export interface Coordinates {
  latitude: number;
  longitude: number;
}

interface GeolocationState {
  coords: Coordinates | null;
  error: string | null;
  isLocating: boolean;
  /** Permission was refused or unavailable — the caller should offer a manual path. */
  denied: boolean;
  request: () => void;
}

/**
 * The patient's position, for the nearby-pharmacy search.
 *
 * Deliberately never falls back to a default city. Ranking pharmacies around a
 * guessed location would surface shops the patient cannot reach and quote
 * delivery times that are fiction — an explicit "we don't know where you are"
 * is the honest state, and the caller renders a prompt instead of a result.
 */
export function useGeolocation(auto = true): GeolocationState {
  const [coords, setCoords] = useState<Coordinates | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [denied, setDenied] = useState(false);

  const request = useCallback(() => {
    if (typeof navigator === "undefined" || !navigator.geolocation) {
      setError("This browser cannot share your location.");
      setDenied(true);
      return;
    }

    setIsLocating(true);
    setError(null);

    navigator.geolocation.getCurrentPosition(
      (position) => {
        setCoords({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
        });
        setDenied(false);
        setIsLocating(false);
      },
      (positionError) => {
        setIsLocating(false);
        setDenied(true);
        setError(
          positionError.code === positionError.PERMISSION_DENIED
            ? "Location access was denied, so nearby pharmacies cannot be listed."
            : "Your location could not be determined.",
        );
      },
      // A stale fix is fine for ranking shops a few kilometres apart, and
      // avoids a cold GPS lock every time the page opens.
      { enableHighAccuracy: false, timeout: 10_000, maximumAge: 300_000 },
    );
  }, []);

  useEffect(() => {
    if (auto) request();
  }, [auto, request]);

  return { coords, error, isLocating, denied, request };
}
