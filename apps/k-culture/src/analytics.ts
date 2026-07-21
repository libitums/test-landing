import {
  createAnalyticsEventValidator,
  createAnalyticsTracker,
  createNoopAnalyticsAdapter,
  parseCountryHint,
} from "@landing/analytics";
import type {
  AnalyticsAdapter,
  AnalyticsEventValidator,
  AnalyticsTracker,
  ConsentProvider,
  CountryAllowlist,
} from "@landing/contracts/analytics";

const productionConsent: ConsentProvider = { getState: () => "unknown" };
const productionAllowedCountries: CountryAllowlist = new Set(["KR", "US"]);

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
      projectId: "k-culture",
      experimentId: "landing-phase-1",
      variantId: "k-culture-v1",
      locale: activeLocale,
      pageId: "home",
      countryHint: parseCountryHint(
        search,
        dependencies.allowedCountries ?? productionAllowedCountries,
      ),
    },
    consent: dependencies.consent ?? productionConsent,
    adapter: dependencies.adapter ?? createNoopAnalyticsAdapter(),
    validator: dependencies.validator ?? createAnalyticsEventValidator(),
  });
}
