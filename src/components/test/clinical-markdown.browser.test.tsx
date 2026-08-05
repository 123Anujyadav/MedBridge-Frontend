import { test, expect, beforeEach, afterEach } from "vitest";
import { render } from "vitest-browser-react";

import "@/index.css";

import { ClinicalMarkdown } from "@/components/shared/ClinicalMarkdown";

/**
 * Geometry cover for the rendered report body.
 *
 * The unit suite proves the Markdown becomes the right elements; this proves
 * those elements fit. Only a real engine measures wrapping, table width and
 * computed font weight, so this runs under Playwright.
 */

const REPORT = `### 1. Chief Complaint
Chest pain radiating to the left arm, described as tightness rather than a sharp pain, present since early this morning.

### 5. Clinical Risk Level
**High**

### 7. Suggested Laboratory Tests
- ECG
- Lipid Profile
- Echocardiogram with strain imaging and full diastolic assessment

### 11. Follow-up Recommendation
1. Review within 24 hours
2. Repeat troponin at 6 hours

| Investigation | Priority | Requesting Clinician | Turnaround |
| --- | --- | --- | --- |
| Electrocardiogram | Immediate | Emergency Medicine | 10 minutes |
| Lipid Profile | Routine | General Medicine | 24 hours |

Reference: https://example-guidelines.invalid/cardiology/acute-coronary-syndrome/assessment
`;

/** Modal inner widths: `max-w-2xl` minus `p-6`, and a 360px phone. */
const MODAL_WIDTHS = [312, 624] as const;

const errors: string[] = [];
const originalError = console.error;

beforeEach(() => {
  errors.length = 0;
  console.error = (...args: unknown[]) => {
    errors.push(args.map(String).join(" "));
    originalError(...args);
  };
});

afterEach(() => {
  console.error = originalError;
});

function overflowing(root: Element): string[] {
  const offenders: string[] = [];
  for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
    const node = el as HTMLElement;
    // Skip boxes that scroll on purpose — the table wrapper is meant to.
    if (getComputedStyle(node).overflowX !== "visible") continue;
    if (node.scrollWidth > node.clientWidth + 1 && node.clientWidth > 0) {
      offenders.push(
        `${node.tagName.toLowerCase()} (${node.scrollWidth} > ${node.clientWidth})`,
      );
    }
  }
  return offenders;
}

test.each(MODAL_WIDTHS)("report body does not overflow a %ipx modal", async (width) => {
  const screen = await render(
    <div style={{ width: `${width}px` }} data-testid="modal">
      <ClinicalMarkdown content={REPORT} />
    </div>,
  );

  const modal = screen.container.querySelector('[data-testid="modal"]')!;
  expect(overflowing(modal)).toEqual([]);
});

test("a wide table scrolls inside its own box, not the modal", async () => {
  const screen = await render(
    <div style={{ width: "312px" }} data-testid="modal">
      <ClinicalMarkdown content={REPORT} />
    </div>,
  );

  const modal = screen.container.querySelector('[data-testid="modal"]') as HTMLElement;
  const wrapper = screen.container.querySelector("table")!.parentElement!;

  // The wrapper is the thing that scrolls...
  expect(wrapper.scrollWidth).toBeGreaterThan(wrapper.clientWidth);
  // ...and it has not pushed the modal wider than its own box.
  expect(modal.scrollWidth).toBeLessThanOrEqual(modal.clientWidth + 1);
});

test("headings are visually heavier and larger than body text", async () => {
  const screen = await render(
    <div style={{ width: "624px" }}>
      <ClinicalMarkdown content={REPORT} />
    </div>,
  );

  const headings = Array.from(
    screen.container.querySelectorAll("h3"),
  ) as HTMLElement[];
  const paragraph = screen.container.querySelector("p") as HTMLElement;

  expect(Number(getComputedStyle(headings[0]).fontWeight)).toBeGreaterThan(
    Number(getComputedStyle(paragraph).fontWeight),
  );

  // The first heading sits flush with the top of the panel — no dead band
  // above the report — while later section headers stand off the text above.
  expect(parseFloat(getComputedStyle(headings[0]).marginTop)).toBe(0);
  expect(parseFloat(getComputedStyle(headings[1]).marginTop)).toBeGreaterThan(0);
});

test("bold text actually renders bold", async () => {
  const screen = await render(
    <div style={{ width: "624px" }}>
      <ClinicalMarkdown content={REPORT} />
    </div>,
  );

  const strong = screen.container.querySelector("strong") as HTMLElement;
  expect(strong.textContent).toBe("High");
  expect(Number(getComputedStyle(strong).fontWeight)).toBeGreaterThanOrEqual(700);
});

test("list items carry real markers and hanging indentation", async () => {
  const screen = await render(
    <div style={{ width: "624px" }}>
      <ClinicalMarkdown content={REPORT} />
    </div>,
  );

  const ul = screen.container.querySelector("ul") as HTMLElement;
  const ol = screen.container.querySelector("ol") as HTMLElement;

  expect(getComputedStyle(ul).listStyleType).toBe("disc");
  expect(getComputedStyle(ol).listStyleType).toBe("decimal");
  // Indented, so wrapped lines align under the text rather than the bullet.
  expect(parseFloat(getComputedStyle(ul).marginLeft)).toBeGreaterThan(0);
});

test("paragraphs are spaced apart rather than run together", async () => {
  const screen = await render(
    <div style={{ width: "624px" }}>
      <ClinicalMarkdown content={"First paragraph.\n\nSecond paragraph."} />
    </div>,
  );

  const paragraph = screen.container.querySelector("p") as HTMLElement;
  const style = getComputedStyle(paragraph);
  expect(parseFloat(style.marginBottom)).toBeGreaterThan(0);
  expect(parseFloat(style.lineHeight)).toBeGreaterThan(
    parseFloat(style.fontSize) * 1.4,
  );
});

test("renders the whole report without a console error", async () => {
  await render(
    <div style={{ width: "624px" }}>
      <ClinicalMarkdown content={REPORT} />
    </div>,
  );

  expect(errors).toEqual([]);
});
