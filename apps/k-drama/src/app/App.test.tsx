import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAnalyticsEventValidator, createInMemoryAnalyticsAdapter } from "@landing/analytics";
import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "../analytics";
import { App } from "./App";
import { getRuntime } from "../i18n";

describe("K-drama landing", () => {
  it("tracks exposure and CTA without changing link navigation", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const analytics = createAppAnalytics("?utm_country=kr", {
      consent: { getState: () => "granted" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    await waitFor(() => expect(adapter.events).toHaveLength(1));
    const action = screen.getByTestId("hero-action:start");
    expect(action).toHaveAttribute("href", "#features");
    fireEvent.click(action);
    await waitFor(() => expect(adapter.events).toHaveLength(2));
    expect(adapter.events).toEqual([
      {
        name: "experiment_viewed",
        version: 1,
        projectId: "k-drama",
        experimentId: "landing-phase-1",
        variantId: "k-drama-v1",
        locale: "en-US",
        pageId: "home",
        countryHint: "KR",
      },
      {
        name: "cta_clicked",
        version: 1,
        projectId: "k-drama",
        experimentId: "landing-phase-1",
        variantId: "k-drama-v1",
        locale: "en-US",
        pageId: "home",
        countryHint: "KR",
      },
    ]);
    expect(screen.getByTestId("landing:k-drama")).toBeInTheDocument();
  });
});
