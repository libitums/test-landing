import type {
  AnalyticsAdapter,
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

const eventNames = new Set<AnalyticsEventName>([
  "experiment_viewed",
  "cta_clicked",
  "conversion_completed",
]);

const projectIds = new Set(["k-drama", "ai-communication", "k-culture"]);

const eventKeys = new Set([
  "name",
  "version",
  "projectId",
  "experimentId",
  "variantId",
  "locale",
  "pageId",
  "countryHint",
]);

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

/** Strictly validates the closed version 1 event contract. */
export const analyticsEventValidator: AnalyticsEventValidator = {
  validate(candidate: unknown): AnalyticsValidationResult {
    if (!isRecord(candidate)) {
      return { valid: false, issues: [{ field: "$", code: "invalid" }] };
    }

    const issues: AnalyticsValidationIssue[] = [];

    for (const key of Object.keys(candidate)) {
      if (!eventKeys.has(key)) {
        issues.push({ field: key, code: "unknown" });
      }
    }

    for (const field of [
      "name",
      "projectId",
      "experimentId",
      "variantId",
      "locale",
      "pageId",
      "countryHint",
    ]) {
      addStringIssue(candidate, field, issues);
    }

    if (!("version" in candidate)) {
      issues.push({ field: "version", code: "missing" });
    } else if (candidate.version !== 1) {
      issues.push({ field: "version", code: "invalid" });
    }

    if (
      typeof candidate.name === "string" &&
      !eventNames.has(candidate.name as AnalyticsEventName)
    ) {
      issues.push({ field: "name", code: "invalid" });
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

export function createNoopAnalyticsAdapter(): AnalyticsAdapter {
  return { send: () => undefined };
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
          name: input.name,
          version: 1,
        });
        if (!validation.valid) {
          return { status: "invalid", issues: validation.issues };
        }

        if (validation.event.name === "experiment_viewed") {
          const key = exposureKey(validation.event);
          if (recordedExposures.has(key)) {
            return { status: "duplicate", name: "experiment_viewed" };
          }
          recordedExposures.add(key);
        }

        await options.adapter.send(validation.event);
        return { status: "sent" };
      } catch {
        return { status: "failed" };
      }
    },
  };
}

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
