import { describe, expect, it, vi } from "vitest";
import type { AnalyticsContext, AnalyticsEvent } from "@landing/contracts/analytics";
import { createCompositeAnalyticsAdapter } from "./composite-adapter";

const event = {
  projectId: "k-drama",
  experimentId: "landing-phase-1",
  variantId: "k-drama-v1",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "KR",
  name: "cta_clicked",
  version: 1,
} as AnalyticsEvent & AnalyticsContext;

describe("composite adapter", () => {
  it("delivers the same event to every sink", async () => {
    const first = { send: vi.fn() };
    const second = { send: vi.fn() };

    await createCompositeAnalyticsAdapter([first, second]).send(event);

    expect(first.send).toHaveBeenCalledWith(event);
    expect(second.send).toHaveBeenCalledWith(event);
  });

  it("keeps delivering when one vendor script throws", async () => {
    const failing = {
      send: vi.fn(() => {
        throw new Error("blocked by an ad blocker");
      }),
    };
    const healthy = { send: vi.fn() };

    await expect(
      createCompositeAnalyticsAdapter([failing, healthy]).send(event),
    ).resolves.toBeUndefined();
    expect(healthy.send).toHaveBeenCalledOnce();
  });

  it("keeps delivering when one sink rejects asynchronously", async () => {
    const failing = { send: () => Promise.reject(new Error("network")) };
    const healthy = { send: vi.fn() };

    await createCompositeAnalyticsAdapter([failing, healthy]).send(event);

    expect(healthy.send).toHaveBeenCalledOnce();
  });
});
