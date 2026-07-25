import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "./analytics";

describe("k-drama analytics wiring", () => {
  it("sends with the production defaults instead of blocking on unknown consent", async () => {
    const analytics = createAppAnalytics("?utm_country=kr");

    await expect(analytics.track({ name: "experiment_viewed" })).resolves.toEqual({
      status: "sent",
    });
  });

  it("never loads the GA4 tag outside a production build", async () => {
    await createAppAnalytics("").track({ name: "cta_clicked" });

    expect(document.querySelector("script[data-analytics='gtag']")).toBeNull();
  });
});
