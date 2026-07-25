import { beforeEach, describe, expect, it } from "vitest";
import type {
  AnalyticsContext,
  AnalyticsEvent,
  ConsentProvider,
} from "@landing/contracts/analytics";
import { createEngagementReporter } from "./engagement-reporter";
import {
  analyticsEventValidator,
  createAnalyticsTracker,
  createInMemoryAnalyticsAdapter,
} from "./index";

const context = {
  projectId: "ai-communication",
  experimentId: "landing-phase-1",
  variantId: "ai-communication-v1",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "KR",
} as AnalyticsContext;

const granted: ConsentProvider = { getState: () => "granted" };

let clock = 0;
const now = () => clock;

function setup() {
  const adapter = createInMemoryAnalyticsAdapter();
  const tracker = createAnalyticsTracker({
    context,
    consent: granted,
    adapter,
    validator: analyticsEventValidator,
  });
  return { adapter, reporter: createEngagementReporter({ tracker, now }) };
}

function eventsNamed(events: readonly AnalyticsEvent[], name: AnalyticsEvent["name"]) {
  return events.filter((event) => event.name === name);
}

describe("engagement reporter", () => {
  beforeEach(() => {
    clock = 0;
  });

  it("accumulates dwell per section and reports it once on exit", async () => {
    const { adapter, reporter } = setup();

    reporter.sectionEntered("hero");
    clock = 3000;
    reporter.sectionLeft("hero");
    reporter.sectionEntered("features");
    clock = 8000;
    reporter.sectionLeft("features");
    reporter.sectionEntered("hero");
    clock = 9000;
    reporter.finish();
    await Promise.resolve();

    expect(eventsNamed(adapter.events, "section_dwelled")).toEqual([
      expect.objectContaining({ sectionId: "hero", dwellMs: 4000 }),
      expect.objectContaining({ sectionId: "features", dwellMs: 5000 }),
    ]);
  });

  it("fires each scroll milestone once, in order, and never above the deepest reached", async () => {
    const { adapter, reporter } = setup();

    reporter.scrolled(30);
    reporter.scrolled(28);
    reporter.scrolled(80);
    reporter.scrolled(80);
    await Promise.resolve();

    expect(
      eventsNamed(adapter.events, "scroll_depth_reached").map((event) =>
        "scrollPercent" in event ? event.scrollPercent : null,
      ),
    ).toEqual([25, 50, 75]);
  });

  it("stops counting while the tab is hidden", async () => {
    const { adapter, reporter } = setup();

    reporter.sectionEntered("pricing");
    clock = 2000;
    reporter.paused();
    clock = 60000;
    reporter.resumed();
    clock = 63000;
    reporter.finish();
    await Promise.resolve();

    expect(eventsNamed(adapter.events, "section_dwelled")[0]).toMatchObject({ dwellMs: 5000 });
    expect(eventsNamed(adapter.events, "page_exited")[0]).toMatchObject({ engagedMs: 5000 });
  });

  it("reports the last seen section and deepest scroll on exit", async () => {
    const { adapter, reporter } = setup();

    reporter.sectionEntered("hero");
    reporter.scrolled(64);
    reporter.sectionEntered("pricing");
    clock = 1000;
    reporter.finish();
    await Promise.resolve();

    expect(eventsNamed(adapter.events, "page_exited")).toEqual([
      expect.objectContaining({
        lastSectionId: "pricing",
        maxScrollPercent: 64,
        engagedMs: 1000,
      }),
    ]);
  });

  it("never reports exit twice, because pagehide and visibilitychange both fire", async () => {
    const { adapter, reporter } = setup();

    reporter.sectionEntered("hero");
    clock = 500;
    reporter.finish();
    reporter.finish();
    await Promise.resolve();

    expect(eventsNamed(adapter.events, "page_exited")).toHaveLength(1);
  });

  it("falls back to an explicit marker when no section was ever seen", async () => {
    const { adapter, reporter } = setup();

    reporter.finish();
    await Promise.resolve();

    expect(eventsNamed(adapter.events, "page_exited")[0]).toMatchObject({ lastSectionId: "none" });
  });
});
