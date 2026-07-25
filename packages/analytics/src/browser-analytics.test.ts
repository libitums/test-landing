import { beforeEach, describe, expect, it } from "vitest";
import { createBrowserAnalyticsAdapter } from "./browser-analytics";
import type { GtagWindow } from "./gtag-loader";

const event = {
  name: "experiment_viewed",
  version: 1,
  projectId: "ai-communication",
  experimentId: "landing-phase-1",
  variantId: "ai-communication-v1",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "unknown",
} as const;

function target(): GtagWindow {
  return window as unknown as GtagWindow;
}

function tagScripts(): Element[] {
  return [...document.querySelectorAll("script[data-analytics='gtag']")];
}

describe("browser analytics adapter selection", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete target().dataLayer;
    delete target().gtag;
  });

  it("stays inert without a measurement id", () => {
    const adapter = createBrowserAnalyticsAdapter({ enabled: true, target: target() });

    adapter.send(event);

    expect(tagScripts()).toHaveLength(0);
    expect(target().dataLayer).toBeUndefined();
  });

  it("stays inert while disabled, so development and test runs never load the tag", () => {
    const adapter = createBrowserAnalyticsAdapter({
      measurementId: "G-TEST123",
      enabled: false,
      target: target(),
    });

    adapter.send(event);

    expect(tagScripts()).toHaveLength(0);
    expect(target().dataLayer).toBeUndefined();
  });

  it("loads the tag and forwards events once enabled with a measurement id", () => {
    const adapter = createBrowserAnalyticsAdapter({
      measurementId: "G-TEST123",
      enabled: true,
      target: target(),
    });

    adapter.send(event);

    expect(tagScripts()).toHaveLength(1);
    const queued = (target().dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    );
    expect(queued[queued.length - 1]?.slice(0, 2)).toEqual(["event", "experiment_viewed"]);
  });

  it("configures both properties and broadcasts each event once, without send_to", () => {
    const adapter = createBrowserAnalyticsAdapter({
      measurementId: "G-TEST123",
      rollupMeasurementId: "G-ROLLUP9",
      enabled: true,
      target: target(),
    });

    adapter.send(event);

    const commands = (target().dataLayer ?? []).map((entry) =>
      Array.from(entry as ArrayLike<unknown>),
    );
    expect(
      commands.filter((command) => command[0] === "config").map((command) => command[1]),
    ).toEqual(["G-TEST123", "G-ROLLUP9"]);
    const events = commands.filter((command) => command[0] === "event");
    expect(events).toHaveLength(1);
    expect(events[0]?.[2]).not.toHaveProperty("send_to");
  });

  it("labels the session as internal traffic when asked", () => {
    createBrowserAnalyticsAdapter({
      measurementId: "G-TEST123",
      trafficType: "internal",
      enabled: true,
      target: target(),
    });

    const config = (target().dataLayer ?? [])
      .map((entry) => Array.from(entry as ArrayLike<unknown>))
      .find((command) => command[0] === "config");
    expect(config?.[2]).toMatchObject({ traffic_type: "internal" });
  });

  it("ignores a blank measurement id left in the environment", () => {
    const adapter = createBrowserAnalyticsAdapter({
      measurementId: "   ",
      enabled: true,
      target: target(),
    });

    adapter.send(event);

    expect(tagScripts()).toHaveLength(0);
  });
});
