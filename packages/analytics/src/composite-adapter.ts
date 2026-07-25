import type { AnalyticsAdapter, AnalyticsEvent } from "@landing/contracts/analytics";

/**
 * Fans one event out to every sink. Sinks are isolated: a failing vendor script must not
 * stop the others, so a rejection is contained rather than propagated to the tracker.
 */
export function createCompositeAnalyticsAdapter(
  adapters: readonly AnalyticsAdapter[],
): AnalyticsAdapter {
  return {
    async send(event: AnalyticsEvent) {
      await Promise.all(
        adapters.map(async (adapter) => {
          try {
            await adapter.send(event);
          } catch {
            return;
          }
        }),
      );
    },
  };
}
