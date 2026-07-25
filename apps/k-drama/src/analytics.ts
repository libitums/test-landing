import {
  createAnalyticsEventValidator,
  createAnalyticsTracker,
  createBrowserAnalyticsAdapter,
  resolveTrafficType,
  parseCountryHint,
} from "@landing/analytics";
import type {
  AnalyticsAdapter,
  AnalyticsEventValidator,
  AnalyticsTracker,
  ConsentProvider,
  CountryAllowlist,
} from "@landing/contracts/analytics";

/** No consent banner ships yet: measurement is granted, advertising signals stay denied. */
const productionConsent: ConsentProvider = { getState: () => "granted" };
const productionAllowedCountries: CountryAllowlist = new Set(["KR", "US"]);

/** GA4 loads only in production builds that carry a measurement id. */
function createProductionAdapter(search: string): AnalyticsAdapter {
  return createBrowserAnalyticsAdapter({
    trafficType: resolveTrafficType({ search }),
    measurementId: import.meta.env.VITE_GA_MEASUREMENT_ID,
    rollupMeasurementId: import.meta.env.VITE_GA_ROLLUP_MEASUREMENT_ID,
    pixelId: import.meta.env.VITE_META_PIXEL_ID,
    enabled: import.meta.env.PROD,
  });
}

export interface AppAnalyticsDependencies {
  consent?: ConsentProvider;
  adapter?: AnalyticsAdapter;
  validator?: AnalyticsEventValidator;
  allowedCountries?: CountryAllowlist;
}

export function createAppAnalytics(
  search: string,
  dependencies: AppAnalyticsDependencies = {},
  activeLocale = "en-US",
): AnalyticsTracker {
  return createAnalyticsTracker({
    context: {
      projectId: "k-drama",
      experimentId: "landing-phase-1",
      variantId: "k-drama-v1",
      locale: activeLocale,
      pageId: "home",
      countryHint: parseCountryHint(
        search,
        dependencies.allowedCountries ?? productionAllowedCountries,
      ),
    },
    consent: dependencies.consent ?? productionConsent,
    adapter: dependencies.adapter ?? createProductionAdapter(search),
    validator: dependencies.validator ?? createAnalyticsEventValidator(),
  });
}
