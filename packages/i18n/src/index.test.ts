import type { LocaleRegistry } from "@landing/contracts/i18n";
import { describe, expect, it } from "vitest";
import {
  assertRegistryResources,
  assertValidResource,
  createI18nRuntime,
  createLocaleRegistry,
  createRoutingMetadata,
  locale,
  localizePath,
  pseudoLocale,
  resolveLocalePath,
  validateResourceKeys,
} from "./index";

const base = { greeting: "Hello {{name}}", count: "Count" };
const defs = [
  {
    locale: locale("ko-KR"),
    direction: "ltr" as const,
    resource: { greeting: "안녕 {{name}}", count: "수" },
    canonicalPath: "/ko-KR",
  },
  { locale: locale("en-US"), direction: "ltr" as const, resource: base, canonicalPath: "/en-US" },
  {
    locale: locale("ar"),
    direction: "rtl" as const,
    resource: { greeting: "مرحبا {{name}}", count: "عدد" },
    canonicalPath: "/ar",
  },
];

describe("strict locale registry", () => {
  it("resolves supported prefixes and normalizes missing or unsupported prefixes", () => {
    const registry = createLocaleRegistry(defs);
    expect(registry.resolve("/ar/page?utm_country=US")).toBe(locale("ar"));
    expect(resolveLocalePath(registry, "/products/one?secret=1#part")).toEqual({
      locale: locale("ko-KR"),
      pathname: "/ko-KR/products/one",
      hadSupportedPrefix: false,
    });
    expect(resolveLocalePath(registry, "/fr/products").pathname).toBe("/ko-KR/products");
    expect(resolveLocalePath(registry, "/app/features").pathname).toBe("/ko-KR/app/features");
    expect(
      localizePath(registry, "/ko-KR/products?experiment=variant-a#details", locale("ar")),
    ).toBe("/ar/products?experiment=variant-a#details");
  });

  it("rejects empty, duplicate, unregistered default, and unsupported target locales", () => {
    expect(() => createLocaleRegistry([])).toThrow("at least one");
    expect(() => createLocaleRegistry([defs[0]!, defs[0]!])).toThrow("Duplicate");
    expect(() => createLocaleRegistry(defs, locale("fr"))).toThrow("not registered");
    expect(() => localizePath(createLocaleRegistry(defs), "/", locale("fr"))).toThrow(
      "Unsupported",
    );
  });
});

describe("translation contracts", () => {
  it("strictly reports both missing and extra keys in stable order", () => {
    expect(validateResourceKeys(base, { greeting: "x", zebra: "z", alpha: "a" })).toEqual({
      missing: ["count"],
      extra: ["alpha", "zebra"],
    });
    expect(() => assertValidResource(base, { greeting: "x" })).toThrow("missing: count");
    expect(() =>
      assertRegistryResources(
        createLocaleRegistry([defs[0]!, { ...defs[1]!, resource: { greeting: "x", extra: "y" } }]),
      ),
    ).toThrow("missing: count; extra: extra");
  });

  it("throws for missing keys and never falls back to another definition", () => {
    const registry: LocaleRegistry = {
      defaultLocale: locale("ko-KR"),
      supportedLocales: [locale("ko-KR")],
      definitions: defs.slice(1),
      resolve: () => locale("ko-KR"),
    };
    expect(() => createI18nRuntime(registry, "/ko-KR")).toThrow("no definition");
    const runtime = createI18nRuntime(createLocaleRegistry(defs), "/ar");
    expect(() => runtime.translate("unknown")).toThrow("Missing translation key");
    expect(runtime.translate("greeting", { name: "A" })).toBe("مرحبا A");
  });
});

describe("Intl formatting", () => {
  it.each(["ko-KR", "en-US", "ar"])("uses Intl results for %s", (tag) => {
    const runtime = createI18nRuntime(createLocaleRegistry(defs), `/${tag}`);
    const numberOptions: Intl.NumberFormatOptions = { style: "currency", currency: "USD" };
    const dateOptions: Intl.DateTimeFormatOptions = {
      timeZone: "UTC",
      year: "numeric",
      month: "2-digit",
      day: "2-digit",
    };
    const date = new Date("2020-01-02T00:00:00Z");
    expect(runtime.formatNumber(1234.5, numberOptions)).toBe(
      new Intl.NumberFormat(tag, numberOptions).format(1234.5),
    );
    expect(runtime.formatDate(date, dateOptions)).toBe(
      new Intl.DateTimeFormat(tag, dateOptions).format(date),
    );
  });
});

describe("pseudo locale and metadata", () => {
  it("creates deterministic expanded pseudo resources without corrupting placeholders", () => {
    const options = {
      sourceLocale: locale("en-US"),
      pseudoLocale: locale("en-XA"),
      expandByPercent: 35,
    };
    const first = pseudoLocale({ z: "Save", a: "Hello {{name}}" }, options);
    const second = pseudoLocale({ a: "Hello {{name}}", z: "Save" }, options);
    expect(first).toEqual(second);
    expect(Object.keys(first)).toEqual(["a", "z"]);
    expect(first.a).toContain("{{name}}");
    expect(first.a).not.toContain("ñåḿé");
    expect(first.a!.length).toBeGreaterThan("Hello {{name}}".length);
  });

  it("preserves routes, excludes query/hash, and emits one alternate per locale", () => {
    const metadata = createRoutingMetadata(
      createLocaleRegistry(defs),
      "/ar/products/one?utm_country=US#part",
      "https://x.test/",
    );
    expect(metadata).toEqual({
      lang: "ar",
      dir: "rtl",
      canonical: "https://x.test/ar/products/one",
      hreflang: {
        "ko-KR": "https://x.test/ko-KR/products/one",
        "en-US": "https://x.test/en-US/products/one",
        ar: "https://x.test/ar/products/one",
      },
    });
    expect(Object.keys(metadata.hreflang)).toHaveLength(defs.length);
  });

  it("uses each locale definition canonical path as its metadata base", () => {
    const divergentDefinitions = [
      { ...defs[0]!, canonicalPath: "/ko-KR/start" },
      { ...defs[1]!, canonicalPath: "/en-US/welcome" },
      { ...defs[2]!, canonicalPath: "/ar/bidaya" },
    ];
    const metadata = createRoutingMetadata(
      createLocaleRegistry(divergentDefinitions),
      "/en-US/products/one?secret=1#part",
      "https://x.test/",
    );

    expect(metadata.canonical).toBe("https://x.test/en-US/welcome/products/one");
    expect(metadata.hreflang).toEqual({
      "ko-KR": "https://x.test/ko-KR/start/products/one",
      "en-US": "https://x.test/en-US/welcome/products/one",
      ar: "https://x.test/ar/bidaya/products/one",
    });
  });
});
