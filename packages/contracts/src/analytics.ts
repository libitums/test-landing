/** Frozen provider-independent contracts for Phase 1 analytics measurement. */

export type AnalyticsProjectId = "k-drama" | "ai-communication" | "k-culture";

export type AnalyticsEventVersion = 1;

/**
 * Names are past tense so none of them collide with GA4's automatically collected
 * `scroll`, `form_start`, and `form_submit` events.
 */
export type AnalyticsEventName =
  | "experiment_viewed"
  | "cta_clicked"
  | "feature_cta_clicked"
  | "conversion_completed"
  | "section_viewed"
  | "section_dwelled"
  | "scroll_depth_reached"
  | "page_exited"
  | "form_opened"
  | "form_started"
  | "form_submitted"
  | "form_failed"
  | "form_abandoned";

/** Identifies a landing page section for view, dwell, and exit reporting. */
export type SectionId = string;

/** Mirrors the early access submission failure codes plus client-side validation. */
export type FormErrorCode = "validation" | "rate_limited" | "network" | "server";

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

/** Fired once per section, the first time it is at least half visible. */
export interface SectionViewedEvent extends AnalyticsContext {
  name: "section_viewed";
  version: AnalyticsEventVersion;
  sectionId: SectionId;
}

/** Total visible time accumulated on a section, reported when the page is left. */
export interface SectionDwelledEvent extends AnalyticsContext {
  name: "section_dwelled";
  version: AnalyticsEventVersion;
  sectionId: SectionId;
  dwellMs: number;
}

export interface ScrollDepthReachedEvent extends AnalyticsContext {
  name: "scroll_depth_reached";
  version: AnalyticsEventVersion;
  scrollPercent: number;
}

/** The abandonment signal: what the visitor last saw before leaving. */
export interface PageExitedEvent extends AnalyticsContext {
  name: "page_exited";
  version: AnalyticsEventVersion;
  lastSectionId: SectionId;
  maxScrollPercent: number;
  engagedMs: number;
}

export interface FormOpenedEvent extends AnalyticsContext {
  name: "form_opened";
  version: AnalyticsEventVersion;
  formId: string;
  sourceId: string;
}

export interface FormStartedEvent extends AnalyticsContext {
  name: "form_started";
  version: AnalyticsEventVersion;
  formId: string;
  fieldId: string;
}

export interface FormSubmittedEvent extends AnalyticsContext {
  name: "form_submitted";
  version: AnalyticsEventVersion;
  formId: string;
}

export interface FormFailedEvent extends AnalyticsContext {
  name: "form_failed";
  version: AnalyticsEventVersion;
  formId: string;
  errorCode: FormErrorCode;
}

/** Closed without submitting; `lastFieldId` is where the visitor gave up. */
export interface FormAbandonedEvent extends AnalyticsContext {
  name: "form_abandoned";
  version: AnalyticsEventVersion;
  formId: string;
  lastFieldId: string;
}

export type AnalyticsEvent =
  | ExperimentViewedEvent
  | CtaClickedEvent
  | FeatureCtaClickedEvent
  | ConversionCompletedEvent
  | SectionViewedEvent
  | SectionDwelledEvent
  | ScrollDepthReachedEvent
  | PageExitedEvent
  | FormOpenedEvent
  | FormStartedEvent
  | FormSubmittedEvent
  | FormFailedEvent
  | FormAbandonedEvent;

export type AnalyticsEventInput =
  | { name: "experiment_viewed" | "cta_clicked" | "conversion_completed" }
  | { name: "feature_cta_clicked"; featureId: string }
  | { name: "section_viewed"; sectionId: SectionId }
  | { name: "section_dwelled"; sectionId: SectionId; dwellMs: number }
  | { name: "scroll_depth_reached"; scrollPercent: number }
  | { name: "page_exited"; lastSectionId: SectionId; maxScrollPercent: number; engagedMs: number }
  | { name: "form_opened"; formId: string; sourceId: string }
  | { name: "form_started"; formId: string; fieldId: string }
  | { name: "form_submitted"; formId: string }
  | { name: "form_failed"; formId: string; errorCode: FormErrorCode }
  | { name: "form_abandoned"; formId: string; lastFieldId: string };

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
  | { status: "duplicate"; name: "experiment_viewed" | "section_viewed" }
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
