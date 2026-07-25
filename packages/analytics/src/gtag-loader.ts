/** Loads and configures Google's gtag.js exactly once per browsing context. */

export type GtagFunction = (...args: readonly unknown[]) => void;

export interface GtagWindow extends Window {
  dataLayer?: unknown[];
  gtag?: GtagFunction;
}

export interface InstallGtagOptions {
  measurementId: string;
  target?: GtagWindow | undefined;
  scriptOrigin?: string | undefined;
  timestamp?: Date | undefined;
  /** Set to `internal` so GA4's internal traffic filter can exclude the session. */
  trafficType?: string | undefined;
}

const scriptMarker = "gtag";

/**
 * Consent mode v2 defaults. Measurement is granted because the landing pages target the
 * KR/US allowlist and ship no advertising features; every advertising signal stays denied.
 */
const consentDefaults = {
  analytics_storage: "granted",
  ad_storage: "denied",
  ad_user_data: "denied",
  ad_personalization: "denied",
} as const;

function injectScript(documentRef: Document, source: string): void {
  const selector = `script[data-analytics="${scriptMarker}"][src="${source}"]`;
  if (documentRef.querySelector(selector) !== null) {
    return;
  }

  const script = documentRef.createElement("script");
  script.async = true;
  script.src = source;
  script.dataset.analytics = scriptMarker;
  documentRef.head.appendChild(script);
}

/** Measurement ids already configured per window, so a roll-up id can join later. */
const configuredIds = new WeakMap<GtagWindow, Set<string>>();

export function installGtag(options: InstallGtagOptions): GtagFunction {
  const target = options.target ?? (window as unknown as GtagWindow);
  let gtag = target.gtag;
  let ids = configuredIds.get(target);

  if (gtag === undefined) {
    const dataLayer = target.dataLayer ?? [];
    target.dataLayer = dataLayer;

    gtag = function queueGtagCommand() {
      // gtag.js reads the raw arguments object, exactly as Google's install snippet queues it.
      // eslint-disable-next-line prefer-rest-params
      dataLayer.push(arguments);
    };
    target.gtag = gtag;
    ids = new Set();
    configuredIds.set(target, ids);

    gtag("consent", "default", { ...consentDefaults });
    gtag("js", options.timestamp ?? new Date());

    const origin = options.scriptOrigin ?? "https://www.googletagmanager.com";
    injectScript(
      target.document,
      `${origin}/gtag/js?id=${encodeURIComponent(options.measurementId)}`,
    );
  }

  if (ids === undefined) {
    ids = new Set();
    configuredIds.set(target, ids);
  }

  if (!ids.has(options.measurementId)) {
    ids.add(options.measurementId);
    gtag("config", options.measurementId, {
      send_page_view: true,
      ...(options.trafficType === undefined ? {} : { traffic_type: options.trafficType }),
    });
  }

  return gtag;
}
