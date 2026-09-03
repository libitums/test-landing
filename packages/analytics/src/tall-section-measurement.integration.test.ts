import { afterEach, describe, expect, it, vi } from "vitest";
import type { AnalyticsContext, AnalyticsEvent } from "@landing/contracts/analytics";
import {
  analyticsEventValidator,
  createAnalyticsTracker,
  createEngagementReporter,
  createInMemoryAnalyticsAdapter,
  startEngagementTracking,
} from "./index";

/**
 * The layers below each pass on their own; what this file checks is the seam. A section
 * taller than twice the viewport used to reach the reporter as "never entered", and that
 * silence then travelled: no `section_viewed`, a dwell total of zero, and a
 * `page_exited.lastSectionId` naming whatever shorter section happened to fire last.
 */

const context: AnalyticsContext = {
  projectId: "k-drama",
  experimentId: "landing-phase-2",
  variantId: "k-drama-v1",
  locale: "en-US",
  pageId: "home",
  countryHint: "unknown",
};

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;
const callbacks: ObserverCallback[] = [];

class FakeIntersectionObserver {
  constructor(callback: ObserverCallback) {
    callbacks.push(callback);
  }
  observe() {}
  disconnect() {}
  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

// iPhone 12: the viewport 99% of the traffic arrives on.
const viewport = 844;
// Measured on 2026-09-03: hero fits, pricing is more than twice the viewport.
const heights = { hero: 1533, pricing: 2006 };

function entry(target: Element, visible: number, section: number) {
  return {
    target,
    isIntersecting: visible > 0,
    intersectionRatio: visible / section,
    intersectionRect: { height: visible },
    boundingClientRect: { height: section },
    rootBounds: { height: viewport },
  } as unknown as IntersectionObserverEntry;
}

function setup() {
  document.body.innerHTML = `<div id="hero"></div><div id="pricing"></div>`;
  const hero = document.getElementById("hero")!;
  const pricing = document.getElementById("pricing")!;
  const adapter = createInMemoryAnalyticsAdapter();
  const tracker = createAnalyticsTracker({
    context,
    consent: { getState: () => "granted" },
    adapter,
    validator: analyticsEventValidator,
  });

  let clock = 0;
  const reporter = createEngagementReporter({ tracker, now: () => clock });
  const stop = startEngagementTracking({
    reporter,
    sections: [
      { id: "hero", element: hero },
      { id: "pricing", element: pricing },
    ],
  });

  return {
    hero,
    pricing,
    adapter,
    stop,
    advance: (ms: number) => {
      clock += ms;
    },
    emit: (entries: IntersectionObserverEntry[]) => callbacks[0]?.(entries),
  };
}

const named = (adapter: { events: readonly AnalyticsEvent[] }, name: AnalyticsEvent["name"]) =>
  adapter.events.filter((event) => event.name === name);

describe("a section taller than the viewport reaches the analytics pipeline", () => {
  afterEach(() => {
    callbacks.length = 0;
    vi.unstubAllGlobals();
    document.body.innerHTML = "";
  });

  it("records the view, the dwell, and the exit for the tall section", async () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const page = setup();

    // Reads the hero, then scrolls down and settles on pricing before leaving.
    page.emit([entry(page.hero, 800, heights.hero)]);
    page.advance(4000);
    page.emit([entry(page.hero, 0, heights.hero), entry(page.pricing, 700, heights.pricing)]);
    page.advance(9000);
    page.stop();
    await Promise.resolve();

    const viewed = named(page.adapter, "section_viewed").map((event) =>
      "sectionId" in event ? event.sectionId : "",
    );
    expect(viewed).toEqual(["hero", "pricing"]);

    const pricingDwell = named(page.adapter, "section_dwelled").find(
      (event) => "sectionId" in event && event.sectionId === "pricing",
    );
    expect(pricingDwell).toBeDefined();
    expect(pricingDwell && "dwellMs" in pricingDwell ? pricingDwell.dwellMs : 0).toBe(9000);

    const exited = named(page.adapter, "page_exited")[0];
    expect(exited && "lastSectionId" in exited ? exited.lastSectionId : "").toBe("pricing");
  });

  it("still refuses a tall section that only peeks in", async () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const page = setup();

    page.emit([entry(page.pricing, 300, heights.pricing)]);
    page.advance(3000);
    page.stop();
    await Promise.resolve();

    expect(named(page.adapter, "section_viewed")).toHaveLength(0);
  });
});
