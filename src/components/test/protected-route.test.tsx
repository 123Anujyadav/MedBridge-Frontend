import { describe, it, expect, vi, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { ProtectedRoute } from "@/components/shared/ProtectedRoute";

/**
 * The homepage is MedBridge's primary landing page, so an absent or expired
 * session returns there — its Portal Access menu opens the patient, clinician
 * and administrator logins. These tests pin that destination for every role,
 * and guard the role-based redirects that must keep working alongside it.
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
        <Route path="/" element={<div>homepage</div>} />
        <Route path="/auth" element={<div>sign-in page</div>} />
        <Route path="/patient/dashboard" element={<div>patient dashboard</div>} />
        <Route path="/doctor/dashboard" element={<div>doctor dashboard</div>} />
        <Route path="/admin/dashboard" element={<div>admin dashboard</div>} />
      </Routes>
    </MemoryRouter>,
  );
}

afterEach(cleanup);

describe("ProtectedRoute session handling", () => {
  it("sends an unauthenticated visitor to the homepage", () => {
    renderAt({ isAuthenticated: false, role: null, isLoading: false }, ["patient"]);
    expect(screen.getByText("homepage")).toBeTruthy();
    expect(screen.queryByText("protected content")).toBeNull();
  });

  it("sends an expired session (authenticated flag but no role) to the homepage", () => {
    renderAt({ isAuthenticated: true, role: null, isLoading: false }, ["doctor"]);
    expect(screen.getByText("homepage")).toBeTruthy();
  });

  it.each(["patient", "doctor", "admin"] as const)(
    "bounces a signed-out %s to the homepage",
    (role) => {
      renderAt({ isAuthenticated: false, role: null, isLoading: false }, [role]);
      expect(screen.getByText("homepage")).toBeTruthy();
    },
  );

  it("shows the verifying state while the session is still loading", () => {
    renderAt({ isAuthenticated: false, role: null, isLoading: true }, ["patient"]);
    expect(screen.getByText(/verifying secure credentials/i)).toBeTruthy();
    expect(screen.queryByText("homepage")).toBeNull();
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
    // A logged-in user on the wrong portal must reach their own dashboard, not
    // get dumped back on the homepage as if their session had lapsed.
    expect(screen.getByText("doctor dashboard")).toBeTruthy();
    expect(screen.queryByText("homepage")).toBeNull();
  });

  it("redirects an admin away from a doctor-only route to their own dashboard", () => {
    renderAt({ isAuthenticated: true, role: "admin", isLoading: false }, ["doctor"]);
    expect(screen.getByText("admin dashboard")).toBeTruthy();
  });
});
