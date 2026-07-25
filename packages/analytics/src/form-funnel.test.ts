import { describe, expect, it } from "vitest";
import type { AnalyticsContext, ConsentProvider } from "@landing/contracts/analytics";
import { createFormFunnelReporter } from "./form-funnel";
import {
  analyticsEventValidator,
  createAnalyticsTracker,
  createInMemoryAnalyticsAdapter,
} from "./index";

const context = {
  projectId: "ai-communication",
  experimentId: "landing-phase-1",
  variantId: "ai-communication-v1",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "KR",
} as AnalyticsContext;

const granted: ConsentProvider = { getState: () => "granted" };

function setup(sourceId = "hero") {
  const adapter = createInMemoryAnalyticsAdapter();
  const tracker = createAnalyticsTracker({
    context,
    consent: granted,
    adapter,
    validator: analyticsEventValidator,
  });
  return {
    adapter,
    funnel: createFormFunnelReporter({ tracker, formId: "early-access", sourceId }),
  };
}

const names = (adapter: ReturnType<typeof setup>["adapter"]) =>
  adapter.events.map((event) => event.name);

describe("form funnel reporter", () => {
  it("records the opening call to action", async () => {
    const { adapter, funnel } = setup("feature:roleplay");

    funnel.opened();
    await Promise.resolve();

    expect(adapter.events[0]).toMatchObject({
      name: "form_opened",
      formId: "early-access",
      sourceId: "feature:roleplay",
    });
  });

  it("starts the funnel on the first touched field only", async () => {
    const { adapter, funnel } = setup();

    funnel.fieldTouched("email");
    funnel.fieldTouched("email");
    funnel.fieldTouched("marketingConsent");
    await Promise.resolve();

    expect(adapter.events).toEqual([
      expect.objectContaining({ name: "form_started", fieldId: "email" }),
    ]);
  });

  it("reports abandonment with the last field the visitor touched", async () => {
    const { adapter, funnel } = setup();

    funnel.fieldTouched("email");
    funnel.fieldTouched("marketingConsent");
    funnel.closed();
    await Promise.resolve();

    expect(adapter.events[adapter.events.length - 1]).toMatchObject({
      name: "form_abandoned",
      lastFieldId: "marketingConsent",
    });
  });

  it("treats a form closed without any input as abandoned at no field", async () => {
    const { adapter, funnel } = setup();

    funnel.opened();
    funnel.closed();
    await Promise.resolve();

    expect(adapter.events[adapter.events.length - 1]).toMatchObject({
      name: "form_abandoned",
      lastFieldId: "none",
    });
  });

  it("never reports abandonment after a conversion, or twice", async () => {
    const { adapter, funnel } = setup();

    funnel.fieldTouched("email");
    funnel.submitted();
    funnel.succeeded();
    funnel.closed();
    funnel.closed();
    await Promise.resolve();

    expect(names(adapter)).toEqual(["form_started", "form_submitted", "conversion_completed"]);
  });

  it("keeps the funnel open after a failure so a retry is still measured", async () => {
    const { adapter, funnel } = setup();

    funnel.fieldTouched("email");
    funnel.submitted();
    funnel.failed("rate_limited");
    funnel.submitted();
    funnel.succeeded();
    await Promise.resolve();

    expect(names(adapter)).toEqual([
      "form_started",
      "form_submitted",
      "form_failed",
      "form_submitted",
      "conversion_completed",
    ]);
  });
});
