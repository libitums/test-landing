import { describe, expect, it, vi } from "vitest";
import type {
  AnalyticsContext,
  ConsentState,
  CountryAllowlist,
} from "@landing/contracts/analytics";
import {
  createAnalyticsEventValidator,
  createAnalyticsTracker,
  createInMemoryAnalyticsAdapter,
  createNoopAnalyticsAdapter,
  parseCountryHint,
} from "./index";

const context: AnalyticsContext = {
  projectId: "k-drama",
  experimentId: "homepage-hero",
  variantId: "control",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "unknown",
};

const validEvent = {
  ...context,
  name: "experiment_viewed",
  version: 1,
} as const;

describe("analytics event validator", () => {
  const validator = createAnalyticsEventValidator();

  it.each(["experiment_viewed", "cta_clicked", "conversion_completed"] as const)(
    "accepts a valid %s event",
    (name) => {
      expect(validator.validate({ ...validEvent, name })).toEqual({
        valid: true,
        event: { ...validEvent, name },
      });
    },
  );

  it.each([
    [{ version: undefined }, "version", "invalid"],
    [{ name: "other" }, "name", "invalid"],
    [{ version: 2 }, "version", "invalid"],
    [{ projectId: "landing-alpha" }, "projectId", "invalid"],
    [{ countryHint: "kr" }, "countryHint", "invalid"],
    [{ countryHint: "KOR" }, "countryHint", "invalid"],
    [{ email: "person@example.com" }, "email", "unknown"],
    [{ phone: "+821012345678" }, "phone", "unknown"],
    [{ query: "?utm_country=KR" }, "query", "unknown"],
    [{ url: "https://example.test/?secret=1" }, "url", "unknown"],
    [{ metadata: {} }, "metadata", "unknown"],
  ] as const)("rejects invalid or extra data %#", (change, field, code) => {
    const result = validator.validate({ ...validEvent, ...change });
    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual({ field, code });
      expect(JSON.stringify(result.issues)).not.toContain("utm_country");
      expect(JSON.stringify(result.issues)).not.toContain("example.test");
    }
  });

  it("reports missing fields and rejects non-record candidates", () => {
    expect(validator.validate({}).valid).toBe(false);
    expect(validator.validate(null)).toEqual({
      valid: false,
      issues: [{ field: "$", code: "invalid" }],
    });
  });
});

describe("parseCountryHint", () => {
  const allowlist: CountryAllowlist = {
    has: (value) => new Set(["KR", "US"]).has(value),
  };

  it.each([
    ["?utm_country=KR", "KR"],
    ["?utm_country=kr", "KR"],
    ["?utm_source=x&utm_country=US", "US"],
    ["", "unknown"],
    ["?utm_country=", "unknown"],
    ["?utm_country=KR&utm_country=US", "unknown"],
    ["?utm_country=K", "unknown"],
    ["?utm_country=KOR", "unknown"],
    ["?utm_country=ＫＲ", "unknown"],
    ["?utm_country=JP", "unknown"],
  ])("sanitizes %s", (search, expected) => {
    expect(parseCountryHint(search, allowlist)).toBe(expected);
  });

  it("fails closed when the injected allowlist throws", () => {
    expect(
      parseCountryHint("?utm_country=KR&secret=value", {
        has: () => {
          throw new Error("allowlist unavailable");
        },
      }),
    ).toBe("unknown");
  });
});

describe("analytics adapters and tracker", () => {
  function setup(initialConsent: ConsentState = "granted") {
    let consentState = initialConsent;
    const adapter = createInMemoryAnalyticsAdapter();
    const tracker = createAnalyticsTracker({
      context,
      consent: { getState: () => consentState },
      adapter,
      validator: createAnalyticsEventValidator(),
    });

    return {
      adapter,
      tracker,
      setConsent: (state: ConsentState) => {
        consentState = state;
      },
    };
  }

  it("records valid current events and can clear the memory sink", async () => {
    const { adapter, tracker } = setup();
    await expect(tracker.track({ name: "cta_clicked" })).resolves.toEqual({
      status: "sent",
    });
    expect(adapter.events).toEqual([{ ...context, name: "cta_clicked", version: 1 }]);
    adapter.clear();
    expect(adapter.events).toEqual([]);
  });

  it("deduplicates an exposure within a tracker lifecycle", async () => {
    const { adapter, tracker } = setup();
    const [first, second] = await Promise.all([
      tracker.track({ name: "experiment_viewed" }),
      tracker.track({ name: "experiment_viewed" }),
    ]);

    expect(first).toEqual({ status: "sent" });
    expect(second).toEqual({ status: "duplicate", name: "experiment_viewed" });
    expect(adapter.events).toHaveLength(1);
  });

  it.each(["unknown", "denied"] as const)(
    "blocks %s consent without queueing or replay",
    async (state) => {
      const { adapter, tracker, setConsent } = setup(state);
      await expect(tracker.track({ name: "cta_clicked" })).resolves.toEqual({
        status: "blocked",
        consent: state,
      });
      setConsent("granted");
      await expect(tracker.track({ name: "conversion_completed" })).resolves.toEqual({
        status: "sent",
      });
      expect(adapter.events.map((event) => event.name)).toEqual(["conversion_completed"]);
    },
  );

  it("does not let countryHint bypass denied consent", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const tracker = createAnalyticsTracker({
      context: {
        ...context,
        countryHint: parseCountryHint("?utm_country=KR", { has: () => true }),
      },
      consent: { getState: () => "denied" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    expect(await tracker.track({ name: "cta_clicked" })).toEqual({
      status: "blocked",
      consent: "denied",
    });
    expect(adapter.events).toHaveLength(0);
  });

  it.each(["k-drama", "ai-communication", "k-culture"] as const)(
    "preserves the %s context",
    async (projectId) => {
      const adapter = createInMemoryAnalyticsAdapter();
      const tracker = createAnalyticsTracker({
        context: { ...context, projectId },
        consent: { getState: () => "granted" },
        adapter,
        validator: createAnalyticsEventValidator(),
      });
      await tracker.track({ name: "experiment_viewed" });
      expect(adapter.events[0]).toMatchObject({ ...context, projectId });
    },
  );

  it("isolates synchronous and asynchronous adapter failures", async () => {
    for (const send of [
      () => {
        throw new Error("sync failure");
      },
      () => Promise.reject(new Error("async failure")),
    ]) {
      const tracker = createAnalyticsTracker({
        context,
        consent: { getState: () => "granted" },
        adapter: { send },
        validator: createAnalyticsEventValidator(),
      });
      await expect(tracker.track({ name: "cta_clicked" })).resolves.toEqual({
        status: "failed",
      });
    }
  });

  it("isolates consent and validation failures", async () => {
    const adapter = { send: vi.fn() };
    const consentFailure = createAnalyticsTracker({
      context,
      consent: {
        getState: () => {
          throw new Error("state unavailable");
        },
      },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    const validationFailure = createAnalyticsTracker({
      context,
      consent: { getState: () => "granted" },
      adapter,
      validator: {
        validate: () => {
          throw new Error("validator unavailable");
        },
      },
    });

    await expect(consentFailure.track({ name: "cta_clicked" })).resolves.toEqual({
      status: "failed",
    });
    await expect(validationFailure.track({ name: "cta_clicked" })).resolves.toEqual({
      status: "failed",
    });
    expect(adapter.send).not.toHaveBeenCalled();
  });

  it("provides a safe no-op sink", async () => {
    const tracker = createAnalyticsTracker({
      context,
      consent: { getState: () => "granted" },
      adapter: createNoopAnalyticsAdapter(),
      validator: createAnalyticsEventValidator(),
    });
    await expect(tracker.track({ name: "cta_clicked" })).resolves.toEqual({ status: "sent" });
  });
});
