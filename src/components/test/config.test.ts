import { describe, it, expect, afterEach, vi } from "vitest";

/**
 * Backend address resolution.
 *
 * The production incident this guards against: `VITE_API_URL` was set on the
 * deployment, the code read `VITE_API_BASE_URL`, and every request silently
 * fell back to `http://localhost:8000` — which fails in a browser that is not
 * the developer's. These tests pin both the variable names that are accepted
 * and the `/api/v1` suffix handling.
 */

const RAILWAY = "https://medbridge-backend-production-730e.up.railway.app";

/** Re-import the module with a specific environment. */
async function loadConfig(env: Record<string, string | undefined>) {
  vi.resetModules();
  vi.stubGlobal("import.meta.env", env);
  // Vite exposes env through import.meta; stubEnv is the supported hook.
  for (const [key, value] of Object.entries(env)) {
    vi.stubEnv(key, value as string);
  }
  return await import("@/lib/config");
}

afterEach(() => {
  vi.unstubAllEnvs();
  vi.resetModules();
});

describe("API base URL resolution", () => {
  it("uses VITE_API_URL when set", async () => {
    const { API_BASE_URL, API_ORIGIN } = await loadConfig({
      VITE_API_URL: RAILWAY,
      VITE_API_BASE_URL: undefined,
      VITE_WS_URL: undefined,
    });
    expect(API_ORIGIN).toBe(RAILWAY);
    expect(API_BASE_URL).toBe(`${RAILWAY}/api/v1`);
  });

  it("appends /api/v1 when the variable omits it", async () => {
    const { API_BASE_URL } = await loadConfig({ VITE_API_URL: RAILWAY });
    // The deployment supplies only the host; requests must still be versioned.
    expect(API_BASE_URL.endsWith("/api/v1")).toBe(true);
    expect(API_BASE_URL).not.toContain("/api/v1/api/v1");
  });

  it("does not double the prefix when the variable already includes it", async () => {
    const { API_BASE_URL } = await loadConfig({
      VITE_API_URL: `${RAILWAY}/api/v1`,
    });
    expect(API_BASE_URL).toBe(`${RAILWAY}/api/v1`);
  });

  it("tolerates a trailing slash", async () => {
    const { API_BASE_URL } = await loadConfig({ VITE_API_URL: `${RAILWAY}/` });
    expect(API_BASE_URL).toBe(`${RAILWAY}/api/v1`);
  });

  it("still honours the legacy VITE_API_BASE_URL name", async () => {
    const { API_BASE_URL } = await loadConfig({
      VITE_API_URL: undefined,
      VITE_API_BASE_URL: `${RAILWAY}/api/v1`,
    });
    expect(API_BASE_URL).toBe(`${RAILWAY}/api/v1`);
  });

  it("never resolves to localhost when a deployment URL is configured", async () => {
    const { API_BASE_URL } = await loadConfig({ VITE_API_URL: RAILWAY });
    expect(API_BASE_URL).not.toContain("localhost");
    expect(API_BASE_URL).not.toContain("127.0.0.1");
  });

  it("falls back to localhost only when nothing is configured", async () => {
    const { API_BASE_URL } = await loadConfig({
      VITE_API_URL: undefined,
      VITE_API_BASE_URL: undefined,
    });
    expect(API_BASE_URL).toBe("http://localhost:8000/api/v1");
  });
});

describe("WebSocket URL resolution", () => {
  it("derives wss from an https API URL", async () => {
    const { getWebSocketUrl } = await loadConfig({
      VITE_API_URL: RAILWAY,
      VITE_WS_URL: undefined,
    });
    const url = getWebSocketUrl();
    expect(url.startsWith("wss://")).toBe(true);
    expect(url).toContain("medbridge-backend-production-730e.up.railway.app");
    expect(url.endsWith("/api/v1/ws")).toBe(true);
    expect(url).not.toContain("localhost");
  });

  it("derives ws from an http API URL in development", async () => {
    const { getWebSocketUrl } = await loadConfig({
      VITE_API_URL: "http://localhost:8000",
      VITE_WS_URL: undefined,
    });
    expect(getWebSocketUrl()).toBe("ws://localhost:8000/api/v1/ws");
  });

  it("prefers an explicit VITE_WS_URL", async () => {
    const { getWebSocketUrl } = await loadConfig({
      VITE_API_URL: RAILWAY,
      VITE_WS_URL: "wss://sockets.example.com",
    });
    expect(getWebSocketUrl()).toBe("wss://sockets.example.com/api/v1/ws");
  });
});

describe("absolute route helper", () => {
  it("builds download links against the configured backend", async () => {
    const { apiUrl } = await loadConfig({ VITE_API_URL: RAILWAY });
    expect(apiUrl("/shared/reports/abc/download")).toBe(
      `${RAILWAY}/api/v1/shared/reports/abc/download`
    );
  });

  it("accepts a path without a leading slash", async () => {
    const { apiUrl } = await loadConfig({ VITE_API_URL: RAILWAY });
    expect(apiUrl("shared/search")).toBe(`${RAILWAY}/api/v1/shared/search`);
  });
});
