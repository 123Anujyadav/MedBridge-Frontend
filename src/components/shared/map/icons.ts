import L from "leaflet";

/**
 * Marker icons, built as inline SVG data URIs.
 *
 * Leaflet's default icons resolve their PNGs relative to the CSS file, which
 * Vite rewrites during bundling — the well-known result is markers that vanish
 * in production while working in dev. Inlining the artwork removes that whole
 * class of failure and keeps the palette matched to the MedBridge design
 * system rather than Leaflet's blue.
 */

/** Design-system colours, kept in sync with `index.css`. */
const PALETTE = {
  primary: "#00685f",
  secondary: "#6bd8cb",
  danger: "#b3261e",
  warning: "#f59e0b",
  slate: "#6d7a77",
} as const;

export type MarkerTone = keyof typeof PALETTE;

/** A teardrop pin with a glyph punched out of the centre. */
function pinSvg(color: string, glyph: string): string {
  return `
<svg xmlns="http://www.w3.org/2000/svg" width="32" height="42" viewBox="0 0 32 42">
  <path d="M16 0C7.2 0 0 7.2 0 16c0 11 16 26 16 26s16-15 16-26c0-8.8-7.2-16-16-16z"
        fill="${color}"/>
  <circle cx="16" cy="16" r="9" fill="#ffffff"/>
  <text x="16" y="21" font-size="12" font-family="system-ui,sans-serif"
        font-weight="700" text-anchor="middle" fill="${color}">${glyph}</text>
</svg>`.trim();
}

function toDataUri(svg: string): string {
  // encodeURIComponent rather than base64: it keeps the URI readable in
  // devtools and avoids a btoa call that breaks on non-ASCII glyphs.
  return `data:image/svg+xml;charset=UTF-8,${encodeURIComponent(svg)}`;
}

const cache = new Map<string, L.Icon>();

/**
 * A pin icon, memoised.
 *
 * Leaflet compares icon identity when deciding whether to re-render a marker,
 * so returning a fresh object each call would rebuild every marker on every
 * map update.
 */
export function pinIcon(tone: MarkerTone, glyph = "•"): L.Icon {
  const key = `${tone}:${glyph}`;
  const existing = cache.get(key);
  if (existing) return existing;

  const icon = L.icon({
    iconUrl: toDataUri(pinSvg(PALETTE[tone], glyph)),
    iconSize: [32, 42],
    iconAnchor: [16, 42],
    popupAnchor: [0, -38],
  });
  cache.set(key, icon);
  return icon;
}

let currentLocation: L.DivIcon | null = null;

/**
 * A pulsing dot for the viewer's own position — distinct from a destination.
 *
 * Memoised for the same reason `pinIcon` is, and it matters more here: this is
 * the marker on the live-tracking screens, so it is rebuilt on every GPS tick
 * unless the identity is stable.
 */
export function currentLocationIcon(): L.DivIcon {
  if (currentLocation) return currentLocation;

  currentLocation = L.divIcon({
    className: "",
    html: `<span style="
      display:block;width:16px;height:16px;border-radius:9999px;
      background:${PALETTE.primary};border:3px solid #fff;
      box-shadow:0 0 0 4px ${PALETTE.primary}33;"></span>`,
    iconSize: [16, 16],
    iconAnchor: [8, 8],
  });
  return currentLocation;
}

export const ICONS = {
  pharmacy: () => pinIcon("primary", "℞"),
  hospital: () => pinIcon("danger", "H"),
  patient: () => pinIcon("secondary", "P"),
  rider: () => pinIcon("warning", "▲"),
  generic: () => pinIcon("slate", "•"),
};
