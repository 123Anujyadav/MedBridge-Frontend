import { useEffect, useMemo } from "react";
import {
  MapContainer,
  Marker,
  Polyline,
  Popup,
  TileLayer,
  useMap,
} from "react-leaflet";
import MarkerClusterGroup from "react-leaflet-cluster";
import type { LatLngTuple } from "leaflet";

// Leaflet ships its own stylesheet and will not lay a map out without it.
// Imported here rather than globally so it only loads with the lazy map chunk.
import "leaflet/dist/leaflet.css";

import { ICONS, currentLocationIcon, type MarkerTone, pinIcon } from "./icons";

export interface MapMarker {
  id: string;
  latitude: number;
  longitude: number;
  /** Chooses the icon. `current` renders the pulsing self-location dot. */
  kind?: "pharmacy" | "hospital" | "patient" | "rider" | "current" | "generic";
  tone?: MarkerTone;
  glyph?: string;
  title?: string;
  /** Rendered inside the popup. Plain nodes only — no map APIs. */
  popup?: React.ReactNode;
}

interface MapViewProps {
  markers?: MapMarker[];
  /** Route geometry as [lat, lng] pairs, in Leaflet order. */
  polyline?: LatLngTuple[];
  center?: LatLngTuple;
  zoom?: number;
  height?: string;
  /** Cluster markers. Worth it above ~20 pins, noise below that. */
  cluster?: boolean;
  className?: string;
  ariaLabel?: string;
}

const OSM_TILES = "https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png";
const OSM_ATTRIBUTION =
  '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors';

/** Fallback centre used only when there is nothing at all to show. */
const FALLBACK_CENTER: LatLngTuple = [20.5937, 78.9629];

function iconFor(marker: MapMarker) {
  if (marker.kind === "current") return currentLocationIcon();
  if (marker.tone) return pinIcon(marker.tone, marker.glyph ?? "•");
  return (ICONS[marker.kind ?? "generic"] ?? ICONS.generic)();
}

/**
 * Keeps the viewport framed on the content.
 *
 * A child component because `useMap` only works inside `MapContainer`, and
 * because `MapContainer` ignores `center`/`zoom` changes after mount by design.
 */
function FitBounds({
  markers,
  polyline,
  center,
  zoom,
}: {
  markers: MapMarker[];
  polyline?: LatLngTuple[];
  center?: LatLngTuple;
  zoom?: number;
}) {
  const map = useMap();

  useEffect(() => {
    const points: LatLngTuple[] = [
      ...markers.map((m) => [m.latitude, m.longitude] as LatLngTuple),
      ...(polyline ?? []),
    ];

    // `animate: false` is load-bearing, not a preference.
    //
    // An animated programmatic fit runs a CSS transition on the map pane for a
    // few hundred milliseconds. If the user navigates away inside that window
    // — tapping a pharmacy card the moment the list appears is enough —
    // react-leaflet removes the map while the transition is still pending, and
    // Leaflet's `_onZoomTransitionEnd` then dereferences panes that no longer
    // exist, throwing an uncaught TypeError on an ordinary navigation.
    //
    // Only this automatic framing is affected. Zooming and panning by hand
    // still animate exactly as before.
    //
    // Deliberately no cleanup function here. React tears children down after
    // the parent, so by the time this effect could clean up, `MapContainer`
    // has already called `map.remove()`; touching the map at that point —
    // even `map.stop()`, which internally reads the map centre — throws on
    // the panes that removal just discarded.
    if (points.length === 0) {
      if (center) map.setView(center, zoom ?? 13, { animate: false });
    } else if (points.length === 1) {
      // A single point has no extent to fit; fitBounds would zoom to maximum.
      map.setView(points[0], zoom ?? 15, { animate: false });
    } else {
      map.fitBounds(points, {
        padding: [48, 48],
        maxZoom: 16,
        animate: false,
      });
    }
  }, [map, markers, polyline, center, zoom]);

  return null;
}

/**
 * Keeps the map sized to its container.
 *
 * Leaflet measures once on mount. A map inside a card that changes width — a
 * sidebar opening, a tab becoming visible — renders grey tiles until told to
 * re-measure, so the container is observed rather than assumed static.
 */
function ResizeObserverBridge() {
  const map = useMap();

  useEffect(() => {
    // Always re-measure on the next frame: the first measurement often lands
    // before the parent has finished laying out.
    const raf = requestAnimationFrame(() => map.invalidateSize());

    // Guarded because an unguarded constructor call would throw inside an
    // effect and take the whole map down with it. Every current browser has
    // ResizeObserver; test renderers and older embedded webviews do not, and
    // a map that cannot resize is still far better than one that crashes.
    if (typeof ResizeObserver === "undefined") {
      return () => cancelAnimationFrame(raf);
    }

    const observer = new ResizeObserver(() => map.invalidateSize());
    observer.observe(map.getContainer());
    return () => {
      observer.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [map]);

  return null;
}

/**
 * An interactive OpenStreetMap.
 *
 * Zoom, pan, clustering, custom icons, popups, route polylines and fit-bounds,
 * with no API key and no third-party SDK. Import it lazily — Leaflet and its
 * stylesheet are dead weight on screens that show no map.
 */
export function MapView({
  markers = [],
  polyline,
  center,
  zoom = 13,
  height = "320px",
  cluster = false,
  className,
  ariaLabel = "Map",
}: MapViewProps) {
  // Memoised so a parent re-render does not rebuild every marker element.
  const rendered = useMemo(
    () =>
      markers.map((marker) => (
        <Marker
          key={marker.id}
          position={[marker.latitude, marker.longitude]}
          icon={iconFor(marker)}
          title={marker.title}
        >
          {marker.popup ? <Popup>{marker.popup}</Popup> : null}
        </Marker>
      )),
    [markers],
  );

  const initialCenter: LatLngTuple =
    center ??
    (markers.length > 0
      ? [markers[0].latitude, markers[0].longitude]
      : FALLBACK_CENTER);

  return (
    <div
      className={className}
      style={{ height }}
      role="region"
      aria-label={ariaLabel}
    >
      <MapContainer
        center={initialCenter}
        zoom={zoom}
        scrollWheelZoom
        style={{ height: "100%", width: "100%", borderRadius: "0.75rem" }}
      >
        <TileLayer url={OSM_TILES} attribution={OSM_ATTRIBUTION} maxZoom={19} />

        {cluster ? (
          <MarkerClusterGroup chunkedLoading>{rendered}</MarkerClusterGroup>
        ) : (
          rendered
        )}

        {polyline && polyline.length > 1 && (
          <Polyline positions={polyline} pathOptions={{ color: "#00685f", weight: 4 }} />
        )}

        <FitBounds
          markers={markers}
          polyline={polyline}
          center={center}
          zoom={zoom}
        />
        <ResizeObserverBridge />
      </MapContainer>
    </div>
  );
}

export default MapView;
