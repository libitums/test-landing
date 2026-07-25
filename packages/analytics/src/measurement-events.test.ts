import { describe, expect, it, vi } from "vitest";
import type { AnalyticsContext, ConsentProvider } from "@landing/contracts/analytics";
import {
  analyticsEventValidator,
  createAnalyticsTracker,
  createInMemoryAnalyticsAdapter,
} from "./index";
import { createGtagAnalyticsAdapter } from "./gtag-adapter";

const context = {
  projectId: "ai-communication",
  experimentId: "landing-phase-1",
  variantId: "ai-communication-v1",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "KR",
} as AnalyticsContext;

const granted: ConsentProvider = { getState: () => "granted" };

function createTracker() {
  const adapter = createInMemoryAnalyticsAdapter();
  const tracker = createAnalyticsTracker({
    context,
    consent: granted,
    adapter,
    validator: analyticsEventValidator,
  });
  return { adapter, tracker };
}

function validate(candidate: Record<string, unknown>) {
  return analyticsEventValidator.validate({ ...context, version: 1, ...candidate });
}

describe("engagement and funnel events", () => {
  it("accepts the section, scroll, exit, and form events with their payloads", () => {
    const candidates = [
      { name: "section_viewed", sectionId: "features" },
      { name: "section_dwelled", sectionId: "features", dwellMs: 4200 },
      { name: "scroll_depth_reached", scrollPercent: 75 },
      { name: "page_exited", lastSectionId: "pricing", maxScrollPercent: 82, engagedMs: 19000 },
      { name: "form_opened", formId: "early-access", sourceId: "feature-roleplay" },
      { name: "form_started", formId: "early-access", fieldId: "email" },
      { name: "form_submitted", formId: "early-access" },
      { name: "form_failed", formId: "early-access", errorCode: "rate_limited" },
      { name: "form_abandoned", formId: "early-access", lastFieldId: "marketingConsent" },
    ];

    for (const candidate of candidates) {
      expect(validate(candidate), `${candidate.name} should validate`).toMatchObject({
        valid: true,
      });
    }
  });

  it("reports missing payload fields per event name", () => {
    expect(validate({ name: "section_viewed" })).toEqual({
      valid: false,
      issues: [{ field: "sectionId", code: "missing" }],
    });
    expect(validate({ name: "page_exited", lastSectionId: "cta", maxScrollPercent: 40 })).toEqual({
      valid: false,
      issues: [{ field: "engagedMs", code: "missing" }],
    });
  });

  it("rejects measurements that are negative, non-finite, or over 100 percent", () => {
    const cases = [
      { name: "section_dwelled", sectionId: "hero", dwellMs: -1 },
      { name: "section_dwelled", sectionId: "hero", dwellMs: Number.NaN },
      { name: "scroll_depth_reached", scrollPercent: 101 },
      { name: "scroll_depth_reached", scrollPercent: "50" },
    ];

    for (const candidate of cases) {
      expect(validate(candidate).valid, JSON.stringify(candidate)).toBe(false);
    }
  });

  it("rejects a form error code outside the submission contract", () => {
    expect(validate({ name: "form_failed", formId: "early-access", errorCode: "teapot" })).toEqual({
      valid: false,
      issues: [{ field: "errorCode", code: "invalid" }],
    });
  });

  it("rejects payload fields that belong to a different event", () => {
    expect(validate({ name: "section_viewed", sectionId: "hero", dwellMs: 10 })).toEqual({
      valid: false,
      issues: [{ field: "dwellMs", code: "unknown" }],
    });
  });

  it("sends each section view only once but keeps every dwell report", async () => {
    const { adapter, tracker } = createTracker();

    expect(await tracker.track({ name: "section_viewed", sectionId: "features" })).toEqual({
      status: "sent",
    });
    expect(await tracker.track({ name: "section_viewed", sectionId: "features" })).toEqual({
      status: "duplicate",
      name: "section_viewed",
    });
    expect(await tracker.track({ name: "section_viewed", sectionId: "pricing" })).toEqual({
      status: "sent",
    });
    await tracker.track({ name: "section_dwelled", sectionId: "features", dwellMs: 10 });
    await tracker.track({ name: "section_dwelled", sectionId: "features", dwellMs: 20 });

    expect(adapter.events.map((event) => event.name)).toEqual([
      "section_viewed",
      "section_viewed",
      "section_dwelled",
      "section_dwelled",
    ]);
  });

  it("maps multi-word payload fields onto snake_case GA4 parameters", () => {
    const gtag = vi.fn();
    const adapter = createGtagAnalyticsAdapter({ gtag });

    adapter.send({
      ...context,
      name: "page_exited",
      version: 1,
      lastSectionId: "pricing",
      maxScrollPercent: 82,
      engagedMs: 19000,
    });

    expect(gtag.mock.calls[0]?.[2]).toMatchObject({
      last_section_id: "pricing",
      max_scroll_percent: 82,
      engaged_ms: 19000,
    });
  });
});
