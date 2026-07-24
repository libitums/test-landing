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

describe("ai-communication Phase 2 localization integration", () => {
  it("enables pseudo runtime only through the explicit test entry", () => {
    expect(registry.supportedLocales).not.toContain("en-XA");
    expect(getEntryRuntime("/ko-KR/campaign", "?pseudo=1", true).locale).toBe("en-XA");
    expect(getEntryRuntime("/ko-KR/campaign", "?pseudo=1", false).locale).toBe("ko-KR");
  });
  it.each(["ko-KR", "en-US", "ja-JP", "vi-VN", "th-TH", "zh-CN", "zh-TW", "ar"] as const)(
    "renders real %s translations with a complete key set and locale Intl formatting",
    (localeName) => {
      const runtime = getRuntime(`/${localeName}/campaign`);
      const referenceKeys = Object.keys(resources["ko-KR"]).sort();
      expect(Object.keys(resources[localeName]).sort()).toEqual(referenceKeys);

      render(<App analytics={analytics} runtime={runtime} />);

      expect(screen.getByTestId("landing:ai-communication")).toBeInTheDocument();
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

  it.each(["ko-KR", "ar"] as const)(
    "keeps representative %s feature copy localized instead of inheriting English",
    (localeName) => {
      expect(resources[localeName]["hero.title"]).not.toBe(resources["en-US"]["hero.title"]);
      expect(resources[localeName]["feature.cta"]).not.toBe(resources["en-US"]["feature.cta"]);
      expect(resources[localeName]["feature.roleplay.title"]).not.toBe(
        resources["en-US"]["feature.roleplay.title"],
      );
      expect(resources[localeName]["feature.corrections.feedback"]).not.toBe(
        resources["en-US"]["feature.corrections.feedback"],
      );
      expect(resources[localeName]["feature.bias.title"]).not.toBe(
        resources["en-US"]["feature.bias.title"],
      );
    },
  );

  it.each(["ja-JP", "vi-VN", "th-TH", "zh-CN", "zh-TW"] as const)(
    "localizes mockup and persona copy for %s while preserving Korean practice phrases",
    (localeName) => {
      const copy = resources[localeName];
      const localizedUiKeys = [
        "feature.roleplay.phone.title",
        "feature.roleplay.phone.translation",
        "feature.roleplay.tag.travel",
        "feature.roleplay.scene.taxi",
        "feature.corrections.feedback",
        "feature.corrections.explanation",
        "feature.bias.persona.midnight.name",
        "feature.bias.persona.midnight.quote",
        "feature.bias.persona.closer.tags",
        "feature.bias.persona.closer.streak",
      ] as const;
      for (const key of localizedUiKeys) expect(copy[key]).not.toBe(resources["en-US"][key]);
      expect(copy["feature.roleplay.phone.prompt"]).toBe(
        resources["ko-KR"]["feature.roleplay.phone.prompt"],
      );
    },
  );

  it("normalizes unsupported/missing locales and applies route-preserving metadata idempotently", () => {
    expect(getRuntime("/fr-FR/campaign/launch").locale).toBe("ko-KR");
    expect(getRuntime("/campaign/launch").locale).toBe("ko-KR");

    applyLocaleMetadata("/ar/campaign/launch?utm_country=KR#proof");
    applyLocaleMetadata("/ar/campaign/launch?utm_country=US#features");

    expect(document.documentElement).toHaveAttribute("lang", "ar");
    expect(document.documentElement).toHaveAttribute("dir", "rtl");
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

    expect(screen.getByRole("link", { name: resources.ar["nav.cta"] })).toHaveAttribute(
      "href",
      "#cta",
    );
    expect(screen.getByRole("link", { name: resources.ar["cta.action"] })).toHaveAttribute(
      "href",
      "/ar/ai-communication/early-access",
    );
    expect(hrefs.indexOf("#cta")).toBeLessThan(hrefs.lastIndexOf("#top"));
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
        location="/ar/campaign/launch?experiment=A#comparison"
      />,
    );
    const languageTrigger = screen.getByRole("button", { name: resources.ar["locale.label"] });
    languageTrigger.focus();
    fireEvent.keyDown(languageTrigger, { key: "ArrowDown" });
    const menu = await screen.findByRole("menu", { name: resources.ar["locale.label"] });
    expect(menu.querySelectorAll("a")).toHaveLength(registry.supportedLocales.length);
    expect(screen.getByRole("menuitem", { name: resources.ar["locale.ar"] })).toHaveAttribute(
      "aria-current",
      "page",
    );
    expect(screen.getByRole("menuitem", { name: resources.ar["locale.en-US"] })).toHaveAttribute(
      "href",
      "/en-US/campaign/launch?experiment=A#comparison",
    );
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
