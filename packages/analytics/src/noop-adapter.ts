import type { AnalyticsAdapter } from "@landing/contracts/analytics";

export function createNoopAnalyticsAdapter(): AnalyticsAdapter {
  return { send: () => undefined };
}
