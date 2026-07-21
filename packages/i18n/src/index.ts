import type {
  I18nRuntime,
  Locale,
  LocaleDefinition,
  LocaleRegistry,
  LocaleRoutingMetadata,
  PseudoLocaleOptions,
  TextDirection,
  TranslationKeyReport,
} from "@landing/contracts/i18n";

export const locale = (value: string): Locale => value as Locale;

export const SUPPORTED_LOCALES = [locale("ko-KR"), locale("en-US"), locale("ar")] as const;

const LOCALE_SEGMENT = /^[a-z]{2}(?:-[a-z0-9]{2,8})*$/i;

function cleanPath(value: string | undefined): string {
  const raw = (value ?? "/").split(/[?#]/, 1)[0] ?? "/";
  const withSlash = raw.startsWith("/") ? raw : `/${raw}`;
  return withSlash.replace(/\/{2,}/g, "/");
}

function queryAndHash(value: string | undefined): string {
  if (value === undefined) return "";
  const queryIndex = value.indexOf("?");
  const hashIndex = value.indexOf("#");
  const indexes = [queryIndex, hashIndex].filter((index) => index >= 0);
  return indexes.length === 0 ? "" : value.slice(Math.min(...indexes));
}

function assertRegistry(definitions: readonly LocaleDefinition[], defaultLocale: Locale): void {
  if (definitions.length === 0) {
    throw new Error("Locale registry must define at least one locale");
  }

  const seen = new Set<string>();
  for (const definition of definitions) {
    if (seen.has(definition.locale)) {
      throw new Error(`Duplicate locale definition: ${definition.locale}`);
    }
    seen.add(definition.locale);
  }

  if (!seen.has(defaultLocale)) {
    throw new Error(`Default locale is not registered: ${defaultLocale}`);
  }
}

export function createLocaleRegistry(
  definitions: readonly LocaleDefinition[],
  defaultLocale: Locale = locale("ko-KR"),
): LocaleRegistry {
  assertRegistry(definitions, defaultLocale);

  const immutableDefinitions = Object.freeze(
    definitions.map((definition) => Object.freeze({ ...definition })),
  );
  const supportedLocales = Object.freeze(
    immutableDefinitions.map((definition) => definition.locale),
  );
  const supported = new Set<string>(supportedLocales);

  return Object.freeze({
    defaultLocale,
    supportedLocales,
    definitions: immutableDefinitions,
    resolve(requested: string | undefined) {
      const firstSegment = cleanPath(requested).split("/")[1];
      return firstSegment !== undefined && supported.has(firstSegment)
        ? (firstSegment as Locale)
        : defaultLocale;
    },
  });
}

export interface LocalePathResolution {
  readonly locale: Locale;
  readonly pathname: string;
  readonly hadSupportedPrefix: boolean;
}

/** Resolves a path and returns its canonical locale-prefixed pathname. */
export function resolveLocalePath(
  registry: LocaleRegistry,
  requested: string | undefined,
): LocalePathResolution {
  const pathname = cleanPath(requested);
  const segments = pathname.split("/").filter(Boolean);
  const first = segments[0];
  const hadSupportedPrefix =
    first !== undefined && registry.supportedLocales.includes(first as Locale);
  const localeValue = hadSupportedPrefix ? (first as Locale) : registry.defaultLocale;

  // Replace a locale-looking unsupported prefix, but retain an ordinary route.
  const routeSegments = hadSupportedPrefix
    ? segments.slice(1)
    : first !== undefined && LOCALE_SEGMENT.test(first)
      ? segments.slice(1)
      : segments;
  const suffix = routeSegments.length > 0 ? `/${routeSegments.join("/")}` : "/";

  return Object.freeze({
    locale: localeValue,
    pathname: `/${localeValue}${suffix}`,
    hadSupportedPrefix,
  });
}

/** Switches only the locale prefix while preserving the current route. */
export function localizePath(
  registry: LocaleRegistry,
  requested: string | undefined,
  targetLocale: Locale,
): string {
  if (!registry.supportedLocales.includes(targetLocale)) {
    throw new Error(`Unsupported locale: ${targetLocale}`);
  }
  const normalized = resolveLocalePath(registry, requested).pathname;
  const segments = normalized.split("/").filter(Boolean).slice(1);
  return `/${targetLocale}/${segments.join("/")}${queryAndHash(requested)}`;
}

export function validateResourceKeys(
  reference: Readonly<Record<string, string>>,
  resource: Readonly<Record<string, string>>,
): TranslationKeyReport {
  const expected = new Set(Object.keys(reference));
  const actual = new Set(Object.keys(resource));
  return Object.freeze({
    missing: Object.freeze([...expected].filter((key) => !actual.has(key)).sort()),
    extra: Object.freeze([...actual].filter((key) => !expected.has(key)).sort()),
  });
}

export function assertValidResource(
  reference: Readonly<Record<string, string>>,
  resource: Readonly<Record<string, string>>,
): void {
  const report = validateResourceKeys(reference, resource);
  if (report.missing.length > 0 || report.extra.length > 0) {
    throw new Error(
      `Invalid translation keys (missing: ${report.missing.join(", ")}; extra: ${report.extra.join(", ")})`,
    );
  }
}

/** Validates every definition against one explicit reference locale. */
export function assertRegistryResources(
  registry: LocaleRegistry,
  referenceLocale: Locale = registry.defaultLocale,
): void {
  const reference = registry.definitions.find(
    (definition) => definition.locale === referenceLocale,
  );
  if (reference === undefined) {
    throw new Error(`Reference locale is not registered: ${referenceLocale}`);
  }
  for (const definition of registry.definitions) {
    assertValidResource(reference.resource, definition.resource);
  }
}

function requireDefinition(registry: LocaleRegistry, localeValue: Locale): LocaleDefinition {
  const definition = registry.definitions.find((candidate) => candidate.locale === localeValue);
  if (definition === undefined) {
    // A custom registry may violate the contract; never hide that with fallback.
    throw new Error(`Resolved locale has no definition: ${localeValue}`);
  }
  return definition;
}

export function createI18nRuntime(
  registry: LocaleRegistry,
  requested: string | undefined,
): I18nRuntime {
  const current = registry.resolve(requested);
  const definition = requireDefinition(registry, current);

  return Object.freeze({
    locale: current,
    direction: definition.direction,
    translate(key: string, values: Readonly<Record<string, string | number>> = {}) {
      const text = definition.resource[key];
      if (text === undefined) {
        throw new Error(`Missing translation key: ${key}`);
      }
      return text.replace(/\{\{\s*([\w.-]+)\s*\}\}/g, (_, name: string) =>
        Object.prototype.hasOwnProperty.call(values, name) ? String(values[name]) : `{{${name}}}`,
      );
    },
    formatNumber: (value: number, options?: Intl.NumberFormatOptions) =>
      new Intl.NumberFormat(current, options).format(value),
    formatDate: (value: Date | number, options?: Intl.DateTimeFormatOptions) =>
      new Intl.DateTimeFormat(current, options).format(value),
  });
}

function originPrefix(origin: string): string {
  return origin.replace(/\/+$/, "");
}

function canonicalRoute(definition: LocaleDefinition, routeSegments: readonly string[]): string {
  const canonicalBase = cleanPath(definition.canonicalPath).replace(/\/+$/, "");
  const route = routeSegments.length > 0 ? `/${routeSegments.join("/")}` : "/";
  return `${canonicalBase}${route}`;
}

export function createRoutingMetadata(
  registry: LocaleRegistry,
  requested: string | undefined,
  origin = "",
): LocaleRoutingMetadata {
  const resolution = resolveLocalePath(registry, requested);
  const definition = requireDefinition(registry, resolution.locale);
  const prefix = originPrefix(origin);
  const routeSegments = resolution.pathname.split("/").filter(Boolean).slice(1);
  const canonical = `${prefix}${canonicalRoute(definition, routeSegments)}`;
  const hreflang = Object.fromEntries(
    registry.supportedLocales.map((supportedLocale) => {
      const supportedDefinition = requireDefinition(registry, supportedLocale);
      return [supportedLocale, `${prefix}${canonicalRoute(supportedDefinition, routeSegments)}`];
    }),
  );

  return Object.freeze({
    lang: resolution.locale,
    dir: definition.direction,
    canonical,
    hreflang: Object.freeze(hreflang),
  });
}

const ACCENTS: Readonly<Record<string, string>> = Object.freeze({
  A: "Å",
  B: "Ɓ",
  C: "Ç",
  D: "Ð",
  E: "É",
  F: "Ƒ",
  G: "Ĝ",
  H: "Ĥ",
  I: "Î",
  J: "Ĵ",
  K: "Ķ",
  L: "Ŀ",
  M: "Ḿ",
  N: "Ñ",
  O: "Ö",
  P: "Þ",
  Q: "Ǫ",
  R: "Ŕ",
  S: "Š",
  T: "Ţ",
  U: "Û",
  V: "Ṽ",
  W: "Ŵ",
  X: "Ẋ",
  Y: "Ý",
  Z: "Ž",
  a: "å",
  b: "ƀ",
  c: "ç",
  d: "ð",
  e: "é",
  f: "ƒ",
  g: "ĝ",
  h: "ĥ",
  i: "î",
  j: "ĵ",
  k: "ķ",
  l: "ŀ",
  m: "ḿ",
  n: "ñ",
  o: "ö",
  p: "þ",
  q: "ǫ",
  r: "ŕ",
  s: "š",
  t: "ţ",
  u: "û",
  v: "ṽ",
  w: "ŵ",
  x: "ẋ",
  y: "ý",
  z: "ž",
});

function pseudoText(value: string, expandByPercent: number): string {
  const tokens: string[] = [];
  const protectedText = value.replace(/\{\{\s*[\w.-]+\s*\}\}/g, (token) => {
    tokens.push(token);
    return `⟪${tokens.length - 1}⟫`;
  });
  const accented = protectedText.replace(
    /[A-Za-z]/g,
    (character) => ACCENTS[character] ?? character,
  );
  const padding = "~".repeat(Math.ceil((value.length * Math.max(0, expandByPercent)) / 100));
  return `[${accented}${padding}]`.replace(
    /⟪(\d+)⟫/g,
    (_, index: string) => tokens[Number(index)] ?? "",
  );
}

export function pseudoLocale(
  resource: Readonly<Record<string, string>>,
  options: PseudoLocaleOptions,
): Record<string, string> {
  return Object.fromEntries(
    Object.keys(resource)
      .sort()
      .map((key) => [key, pseudoText(resource[key] ?? "", options.expandByPercent)]),
  );
}

export const directionForLocale = (value: Locale): TextDirection =>
  value === locale("ar") ? "rtl" : "ltr";
