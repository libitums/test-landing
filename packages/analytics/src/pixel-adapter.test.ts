import { beforeEach, describe, expect, it, vi } from "vitest";
import type { AnalyticsContext } from "@landing/contracts/analytics";
import { createPixelAnalyticsAdapter } from "./pixel-adapter";
import { installPixel } from "./pixel-loader";
import type { PixelWindow } from "./pixel-loader";

const context = {
  projectId: "k-drama",
  experimentId: "landing-phase-1",
  variantId: "k-drama-v1",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "KR",
} as AnalyticsContext;

function target(): PixelWindow {
  return window as unknown as PixelWindow;
}

describe("Meta pixel sink", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete target().fbq;
    delete target()._fbq;
  });

  it("initialises the pixel and reports the page view once", () => {
    const first = installPixel({ pixelId: "1234567890", target: target() });
    const second = installPixel({ pixelId: "1234567890", target: target() });

    expect(second).toBe(first);
    expect(first.queue).toEqual([
      ["init", "1234567890"],
      ["track", "PageView"],
    ]);
    expect(document.querySelectorAll("script[data-analytics='meta-pixel']")).toHaveLength(1);
  });

  it("forwards only the events Meta can optimise on", () => {
    const fbq = vi.fn();
    const adapter = createPixelAnalyticsAdapter({ fbq });

    adapter.send({ ...context, name: "form_submitted", version: 1, formId: "early-access" });
    adapter.send({ ...context, name: "conversion_completed", version: 1 });
    adapter.send({ ...context, name: "section_viewed", version: 1, sectionId: "pricing" });
    adapter.send({ ...context, name: "cta_clicked", version: 1 });
    adapter.send({
      ...context,
      name: "page_exited",
      version: 1,
      lastSectionId: "cta",
      maxScrollPercent: 50,
      engagedMs: 10,
    });

    expect(fbq.mock.calls.map((call) => call[1])).toEqual(["Lead", "CompleteRegistration"]);
  });

  it("labels a feature call to action as viewed content", () => {
    const fbq = vi.fn();

    createPixelAnalyticsAdapter({ fbq }).send({
      ...context,
      name: "feature_cta_clicked",
      version: 1,
      featureId: "shortform",
    });

    expect(fbq).toHaveBeenCalledExactlyOnceWith("track", "ViewContent", {
      content_category: "feature",
      content_name: "shortform",
      locale: "ko-KR",
      project_id: "k-drama",
      variant_id: "k-drama-v1",
    });
  });
});
