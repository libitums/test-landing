import type { LocaleRegistry } from "@landing/contracts/i18n";
import {
  assertRegistryResources,
  createI18nRuntime,
  createLocaleRegistry,
  createRoutingMetadata,
  directionForLocale,
  locale,
  localizePath,
  pseudoLocale,
} from "@landing/i18n";
import { ar, enUS, jaJP, koKR, thTH, viVN, zhCN, zhTW } from "./resources";

export const resources = {
  "ko-KR": koKR,
  "en-US": enUS,
  "ja-JP": jaJP,
  "vi-VN": viVN,
  "th-TH": thTH,
  "zh-CN": zhCN,
  "zh-TW": zhTW,
  ar,
} as const;
const definitions = Object.entries(resources).map(([key, resource]) => ({
  locale: locale(key),
  direction: directionForLocale(locale(key)),
  resource,
  canonicalPath: `/${key}/`,
}));
export const registry = createLocaleRegistry(definitions);
assertRegistryResources(registry);

export function createTestRegistry(): LocaleRegistry {
  const pseudo = locale("en-XA");
  return createLocaleRegistry([
    ...definitions,
    {
      locale: pseudo,
      direction: "ltr",
      resource: pseudoLocale(enUS, {
        sourceLocale: locale("en-US"),
        pseudoLocale: pseudo,
        expandByPercent: 35,
      }),
      canonicalPath: "/en-XA/",
    },
  ]);
}

export const getRuntime = (
  pathname = window.location.pathname,
  source: LocaleRegistry = registry,
) => createI18nRuntime(source, pathname);
export function getEntryRuntime(pathname: string, search: string, allowPseudo: boolean) {
  if (allowPseudo && new URLSearchParams(search).get("pseudo") === "1") {
    const testRegistry = createTestRegistry();
    return getRuntime(localizePath(testRegistry, pathname, locale("en-XA")), testRegistry);
  }
  return getRuntime(pathname);
}

export function applyLocaleMetadata(
  pathname = window.location.pathname,
  source: LocaleRegistry = registry,
) {
  const metadata = createRoutingMetadata(source, pathname, window.location.origin);
  document.documentElement.lang = metadata.lang;
  document.documentElement.dir = metadata.dir;
  document.title = createI18nRuntime(source, pathname).translate("document.title");
  const canonical =
    document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ??
    document.head.appendChild(document.createElement("link"));
  canonical.rel = "canonical";
  canonical.href = metadata.canonical;
  document
    .querySelectorAll('link[rel="alternate"][data-i18n-managed="true"]')
    .forEach((node) => node.remove());
  for (const [language, href] of Object.entries(metadata.hreflang)) {
    const alternate = document.createElement("link");
    alternate.rel = "alternate";
    alternate.hreflang = language;
    alternate.href = href;
    alternate.dataset.i18nManaged = "true";
    document.head.appendChild(alternate);
  }
  return metadata;
}
