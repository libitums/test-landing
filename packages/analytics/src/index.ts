import type {
  AnalyticsContext,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventValidator,
  AnalyticsTrackResult,
  AnalyticsTracker,
  AnalyticsTrackerOptions,
  AnalyticsValidationIssue,
  AnalyticsValidationResult,
  CountryAllowlist,
  CountryHint,
  InMemoryAnalyticsAdapter,
} from "@landing/contracts/analytics";
import {
  baseEventKeys,
  contextStringFields,
  eventSchemas,
  formErrorCodes,
  percentFields,
} from "./event-schema";
import type { EventFieldSchema } from "./event-schema";

const projectIds = new Set(["k-drama", "ai-communication", "k-culture"]);

function schemaFor(name: unknown): EventFieldSchema | undefined {
  return typeof name === "string" && name in eventSchemas
    ? eventSchemas[name as AnalyticsEventName]
    : undefined;
}

function isRecord(candidate: unknown): candidate is Record<string, unknown> {
  if (candidate === null || typeof candidate !== "object" || Array.isArray(candidate)) {
    return false;
  }

  const prototype = Object.getPrototypeOf(candidate) as unknown;
  return prototype === Object.prototype || prototype === null;
}

function addStringIssue(
  candidate: Record<string, unknown>,
  field: string,
  issues: AnalyticsValidationIssue[],
): void {
  if (!(field in candidate)) {
    issues.push({ field, code: "missing" });
  } else if (typeof candidate[field] !== "string" || candidate[field] === "") {
    issues.push({ field, code: "invalid" });
  }
}

/** Durations and percentages are finite and non-negative; percentages also cap at 100. */
function isMeasurement(value: unknown, isPercent: boolean): boolean {
  if (typeof value !== "number" || !Number.isFinite(value) || value < 0) {
    return false;
  }

  return !isPercent || value <= 100;
}

/** Strictly validates the closed version 1 event contract. */
export const analyticsEventValidator: AnalyticsEventValidator = {
  validate(candidate: unknown): AnalyticsValidationResult {
    if (!isRecord(candidate)) {
      return { valid: false, issues: [{ field: "$", code: "invalid" }] };
    }

    const issues: AnalyticsValidationIssue[] = [];
    const schema = schemaFor(candidate.name);
    const payloadKeys = new Set(schema ? [...schema.strings, ...schema.numbers] : []);

    for (const key of Object.keys(candidate)) {
      if (!baseEventKeys.has(key) && !payloadKeys.has(key)) {
        issues.push({ field: key, code: "unknown" });
      }
    }

    for (const field of ["name", ...contextStringFields]) {
      addStringIssue(candidate, field, issues);
    }

    if (!("version" in candidate)) {
      issues.push({ field: "version", code: "missing" });
    } else if (candidate.version !== 1) {
      issues.push({ field: "version", code: "invalid" });
    }

    if (typeof candidate.name === "string" && schema === undefined) {
      issues.push({ field: "name", code: "invalid" });
    }

    for (const field of schema?.strings ?? []) {
      if (!(field in candidate)) {
        issues.push({ field, code: "missing" });
      } else if (typeof candidate[field] !== "string" || String(candidate[field]).trim() === "") {
        issues.push({ field, code: "invalid" });
      }
    }

    for (const field of schema?.numbers ?? []) {
      if (!(field in candidate)) {
        issues.push({ field, code: "missing" });
      } else if (!isMeasurement(candidate[field], percentFields.has(field))) {
        issues.push({ field, code: "invalid" });
      }
    }

    if (
      candidate.name === "form_failed" &&
      typeof candidate.errorCode === "string" &&
      !formErrorCodes.has(candidate.errorCode)
    ) {
      issues.push({ field: "errorCode", code: "invalid" });
    }

    if (typeof candidate.projectId === "string" && !projectIds.has(candidate.projectId)) {
      issues.push({ field: "projectId", code: "invalid" });
    }

    if (
      typeof candidate.countryHint === "string" &&
      candidate.countryHint !== "unknown" &&
      !/^[A-Z]{2}$/.test(candidate.countryHint)
    ) {
      issues.push({ field: "countryHint", code: "invalid" });
    }

    return issues.length === 0
      ? { valid: true, event: candidate as unknown as AnalyticsEvent }
      : { valid: false, issues };
  },
};

export function createAnalyticsEventValidator(): AnalyticsEventValidator {
  return analyticsEventValidator;
}

/** Returns only a sanitized country hint; the input search is never retained. */
export function parseCountryHint(search: string, allowlist: CountryAllowlist): CountryHint {
  try {
    const parameters = new URLSearchParams(search);
    const values = parameters.getAll("utm_country");

    if (values.length !== 1) {
      return "unknown";
    }

    const normalized = values[0]?.toUpperCase();
    if (normalized === undefined || !/^[A-Z]{2}$/.test(normalized)) {
      return "unknown";
    }

    return allowlist.has(normalized) ? (normalized as CountryHint) : "unknown";
  } catch {
    return "unknown";
  }
}

export function createInMemoryAnalyticsAdapter(): InMemoryAnalyticsAdapter {
  const events: AnalyticsEvent[] = [];

  return {
    get events() {
      return events;
    },
    send(event) {
      events.push(event);
    },
    clear() {
      events.length = 0;
    },
  };
}

function exposureKey(context: AnalyticsContext): string {
  return JSON.stringify([context.experimentId, context.variantId, context.pageId]);
}

/** Creates a page-lifecycle tracker with injected consent, validation, and sink. */
export function createAnalyticsTracker(options: AnalyticsTrackerOptions): AnalyticsTracker {
  const recordedExposures = new Set<string>();

  return {
    async track(input): Promise<AnalyticsTrackResult> {
      try {
        const consent = options.consent.getState();
        if (consent !== "granted") {
          return consent === "denied" || consent === "unknown"
            ? { status: "blocked", consent }
            : { status: "failed" };
        }

        const validation = options.validator.validate({
          ...options.context,
          ...input,
          version: 1,
        });
        if (!validation.valid) {
          return { status: "invalid", issues: validation.issues };
        }

        const event = validation.event;
        const onceKey =
          event.name === "experiment_viewed"
            ? exposureKey(event)
            : event.name === "section_viewed"
              ? `section:${event.sectionId}`
              : undefined;

        if (onceKey !== undefined) {
          if (recordedExposures.has(onceKey)) {
            return {
              status: "duplicate",
              name: event.name as "experiment_viewed" | "section_viewed",
            };
          }
          recordedExposures.add(onceKey);
        }

        await options.adapter.send(validation.event);
        return { status: "sent" };
      } catch {
        return { status: "failed" };
      }
    },
  };
}

export { createNoopAnalyticsAdapter } from "./noop-adapter";
export { resolveTrafficType } from "./internal-traffic";
export type {
  InternalTrafficOptions,
  InternalTrafficStorage,
  TrafficType,
} from "./internal-traffic";
export { createEngagementReporter } from "./engagement-reporter";
export type { EngagementReporter, EngagementReporterOptions } from "./engagement-reporter";
export { startEngagementTracking } from "./engagement-dom";
export type { EngagementTrackingOptions, TrackedSection } from "./engagement-dom";
export { createFormFunnelReporter } from "./form-funnel";
export type { FormFunnelOptions, FormFunnelReporter } from "./form-funnel";
export { discoverSections, featureSectionId } from "./section-discovery";
export type { SectionDiscoveryOptions } from "./section-discovery";
export { eventSchemas } from "./event-schema";
export type { EventFieldSchema } from "./event-schema";
export { createBrowserAnalyticsAdapter } from "./browser-analytics";
export type { BrowserAnalyticsOptions } from "./browser-analytics";
export { createCompositeAnalyticsAdapter } from "./composite-adapter";
export { createPixelAnalyticsAdapter } from "./pixel-adapter";
export type { PixelAnalyticsAdapterOptions } from "./pixel-adapter";
export { installPixel } from "./pixel-loader";
export type { FbqFunction, InstallPixelOptions, PixelWindow } from "./pixel-loader";
export { createGtagAnalyticsAdapter } from "./gtag-adapter";
export type { GtagAnalyticsAdapterOptions } from "./gtag-adapter";
export { installGtag } from "./gtag-loader";
export type { GtagFunction, GtagWindow, InstallGtagOptions } from "./gtag-loader";

export type {
  AnalyticsAdapter,
  AnalyticsContext,
  AnalyticsEvent,
  AnalyticsEventName,
  AnalyticsEventValidator,
  AnalyticsTracker,
  AnalyticsTrackerOptions,
  CountryAllowlist,
  CountryHint,
  InMemoryAnalyticsAdapter,
} from "@landing/contracts/analytics";
