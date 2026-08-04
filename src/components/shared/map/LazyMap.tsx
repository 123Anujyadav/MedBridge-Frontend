import { Suspense, lazy } from "react";

import { LoadingState } from "@/components/shared/States";
import type { MapMarker } from "./MapView";

/**
 * Leaflet, its stylesheet and the clustering plugin total well over 150 kB.
 * Splitting them out keeps that off every screen that shows no map, and off
 * the initial bundle entirely.
 */
const MapView = lazy(() =>
  import("./MapView").then((module) => ({ default: module.MapView })),
);

interface LazyMapProps {
  markers?: MapMarker[];
  polyline?: [number, number][];
  center?: [number, number];
  zoom?: number;
  height?: string;
  cluster?: boolean;
  className?: string;
  ariaLabel?: string;
}

/**
 * A map that loads on demand.
 *
 * Use this everywhere rather than importing `MapView` directly — a static
 * import anywhere would pull Leaflet back into the main chunk and undo the
 * split for the whole application.
 */
export function LazyMap(props: LazyMapProps) {
  return (
    <Suspense
      fallback={
        <div style={{ height: props.height ?? "320px" }}>
          <LoadingState rows={2} />
        </div>
      }
    >
      <MapView {...props} />
    </Suspense>
  );
}

export type { MapMarker };
export default LazyMap;
