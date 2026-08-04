import { useCallback, useEffect, useState } from "react";
import {
  Building2,
  Clock,
  Crosshair,
  MapPin,
  Navigation,
  Phone,
  Route,
} from "lucide-react";

import { SectionCard } from "@/components/shared/FilterBar";
import { EmptyState, ErrorState, LoadingState } from "@/components/shared/States";
import { useEmergencyProfile } from "@/hooks/useEmergencyProfile";
import { useGeolocation } from "@/components/patient/pharmacy/useGeolocation";
import { useNearbyHospitals, type NearbyHospital } from "@/hooks/useNearbyHospitals";

interface NearbyHospitalsProps {
  /**
   * Bumped by the page whenever an emergency is raised, so the list is
   * re-fetched at the moment it matters most rather than showing whatever was
   * cached before the SOS.
   */
  refreshToken?: number;
}

/** One facility. Every field renders only when the backend actually knows it. */
function HospitalCard({ hospital }: { hospital: NearbyHospital }) {
  return (
    <li className="rounded-xl border border-border-subtle bg-surface-container-low p-4">
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0 space-y-1">
          <p className="flex items-center gap-2 font-semibold text-foreground">
            <Building2 className="h-4 w-4 shrink-0 text-primary" aria-hidden="true" />
            <span className="truncate">{hospital.name}</span>
          </p>

          {hospital.address && (
            <p className="flex items-start gap-2 text-body-sm text-muted-foreground">
              <MapPin className="mt-0.5 h-4 w-4 shrink-0" aria-hidden="true" />
              <span>{hospital.address}</span>
            </p>
          )}

          <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-body-sm text-muted-foreground">
            {/* Distance and time are absent whenever routing could not answer.
                A dash is the honest rendering; a guessed ETA on this screen is
                somewhere an ambulance gets sent. */}
            <span className="flex items-center gap-1.5">
              <Route className="h-4 w-4" aria-hidden="true" />
              {hospital.distance_text ?? "Distance unavailable"}
            </span>
            <span className="flex items-center gap-1.5">
              <Clock className="h-4 w-4" aria-hidden="true" />
              {hospital.duration_text ?? "Travel time unavailable"}
            </span>
          </div>

          {hospital.phone && (
            <a
              href={`tel:${hospital.phone}`}
              className="inline-flex items-center gap-1.5 text-body-sm font-medium text-primary hover:underline"
            >
              <Phone className="h-4 w-4" aria-hidden="true" />
              {hospital.phone}
            </a>
          )}
        </div>

        {/* The URL comes from the backend's shared builder — never assembled here. */}
        <a
          href={hospital.directions_url}
          target="_blank"
          rel="noreferrer noopener"
          aria-label={`Open navigation to ${hospital.name}`}
          className="inline-flex shrink-0 items-center gap-2 rounded-xl bg-primary px-4 py-2.5 text-body-sm font-semibold text-primary-foreground transition-all hover:opacity-90"
        >
          <Navigation className="h-4 w-4" aria-hidden="true" />
          Navigate
        </a>
      </div>
    </li>
  );
}

/**
 * Nearby hospitals for the emergency screen.
 *
 * Location is resolved in the order the patient is most likely to be findable:
 * the coordinates saved on their emergency profile first, because those are
 * already verified and need no prompt, then a live browser fix. If neither is
 * available the card says so and keeps the page's emergency call buttons as
 * the path forward — it never blocks or throws.
 */
export function NearbyHospitals({ refreshToken = 0 }: NearbyHospitalsProps) {
  const { data: profile } = useEmergencyProfile();
  const { coords: liveCoords, denied, isLocating, request } = useGeolocation(false);
  const [askedForLive, setAskedForLive] = useState(false);

  const profileLat = profile?.latitude ?? null;
  const profileLng = profile?.longitude ?? null;
  const hasProfileCoords =
    typeof profileLat === "number" && typeof profileLng === "number";

  // Priority: a live fix once we have one, otherwise the saved profile point.
  const latitude = liveCoords?.latitude ?? (hasProfileCoords ? profileLat! : undefined);
  const longitude = liveCoords?.longitude ?? (hasProfileCoords ? profileLng! : undefined);

  // Only prompt when there is nothing saved to fall back on. Asking for the
  // browser permission on a screen someone opened mid-emergency, when we
  // already know where they live, is a dialog in the way of the call buttons.
  useEffect(() => {
    if (!hasProfileCoords && !liveCoords && !denied && !askedForLive) {
      setAskedForLive(true);
      request();
    }
  }, [hasProfileCoords, liveCoords, denied, askedForLive, request]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useNearbyHospitals(latitude, longitude);

  // Re-run when the page signals an SOS was raised.
  useEffect(() => {
    if (refreshToken > 0 && latitude !== undefined) void refetch();
  }, [refreshToken, latitude, refetch]);

  const updateLocation = useCallback(() => {
    setAskedForLive(true);
    request();
  }, [request]);

  const actionButton = (
    <button
      type="button"
      onClick={updateLocation}
      disabled={isLocating}
      className="inline-flex items-center gap-2 rounded-xl border border-border-subtle px-4 py-2 text-body-sm font-semibold text-foreground transition-all hover:bg-surface-container-low disabled:opacity-60"
    >
      <Crosshair className="h-4 w-4" aria-hidden="true" />
      {isLocating ? "Locating…" : "Update location"}
    </button>
  );

  let body: React.ReactNode;

  if (isLocating && latitude === undefined) {
    body = <LoadingState rows={2} />;
  } else if (latitude === undefined || longitude === undefined) {
    body = (
      <EmptyState
        icon={<MapPin className="h-8 w-8" />}
        title="Location unavailable"
        description={
          denied
            ? "Location access is blocked, so we cannot search for facilities near you. Add an address to your emergency profile above, or call your local emergency number."
            : "We need your location to find nearby facilities."
        }
        action={denied ? undefined : actionButton}
      />
    );
  } else if (isLoading) {
    body = <LoadingState rows={3} />;
  } else if (isError) {
    body = (
      <ErrorState
        title="Could not load nearby facilities"
        description={
          // Never the raw error: it names internal hosts and means nothing on
          // a phone screen during an emergency.
          (error as { response?: { status?: number } })?.response?.status === 429
            ? "The facility directory is busy. Try again in a moment."
            : "We could not reach the facility directory. If this is urgent, call your local emergency number now."
        }
        onRetry={refetch}
      />
    );
  } else if (!data?.available || data.hospitals.length === 0) {
    body = (
      <EmptyState
        icon={<Building2 className="h-8 w-8" />}
        title="No facilities found nearby"
        description={
          data?.reason ??
          "Nothing was found within range of this location. If this is urgent, call your local emergency number now."
        }
        action={actionButton}
      />
    );
  } else {
    body = (
      <div className="space-y-3">
        <ul className="space-y-3">
          {data.hospitals.map((hospital) => (
            <HospitalCard key={hospital.place_id} hospital={hospital} />
          ))}
        </ul>
        <div className="flex items-center justify-between gap-3">
          <p className="text-body-sm text-muted-foreground">
            Nearest first, by driving time.
            {liveCoords ? " Using your current location." : " Using your saved location."}
          </p>
          {actionButton}
        </div>
      </div>
    );
  }

  return (
    <SectionCard
      title="Nearby Hospital Facilities"
      subtitle={isFetching && !isLoading ? "Updating…" : undefined}
    >
      {body}
    </SectionCard>
  );
}

export default NearbyHospitals;
