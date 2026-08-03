import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { render, screen, cleanup, fireEvent, within } from "@testing-library/react";
import { MemoryRouter, Routes, Route, useLocation } from "react-router-dom";

import HomePage from "@/pages/HomePage";

/**
 * The landing page is the only entry point into the three portals, so its
 * calls-to-action carry the whole funnel. These tests pin the auth routes each
 * button hands off to — `/auth` reads `role` and `mode` off the query string,
 * so a typo in either would silently drop a visitor on the wrong form.
 */

function LocationProbe() {
  const location = useLocation();
  return <div data-testid="location">{location.pathname + location.search}</div>;
}

function renderHome() {
  return render(
    <MemoryRouter initialEntries={["/"]}>
      <Routes>
        <Route path="/" element={<HomePage />} />
        <Route path="/auth" element={<LocationProbe />} />
      </Routes>
    </MemoryRouter>,
  );
}

const currentLocation = () => screen.getByTestId("location").textContent;

beforeEach(() => {
  // jsdom does not implement scrollIntoView; the in-page nav calls it.
  Element.prototype.scrollIntoView = () => {};
});
afterEach(cleanup);

describe("homepage portal entry points", () => {
  it("sends the hero CTA to patient signup", () => {
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: /request demo/i }));
    expect(currentLocation()).toBe("/auth?role=patient&mode=signup");
  });

  it("sends the header Get Started button to patient signup", () => {
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: /^get started$/i }));
    expect(currentLocation()).toBe("/auth?role=patient&mode=signup");
  });

  it.each([
    ["Patient Login", "/auth?role=patient&mode=login"],
    ["Doctor Login", "/auth?role=doctor&mode=login"],
    ["Admin Login", "/auth?role=admin&mode=login"],
  ])("routes the %s portal item correctly", (label, expected) => {
    renderHome();
    // Radix opens the menu on pointerdown/keydown, not click.
    fireEvent.keyDown(screen.getByRole("button", { name: /portal access/i }), {
      key: "Enter",
    });
    fireEvent.click(screen.getByRole("menuitem", { name: new RegExp(label, "i") }));
    expect(currentLocation()).toBe(expected);
  });

  it("sends the SOS button to the patient login", () => {
    renderHome();
    fireEvent.click(screen.getByRole("button", { name: /activate sos mode/i }));
    expect(currentLocation()).toBe("/auth?role=patient&mode=login");
  });

  it("routes the footer portal links to their respective logins", () => {
    const { unmount } = renderHome();
    fireEvent.click(screen.getByRole("button", { name: /^patient portal$/i }));
    expect(currentLocation()).toBe("/auth?role=patient&mode=login");
    unmount();

    renderHome();
    fireEvent.click(screen.getByRole("button", { name: /^doctor portal$/i }));
    expect(currentLocation()).toBe("/auth?role=doctor&mode=login");
  });
});

describe("homepage in-page navigation", () => {
  it("exposes an anchor for every section the nav scrolls to", () => {
    const { container } = renderHome();
    for (const id of ["features", "rx-pharmacy", "emergency", "ai-assistant", "why-us"]) {
      expect(container.querySelector(`#${id}`), `missing anchor #${id}`).not.toBeNull();
    }
  });

  it("opens and closes the mobile drawer", () => {
    renderHome();
    // The drawer duplicates the nav labels, so counting occurrences of a
    // desktop-only label tells us whether it is mounted.
    expect(screen.getAllByRole("button", { name: /^features$/i })).toHaveLength(1);

    const toggle = screen.getAllByRole("button").find((b) => b.className.includes("hover:bg-slate-100"))!;
    fireEvent.click(toggle);
    expect(screen.getAllByRole("button", { name: /^features$/i })).toHaveLength(2);

    fireEvent.click(toggle);
    expect(screen.getAllByRole("button", { name: /^features$/i })).toHaveLength(1);
  });
});

describe("homepage AI assistant demo", () => {
  it("appends the typed message and a triage reply", () => {
    renderHome();
    const input = screen.getByPlaceholderText(/type your response/i);
    fireEvent.change(input, { target: { value: "My arm feels numb" } });
    fireEvent.submit(input.closest("form")!);

    expect(screen.getByText("My arm feels numb")).toBeTruthy();
    expect(screen.getByText(/triage alert/i)).toBeTruthy();
    expect((input as HTMLInputElement).value).toBe("");
  });

  it("ignores an empty submission", () => {
    renderHome();
    const input = screen.getByPlaceholderText(/type your response/i);
    fireEvent.submit(input.closest("form")!);
    expect(screen.queryByText(/triage alert/i)).toBeNull();
  });

  it("falls back to the selected symptom pills when no text is typed", () => {
    renderHome();
    const pill = screen.getByRole("button", { name: /dizziness/i });
    fireEvent.click(pill);

    const input = screen.getByPlaceholderText(/type your response/i);
    fireEvent.submit(input.closest("form")!);
    expect(screen.getByText(/Selected symptoms: Dizziness/)).toBeTruthy();
  });

  it("toggles a symptom pill off when clicked twice", () => {
    renderHome();
    const pill = screen.getByRole("button", { name: /dizziness/i });
    fireEvent.click(pill);
    expect(pill.className).toContain("bg-emerald-500");
    fireEvent.click(pill);
    expect(pill.className).not.toContain("bg-emerald-500");
  });
});

describe("homepage comparison table", () => {
  it("contrasts traditional care with MedBridge on every row", () => {
    renderHome();
    const table = screen.getByRole("table");
    const rows = within(table).getAllByRole("row");
    // 1 header + 4 comparison rows
    expect(rows).toHaveLength(5);
  });
});
