/** Loads Meta's fbevents.js once and returns the queueing `fbq` bridge. */

export type FbqFunction = ((...args: readonly unknown[]) => void) & {
  queue?: unknown[];
  loaded?: boolean;
  version?: string;
  push?: FbqFunction;
  callMethod?: (...args: readonly unknown[]) => void;
};

export interface PixelWindow extends Window {
  fbq?: FbqFunction;
  _fbq?: FbqFunction;
}

export interface InstallPixelOptions {
  pixelId: string;
  target?: PixelWindow | undefined;
  scriptOrigin?: string | undefined;
}

const scriptMarker = "meta-pixel";

function injectScript(documentRef: Document, source: string): void {
  if (documentRef.querySelector(`script[data-analytics="${scriptMarker}"]`) !== null) {
    return;
  }

  const script = documentRef.createElement("script");
  script.async = true;
  script.src = source;
  script.dataset.analytics = scriptMarker;
  documentRef.head.appendChild(script);
}

export function installPixel(options: InstallPixelOptions): FbqFunction {
  const target = options.target ?? (window as unknown as PixelWindow);
  const installed = target.fbq;
  if (installed !== undefined) {
    return installed;
  }

  const fbq: FbqFunction = function queuePixelCommand(...args: readonly unknown[]) {
    if (fbq.callMethod) {
      fbq.callMethod(...args);
      return;
    }
    fbq.queue?.push(args);
  };

  fbq.queue = [];
  fbq.loaded = true;
  fbq.version = "2.0";
  fbq.push = fbq;
  target.fbq = fbq;
  target._fbq = fbq;

  fbq("init", options.pixelId);
  fbq("track", "PageView");

  const origin = options.scriptOrigin ?? "https://connect.facebook.net";
  injectScript(target.document, `${origin}/en_US/fbevents.js`);

  return fbq;
}
