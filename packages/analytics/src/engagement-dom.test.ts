import { afterEach, describe, expect, it, vi } from "vitest";
import { startEngagementTracking } from "./engagement-dom";
import type { EngagementReporter } from "./engagement-reporter";

type ObserverCallback = (entries: IntersectionObserverEntry[]) => void;

const observerCallbacks: ObserverCallback[] = [];

class FakeIntersectionObserver {
  observed: Element[] = [];
  disconnected = false;

  constructor(callback: ObserverCallback) {
    observerCallbacks.push(callback);
  }

  observe(element: Element) {
    this.observed.push(element);
  }

  disconnect() {
    this.disconnected = true;
  }

  unobserve() {}
  takeRecords(): IntersectionObserverEntry[] {
    return [];
  }
}

function createReporter(): EngagementReporter & Record<string, ReturnType<typeof vi.fn>> {
  return {
    sectionEntered: vi.fn(),
    sectionLeft: vi.fn(),
    scrolled: vi.fn(),
    paused: vi.fn(),
    resumed: vi.fn(),
    finish: vi.fn(),
  } as unknown as EngagementReporter & Record<string, ReturnType<typeof vi.fn>>;
}

interface EntryGeometry {
  /** Height of the section currently inside the viewport. */
  visible: number;
  section: number;
  viewport?: number | null;
}

function entry(target: Element, isIntersecting: boolean, geometry: EntryGeometry) {
  const { visible, section, viewport = 900 } = geometry;
  return {
    target,
    isIntersecting,
    intersectionRatio: section === 0 ? 0 : visible / section,
    intersectionRect: { height: visible },
    boundingClientRect: { height: section },
    rootBounds: viewport === null ? null : { height: viewport },
  } as unknown as IntersectionObserverEntry;
}

function setupSections() {
  document.body.innerHTML = `<div id="hero"></div><div id="pricing"></div>`;
  const hero = document.getElementById("hero")!;
  const pricing = document.getElementById("pricing")!;
  return {
    hero,
    pricing,
    sections: [
      { id: "hero", element: hero },
      { id: "pricing", element: pricing },
    ],
  };
}

describe("engagement DOM bindings", () => {
  afterEach(() => {
    observerCallbacks.length = 0;
    vi.unstubAllGlobals();
  });

  it("reports a section as seen only once it passes the visible ratio", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const reporter = createReporter();
    const { hero, sections } = setupSections();

    startEngagementTracking({ reporter, sections });
    observerCallbacks[0]?.([entry(hero, true, { visible: 120, section: 600 })]);
    expect(reporter.sectionEntered).not.toHaveBeenCalled();

    observerCallbacks[0]?.([entry(hero, true, { visible: 420, section: 600 })]);
    expect(reporter.sectionEntered).toHaveBeenCalledWith("hero");

    observerCallbacks[0]?.([entry(hero, false, { visible: 0, section: 600 })]);
    expect(reporter.sectionLeft).toHaveBeenCalledWith("hero");
  });


  it("sees a section taller than twice the viewport", () => {
    // k-drama pricing measured 2006px inside an iPhone 12's 844px viewport. Its area ratio
    // peaks at 0.42, so the old area-only rule never fired and the section was recorded as
    // never seen on every phone in the traffic.
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const reporter = createReporter();
    const { pricing, sections } = setupSections();

    startEngagementTracking({ reporter, sections });
    observerCallbacks[0]?.([entry(pricing, true, { visible: 200, section: 2006, viewport: 844 })]);
    expect(reporter.sectionEntered).not.toHaveBeenCalled();

    observerCallbacks[0]?.([entry(pricing, true, { visible: 500, section: 2006, viewport: 844 })]);
    expect(reporter.sectionEntered).toHaveBeenCalledWith("pricing");
  });

  it("leaves a tall section when it stops covering half the viewport", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const reporter = createReporter();
    const { pricing, sections } = setupSections();

    startEngagementTracking({ reporter, sections });
    observerCallbacks[0]?.([entry(pricing, true, { visible: 500, section: 2006, viewport: 844 })]);
    observerCallbacks[0]?.([entry(pricing, true, { visible: 100, section: 2006, viewport: 844 })]);

    expect(reporter.sectionLeft).toHaveBeenCalledWith("pricing");
  });

  it("falls back to the window height when the observer reports no root bounds", () => {
    // Safari hands back a null rootBounds in some cross-document cases; without a fallback
    // the viewport rule would divide by nothing and tall sections would go dark again.
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    vi.stubGlobal("innerHeight", 844);
    const reporter = createReporter();
    const { pricing, sections } = setupSections();

    startEngagementTracking({ reporter, sections });
    observerCallbacks[0]?.([
      entry(pricing, true, { visible: 500, section: 2006, viewport: null }),
    ]);

    expect(reporter.sectionEntered).toHaveBeenCalledWith("pricing");
  });

  it("asks the observer for thresholds fine enough to see a tall section arrive", () => {
    // With only [0, 0.5] the callback never runs for a section whose ratio tops out at 0.42.
    const observers: { threshold: readonly number[] }[] = [];
    class RecordingObserver extends FakeIntersectionObserver {
      constructor(callback: ObserverCallback, options?: IntersectionObserverInit) {
        super(callback);
        const threshold = options?.threshold ?? [];
        observers.push({ threshold: Array.isArray(threshold) ? threshold : [threshold] });
      }
    }
    vi.stubGlobal("IntersectionObserver", RecordingObserver);
    const reporter = createReporter();
    const { sections } = setupSections();

    startEngagementTracking({ reporter, sections });

    const thresholds = observers[0]?.threshold ?? [];
    const belowHalf = thresholds.filter((value) => value > 0 && value < 0.5);
    expect(belowHalf.length).toBeGreaterThanOrEqual(5);
  });

  it("ignores intersections from elements it was not asked to track", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const reporter = createReporter();
    const { sections } = setupSections();
    const stranger = document.createElement("div");

    startEngagementTracking({ reporter, sections });
    observerCallbacks[0]?.([entry(stranger, true, { visible: 600, section: 600 })]);

    expect(reporter.sectionEntered).not.toHaveBeenCalled();
  });

  it("flushes on tab hide and stops counting, then resumes when visible again", () => {
    const reporter = createReporter();
    const { sections } = setupSections();
    const stop = startEngagementTracking({ reporter, sections });

    document.dispatchEvent(new Event("visibilitychange"));
    expect(reporter.resumed).toHaveBeenCalledTimes(1);

    vi.spyOn(document, "visibilityState", "get").mockReturnValue("hidden");
    document.dispatchEvent(new Event("visibilitychange"));
    expect(reporter.paused).toHaveBeenCalledTimes(1);
    expect(reporter.finish).toHaveBeenCalledTimes(1);

    stop();
  });

  it("stays silent about depth while the page does not scroll", () => {
    const reporter = createReporter();
    const { sections } = setupSections();

    const stop = startEngagementTracking({ reporter, sections });
    window.dispatchEvent(new Event("scroll"));

    expect(reporter.scrolled).not.toHaveBeenCalled();
    stop();
  });

  it("measures depth against the scrollable distance and detaches when stopped", () => {
    const reporter = createReporter();
    const { sections } = setupSections();
    vi.spyOn(document.documentElement, "scrollHeight", "get").mockReturnValue(2768);
    vi.stubGlobal("innerHeight", 768);
    vi.stubGlobal("scrollY", 500);

    const stop = startEngagementTracking({ reporter, sections });
    expect(reporter.scrolled).toHaveBeenCalledWith(25);

    stop();
    window.dispatchEvent(new Event("scroll"));
    expect(reporter.scrolled).toHaveBeenCalledTimes(1);
    expect(reporter.finish).toHaveBeenCalledTimes(1);
  });
});
