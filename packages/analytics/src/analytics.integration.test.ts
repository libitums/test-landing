import { describe, expect, it, vi } from "vitest";
import type {
  AnalyticsAdapter,
  AnalyticsContext,
  AnalyticsEvent,
  ConsentState,
  CountryAllowlist,
} from "@landing/contracts/analytics";
import {
  analyticsEventValidator,
  createAnalyticsTracker,
  createInMemoryAnalyticsAdapter,
  parseCountryHint,
} from "./index";

const baseContext: AnalyticsContext = {
  projectId: "k-drama",
  experimentId: "hero-copy",
  variantId: "treatment",
  locale: "ko-KR",
  pageId: "home",
  countryHint: "unknown",
};

const validEvents = [
  { ...baseContext, name: "experiment_viewed", version: 1 },
  { ...baseContext, name: "cta_clicked", version: 1 },
  { ...baseContext, name: "conversion_completed", version: 1 },
] as const satisfies readonly [AnalyticsEvent, ...AnalyticsEvent[]];

function allow(...countries: string[]): CountryAllowlist {
  return { has: (candidate) => countries.includes(candidate) };
}

function createConsent(initial: ConsentState) {
  let state = initial;
  return {
    getState: () => state,
    setState: (next: ConsentState) => {
      state = next;
    },
  };
}

describe("analytics version 1 runtime contract", () => {
  it.each(validEvents)("accepts $name", (event) => {
    expect(analyticsEventValidator.validate(event)).toEqual({ valid: true, event });
  });

  it.each([
    ["non-object", null, "$", "invalid"],
    ["missing field", { ...validEvents[0], locale: undefined }, "locale", "invalid"],
    ["missing version", { ...baseContext, name: "experiment_viewed" }, "version", "missing"],
    ["unknown name", { ...validEvents[0], name: "page_viewed" }, "name", "invalid"],
    ["wrong version", { ...validEvents[0], version: 2 }, "version", "invalid"],
    ["unknown project", { ...validEvents[0], projectId: "landing-alpha" }, "projectId", "invalid"],
    ["invalid country hint", { ...validEvents[0], countryHint: "kr" }, "countryHint", "invalid"],
    ["consent field", { ...validEvents[0], consent: "granted" }, "consent", "unknown"],
    ["email field", { ...validEvents[0], email: "person@example.com" }, "email", "unknown"],
    ["phone field", { ...validEvents[0], phone: "+82-10-1234-5678" }, "phone", "unknown"],
    [
      "raw query field",
      { ...validEvents[0], query: "?utm_country=KR&email=secret" },
      "query",
      "unknown",
    ],
    [
      "full URL field",
      { ...validEvents[0], url: "https://example.test/?token=secret" },
      "url",
      "unknown",
    ],
    ["metadata bag", { ...validEvents[0], metadata: {} }, "metadata", "unknown"],
  ])("rejects %s without reflecting its value", (_label, candidate, field, code) => {
    const result = analyticsEventValidator.validate(candidate);

    expect(result.valid).toBe(false);
    if (!result.valid) {
      expect(result.issues).toContainEqual({ field, code });
      expect(JSON.stringify(result.issues)).not.toContain("person@example.com");
      expect(JSON.stringify(result.issues)).not.toContain("secret");
    }
  });
});

describe("country hint boundary", () => {
  it.each([
    ["?utm_country=KR", ["KR"], "KR"],
    ["?utm_country=kr", ["KR"], "KR"],
    ["?campaign=x&utm_country=US", ["US"], "US"],
    ["", ["KR"], "unknown"],
    ["?utm_country=", ["KR"], "unknown"],
    ["?utm_country=KR&utm_country=US", ["KR", "US"], "unknown"],
    ["?utm_country=K", ["KR"], "unknown"],
    ["?utm_country=KOR", ["KR"], "unknown"],
    ["?utm_country=%ED%95%9C", ["KR"], "unknown"],
    ["?utm_country=US", ["KR"], "unknown"],
  ])("sanitizes %s", (search, countries, expected) => {
    expect(parseCountryHint(search, allow(...countries))).toBe(expected);
  });

  it("returns only the sanitized code and never the original query", () => {
    const search = "?utm_country=kr&email=person%40example.com";
    const result = parseCountryHint(search, allow("KR"));

    expect(result).toBe("KR");
    expect(JSON.stringify(result)).not.toContain(search);
    expect(JSON.stringify(result)).not.toContain("person@example.com");
  });
});

describe("tracker integration", () => {
  it.each([
    ["k-drama", "drama-hero", "ko-KR", "drama-home"],
    ["ai-communication", "ai-message", "en-US", "ai-home"],
    ["k-culture", "culture-discovery", "fr-FR", "culture-home"],
  ] as const)(
    "records exposure and CTA context for %s",
    async (projectId, experimentId, locale, pageId) => {
      const adapter = createInMemoryAnalyticsAdapter();
      const context: AnalyticsContext = {
        ...baseContext,
        projectId,
        experimentId,
        variantId: "variant-b",
        locale,
        pageId,
      };
      const tracker = createAnalyticsTracker({
        context,
        consent: { getState: () => "granted" },
        adapter,
        validator: analyticsEventValidator,
      });

      await tracker.track({ name: "experiment_viewed" });
      await tracker.track({ name: "cta_clicked" });

      expect(adapter.events).toEqual([
        { ...context, name: "experiment_viewed", version: 1 },
        { ...context, name: "cta_clicked", version: 1 },
      ]);
    },
  );

  it("deduplicates an exposure for the page lifecycle but not other event names", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const tracker = createAnalyticsTracker({
      context: baseContext,
      consent: { getState: () => "granted" },
      adapter,
      validator: analyticsEventValidator,
    });

    expect(await tracker.track({ name: "experiment_viewed" })).toEqual({ status: "sent" });
    expect(await tracker.track({ name: "experiment_viewed" })).toEqual({
      status: "duplicate",
      name: "experiment_viewed",
    });
    expect(await tracker.track({ name: "cta_clicked" })).toEqual({ status: "sent" });
    expect(await tracker.track({ name: "cta_clicked" })).toEqual({ status: "sent" });
    expect(adapter.events.map(({ name }) => name)).toEqual([
      "experiment_viewed",
      "cta_clicked",
      "cta_clicked",
    ]);
  });

  it.each(["unknown", "denied"] as const)(
    "makes zero outbound calls for %s and never replays after grant",
    async (initialConsent) => {
      const consent = createConsent(initialConsent);
      const send = vi.fn<AnalyticsAdapter["send"]>();
      const tracker = createAnalyticsTracker({
        context: { ...baseContext, countryHint: "KR" as AnalyticsContext["countryHint"] },
        consent,
        adapter: { send },
        validator: analyticsEventValidator,
      });

      expect(await tracker.track({ name: "cta_clicked" })).toEqual({
        status: "blocked",
        consent: initialConsent,
      });
      expect(send).not.toHaveBeenCalled();

      consent.setState("granted");
      expect(send).not.toHaveBeenCalled();
      expect(await tracker.track({ name: "conversion_completed" })).toEqual({ status: "sent" });
      expect(send).toHaveBeenCalledTimes(1);
      expect(send).toHaveBeenCalledWith(expect.objectContaining({ name: "conversion_completed" }));
    },
  );

  it("isolates invalid context without calling the adapter", async () => {
    const send = vi.fn<AnalyticsAdapter["send"]>();
    const tracker = createAnalyticsTracker({
      context: { ...baseContext, locale: "" },
      consent: { getState: () => "granted" },
      adapter: { send },
      validator: analyticsEventValidator,
    });

    await expect(tracker.track({ name: "cta_clicked" })).resolves.toEqual(
      expect.objectContaining({ status: "invalid" }),
    );
    expect(send).not.toHaveBeenCalled();
  });

  it.each([
    [
      "synchronous throw",
      () => {
        throw new Error("sync adapter failure");
      },
    ],
    ["asynchronous rejection", () => Promise.reject(new Error("async adapter failure"))],
  ])("isolates %s as a non-throwing result", async (_label, send) => {
    const tracker = createAnalyticsTracker({
      context: baseContext,
      consent: { getState: () => "granted" },
      adapter: { send },
      validator: analyticsEventValidator,
    });

    await expect(tracker.track({ name: "cta_clicked" })).resolves.toEqual({ status: "failed" });
  });
});
