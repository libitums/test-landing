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
    expect(screen.getByTestId("shared-feature:k-drama-speed")).toHaveClass("shared-feature--white");
    expect(screen.getByTestId("shared-feature:k-drama-consistency")).toHaveClass(
      "shared-feature--soft",
    );
    expect(screen.getByTestId("shared-feature:k-drama-freedom")).toHaveClass(
      "shared-feature--white",
    );
    const featureAction = screen.getByTestId("shared-feature:k-drama-speed:early-access-cta");
    expect(featureAction).toHaveAttribute("href", "/k-drama/early-access");
    expect(featureAction).toHaveClass("button--text", "shared-feature__early-access-cta");
    expect(featureAction).not.toHaveClass("button--secondary");
    featureAction.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(featureAction);
    await waitFor(() => expect(adapter.events).toHaveLength(3));
    expect(adapter.events[adapter.events.length - 1]).toEqual(
      expect.objectContaining({ name: "feature_cta_clicked", featureId: "speed" }),
    );
  });
});
