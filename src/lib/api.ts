// ============================================
// Axios API Client — MedBridge Platform
// Handles: base URL, auth headers, token refresh,
//          error normalisation, request queuing
// ============================================
import axios, {
  type AxiosInstance,
  type AxiosRequestConfig,
  type InternalAxiosRequestConfig,
} from "axios";

import { API_BASE_URL, getWebSocketUrl } from "./config";

// The base URL is resolved in one place (`lib/config.ts`) so that no module can
// reintroduce a hardcoded host. Re-exported because existing callers import
// `getWebSocketUrl` from this module.
const BASE_URL = API_BASE_URL;

export { getWebSocketUrl };

// Token storage keys
export const TOKEN_KEYS = {
  ACCESS: "aronofy_access_token",
  REFRESH: "aronofy_refresh_token",
  ROLE: "aronofy_role",
  USER: "aronofy_user",
} as const;

export function getAccessToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.ACCESS);
}
export function getRefreshToken(): string | null {
  return localStorage.getItem(TOKEN_KEYS.REFRESH);
}
export function setTokens(access: string, refresh: string): void {
  localStorage.setItem(TOKEN_KEYS.ACCESS, access);
  localStorage.setItem(TOKEN_KEYS.REFRESH, refresh);
}
export function clearTokens(): void {
  localStorage.removeItem(TOKEN_KEYS.ACCESS);
  localStorage.removeItem(TOKEN_KEYS.REFRESH);
  localStorage.removeItem(TOKEN_KEYS.ROLE);
  localStorage.removeItem(TOKEN_KEYS.USER);
}

// ── Create the axios instance ─────────────────
const api: AxiosInstance = axios.create({
  baseURL: BASE_URL,
  timeout: 15000,
  headers: { "Content-Type": "application/json" },
});

// ── Request interceptor — attach Bearer token ─
api.interceptors.request.use((config: InternalAxiosRequestConfig) => {
  const token = getAccessToken();
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// ── Response interceptor — auto token refresh ─
let isRefreshing = false;
let failedQueue: Array<{
  resolve: (value: string) => void;
  reject: (reason: unknown) => void;
}> = [];

function processQueue(error: unknown, token: string | null = null) {
  failedQueue.forEach(({ resolve, reject }) => {
    if (error) {
      reject(error);
    } else {
      resolve(token!);
    }
  });
  failedQueue = [];
}

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as AxiosRequestConfig & { _retry?: boolean };

    // If 401 and not already retrying and not on the refresh/login endpoint
    if (
      error.response?.status === 401 &&
      !originalRequest._retry &&
      !originalRequest.url?.includes("/auth/refresh") &&
      !originalRequest.url?.includes("/auth/login")
    ) {
      if (isRefreshing) {
        // Queue the request until refresh completes
        return new Promise((resolve, reject) => {
          failedQueue.push({ resolve, reject });
        })
          .then((token) => {
            originalRequest.headers = {
              ...originalRequest.headers,
              Authorization: `Bearer ${token}`,
            };
            return api(originalRequest);
          })
          .catch((err) => Promise.reject(err));
      }

      originalRequest._retry = true;
      isRefreshing = true;

      const refreshToken = getRefreshToken();
      if (!refreshToken) {
        clearTokens();
        processQueue(error, null);
        isRefreshing = false;
        window.location.href = "/";
        return Promise.reject(error);
      }

      try {
        // Sent in the body, never as a query param — a refresh token in a URL
        // is recorded in access logs, proxy logs and browser history.
        const response = await axios.post<{
          access_token: string;
          refresh_token: string;
        }>(`${BASE_URL}/auth/refresh`, { refresh_token: refreshToken });

        const { access_token, refresh_token } = response.data;
        setTokens(access_token, refresh_token);
        processQueue(null, access_token);

        originalRequest.headers = {
          ...originalRequest.headers,
          Authorization: `Bearer ${access_token}`,
        };
        return api(originalRequest);
      } catch (refreshError) {
        clearTokens();
        processQueue(refreshError, null);
        window.location.href = "/";
        return Promise.reject(refreshError);
      } finally {
        isRefreshing = false;
      }
    }

    // Normalise error message
    const message =
      error.response?.data?.detail ??
      error.response?.data?.message ??
      error.message ??
      "An unexpected error occurred.";

    return Promise.reject(new Error(message));
  }
);

/**
 * Turn a failed binary download into something worth showing a patient.
 *
 * The interceptor above reads the API's `message` off `error.response.data`,
 * but a request made with `responseType: "blob"` gets a `Blob` there even when
 * the server answered with JSON — so the lookup misses and the rejection falls
 * through to axios's own `error.message`. That is the string
 * "Request failed with status code 404", which is what a patient clicking
 * Download was shown.
 *
 * The blob is read back as text and the API's real message recovered. A
 * missing document is reported as such rather than as a transport failure.
 */
export async function describeDownloadFailure(error: unknown): Promise<string> {
  const response = (error as { response?: { status?: number; data?: unknown } })?.response;
  const status = response?.status;

  if (status === 404) return "Report not available.";
  if (status === 403) return "You do not have access to this report.";

  const data = response?.data;
  if (data instanceof Blob) {
    try {
      const parsed = JSON.parse(await data.text());
      if (typeof parsed?.message === "string" && parsed.message.trim()) {
        return parsed.message;
      }
    } catch {
      // Not JSON, or unreadable: fall through to the generic message.
    }
  }

  return "This report could not be downloaded. Please try again.";
}

export default api;
