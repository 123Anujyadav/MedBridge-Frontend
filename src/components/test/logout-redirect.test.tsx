import { describe, it, expect, vi, afterEach, beforeEach } from "vitest";
import { render, screen, cleanup, fireEvent, waitFor } from "@testing-library/react";
import { MemoryRouter, Routes, Route } from "react-router-dom";

import { AppShell } from "@/components/layout/AppShell";

/**
 * Signing out must land on the homepage for every portal, since that is where
 * the Portal Access menu lives. The destination is easy to change by accident
 * while editing the shell, so it is pinned here for patient, doctor and admin.
 */

const logoutSpy = vi.hoisted(() => vi.fn().mockResolvedValue(undefined));

vi.mock("@/context/AuthContext", () => ({
  useAuth: () => ({ logout: logoutSpy }),
}));

// The shell opens a live socket and fetches an avatar; neither is under test.
vi.mock("@/hooks/useWebSocket", () => ({ useWebSocket: () => undefined }));
vi.mock("@/hooks/useAvatar", () => ({
  useCurrentUserAvatar: () => ({ avatarUrl: null }),
}));

const PORTALS = [
  { portal: "patient", userRole: "Patient" },
  { portal: "doctor", userRole: "Doctor" },
  { portal: "admin", userRole: "Administrator" },
] as const;

beforeEach(() => logoutSpy.mockClear());
afterEach(cleanup);

describe("logout destination", () => {
  it.each(PORTALS)("returns a $portal to the homepage", async ({ portal, userRole }) => {
    render(
      <MemoryRouter initialEntries={[`/${portal}/dashboard`]}>
        <Routes>
          <Route
            path={`/${portal}/dashboard`}
            element={
              <AppShell
                portal={portal}
                userName="Test User"
                userRole={userRole}
                searchPlaceholder="Search"
              >
                <div>dashboard content</div>
              </AppShell>
            }
          />
          <Route path="/" element={<div>homepage</div>} />
          <Route path="/auth" element={<div>sign-in page</div>} />
        </Routes>
      </MemoryRouter>,
    );

    fireEvent.click(screen.getByRole("button", { name: /log ?out|sign ?out/i }));

    await waitFor(() => expect(screen.getByText("homepage")).toBeTruthy());
    expect(screen.queryByText("sign-in page")).toBeNull();
    // The session is still torn down; only the destination changed.
    expect(logoutSpy).toHaveBeenCalledTimes(1);
  });
});
