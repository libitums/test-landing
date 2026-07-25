import type { AnalyticsTracker, FormErrorCode } from "@landing/contracts/analytics";

export interface FormFunnelOptions {
  tracker: AnalyticsTracker;
  formId: string;
  /** Which call to action opened the form, e.g. `hero` or `feature:roleplay`. */
  sourceId: string;
}

export interface FormFunnelReporter {
  opened(): void;
  /** First touched field starts the funnel; every touch updates the abandonment marker. */
  fieldTouched(fieldId: string): void;
  submitted(): void;
  failed(errorCode: FormErrorCode): void;
  succeeded(): void;
  /** Call when the form goes away; reports abandonment unless it already succeeded. */
  closed(): void;
}

/** Turns one form's lifecycle into the funnel events, including where a visitor gave up. */
export function createFormFunnelReporter(options: FormFunnelOptions): FormFunnelReporter {
  const { tracker, formId, sourceId } = options;
  let started = false;
  let succeeded = false;
  let closed = false;
  let lastFieldId = "none";

  return {
    opened() {
      void tracker.track({ name: "form_opened", formId, sourceId });
    },

    fieldTouched(fieldId) {
      lastFieldId = fieldId;
      if (!started) {
        started = true;
        void tracker.track({ name: "form_started", formId, fieldId });
      }
    },

    submitted() {
      void tracker.track({ name: "form_submitted", formId });
    },

    failed(errorCode) {
      void tracker.track({ name: "form_failed", formId, errorCode });
    },

    succeeded() {
      succeeded = true;
      void tracker.track({ name: "conversion_completed" });
    },

    closed() {
      if (closed || succeeded) {
        return;
      }
      closed = true;
      void tracker.track({ name: "form_abandoned", formId, lastFieldId });
    },
  };
}
