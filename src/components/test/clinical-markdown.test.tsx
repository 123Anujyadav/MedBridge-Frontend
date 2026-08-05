import { describe, it, expect, afterEach } from "vitest";
import { render, screen, cleanup } from "@testing-library/react";

import { ClinicalMarkdown } from "@/components/shared/ClinicalMarkdown";

afterEach(cleanup);

/**
 * The report body as the intake prompt mandates it — `### N. Section` headers,
 * with the model's usual mix of lists, emphasis and prose underneath.
 */
const AI_REPORT = `### 1. Chief Complaint
Chest pain radiating to the left arm.

### 2. Patient Description
"Tightness in chest since this morning, worse on exertion."

### 5. Clinical Risk Level
**High**

### 7. Suggested Laboratory Tests
- ECG
- Lipid Profile
- Echocardiogram

### 11. Follow-up Recommendation
1. Review within 24 hours
2. Repeat troponin at 6 hours
   - Escalate if rising

### 12. Emergency Warning
> Call emergency services if pain persists beyond 15 minutes.

---

| Test | Priority |
| --- | --- |
| ECG | Immediate |
| Lipids | Routine |
`;

/**
 * A doctor-issued report. Composed server-side as plain lines — *not* Markdown
 * headings — which is why single newlines have to survive rendering.
 */
const DOCTOR_REPORT = `CLINICAL REPORT — Cardiology Consultation
Issued by Dr. A. Rao, Apollo Hospital on 2026-08-05.

Chief Complaint: Chest tightness
Working Diagnosis: Stable angina

Recommendations:
- Reduce exertion
- Daily BP log`;

/** Every character the source has that the reader must never see. */
function visibleText(): string {
  return document.body.textContent ?? "";
}

describe("ClinicalMarkdown — no raw syntax reaches the reader", () => {
  it("renders ### as a heading element, not as literal hashes", () => {
    render(<ClinicalMarkdown content={AI_REPORT} />);

    const heading = screen.getByRole("heading", { name: "1. Chief Complaint" });
    expect(heading.tagName).toBe("H3");
    expect(visibleText()).not.toContain("###");
    expect(visibleText()).not.toContain("##");
    expect(visibleText()).not.toContain("#");
  });

  it("renders every heading level the report may use", () => {
    render(
      <ClinicalMarkdown content={"# One\n\n## Two\n\n### Three\n\n#### Four"} />,
    );

    expect(screen.getByRole("heading", { name: "One" }).tagName).toBe("H1");
    expect(screen.getByRole("heading", { name: "Two" }).tagName).toBe("H2");
    expect(screen.getByRole("heading", { name: "Three" }).tagName).toBe("H3");
    expect(screen.getByRole("heading", { name: "Four" }).tagName).toBe("H4");
    expect(visibleText()).not.toContain("#");
  });

  it("leaves no bullet, emphasis or rule markers in the text", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);
    const text = container.textContent ?? "";

    // The list markers are gone from the text; the <li> elements carry them.
    expect(text).not.toContain("- ECG");
    expect(text).not.toContain("**");
    expect(text).not.toContain("---");
    expect(text).not.toContain("| Test |");
    expect(text).not.toContain("> Call emergency");
  });
});

describe("ClinicalMarkdown — structure", () => {
  it("renders unordered lists with real list items", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);

    const lists = container.querySelectorAll("ul");
    expect(lists.length).toBeGreaterThan(0);

    const labs = Array.from(container.querySelectorAll("li")).map(
      (li) => li.textContent,
    );
    expect(labs).toContain("ECG");
    expect(labs).toContain("Lipid Profile");
    expect(labs).toContain("Echocardiogram");
  });

  it("renders ordered lists as <ol> so numbering is real", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);

    const ordered = container.querySelector("ol");
    expect(ordered).not.toBeNull();
    expect(ordered?.querySelectorAll(":scope > li").length).toBe(2);
    expect(ordered?.textContent).toContain("Review within 24 hours");
  });

  it("nests a sub-list inside its parent item", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);

    const nested = container.querySelector("ol li ul li");
    expect(nested?.textContent).toBe("Escalate if rising");
  });

  it("renders bold as <strong> and quotes as <blockquote>", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);

    expect(container.querySelector("strong")?.textContent).toBe("High");
    expect(container.querySelector("blockquote")?.textContent).toContain(
      "Call emergency services",
    );
  });

  it("renders italics, dividers and code", () => {
    const { container } = render(
      <ClinicalMarkdown
        content={"*careful* and `troponin`\n\n---\n\n```\nHR 88\n```"}
      />,
    );

    expect(container.querySelector("em")?.textContent).toBe("careful");
    expect(container.querySelector("hr")).not.toBeNull();
    expect(container.querySelector("code")?.textContent).toBe("troponin");
    expect(container.querySelector("pre")?.textContent).toContain("HR 88");
  });

  it("renders GFM tables with header and body cells", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);

    const table = container.querySelector("table");
    expect(table).not.toBeNull();
    expect(
      Array.from(table!.querySelectorAll("th")).map((th) => th.textContent),
    ).toEqual(["Test", "Priority"]);
    expect(table!.querySelectorAll("td").length).toBe(4);
  });

  it("keeps a wide table scrollable inside its own box", () => {
    // Requirement: the modal itself must never gain a horizontal scrollbar.
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);
    const wrapper = container.querySelector("table")?.parentElement;
    expect(wrapper?.className).toContain("overflow-x-auto");
  });
});

describe("ClinicalMarkdown — content is never altered", () => {
  it("reproduces every sentence of the report verbatim", () => {
    const { container } = render(<ClinicalMarkdown content={AI_REPORT} />);
    const text = container.textContent ?? "";

    for (const sentence of [
      "Chest pain radiating to the left arm.",
      '"Tightness in chest since this morning, worse on exertion."',
      "Review within 24 hours",
      "Repeat troponin at 6 hours",
      "Call emergency services if pain persists beyond 15 minutes.",
      "1. Chief Complaint",
      "2. Patient Description",
    ]) {
      expect(text).toContain(sentence);
    }
  });

  it("preserves single line breaks in a doctor-issued plain-text report", () => {
    /*
     * Without `remark-breaks` these lines fold into one paragraph and the
     * report reads as a wall of text — a regression the Markdown fix would
     * otherwise have introduced for every clinician-issued report.
     */
    const { container } = render(<ClinicalMarkdown content={DOCTOR_REPORT} />);

    // Two soft breaks: title/issuer, and complaint/diagnosis. The third pair
    // ("Recommendations:" and its items) becomes a list rather than a break.
    expect(container.querySelectorAll("br").length).toBe(2);

    const text = container.textContent ?? "";
    expect(text).toContain("Chief Complaint: Chest tightness");
    expect(text).toContain("Working Diagnosis: Stable angina");
    // The lines stayed separate rather than being glued together.
    expect(text).not.toContain("Chest tightnessWorking Diagnosis");

    // Its `-` items still become real bullets.
    const items = Array.from(container.querySelectorAll("li")).map(
      (li) => li.textContent,
    );
    expect(items).toEqual(["Reduce exertion", "Daily BP log"]);
  });

  it("does not execute or inject embedded HTML", () => {
    // Report bodies are model-generated. They are rendered, never trusted.
    const { container } = render(
      <ClinicalMarkdown
        content={'<img src=x onerror="alert(1)"> and <b>markup</b>'}
      />,
    );

    expect(container.querySelector("img")).toBeNull();
    expect(container.querySelector("b")).toBeNull();
    expect(container.textContent).toContain("<b>markup</b>");
  });

  it("shows a plain notice rather than an empty panel when there is no body", () => {
    const { container } = render(<ClinicalMarkdown content="   " />);
    expect(container.textContent).toBe("No report content recorded.");
  });

  it("wraps long unbroken tokens instead of widening the modal", () => {
    const { container } = render(<ClinicalMarkdown content="short" />);
    expect((container.firstElementChild as HTMLElement).className).toContain(
      "break-words",
    );
  });
});
