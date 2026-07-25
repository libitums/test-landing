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

function entry(target: Element, isIntersecting: boolean, ratio: number) {
  return { target, isIntersecting, intersectionRatio: ratio } as IntersectionObserverEntry;
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
    observerCallbacks[0]?.([entry(hero, true, 0.2)]);
    expect(reporter.sectionEntered).not.toHaveBeenCalled();

    observerCallbacks[0]?.([entry(hero, true, 0.7)]);
    expect(reporter.sectionEntered).toHaveBeenCalledWith("hero");

    observerCallbacks[0]?.([entry(hero, false, 0)]);
    expect(reporter.sectionLeft).toHaveBeenCalledWith("hero");
  });

  it("ignores intersections from elements it was not asked to track", () => {
    vi.stubGlobal("IntersectionObserver", FakeIntersectionObserver);
    const reporter = createReporter();
    const { sections } = setupSections();
    const stranger = document.createElement("div");

    startEngagementTracking({ reporter, sections });
    observerCallbacks[0]?.([entry(stranger, true, 1)]);

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
