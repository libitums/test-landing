/** Provider-independent i18n contracts for Phase 2 localization. */

export type Locale = string & { readonly __localeBrand: unique symbol };
export type TextDirection = "ltr" | "rtl";

export interface LocaleDefinition {
  locale: Locale;
  direction: TextDirection;
  resource: Readonly<Record<string, string>>;
  canonicalPath: string;
}

export interface LocaleRegistry {
  readonly defaultLocale: Locale;
  readonly supportedLocales: readonly Locale[];
  readonly definitions: readonly LocaleDefinition[];
  resolve(requested: string | undefined): Locale;
}

export interface I18nRuntime {
  readonly locale: Locale;
  readonly direction: TextDirection;
  translate(key: string, values?: Readonly<Record<string, string | number>>): string;
  formatNumber(value: number, options?: Intl.NumberFormatOptions): string;
  formatDate(value: Date | number, options?: Intl.DateTimeFormatOptions): string;
}

export interface LocaleRoutingMetadata {
  lang: string;
  dir: TextDirection;
  canonical: string;
  hreflang: Readonly<Record<string, string>>;
}

export interface TranslationKeyReport {
  missing: readonly string[];
  extra: readonly string[];
}

export interface PseudoLocaleOptions {
  sourceLocale: Locale;
  pseudoLocale: Locale;
  expandByPercent: number;
}
