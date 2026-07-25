import type { AnalyticsEventName } from "@landing/contracts/analytics";

/** Fields every event carries, independent of its name. */
export const contextStringFields = [
  "projectId",
  "experimentId",
  "variantId",
  "locale",
  "pageId",
  "countryHint",
] as const;

export const baseEventKeys: ReadonlySet<string> = new Set([
  "name",
  "version",
  ...contextStringFields,
]);

export interface EventFieldSchema {
  /** Required non-empty string payload fields beyond the shared context. */
  readonly strings: readonly string[];
  /** Required finite, non-negative number payload fields. */
  readonly numbers: readonly string[];
}

const none: EventFieldSchema = { strings: [], numbers: [] };

export const eventSchemas: Readonly<Record<AnalyticsEventName, EventFieldSchema>> = {
  experiment_viewed: none,
  cta_clicked: none,
  conversion_completed: none,
  feature_cta_clicked: { strings: ["featureId"], numbers: [] },
  section_viewed: { strings: ["sectionId"], numbers: [] },
  section_dwelled: { strings: ["sectionId"], numbers: ["dwellMs"] },
  scroll_depth_reached: { strings: [], numbers: ["scrollPercent"] },
  page_exited: {
    strings: ["lastSectionId"],
    numbers: ["maxScrollPercent", "engagedMs"],
  },
  form_opened: { strings: ["formId", "sourceId"], numbers: [] },
  form_started: { strings: ["formId", "fieldId"], numbers: [] },
  form_submitted: { strings: ["formId"], numbers: [] },
  form_failed: { strings: ["formId", "errorCode"], numbers: [] },
  form_abandoned: { strings: ["formId", "lastFieldId"], numbers: [] },
};

export const eventNames: ReadonlySet<string> = new Set(Object.keys(eventSchemas));

export const formErrorCodes: ReadonlySet<string> = new Set([
  "validation",
  "rate_limited",
  "network",
  "server",
]);

/** Percentage fields are additionally bounded, everything else only has to be non-negative. */
export const percentFields: ReadonlySet<string> = new Set(["scrollPercent", "maxScrollPercent"]);
