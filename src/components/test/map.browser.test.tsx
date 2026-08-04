import { test, expect, afterEach } from "vitest";
import { render } from "vitest-browser-react";

import { MapView, type MapMarker } from "@/components/shared/map/MapView";
import { ICONS, currentLocationIcon, pinIcon } from "@/components/shared/map/icons";

/**
 * Leaflet only behaves in a real browser — it measures elements, reads
 * computed styles and attaches DOM listeners — so these run under the
 * Playwright provider rather than jsdom.
 */

/** Map initialisation is not instant, and slows as the browser fills up. */
const POLL = { timeout: 8000 } as const;

/**
 * Leaflet finishes work asynchronously after unmount — tile fades, pending
 * transitions. Letting it settle between tests keeps one test's teardown from
 * surfacing as an unhandled rejection inside the next one.
 */
afterEach(async () => {
  await new Promise((resolve) => setTimeout(resolve, 60));
});

const MARKERS: MapMarker[] = [
  { id: "me", latitude: 28.6315, longitude: 77.2167, kind: "current", title: "You" },
  { id: "p1", latitude: 28.6129, longitude: 77.2295, kind: "pharmacy", title: "Pharmacy A" },
  { id: "p2", latitude: 28.6562, longitude: 77.241, kind: "pharmacy", title: "Pharmacy B" },
];

const containers = () => document.querySelectorAll(".leaflet-container").length;
const tiles = () => document.querySelectorAll(".leaflet-tile").length;
const markerIcons = () => document.querySelectorAll(".leaflet-marker-icon").length;

/**
 * Ordering matters. The teardown tests unmount by hand, which detaches the
 * harness's mount root; anything rendering after them would mount outside
 * `document` and appear to render nothing. Rendering assertions therefore run
 * first, and everything that deliberately unmounts runs at the end.
 */

test("renders tiles, panes and every marker", async () => {
  const screen = await render(<MapView markers={MARKERS} height="300px" />);

  await expect.element(screen.getByRole("region", { name: "Map" })).toBeInTheDocument();

  const container = document.querySelector(".leaflet-container");
  expect(container).not.toBeNull();

  // The stylesheet ships inside the lazy chunk; without it Leaflet lays panes
  // out at zero size and the map renders as a grey box.
  expect(getComputedStyle(container as Element).position).toBe("relative");
  expect((container as HTMLElement).clientHeight).toBeGreaterThan(0);

  await expect.poll(tiles, POLL).toBeGreaterThan(0);
  await expect.poll(markerIcons, POLL).toBe(MARKERS.length);
});

test("marker icons are inline data URIs, not Leaflet's bundled PNGs", async () => {
  await render(<MapView markers={MARKERS} height="300px" />);

  await expect
    .poll(() => document.querySelectorAll("img.leaflet-marker-icon").length, POLL)
    .toBeGreaterThan(0);

  // The classic production failure is Vite rewriting Leaflet's relative PNG
  // paths, leaving markers invisible. Inline SVG removes that whole class.
  for (const img of Array.from(document.querySelectorAll("img.leaflet-marker-icon"))) {
    expect((img as HTMLImageElement).src.startsWith("data:image/svg+xml")).toBe(true);
  }
});

test("icons are memoised so markers are not rebuilt on every update", () => {
  expect(pinIcon("primary", "R")).toBe(pinIcon("primary", "R"));
  expect(ICONS.pharmacy()).toBe(ICONS.pharmacy());
  // Regression guard: this one was rebuilt on every GPS tick on the
  // live-tracking screens, which is the highest-frequency map path there is.
  expect(currentLocationIcon()).toBe(currentLocationIcon());
});

test("draws a polyline when route geometry is supplied", async () => {
  await render(
    <MapView
      markers={MARKERS.slice(0, 2)}
      polyline={[
        [28.6315, 77.2167],
        [28.6221, 77.2231],
        [28.6129, 77.2295],
      ]}
      height="300px"
    />,
  );

  await expect
    .poll(() => document.querySelectorAll("path.leaflet-interactive").length, POLL)
    .toBeGreaterThan(0);
});

test("a single marker centres instead of zooming to maximum", async () => {
  await render(<MapView markers={[MARKERS[1]]} height="300px" zoom={14} />);

  await expect.poll(markerIcons, POLL).toBe(1);
  // fitBounds on one point would slam to maxZoom; the guard keeps it usable.
  await expect.poll(tiles, POLL).toBeGreaterThan(0);
});

test("clustering collapses a dense set into fewer rendered markers", async () => {
  const dense: MapMarker[] = Array.from({ length: 40 }, (_, i) => ({
    id: `d${i}`,
    latitude: 28.63 + (i % 8) * 0.0004,
    longitude: 77.21 + Math.floor(i / 8) * 0.0004,
    kind: "pharmacy" as const,
  }));

  await render(<MapView markers={dense} cluster height="300px" />);

  await expect.poll(markerIcons, POLL).toBeGreaterThan(0);
  expect(markerIcons()).toBeLessThan(dense.length);
});

test("renders without a ResizeObserver rather than crashing", async () => {
  const original = window.ResizeObserver;
  // Older embedded webviews lack it; an unguarded constructor would throw
  // inside the effect and take the map down.
  // @ts-expect-error deliberately removing a global for this test
  delete window.ResizeObserver;
  try {
    await render(<MapView markers={MARKERS} height="300px" />);
    await expect.poll(containers, POLL).toBe(1);
  } finally {
    window.ResizeObserver = original;
  }
});

test("unmount removes the map and leaves no detached container", async () => {
  const screen = await render(<MapView markers={MARKERS} height="300px" />);
  await expect.poll(tiles, POLL).toBeGreaterThan(0);

  screen.unmount();

  expect(containers()).toBe(0);
  expect(markerIcons()).toBe(0);
});

test("repeated mount/unmount cycles leave nothing behind", async () => {
  // Two regressions in one. Leaving a screen before its map had settled used
  // to leave Leaflet dereferencing panes that removal had discarded; and any
  // DOM left behind compounds, because the delivery and pharmacy screens mount
  // a map on every navigation.
  for (let i = 0; i < 5; i++) {
    const screen = await render(<MapView markers={MARKERS} height="240px" />);
    screen.unmount();
  }

  expect(containers()).toBe(0);
  expect(document.querySelectorAll(".leaflet-pane").length).toBe(0);
  expect(document.querySelectorAll("img.leaflet-tile").length).toBe(0);
});
