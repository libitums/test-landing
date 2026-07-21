import { describe, expect, it } from "vitest";
import {
  assertRegistryResources,
  createI18nRuntime,
  createLocaleRegistry,
  createRoutingMetadata,
  locale,
  pseudoLocale,
  resolveLocalePath,
  validateResourceKeys,
} from "./index";

const resources = {
  "ko-KR": {
    "hero.title": "새로운 이야기를 만나보세요",
    "hero.cta": "지금 시작하기",
    "proof.count": "{{count}}개의 이야기",
  },
  "en-US": {
    "hero.title": "Meet a new story",
    "hero.cta": "Start now",
    "proof.count": "{{count}} stories",
  },
  ar: {
    "hero.title": "اكتشف قصة جديدة",
    "hero.cta": "ابدأ الآن",
    "proof.count": "{{count}} قصة",
  },
} as const;

const registry = createLocaleRegistry(
  Object.entries(resources).map(([localeName, resource]) => ({
    locale: locale(localeName),
    direction: localeName === "ar" ? ("rtl" as const) : ("ltr" as const),
    resource,
    canonicalPath: `/${localeName}/`,
  })),
);

describe("Phase 2 localization integration contract", () => {
  it("uses the same complete key set and renders real translated copy in every production locale", () => {
    const reference = resources["ko-KR"];

    expect(() => assertRegistryResources(registry)).not.toThrow();
    for (const localeName of ["ko-KR", "en-US", "ar"] as const) {
      expect(validateResourceKeys(reference, resources[localeName])).toEqual({
        missing: [],
        extra: [],
      });

      const runtime = createI18nRuntime(registry, `/${localeName}/campaign`);
      expect(runtime.translate("hero.title")).toBe(resources[localeName]["hero.title"]);
      expect(runtime.translate("hero.title")).not.toBe("hero.title");
      expect(runtime.translate("proof.count", { count: 12 })).not.toContain("{{count}}");
    }
  });

  it("normalizes missing and locale-looking unsupported prefixes to ko-KR without treating an ordinary route as a locale", () => {
    expect(resolveLocalePath(registry, "/campaign/launch?utm_country=US#proof")).toEqual({
      locale: locale("ko-KR"),
      pathname: "/ko-KR/campaign/launch",
      hadSupportedPrefix: false,
    });
    expect(resolveLocalePath(registry, "/fr-FR/campaign/launch?ref=header")).toEqual({
      locale: locale("ko-KR"),
      pathname: "/ko-KR/campaign/launch",
      hadSupportedPrefix: false,
    });
    expect(resolveLocalePath(registry, "/app/features?ref=header")).toEqual({
      locale: locale("ko-KR"),
      pathname: "/ko-KR/app/features",
      hadSupportedPrefix: false,
    });
    expect(registry.resolve(undefined)).toBe(locale("ko-KR"));
  });

  it.each(["ko-KR", "en-US", "ar"] as const)(
    "formats numbers and dates with the active %s Intl locale",
    (localeName) => {
      const runtime = createI18nRuntime(registry, `/${localeName}/`);
      const date = new Date(Date.UTC(2026, 6, 18, 12));
      const dateOptions = { dateStyle: "long", timeZone: "UTC" } as const;

      expect(runtime.formatNumber(1234567.89)).toBe(
        new Intl.NumberFormat(localeName).format(1234567.89),
      );
      expect(runtime.formatDate(date, dateOptions)).toBe(
        new Intl.DateTimeFormat(localeName, dateOptions).format(date),
      );
    },
  );

  it("preserves the route in canonical and emits the complete hreflang set without query/hash", () => {
    const metadata = createRoutingMetadata(
      registry,
      "/ar/campaign/launch?utm_country=KR#proof",
      "https://landing.example/",
    );

    expect(metadata).toEqual({
      lang: "ar",
      dir: "rtl",
      canonical: "https://landing.example/ar/campaign/launch",
      hreflang: {
        "ko-KR": "https://landing.example/ko-KR/campaign/launch",
        "en-US": "https://landing.example/en-US/campaign/launch",
        ar: "https://landing.example/ar/campaign/launch",
      },
    });
  });

  it("builds a deterministic 35% pseudo-locale without exposing keys or losing placeholders", () => {
    const pseudo = pseudoLocale(resources["en-US"], {
      sourceLocale: locale("en-US"),
      pseudoLocale: locale("en-XA"),
      expandByPercent: 35,
    });

    expect(Object.keys(pseudo)).toEqual(Object.keys(resources["en-US"]).sort());
    for (const [key, source] of Object.entries(resources["en-US"])) {
      expect(pseudo[key]).toBeDefined();
      expect(pseudo[key]).not.toContain(key);
      const sourceVisibleLength = source.replace(/\{\{\s*[\w.-]+\s*\}\}/g, "").length;
      const pseudoVisibleLength = pseudo[key]!.replace(/\{\{\s*[\w.-]+\s*\}\}/g, "").replace(
        /^\[|\]$/g,
        "",
      ).length;
      expect(pseudoVisibleLength).toBeGreaterThanOrEqual(Math.ceil(sourceVisibleLength * 1.3));
    }
    expect(pseudo["proof.count"]).toContain("{{count}}");
  });
});
