import { describe, it, expect, beforeEach, vi } from "vitest";
import { render, screen, act, waitFor } from "@testing-library/react";
import { useState } from "react";
import { BrowserRouter } from "react-router-dom";
import { AuthProvider, useAuth } from "@/context/AuthContext";
import authService from "@/lib/auth-service";
import type { UserResponse } from "@/types/api";

// AuthContext delegates every credential operation to `authService`, which
// talks to the real backend over HTTP. The transport is mocked here so these
// tests assert the context's own contract — how it maps a service result onto
// session state — instead of depending on a running API.
vi.mock("@/lib/auth-service", () => ({
  default: {
    login: vi.fn(),
    logout: vi.fn(),
    restoreSession: vi.fn(),
    signupPatient: vi.fn(),
  },
}));

const mocked = vi.mocked(authService);

const ADMIN: UserResponse = {
  id: "3f1c0a9e-1b2d-4c3e-9f8a-7b6c5d4e3f21",
  email: "admin@aronofy.com",
  role: "admin",
  is_active: true,
  is_verified: true,
  created_at: "2026-01-01T00:00:00Z",
  updated_at: "2026-01-01T00:00:00Z",
} as UserResponse;

function AuthConsumer() {
  const { user, role, isAuthenticated, login, logout } = useAuth();
  const [errorMsg, setErrorMsg] = useState("");

  const handleLogin = async (
    email: string,
    password?: string,
    roleVal?: "patient" | "doctor" | "admin"
  ) => {
    try {
      setErrorMsg("");
      await login({ email, password, role: roleVal || "patient" });
    } catch (err) {
      setErrorMsg((err as Error).message);
    }
  };

  return (
    <div>
      <div data-testid="auth-state">
        {isAuthenticated ? "Authenticated" : "Unauthenticated"}
      </div>
      <div data-testid="user-role">{role || "No Role"}</div>
      <div data-testid="user-email">{user?.email || "No Email"}</div>
      <div data-testid="error-message">{errorMsg}</div>
      <button
        data-testid="login-admin-btn"
        onClick={() => handleLogin("admin@aronofy.com", "Admin@123", "admin")}
      >
        Login Admin
      </button>
      <button
        data-testid="login-invalid-btn"
        onClick={() => handleLogin("wrong@email.com", "Password@12345", "admin")}
      >
        Login Invalid
      </button>
      <button data-testid="logout-btn" onClick={logout}>
        Logout
      </button>
    </div>
  );
}

const renderWithRouter = async () => {
  const result = render(
    <BrowserRouter>
      <AuthProvider>
        <AuthConsumer />
      </AuthProvider>
    </BrowserRouter>
  );
  // The provider restores any stored session on mount; let that settle so
  // assertions never race the initial loading state.
  await waitFor(() =>
    expect(mocked.restoreSession).toHaveBeenCalled()
  );
  return result;
};

describe("AuthContext System tests", () => {
  beforeEach(() => {
    localStorage.clear();
    vi.clearAllMocks();
    mocked.restoreSession.mockResolvedValue(null);
    mocked.logout.mockResolvedValue(undefined);
  });

  it("should initialize with default unauthenticated state", async () => {
    await renderWithRouter();

    expect(screen.getByTestId("auth-state").textContent).toBe("Unauthenticated");
    expect(screen.getByTestId("user-role").textContent).toBe("No Role");
    expect(screen.getByTestId("user-email").textContent).toBe("No Email");
  });

  it("should restore an existing session on mount", async () => {
    mocked.restoreSession.mockResolvedValue(ADMIN);

    await renderWithRouter();

    await waitFor(() =>
      expect(screen.getByTestId("auth-state").textContent).toBe("Authenticated")
    );
    expect(screen.getByTestId("user-role").textContent).toBe("admin");
  });

  it("should successfully authenticate admin with correct credentials", async () => {
    mocked.login.mockResolvedValue(ADMIN);

    await renderWithRouter();
    await act(async () => {
      screen.getByTestId("login-admin-btn").click();
    });

    expect(mocked.login).toHaveBeenCalledWith({
      email: "admin@aronofy.com",
      password: "Admin@123",
      role: "admin",
    });
    expect(screen.getByTestId("auth-state").textContent).toBe("Authenticated");
    expect(screen.getByTestId("user-role").textContent).toBe("admin");
    expect(screen.getByTestId("user-email").textContent).toBe("admin@aronofy.com");
  });

  it("should capture and display error for invalid admin credentials", async () => {
    mocked.login.mockRejectedValue(new Error("Invalid Email"));

    await renderWithRouter();
    await act(async () => {
      screen.getByTestId("login-invalid-btn").click();
    });

    expect(screen.getByTestId("auth-state").textContent).toBe("Unauthenticated");
    expect(screen.getByTestId("error-message").textContent).toBe("Invalid Email");
    expect(screen.getByTestId("user-role").textContent).toBe("No Role");
  });

  it("should normalise a role returned in mixed case", async () => {
    // Cast through `unknown` on purpose: the point of this test is a role the
    // server should never send ("Admin " — mixed case, trailing space), which by
    // definition does not fit `UserResponse["role"]`.
    mocked.login.mockResolvedValue(
      { ...ADMIN, role: "Admin " } as unknown as UserResponse
    );

    await renderWithRouter();
    await act(async () => {
      screen.getByTestId("login-admin-btn").click();
    });

    expect(screen.getByTestId("user-role").textContent).toBe("admin");
  });

  it("should successfully clear state on logout", async () => {
    mocked.login.mockResolvedValue(ADMIN);

    await renderWithRouter();
    await act(async () => {
      screen.getByTestId("login-admin-btn").click();
    });
    expect(screen.getByTestId("auth-state").textContent).toBe("Authenticated");

    await act(async () => {
      screen.getByTestId("logout-btn").click();
    });

    expect(mocked.logout).toHaveBeenCalled();
    expect(screen.getByTestId("auth-state").textContent).toBe("Unauthenticated");
    expect(screen.getByTestId("user-role").textContent).toBe("No Role");
  });

  it("should clear the local session when session restoration fails", async () => {
    // A stored token that the backend rejects must not leave the UI in a
    // half-authenticated state on refresh.
    mocked.restoreSession.mockRejectedValue(new Error("token expired"));

    await renderWithRouter();

    await waitFor(() =>
      expect(screen.getByTestId("auth-state").textContent).toBe("Unauthenticated")
    );
    expect(screen.getByTestId("user-role").textContent).toBe("No Role");
  });
});
