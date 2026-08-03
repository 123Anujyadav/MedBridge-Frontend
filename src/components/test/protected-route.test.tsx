import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

/**
 * `/` is the marketing landing page. An expired or absent session used to be
 * bounced there, leaving the user on a sales page with no obvious way back in.
 * These tests pin the destination to the sign-in page for every role.
 */

const mockAuth = vi.hoisted(() => ({ value: {} as Record<string, unknown> }));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => mockAuth.value,
}));

function renderAt(auth: Record<string, unknown>, allowedRoles: ("patient" | "doctor" | "admin")[]) {
  mockAuth.value = auth;
  return render(
    <MemoryRouter initialEntries={["/protected"]}>
      <Routes>
        <Route
          path="/protected"
          element={
            <ProtectedRoute allowedRoles={allowedRoles}>
              <div>protected content</div>
            </ProtectedRoute>
          }
        />
        <Route path="/auth" element={<div>sign-in page</div>} />
        <Route path="/" element={<div>marketing homepage</div>} />
        <Route path="/patient/dashboard" element={<div>patient dashboard</div>} />
        <Route path="/doctor/dashboard" element={<div>doctor dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>admin dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("ProtectedRoute session handling", () => {
  it("sends an unauthenticated visitor to the sign-in page, not the homepage", () => {
    renderAt({ isAuthenticated: false, role: null, isLoading: false }, ["patient"]);
    expect(screen.getByText("sign-in page")).toBeTruthy();
    expect(screen.queryByText("marketing homepage")).toBeNull();
  });

  it("sends an expired session (authenticated flag but no role) to the sign-in page", () => {
    renderAt({ isAuthenticated: true, role: null, isLoading: false }, ["doctor"]);
    expect(screen.getByText("sign-in page")).toBeTruthy();
  });

  it.each(["patient", "doctor", "admin"] as const)(
    "bounces a signed-out %s to the sign-in page",
    (role) => {
      renderAt({ isAuthenticated: false, role: null, isLoading: false }, [role]);
      expect(screen.getByText("sign-in page")).toBeTruthy();
    },
  );

  it("shows the verifying state while the session is still loading", () => {
    renderAt({ isAuthenticated: false, role: null, isLoading: true }, ["patient"]);
    expect(screen.getByText(/verifying secure credentials/i)).toBeTruthy();
    expect(screen.queryByText("sign-in page")).toBeNull();
  });

  it.each(["patient", "doctor", "admin"] as const)(
    "renders the page for an authorised %s",
    (role) => {
      renderAt({ isAuthenticated: true, role, isLoading: false }, [role]);
      expect(screen.getByText("protected content")).toBeTruthy();
    },
  );

  it("redirects a doctor away from a patient-only route to their own dashboard", () => {
    renderAt({ isAuthenticated: true, role: "doctor", isLoading: false }, ["patient"]);
    expect(screen.getByText("doctor dashboard")).toBeTruthy();
    expect(screen.queryByText("sign-in page")).toBeNull();
  });

  it("redirects an admin away from a doctor-only route to their own dashboard", () => {
    renderAt({ isAuthenticated: true, role: "admin", isLoading: false }, ["doctor"]);
    expect(screen.getByText("admin dashboard")).toBeTruthy();
  });
});
