import type { AnalyticsAdapter, AnalyticsEvent } from "@landing/contracts/analytics";
import type { FbqFunction } from "./pixel-loader";

export interface PixelAnalyticsAdapterOptions {
  fbq: FbqFunction;
}

interface PixelMapping {
  /** Meta standard event name; `track` is only used for these. */
  event: string;
  parameters?: (event: AnalyticsEvent) => Record<string, unknown>;
}

/**
 * Only the events Meta can optimise delivery on are forwarded. Engagement noise stays in
 * GA4, because every extra pixel event dilutes the ad model rather than improving it.
 */
const mappings: Partial<Record<AnalyticsEvent["name"], PixelMapping>> = {
  feature_cta_clicked: {
    event: "ViewContent",
    parameters: (event) => ({
      content_category: "feature",
      content_name: "featureId" in event ? event.featureId : undefined,
    }),
  },
  form_submitted: { event: "Lead" },
  conversion_completed: { event: "CompleteRegistration" },
};

export function createPixelAnalyticsAdapter(
  options: PixelAnalyticsAdapterOptions,
): AnalyticsAdapter {
  return {
    send(event: AnalyticsEvent) {
      const mapping = mappings[event.name];
      if (mapping === undefined) {
        return;
      }

      options.fbq("track", mapping.event, {
        ...mapping.parameters?.(event),
        locale: event.locale,
        project_id: event.projectId,
        variant_id: event.variantId,
      });
    },
  };
}
