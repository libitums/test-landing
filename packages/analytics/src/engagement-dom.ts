import type { EngagementReporter } from "./engagement-reporter";

export interface TrackedSection {
  id: string;
  element: Element;
}

export interface EngagementTrackingOptions {
  reporter: EngagementReporter;
  sections: readonly TrackedSection[];
  target?: (Window & typeof globalThis) | undefined;
  /** Visible ratio that counts as "seen"; half the section by default. */
  visibleRatio?: number | undefined;
}

/** Undefined when the page cannot scroll, so depth is never faked as fully read. */
function scrollPercent(target: Window & typeof globalThis): number | undefined {
  const documentElement = target.document.documentElement;
  const scrollable = documentElement.scrollHeight - target.innerHeight;
  if (scrollable <= 0) {
    return undefined;
  }

  return ((target.scrollY || documentElement.scrollTop) / scrollable) * 100;
}

/**
 * Binds a reporter to the page: intersection for sections, scroll for depth, visibility and
 * pagehide for exit. Returns a stop function that flushes the exit event.
 */
export function startEngagementTracking(options: EngagementTrackingOptions): () => void {
  const target = options.target ?? (globalThis as unknown as Window & typeof globalThis);
  const { reporter } = options;
  const ratio = options.visibleRatio ?? 0.5;
  const byElement = new Map<Element, string>(
    options.sections.map((section) => [section.element, section.id]),
  );

  const onScroll = () => {
    const percent = scrollPercent(target);
    if (percent !== undefined) {
      reporter.scrolled(percent);
    }
  };
  const onVisibility = () => {
    if (target.document.visibilityState === "hidden") {
      reporter.paused();
      reporter.finish();
    } else {
      reporter.resumed();
    }
  };
  const onPageHide = () => reporter.finish();

  let observer: IntersectionObserver | undefined;
  if (typeof target.IntersectionObserver === "function") {
    observer = new target.IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          const sectionId = byElement.get(entry.target);
          if (sectionId === undefined) {
            continue;
          }

          if (entry.isIntersecting && entry.intersectionRatio >= ratio) {
            reporter.sectionEntered(sectionId);
          } else {
            reporter.sectionLeft(sectionId);
          }
        }
      },
      { threshold: [0, ratio] },
    );

    for (const section of options.sections) {
      observer.observe(section.element);
    }
  }

  target.addEventListener("scroll", onScroll, { passive: true });
  target.document.addEventListener("visibilitychange", onVisibility);
  target.addEventListener("pagehide", onPageHide);
  onScroll();

  return () => {
    observer?.disconnect();
    target.removeEventListener("scroll", onScroll);
    target.document.removeEventListener("visibilitychange", onVisibility);
    target.removeEventListener("pagehide", onPageHide);
    reporter.finish();
  };
}
