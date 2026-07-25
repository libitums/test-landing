import type { AnalyticsAdapter } from "@landing/contracts/analytics";
import { createCompositeAnalyticsAdapter } from "./composite-adapter";
import { createGtagAnalyticsAdapter } from "./gtag-adapter";
import { installGtag } from "./gtag-loader";
import type { GtagWindow } from "./gtag-loader";
import { createNoopAnalyticsAdapter } from "./noop-adapter";
import { createPixelAnalyticsAdapter } from "./pixel-adapter";
import { installPixel } from "./pixel-loader";
import type { PixelWindow } from "./pixel-loader";

export interface BrowserAnalyticsOptions {
  measurementId?: string | undefined;
  /** Shared property that receives all three apps, so they can be compared side by side. */
  rollupMeasurementId?: string | undefined;
  /** Meta pixel id; only conversion-shaped events are forwarded to it. */
  pixelId?: string | undefined;
  enabled?: boolean | undefined;
  /** Passed through to GA4 as `traffic_type`, so internal sessions can be filtered out. */
  trafficType?: string | undefined;
  target?: (GtagWindow & PixelWindow) | undefined;
}

function trimmed(value: string | undefined): string {
  return value?.trim() ?? "";
}

/**
 * Picks the production sinks for a browser entry point. Without ids, while disabled, or
 * outside a document no vendor script is injected and nothing leaves the page.
 */
export function createBrowserAnalyticsAdapter(
  options: BrowserAnalyticsOptions = {},
): AnalyticsAdapter {
  const measurementId = trimmed(options.measurementId);
  const pixelId = trimmed(options.pixelId);
  const enabled = options.enabled ?? true;
  const target = options.target ?? (typeof window === "undefined" ? undefined : window);

  if (!enabled || target === undefined) {
    return createNoopAnalyticsAdapter();
  }

  const adapters: AnalyticsAdapter[] = [];

  const measurementIds = [measurementId, trimmed(options.rollupMeasurementId)].filter(
    (id) => id !== "",
  );

  if (measurementIds.length > 0) {
    let gtag;
    for (const id of measurementIds) {
      gtag = installGtag({
        measurementId: id,
        target: target as GtagWindow,
        trafficType: options.trafficType,
      });
    }
    if (gtag !== undefined) {
      adapters.push(createGtagAnalyticsAdapter({ gtag }));
    }
  }

  if (pixelId !== "") {
    adapters.push(
      createPixelAnalyticsAdapter({
        fbq: installPixel({ pixelId, target: target as PixelWindow }),
      }),
    );
  }

  if (adapters.length === 0) {
    return createNoopAnalyticsAdapter();
  }

  return adapters.length === 1 && adapters[0] !== undefined
    ? adapters[0]
    : createCompositeAnalyticsAdapter(adapters);
}
