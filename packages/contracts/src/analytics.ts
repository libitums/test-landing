/** Frozen provider-independent contracts for Phase 1 analytics measurement. */

export type AnalyticsProjectId = "k-drama" | "ai-communication" | "k-culture";

export type AnalyticsEventVersion = 1;

export type AnalyticsEventName =
  "experiment_viewed" | "cta_clicked" | "feature_cta_clicked" | "conversion_completed";

declare const countryCodeBrand: unique symbol;

/** Created only after uppercase ASCII alpha-2 shape and allowlist validation. */
export type CountryCode = string & { readonly [countryCodeBrand]: true };

/** A sanitized ISO 3166-1 alpha-2-style code or the explicit fallback. */
export type CountryHint = CountryCode | "unknown";

export type ConsentState = "unknown" | "granted" | "denied";

export interface AnalyticsContext {
  projectId: AnalyticsProjectId;
  experimentId: string;
  variantId: string;
  locale: string;
  pageId: string;
  countryHint: CountryHint;
}

export interface ExperimentViewedEvent extends AnalyticsContext {
  name: "experiment_viewed";
  version: AnalyticsEventVersion;
}

export interface CtaClickedEvent extends AnalyticsContext {
  name: "cta_clicked";
  version: AnalyticsEventVersion;
}

export interface FeatureCtaClickedEvent extends AnalyticsContext {
  name: "feature_cta_clicked";
  version: AnalyticsEventVersion;
  featureId: string;
}

export interface ConversionCompletedEvent extends AnalyticsContext {
  name: "conversion_completed";
  version: AnalyticsEventVersion;
}

export type AnalyticsEvent =
  ExperimentViewedEvent | CtaClickedEvent | FeatureCtaClickedEvent | ConversionCompletedEvent;

export type AnalyticsEventInput =
  | { name: "experiment_viewed" | "cta_clicked" | "conversion_completed" }
  | { name: "feature_cta_clicked"; featureId: string };

export interface AnalyticsValidationSuccess {
  valid: true;
  event: AnalyticsEvent;
}

export interface AnalyticsValidationFailure {
  valid: false;
  issues: readonly AnalyticsValidationIssue[];
}

export interface AnalyticsValidationIssue {
  field: string;
  code: "missing" | "invalid" | "unknown";
}

export type AnalyticsValidationResult = AnalyticsValidationSuccess | AnalyticsValidationFailure;

export interface AnalyticsEventValidator {
  validate(candidate: unknown): AnalyticsValidationResult;
}

export interface CountryAllowlist {
  has(countryCode: string): boolean;
}

export type CountryHintParser = (search: string, allowlist: CountryAllowlist) => CountryHint;

export interface ConsentProvider {
  getState(): ConsentState;
}

export interface AnalyticsAdapter {
  send(event: AnalyticsEvent): void | Promise<void>;
}

export type AnalyticsTrackResult =
  | { status: "sent" }
  | { status: "blocked"; consent: "unknown" | "denied" }
  | { status: "duplicate"; name: "experiment_viewed" }
  | { status: "invalid"; issues: readonly AnalyticsValidationIssue[] }
  | { status: "failed" };

/** Never rejects; adapter and validation failures are represented in the result. */
export interface AnalyticsTracker {
  track(input: AnalyticsEventInput): Promise<AnalyticsTrackResult>;
}

export type NoopAnalyticsAdapterFactory = () => AnalyticsAdapter;

export interface InMemoryAnalyticsAdapter extends AnalyticsAdapter {
  readonly events: readonly AnalyticsEvent[];
  clear(): void;
}

export type InMemoryAnalyticsAdapterFactory = () => InMemoryAnalyticsAdapter;

export interface AnalyticsTrackerOptions {
  context: AnalyticsContext;
  consent: ConsentProvider;
  adapter: AnalyticsAdapter;
  validator: AnalyticsEventValidator;
}

export type AnalyticsTrackerFactory = (options: AnalyticsTrackerOptions) => AnalyticsTracker;
