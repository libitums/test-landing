/**
 * Marks a browser as internal so GA4's internal traffic filter can exclude it. Visiting
 * `?ga_internal=1` once opts the device out for good; `?ga_internal=0` opts it back in.
 * More reliable than an IP rule, which misses mobile networks and VPNs.
 */

export type TrafficType = "internal";

export interface InternalTrafficStorage {
  getItem(key: string): string | null;
  setItem(key: string, value: string): void;
  removeItem(key: string): void;
}

export interface InternalTrafficOptions {
  search: string;
  storage?: InternalTrafficStorage | undefined;
}

const storageKey = "landing:ga-internal";
const queryKey = "ga_internal";

function safeStorage(
  storage: InternalTrafficStorage | undefined,
): InternalTrafficStorage | undefined {
  if (storage !== undefined) {
    return storage;
  }

  try {
    return typeof localStorage === "undefined" ? undefined : localStorage;
  } catch {
    return undefined;
  }
}

export function resolveTrafficType(options: InternalTrafficOptions): TrafficType | undefined {
  const storage = safeStorage(options.storage);

  try {
    const requested = new URLSearchParams(options.search).get(queryKey);

    if (requested === "1") {
      storage?.setItem(storageKey, "1");
      return "internal";
    }

    if (requested === "0") {
      storage?.removeItem(storageKey);
      return undefined;
    }

    return storage?.getItem(storageKey) === "1" ? "internal" : undefined;
  } catch {
    return undefined;
  }
}
