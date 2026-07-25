import type { AnalyticsTracker } from "@landing/contracts/analytics";

export interface EngagementReporterOptions {
  tracker: AnalyticsTracker;
  now?: (() => number) | undefined;
  scrollThresholds?: readonly number[] | undefined;
}

export interface EngagementReporter {
  /** A section became at least half visible. */
  sectionEntered(sectionId: string): void;
  sectionLeft(sectionId: string): void;
  /** Percentage of the page scrolled so far, clamped to 0-100. */
  scrolled(percent: number): void;
  /** The tab was hidden: stop accruing dwell and engaged time. */
  paused(): void;
  resumed(): void;
  /** Flushes dwell totals and the exit event exactly once. */
  finish(): void;
}

const defaultThresholds = [25, 50, 75, 90] as const;

/**
 * Accumulates the engagement signals a single-page landing cannot get from GA4 itself:
 * per-section dwell, scroll milestones, and which section the visitor last saw.
 */
export function createEngagementReporter(options: EngagementReporterOptions): EngagementReporter {
  const now = options.now ?? (() => Date.now());
  const thresholds = [...(options.scrollThresholds ?? defaultThresholds)].sort((a, b) => a - b);

  const dwellTotals = new Map<string, number>();
  const visibleSections = new Set<string>();
  const runningSince = new Map<string, number>();
  const reachedDepths = new Set<number>();

  let maxScrollPercent = 0;
  let lastSectionId = "";
  let engagedMs = 0;
  let engagedSince: number | undefined = now();
  let finished = false;

  function flushSection(sectionId: string): void {
    const startedAt = runningSince.get(sectionId);
    if (startedAt === undefined) {
      return;
    }

    dwellTotals.set(sectionId, (dwellTotals.get(sectionId) ?? 0) + Math.max(0, now() - startedAt));
    runningSince.delete(sectionId);
  }

  function flushEngaged(): void {
    if (engagedSince === undefined) {
      return;
    }

    engagedMs += Math.max(0, now() - engagedSince);
    engagedSince = undefined;
  }

  return {
    sectionEntered(sectionId) {
      lastSectionId = sectionId;
      visibleSections.add(sectionId);
      if (engagedSince !== undefined && !runningSince.has(sectionId)) {
        runningSince.set(sectionId, now());
      }
      void options.tracker.track({ name: "section_viewed", sectionId });
    },

    sectionLeft(sectionId) {
      flushSection(sectionId);
      visibleSections.delete(sectionId);
    },

    scrolled(percent) {
      const clamped = Math.min(100, Math.max(0, Math.round(percent)));
      maxScrollPercent = Math.max(maxScrollPercent, clamped);

      for (const threshold of thresholds) {
        if (clamped >= threshold && !reachedDepths.has(threshold)) {
          reachedDepths.add(threshold);
          void options.tracker.track({ name: "scroll_depth_reached", scrollPercent: threshold });
        }
      }
    },

    paused() {
      for (const sectionId of [...runningSince.keys()]) {
        flushSection(sectionId);
      }
      flushEngaged();
    },

    resumed() {
      if (engagedSince === undefined) {
        engagedSince = now();
      }
      for (const sectionId of visibleSections) {
        if (!runningSince.has(sectionId)) {
          runningSince.set(sectionId, now());
        }
      }
    },

    finish() {
      if (finished) {
        return;
      }
      finished = true;

      for (const sectionId of [...runningSince.keys()]) {
        flushSection(sectionId);
      }
      flushEngaged();

      for (const [sectionId, dwellMs] of dwellTotals) {
        if (dwellMs > 0) {
          void options.tracker.track({ name: "section_dwelled", sectionId, dwellMs });
        }
      }

      void options.tracker.track({
        name: "page_exited",
        lastSectionId: lastSectionId === "" ? "none" : lastSectionId,
        maxScrollPercent,
        engagedMs,
      });
    },
  };
}
