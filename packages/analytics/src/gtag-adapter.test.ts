import { describe, expect, it, vi } from "vitest";
import type { AnalyticsContext, AnalyticsEvent } from "@landing/contracts/analytics";
import { createGtagAnalyticsAdapter } from "./gtag-adapter";

const context = {
  projectId: "k-drama",
  experimentId: "hero-copy",
  variantId: "treatment",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "KR",
} as AnalyticsContext;

describe("GA4 gtag adapter", () => {
  it("maps a contract event onto a snake_case GA4 payload scoped to the measurement id", () => {
    const gtag = vi.fn();
    const event: AnalyticsEvent = { ...context, name: "cta_clicked", version: 1 };

    createGtagAnalyticsAdapter({ gtag }).send(event);

    expect(gtag).toHaveBeenCalledExactlyOnceWith("event", "cta_clicked", {
      event_version: 1,
      project_id: "k-drama",
      experiment_id: "hero-copy",
      variant_id: "treatment",
      locale: "ko-KR",
      page_id: "home",
      country_hint: "KR",
    });
  });

  it("adds feature_id only for feature_cta_clicked", () => {
    const gtag = vi.fn();
    const adapter = createGtagAnalyticsAdapter({ gtag });
    const featureEvent: AnalyticsEvent = {
      ...context,
      name: "feature_cta_clicked",
      featureId: "roleplay",
      version: 1,
    };
    const exposureEvent: AnalyticsEvent = { ...context, name: "experiment_viewed", version: 1 };

    adapter.send(featureEvent);
    adapter.send(exposureEvent);

    expect(gtag.mock.calls[0]?.[2]).toMatchObject({ feature_id: "roleplay" });
    expect(gtag.mock.calls[1]?.[2]).not.toHaveProperty("feature_id");
  });

  it("never mutates the event it was given", () => {
    const event: AnalyticsEvent = { ...context, name: "conversion_completed", version: 1 };
    const snapshot = { ...event };

    createGtagAnalyticsAdapter({ gtag: vi.fn() }).send(event);

    expect(event).toEqual(snapshot);
  });
});
