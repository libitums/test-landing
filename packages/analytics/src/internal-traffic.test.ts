import { describe, expect, it } from "vitest";
import { resolveTrafficType } from "./internal-traffic";
import type { InternalTrafficStorage } from "./internal-traffic";

function createStorage(initial?: string): InternalTrafficStorage & { value: string | null } {
  return {
    value: initial ?? null,
    getItem() {
      return this.value;
    },
    setItem(_key: string, next: string) {
      this.value = next;
    },
    removeItem() {
      this.value = null;
    },
  };
}

describe("internal traffic opt out", () => {
  it("marks ordinary visitors as normal traffic", () => {
    expect(
      resolveTrafficType({ search: "?utm_source=meta", storage: createStorage() }),
    ).toBeUndefined();
  });

  it("opts the device out and remembers it on later visits", () => {
    const storage = createStorage();

    expect(resolveTrafficType({ search: "?ga_internal=1", storage })).toBe("internal");
    expect(resolveTrafficType({ search: "", storage })).toBe("internal");
  });

  it("opts back in on request", () => {
    const storage = createStorage("1");

    expect(resolveTrafficType({ search: "?ga_internal=0", storage })).toBeUndefined();
    expect(resolveTrafficType({ search: "", storage })).toBeUndefined();
  });

  it("stays silent when storage is unavailable, as in private browsing", () => {
    const storage: InternalTrafficStorage = {
      getItem() {
        throw new Error("denied");
      },
      setItem() {
        throw new Error("denied");
      },
      removeItem() {
        throw new Error("denied");
      },
    };

    expect(resolveTrafficType({ search: "?ga_internal=1", storage })).toBeUndefined();
    expect(resolveTrafficType({ search: "", storage })).toBeUndefined();
  });
});
