import { test, expect } from "vitest";
import { render } from "vitest-browser-react";
import { page } from "vitest/browser";

import "@/index.css";

import { DoctorCard, type Doctor } from "@/components/intake/DoctorCard";
import { RecommendedDoctorsSection } from "@/components/intake/RecommendedDoctorsSection";

/**
 * Layout regression cover for the Doctor Suggestion Card.
 *
 * These assertions are about geometry, not markup, so they need a real engine
 * that resolves `@container` queries, `auto-fit` tracks and text wrapping —
 * jsdom reports zero for all of it. Hence the Playwright provider.
 *
 * The card is sized by its column, not by the viewport: it renders inside an
 * 8-of-12 page column, so a 1920px screen can still hand it a 300px box. Every
 * width below is therefore a *container* width, computed from the real page
 * grid rather than assumed.
 */

const DOCTOR: Doctor = {
  id: "doc-1",
  // Deliberately long: a short name hides exactly the wrapping this guards.
  name: "Dr. Priyadarshini Venkataraman",
  photoUrl: "",
  qualification: "MBBS, MD (Internal Medicine), DM (Cardiology)",
  experience: "18 yrs",
  hospital: "Sir Ganga Ram Institute of Medical Sciences",
  specialization: "Interventional Cardiology",
  department: "Cardiology",
  languages: ["English", "Hindi", "Tamil"],
  consultationFee: "₹1,200",
  rating: 4.7,
  reviewCount: 1284,
  isOnline: true,
  todayAvailable: true,
  nextSlot: "Today 4:30 PM",
  distance: "3.2 km",
  consultationTypes: ["video", "in-person"],
  matchScore: 94,
  recommendationReasons: [
    "Specialises in your reported symptoms",
    "Available today",
    "Speaks your preferred language",
    "Highest patient outcome score in this department",
  ],
  aiExplanation:
    "This clinician's speciality matches the cardiac symptoms described in your intake, and they have the earliest available slot in that department.",
};

const DOCTORS: Doctor[] = [
  DOCTOR,
  { ...DOCTOR, id: "doc-2", name: "Dr. A. Rao" },
  { ...DOCTOR, id: "doc-3", name: "Dr. Meenakshi Sundareswaran-Iyer" },
];

/**
 * Width of the `lg:col-span-8` column the section sits in, per viewport.
 *
 *   main    = viewport - 280px sidebar - 64px main padding
 *   col-8   = (main - 11 * 24px gaps) * 8/12 + 7 * 24px reclaimed gaps
 */
const COLUMN_FOR_VIEWPORT: ReadonlyArray<readonly [number, number, number]> = [
  // viewport, column width, cards per row
  [1024, 445, 1],
  [1280, 616, 2],
  [1366, 673, 2],
  [1440, 723, 2],
  [1600, 829, 2],
  [1920, 1043, 3],
];

function box(width: number, children: React.ReactNode) {
  return (
    <div style={{ width: `${width}px` }} data-testid="frame">
      {children}
    </div>
  );
}

/**
 * Every element whose content escapes the box drawn for it.
 *
 * Elements that clip on purpose — anything with `truncate` — are skipped:
 * `scrollWidth > clientWidth` is precisely what truncation looks like, and
 * flagging it would mean asserting that no label may ever be shortened. What
 * matters is content escaping a box that does *not* clip.
 *
 * One pixel of slack absorbs sub-pixel rounding on fractional grid tracks,
 * which browsers report as a 0.5px overflow on layouts that are visually fine.
 */
function overflowing(root: Element): string[] {
  const offenders: string[] = [];
  for (const el of [root, ...Array.from(root.querySelectorAll("*"))]) {
    const node = el as HTMLElement;
    if (getComputedStyle(node).overflowX !== "visible") continue;
    if (node.scrollWidth > node.clientWidth + 1 && node.clientWidth > 0) {
      offenders.push(
        `${node.tagName.toLowerCase()}.${node.className.toString().slice(0, 60)} ` +
          `(${node.scrollWidth} > ${node.clientWidth})`,
      );
    }
  }
  return offenders;
}

function columnsOf(grid: Element): number[] {
  return getComputedStyle(grid)
    .gridTemplateColumns.split(" ")
    .filter(Boolean)
    .map(parseFloat);
}

// --------------------------------------------------------------- the card

test.each([
  ["mobile", 343],
  ["small tablet column", 400],
  ["narrowest grid card", 256],
  ["two-up card", 310],
  ["three-up card at 1920", 316],
  ["single wide card", 616],
])("card does not overflow at %s (%ipx)", async (_label, width) => {
  const screen = await render(
    box(
      width,
      <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />,
    ),
  );

  const frame = screen.container.querySelector('[data-testid="frame"]')!;
  expect(overflowing(frame)).toEqual([]);
});

test("card establishes an inline-size container", async () => {
  const screen = await render(
    box(320, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );

  const card = screen.container.querySelector(".group") as HTMLElement;
  expect(getComputedStyle(card).containerType).toBe("inline-size");
});

test("header stacks in a narrow card and sits in a row in a wide one", async () => {
  /*
   * This is the assertion that proves the `@container` at-rules actually
   * parsed. If the engine ignored them every width would report "column", and
   * the whole set of internal breakpoints would be silently inert.
   */
  const narrow = await render(
    box(300, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );
  const narrowHeader = narrow.container.querySelector(".group > div > div")!;
  expect(getComputedStyle(narrowHeader).flexDirection).toBe("column");

  const wide = await render(
    box(560, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );
  const wideHeader = wide.container.querySelector(".group > div > div")!;
  expect(getComputedStyle(wideHeader).flexDirection).toBe("row");
});

test("avatar is centred while the header is stacked", async () => {
  const screen = await render(
    box(300, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );

  const header = screen.container.querySelector(".group > div > div") as HTMLElement;
  const avatar = header.firstElementChild as HTMLElement;

  const headerBox = header.getBoundingClientRect();
  const avatarBox = avatar.getBoundingClientRect();
  const drift = Math.abs(
    avatarBox.left + avatarBox.width / 2 - (headerBox.left + headerBox.width / 2),
  );
  expect(drift).toBeLessThan(1);
});

test("the doctor's name is never clipped, however it wraps", async () => {
  const screen = await render(
    box(256, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );

  const heading = screen.container.querySelector("h3") as HTMLElement;
  expect(heading.scrollWidth).toBeLessThanOrEqual(heading.clientWidth + 1);
  expect(heading.textContent).toBe(DOCTOR.name);
});

test("the three consultation-format tiles are identical in size", async () => {
  const screen = await render(
    box(310, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );

  const tiles = Array.from(
    screen.container.querySelectorAll(".grid-cols-3 > div"),
  ).filter((el) => /Video|Hospital|Emergency/.test(el.textContent || ""));

  expect(tiles).toHaveLength(3);
  const boxes = tiles.map((t) => t.getBoundingClientRect());
  for (const b of boxes.slice(1)) {
    expect(Math.abs(b.width - boxes[0].width)).toBeLessThan(1);
    expect(Math.abs(b.height - boxes[0].height)).toBeLessThan(1);
  }
});

test("stat cells are equal width and their values are not clipped", async () => {
  const screen = await render(
    box(280, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );

  const cells = Array.from(
    screen.container.querySelectorAll("p.font-headline"),
  ).filter((p) => /Patients|Success|Avg/.test(p.parentElement?.textContent || ""));

  expect(cells).toHaveLength(3);
  const widths = cells.map(
    (c) => (c.parentElement as HTMLElement).getBoundingClientRect().width,
  );
  for (const w of widths.slice(1)) {
    expect(Math.abs(w - widths[0])).toBeLessThan(1);
  }
});

test("selected and unselected cards occupy the same height", async () => {
  /* The selected state adds a ring and a scale transform; if it also changed
     layout height, selecting a doctor would shift the page. */
  const plain = await render(
    box(320, <DoctorCard doctor={DOCTOR} isSelected={false} onSelect={() => {}} />),
  );
  const plainHeight = (
    plain.container.querySelector(".group") as HTMLElement
  ).offsetHeight;

  const chosen = await render(
    box(320, <DoctorCard doctor={DOCTOR} isSelected onSelect={() => {}} />),
  );
  const chosenHeight = (
    chosen.container.querySelector(".group") as HTMLElement
  ).offsetHeight;

  expect(Math.abs(plainHeight - chosenHeight)).toBeLessThan(1);
});

// ------------------------------------------------------------- the section

test.each(COLUMN_FOR_VIEWPORT)(
  "recommendation grid lays out cleanly at %ipx",
  async (viewport, columnWidth, expectedCards) => {
    // The viewport drives Tailwind's `md:`/`lg:` variants; the wrapper is the
    // width the page grid actually hands the section at that viewport. Both
    // are needed — setting only one of them tests a screen that cannot exist.
    await page.viewport(viewport, 900);
    const screen = await render(
      box(columnWidth, <RecommendedDoctorsSection doctors={DOCTORS} />),
    );

    const frame = screen.container.querySelector('[data-testid="frame"]')!;
    const grid = frame.querySelector(".md\\:grid") as HTMLElement;
    const tracks = columnsOf(grid);

    // Equal-width cards, never narrower than the floor the card is designed
    // around. Three columns previously forced ~160px here at 1280px.
    expect(tracks).toHaveLength(expectedCards);
    for (const track of tracks) {
      expect(track).toBeGreaterThanOrEqual(256);
      expect(Math.abs(track - tracks[0])).toBeLessThan(1);
    }

    // Tracks fill the row exactly: no dead gutter on the right.
    const gaps = (tracks.length - 1) * 24;
    const used = tracks.reduce((a, b) => a + b, 0) + gaps;
    expect(Math.abs(used - grid.clientWidth)).toBeLessThan(1.5);

    // A card's padding must follow the card, not the section around it. A
    // container query written on the card itself would be answered by the
    // section's width, so this pins the flat value that replaced it.
    for (const card of frame.querySelectorAll(".md\\:grid > .group")) {
      expect(getComputedStyle(card).paddingLeft).toBe("24px");
    }

    expect(overflowing(frame)).toEqual([]);
  },
);

test("all three cards render at the same height", async () => {
  await page.viewport(1440, 900);
  const screen = await render(
    box(723, <RecommendedDoctorsSection doctors={DOCTORS} />),
  );

  const cards = Array.from(
    screen.container.querySelectorAll(".md\\:grid > .group"),
  ) as HTMLElement[];

  expect(cards).toHaveLength(3);
  for (const card of cards.slice(1)) {
    expect(Math.abs(card.offsetHeight - cards[0].offsetHeight)).toBeLessThan(1);
  }
});

test("skeleton and loaded grids use identical column tracks", async () => {
  /* Guards CLS: the placeholder must hand over to the real cards without the
     column count changing underneath the patient. */
  await page.viewport(1440, 900);
  const loading = await render(
    box(723, <RecommendedDoctorsSection doctors={[]} isLoading />),
  );
  const skeletonGrid = loading.container.querySelector(
    '[data-testid="frame"] .grid',
  ) as HTMLElement;
  const skeletonTracks = columnsOf(skeletonGrid);

  const loaded = await render(
    box(723, <RecommendedDoctorsSection doctors={DOCTORS} />),
  );
  const loadedGrid = loaded.container.querySelector(".md\\:grid") as HTMLElement;

  expect(columnsOf(loadedGrid)).toEqual(skeletonTracks);
});

test("section does not overflow on a mobile column", async () => {
  await page.viewport(390, 844);
  const screen = await render(
    box(343, <RecommendedDoctorsSection doctors={DOCTORS} />),
  );
  const frame = screen.container.querySelector('[data-testid="frame"]')!;
  expect(overflowing(frame)).toEqual([]);
});
