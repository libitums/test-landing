import type { AnalyticsAdapter, AnalyticsEvent } from "@landing/contracts/analytics";
import { eventSchemas } from "./event-schema";
import type { GtagFunction } from "./gtag-loader";

export interface GtagAnalyticsAdapterOptions {
  gtag: GtagFunction;
}

function toSnakeCase(field: string): string {
  return field.replace(/[A-Z]/g, (letter) => `_${letter.toLowerCase()}`);
}

/**
 * Projects the frozen version 1 event contract onto GA4's snake_case parameter names.
 *
 * Events carry no `send_to`, so gtag broadcasts each one to every configured measurement id.
 * Sending the same event once per destination instead makes GA4 discard the later copies as
 * duplicates, which silently empties the roll-up property.
 */
export function createGtagAnalyticsAdapter(options: GtagAnalyticsAdapterOptions): AnalyticsAdapter {
  return {
    send(event: AnalyticsEvent) {
      const schema = eventSchemas[event.name];
      const payload: Record<string, unknown> = {};

      for (const field of [...schema.strings, ...schema.numbers]) {
        payload[toSnakeCase(field)] = (event as unknown as Record<string, unknown>)[field];
      }

      options.gtag("event", event.name, {
        event_version: event.version,
        project_id: event.projectId,
        experiment_id: event.experimentId,
        variant_id: event.variantId,
        locale: event.locale,
        page_id: event.pageId,
        country_hint: event.countryHint,
        ...payload,
      });
    },
  };
}
