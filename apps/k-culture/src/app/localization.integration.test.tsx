import { cleanup, fireEvent, render, screen } from "@testing-library/react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import { afterEach, describe, expect, it, vi } from "vitest";
import {
  applyLocaleMetadata,
  createTestRegistry,
  getEntryRuntime,
  getRuntime,
  registry,
  resources,
} from "../i18n";
import { App } from "./App";

const analytics: AnalyticsTracker = {
  track: vi.fn(async () => ({ status: "sent" as const })),
};

afterEach(() => {
  cleanup();
  document.head
    .querySelectorAll('link[rel="canonical"], link[rel="alternate"]')
    .forEach((node) => node.remove());
});

describe("k-culture Phase 2 localization integration", () => {
  const supportedLocales = [
    "ko-KR",
    "en-US",
    "ja-JP",
    "vi-VN",
    "th-TH",
    "zh-CN",
    "zh-TW",
    "ar",
  ] as const;

  it("registers the eight production locales in the shared navigation order", () => {
    expect(registry.supportedLocales).toEqual(supportedLocales);
    for (const localeName of supportedLocales) {
      expect(getRuntime(`/${localeName}/campaign`).locale).toBe(localeName);
      expect(getRuntime(`/${localeName}/campaign`).direction).toBe(
        localeName === "ar" ? "rtl" : "ltr",
      );
    }
  });

  it("enables pseudo runtime only through the explicit test entry", () => {
    expect(registry.supportedLocales).not.toContain("en-XA");
    expect(getEntryRuntime("/ko-KR/campaign", "?pseudo=1", true).locale).toBe("en-XA");
    expect(getEntryRuntime("/ko-KR/campaign", "?pseudo=1", false).locale).toBe("ko-KR");
  });
  it.each(supportedLocales)(
    "renders real %s translations with a complete key set and locale Intl formatting",
    (localeName) => {
      const runtime = getRuntime(`/${localeName}/campaign`);
      const referenceKeys = Object.keys(resources["ko-KR"]).sort();
      expect(Object.keys(resources[localeName]).sort()).toEqual(referenceKeys);

      render(<App analytics={analytics} runtime={runtime} />);

      expect(screen.getByTestId("landing:k-culture")).toBeInTheDocument();
      expect(screen.getByTestId("navbar-logo")).toHaveAccessibleName("K-zip");
      expect(screen.getByTestId("navbar-logo")).toHaveTextContent("K-zip");
      expect(screen.getByRole("contentinfo")).toHaveTextContent("K-zip");
      expect(screen.getByRole("heading", { level: 1 })).toHaveTextContent(
        resources[localeName]["hero.title"],
      );
      expect(document.body.textContent).not.toContain("hero.title");
      expect(runtime.formatNumber(123456.78)).toBe(
        new Intl.NumberFormat(localeName).format(123456.78),
      );
      const date = new Date(Date.UTC(2026, 6, 18));
      const options = { dateStyle: "long", timeZone: "UTC" } as const;
      expect(runtime.formatDate(date, options)).toBe(
        new Intl.DateTimeFormat(localeName, options).format(date),
      );
    },
  );

  it("normalizes unsupported/missing locales and applies route-preserving metadata idempotently", () => {
    expect(getRuntime("/fr-FR/campaign/launch").locale).toBe("en-US");
    expect(getRuntime("/campaign/launch").locale).toBe("en-US");

    applyLocaleMetadata("/ar/campaign/launch?utm_country=KR#proof");
    applyLocaleMetadata("/ar/campaign/launch?utm_country=US#features");

    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
    expect(document.title).toBe("K-zip — Learn Korean through K-Culture");
    expect(document.head.querySelectorAll('link[rel="canonical"]')).toHaveLength(1);
    expect(document.head.querySelector<HTMLLinkElement>('link[rel="canonical"]')?.href).toBe(
      "http://localhost:3000/ar/campaign/launch",
    );
    const alternates = [
      ...document.head.querySelectorAll<HTMLLinkElement>('link[rel="alternate"]'),
    ];
    expect(alternates).toHaveLength(registry.supportedLocales.length);
    expect(Object.fromEntries(alternates.map((link) => [link.hreflang, link.href]))).toEqual({
      "ko-KR": "http://localhost:3000/ko-KR/campaign/launch",
      "en-US": "http://localhost:3000/en-US/campaign/launch",
      "ja-JP": "http://localhost:3000/ja-JP/campaign/launch",
      "vi-VN": "http://localhost:3000/vi-VN/campaign/launch",
      "th-TH": "http://localhost:3000/th-TH/campaign/launch",
      "zh-CN": "http://localhost:3000/zh-CN/campaign/launch",
      "zh-TW": "http://localhost:3000/zh-TW/campaign/launch",
      ar: "http://localhost:3000/ar/campaign/launch",
    });
  });

  it("keeps RTL CTA links and DOM/focus order semantic", () => {
    render(<App analytics={analytics} runtime={getRuntime("/ar/")} />);
    const links = screen.getAllByRole("link");
    const hrefs = links.map((link) => link.getAttribute("href"));

    expect(screen.getByTestId("navbar-try")).toHaveAttribute("href", "#cta");
    expect(screen.getByTestId("navbar-how-it-works")).toHaveAttribute("href", "#proof");
    expect(screen.getByTestId("navbar-pricing")).toHaveAttribute("href", "#pricing");
    expect(screen.getByTestId("cta-action:early-access")).toHaveAttribute(
      "href",
      "#early-access",
    );
    expect(hrefs.indexOf("#cta")).toBeLessThan(hrefs.indexOf("#early-access"));
    expect(
      screen
        .getByTestId("cta-section")
        .compareDocumentPosition(screen.getByTestId("pricing-section")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    for (const link of links) {
      link.focus();
      expect(document.activeElement).toBe(link);
    }
  });

  it("switches locale accessibly while preserving route, query, and hash", async () => {
    render(
      <App
        analytics={analytics}
        runtime={getRuntime("/ar/campaign/launch")}
        location="/ar/campaign/launch?experiment=A#proof"
      />,
    );
    const languageTrigger = screen.getByRole("button", { name: resources.ar["locale.label"] });
    languageTrigger.focus();
    fireEvent.keyDown(languageTrigger, { key: "ArrowDown" });
    const menu = await screen.findByRole("menu", { name: resources.ar["locale.label"] });
    expect(menu.querySelectorAll("a")).toHaveLength(8);
    expect(screen.getByRole("menuitem", { name: resources.ar["locale.ar"] })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("menuitem", { name: resources.ar["locale.en-US"] })).toHaveAttribute(
      "href",
      "/en-US/campaign/launch?experiment=A#proof",
    );
    expect(
      [...menu.querySelectorAll("a")].map((item) => item.getAttribute("href")?.split("/")[1]),
    ).toEqual(["ko-KR", "en-US", "ja-JP", "vi-VN", "th-TH", "zh-CN", "zh-TW", "ar"]);
  });

  it("renders a 35% pseudo-locale without raw keys and retains CTA and landmarks", () => {
    const testRegistry = createTestRegistry();
    const runtime = getRuntime("/en-XA/campaign", testRegistry);
    applyLocaleMetadata("/en-XA/campaign", testRegistry);
    render(<App analytics={analytics} runtime={runtime} />);

    expect(document.documentElement).toHaveAttribute("lang", "en-XA");
    expect(document.documentElement).toHaveAttribute("dir", "ltr");
    expect(screen.getByRole("banner")).toBeInTheDocument();
    expect(screen.getByRole("main")).toBeInTheDocument();
    expect(screen.getByRole("contentinfo")).toBeInTheDocument();
    expect(screen.getAllByRole("link").length).toBeGreaterThan(0);
    for (const key of Object.keys(resources["en-US"])) {
      expect(document.body.textContent).not.toContain(key);
    }
    expect(runtime.translate("hero.title").length).toBeGreaterThan(
      resources["en-US"]["hero.title"].length * 1.3,
    );
  });
});
