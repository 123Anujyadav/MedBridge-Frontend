import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, act, waitFor } from "@testing-library/react";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import authService from "@/lib/auth-service";
import type { UserResponse } from "@/types/api";

/**
 * The React Query cache must not survive a change of user.
 *
 * It lives in memory for the lifetime of the tab and is keyed by *query*, not
 * by account. Signing out used to clear the tokens and leave the cache intact,
 * so the next person to sign in on the same tab — without a page reload —
 * could be handed the previous user's emergency profile, home address, contact
 * numbers or cases straight out of it for as long as the entry stayed fresh.
 *
 * These tests assert on the cache itself rather than on any screen, because
 * that is where the data actually sat.
 */

vi.mock("@/lib/auth-service", () => ({
  default: {
    login: vi.fn(),
    loginDoctor: vi.fn(),
    logout: vi.fn(),
    restoreSession: vi.fn(),
    signupPatient: vi.fn(),
  },
}));

const mocked = vi.mocked(authService);

const PATIENT: UserResponse = {
  id: "11111111-1111-4111-8111-111111111111",
  email: "patient@example.com",
  role: "patient",
  is_active: true,
  is_verified: true,
} as UserResponse;

const DOCTOR: UserResponse = {
  id: "22222222-2222-4222-8222-222222222222",
  email: "doctor@example.com",
  role: "doctor",
  is_active: true,
  is_verified: true,
} as UserResponse;

/** Stand-ins for the sensitive things really cached under these keys. */
const SENSITIVE = {
  emergencyProfile: ["emergencyProfile", PATIENT.id],
  sosActive: ["sos", "active", PATIENT.id],
  patient: ["patient", "profile"],
  doctor: ["doctor", "dashboard"],
  admin: ["admin", "users"],
  shared: ["shared", "unread-count"],
};

let queryClient: QueryClient;
let auth: ReturnType<typeof useAuth>;

function Probe() {
  auth = useAuth();
  return null;
}

function seedCache() {
  queryClient.setQueryData(SENSITIVE.emergencyProfile, {
    contact_phone: "+919876543210",
    formatted_address: "12/A, Gandhi Road, Patna",
  });
  queryClient.setQueryData(SENSITIVE.sosActive, { active: true });
  queryClient.setQueryData(SENSITIVE.patient, { first_name: "Jane" });
  queryClient.setQueryData(SENSITIVE.doctor, { cases: 3 });
  queryClient.setQueryData(SENSITIVE.admin, [{ email: "admin@x.com" }]);
  queryClient.setQueryData(SENSITIVE.shared, 7);
}

function cachedKeys() {
  return queryClient.getQueryCache().getAll().map((q) => q.queryKey);
}

async function mount() {
  queryClient = new QueryClient({
    defaultOptions: { queries: { retry: false } },
  });
  render(
    <QueryClientProvider client={queryClient}>
      <BrowserRouter>
        <AuthProvider>
          <Probe />
        </AuthProvider>
      </BrowserRouter>
    </QueryClientProvider>
  );
  await waitFor(() => expect(mocked.restoreSession).toHaveBeenCalled());
}

describe("cache is purged when the session changes", () => {
  beforeEach(() => {
    vi.clearAllMocks();
    mocked.restoreSession.mockResolvedValue(PATIENT);
    mocked.logout.mockResolvedValue(undefined);
    localStorage.clear();
  });

  it("removes every cached entry on logout", async () => {
    await mount();
    seedCache();
    expect(cachedKeys().length).toBe(6);

    await act(async () => {
      await auth.logout();
    });

    expect(cachedKeys()).toHaveLength(0);
  });

  it.each(Object.entries(SENSITIVE))(
    "leaves nothing behind under the %s key",
    async (_name, key) => {
      await mount();
      seedCache();

      await act(async () => {
        await auth.logout();
      });

      expect(queryClient.getQueryData(key as unknown as string[])).toBeUndefined();
    }
  );

  it("clears the cache even when the logout request fails", async () => {
    // A logout that leaves the previous user's data on the device because the
    // network dropped is not a logout.
    mocked.logout.mockRejectedValue(new Error("network down"));
    await mount();
    seedCache();

    await act(async () => {
      await auth.logout().catch(() => undefined);
    });

    expect(cachedKeys()).toHaveLength(0);
  });

  it("patient logs out, doctor logs in — no patient data survives", async () => {
    await mount();
    seedCache();

    await act(async () => {
      await auth.logout();
    });

    mocked.login.mockResolvedValue(DOCTOR);
    await act(async () => {
      await auth.login({ email: DOCTOR.email, password: "x" });
    });

    expect(cachedKeys()).toHaveLength(0);
    expect(queryClient.getQueryData(SENSITIVE.emergencyProfile)).toBeUndefined();
    expect(auth.user?.role).toBe("doctor");
  });

  it("purges on login even when logout never happened", async () => {
    // A tab can change hands without a logout: an expired session recovered by
    // signing in as somebody else, or a logout request lost on the network.
    await mount();
    seedCache();

    mocked.login.mockResolvedValue(DOCTOR);
    await act(async () => {
      await auth.login({ email: DOCTOR.email, password: "x" });
    });

    expect(cachedKeys()).toHaveLength(0);
  });

  it("purges on clinician login too", async () => {
    await mount();
    seedCache();

    mocked.loginDoctor.mockResolvedValue(DOCTOR);
    await act(async () => {
      await auth.loginDoctor({
        doctor_id: "ABCD1234",
        email: DOCTOR.email,
        password: "x",
      });
    });

    expect(cachedKeys()).toHaveLength(0);
  });

  it("purges when session restoration fails", async () => {
    mocked.restoreSession.mockRejectedValue(new Error("expired"));
    await mount();

    // Anything a previous tab lifecycle left behind must not outlive a failed
    // restore either.
    seedCache();
    await act(async () => {
      await auth.logout();
    });
    expect(cachedKeys()).toHaveLength(0);
  });

  it("clears the stored session keys as well as the cache", async () => {
    await mount();
    localStorage.setItem("aronofy_access_token", "token");
    localStorage.setItem("aronofy_user", JSON.stringify(PATIENT));
    seedCache();

    await act(async () => {
      await auth.logout();
    });

    expect(localStorage.getItem("aronofy_access_token")).toBeNull();
    expect(localStorage.getItem("aronofy_user")).toBeNull();
    expect(cachedKeys()).toHaveLength(0);
  });
});
