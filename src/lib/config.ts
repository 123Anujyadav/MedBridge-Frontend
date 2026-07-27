/**
 * Runtime configuration — the single source of truth for backend addresses.
 *
 * Every API call, download link and WebSocket connection in the app resolves
 * its host from here. Nothing else may hardcode one: a literal
 * `http://localhost:8000` works on a laptop and then silently breaks in every
 * deployed environment, which is exactly the failure this module exists to
 * prevent.
 *
 * Configuration comes from Vite environment variables, which are inlined at
 * build time — so the value must be present in the build environment (for
 * Vercel, a Project Environment Variable), not just at runtime.
 */

/** The versioned path every backend route lives under. */
const API_PREFIX = "/api/v1";

/**
 * Raw value, in order of preference.
 *
 * `VITE_API_URL` is the documented name. `VITE_API_BASE_URL` is still read so
 * existing local `.env` files and older deployments keep working — the two were
 * historically confused, and a deployment that sets only the old name should
 * not fall back to localhost.
 */
const CONFIGURED_API_URL =
  (import.meta.env.VITE_API_URL as string | undefined)?.trim() ||
  (import.meta.env.VITE_API_BASE_URL as string | undefined)?.trim() ||
  "";

/**
 * Development default.
 *
 * `import.meta.env.DEV` is replaced by a literal at build time, so this whole
 * branch — and the localhost string inside it — is removed from production
 * bundles. A production build therefore *cannot* fall back to localhost, which
 * is precisely the failure that made deployed sign-ins call the developer's
 * own machine.
 */
function fallbackApiUrl(): string {
  if (import.meta.env.DEV) {
    return "http://localhost:8000";
  }
  // Deployed with no API URL configured: use the page's own origin, which is
  // correct when the backend is proxied under the same domain, and loudly
  // report the misconfiguration otherwise.
  console.error(
    "[config] VITE_API_URL is not set for this build. Falling back to the " +
      "page origin. Set VITE_API_URL in the deployment environment."
  );
  return typeof window !== "undefined" ? window.location.origin : "";
}

const RAW_API_URL = CONFIGURED_API_URL || fallbackApiUrl();

/** Strip trailing slashes so joins never produce `//`. */
function trimTrailingSlash(value: string): string {
  return value.replace(/\/+$/, "");
}

/**
 * Resolve the API origin — scheme and host, without the version prefix.
 *
 * Accepts every shape a deployment realistically supplies:
 *   `https://api.example.com`            → https://api.example.com
 *   `https://api.example.com/`           → https://api.example.com
 *   `https://api.example.com/api/v1`     → https://api.example.com
 *   `/api/v1` (same-origin behind proxy) → <page origin>
 */
function resolveApiOrigin(raw: string): string {
  const cleaned = trimTrailingSlash(raw);

  // A relative value means "same origin as the page", used when the backend is
  // proxied under the frontend's domain.
  if (cleaned.startsWith("/")) {
    const origin = typeof window !== "undefined" ? window.location.origin : "";
    return trimTrailingSlash(origin);
  }

  try {
    const url = new URL(cleaned);
    return trimTrailingSlash(`${url.protocol}//${url.host}`);
  } catch {
    // Not parseable as an absolute URL — return it as given rather than
    // silently substituting localhost and hiding the misconfiguration.
    return cleaned;
  }
}

/** `https://host` — no version prefix. Use for non-API assets. */
export const API_ORIGIN = resolveApiOrigin(RAW_API_URL);

/**
 * `https://host/api/v1` — what the axios client uses as its baseURL.
 *
 * The prefix is appended here rather than expected from the environment
 * variable, because deployments are routinely configured with only the host
 * (`https://backend.up.railway.app`). Requiring the suffix would send every
 * request to `/auth/...` instead of `/api/v1/auth/...` and 404 on all of them.
 */
export const API_BASE_URL = `${API_ORIGIN}${API_PREFIX}`;

/**
 * Resolve the WebSocket endpoint for the current environment.
 *
 * Order: explicit `VITE_WS_URL`, then derived from the API origin
 * (http → ws, https → wss), then the page origin for same-origin deployments.
 */
export function getWebSocketUrl(path = `${API_PREFIX}/ws`): string {
  const explicit = (import.meta.env.VITE_WS_URL as string | undefined)?.trim();
  if (explicit) {
    return `${trimTrailingSlash(explicit)}${path}`;
  }

  const toWs = (protocol: string) => (protocol === "https:" ? "wss:" : "ws:");

  try {
    const api = new URL(API_ORIGIN);
    return `${toWs(api.protocol)}//${api.host}${path}`;
  } catch {
    if (typeof window !== "undefined") {
      return `${toWs(window.location.protocol)}//${window.location.host}${path}`;
    }
    return path;
  }
}

/**
 * Absolute URL for a backend route, for the few places that need a real `href`
 * rather than an axios call — a download link the browser navigates to, for
 * instance.
 */
export function apiUrl(path: string): string {
  const suffix = path.startsWith("/") ? path : `/${path}`;
  return `${API_BASE_URL}${suffix}`;
}
