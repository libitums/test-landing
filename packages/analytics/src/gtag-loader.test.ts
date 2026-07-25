import { beforeEach, describe, expect, it } from "vitest";
import { installGtag } from "./gtag-loader";
import type { GtagWindow } from "./gtag-loader";

function target(): GtagWindow {
  return window as unknown as GtagWindow;
}

function commands(): unknown[][] {
  return (target().dataLayer ?? []).map((entry) => Array.from(entry as ArrayLike<unknown>));
}

function lastCommand(): unknown[] | undefined {
  const queued = commands();
  return queued[queued.length - 1];
}

function scripts(): HTMLScriptElement[] {
  return [...document.querySelectorAll<HTMLScriptElement>("script[data-analytics='gtag']")];
}

describe("gtag loader", () => {
  beforeEach(() => {
    document.head.innerHTML = "";
    delete target().dataLayer;
    delete target().gtag;
  });

  it("injects the tag script once per measurement id", () => {
    installGtag({ measurementId: "G-TEST123", target: target() });
    installGtag({ measurementId: "G-TEST123", target: target() });

    expect(scripts()).toHaveLength(1);
    expect(scripts()[0]?.src).toBe("https://www.googletagmanager.com/gtag/js?id=G-TEST123");
    expect(scripts()[0]?.async).toBe(true);
  });

  it("declares consent defaults before configuring the measurement id", () => {
    installGtag({ measurementId: "G-TEST123", target: target() });

    const [consent, ...rest] = commands();
    expect(consent).toEqual([
      "consent",
      "default",
      {
        analytics_storage: "granted",
        ad_storage: "denied",
        ad_user_data: "denied",
        ad_personalization: "denied",
      },
    ]);
    expect(rest.map(([command]) => command)).toEqual(["js", "config"]);
    expect(lastCommand()).toEqual(["config", "G-TEST123", { send_page_view: true }]);
  });

  it("returns a bridge that queues later commands onto the same dataLayer", () => {
    const gtag = installGtag({ measurementId: "G-TEST123", target: target() });

    gtag("event", "cta_clicked", { send_to: "G-TEST123" });

    expect(lastCommand()).toEqual(["event", "cta_clicked", { send_to: "G-TEST123" }]);
  });

  it("configures a second measurement id on the existing bridge for roll-up reporting", () => {
    const first = installGtag({ measurementId: "G-TEST123", target: target() });
    const second = installGtag({ measurementId: "G-ROLLUP9", target: target() });

    expect(second).toBe(first);
    expect(scripts()).toHaveLength(1);
    expect(lastCommand()).toEqual(["config", "G-ROLLUP9", { send_page_view: true }]);
  });

  it("reuses an already installed bridge instead of re-queuing configuration", () => {
    const first = installGtag({ measurementId: "G-TEST123", target: target() });
    const before = commands().length;
    const second = installGtag({ measurementId: "G-TEST123", target: target() });

    expect(second).toBe(first);
    expect(commands()).toHaveLength(before);
  });
});
