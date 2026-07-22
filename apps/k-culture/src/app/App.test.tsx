import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAnalyticsEventValidator, createInMemoryAnalyticsAdapter } from "@landing/analytics";
import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "../analytics";
import { App } from "./App";
import { getRuntime } from "../i18n";

describe("K-culture landing", () => {
  it("renders the display-only Hero composition and only tracks exposure", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const analytics = createAppAnalytics("?utm_country=kr", {
      consent: { getState: () => "granted" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    await waitFor(() => expect(adapter.events).toHaveLength(1));
    const hero = screen.getByTestId("hero");
    const action = screen.getByTestId("hero-cta");
    const media = screen.getByTestId("hero-media");
    expect(hero).toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(hero).toContainElement(action);
    expect(hero).toContainElement(media);
    expect(action).toHaveRole("button");
    expect(action).not.toHaveAttribute("href");
    expect(action).toHaveTextContent(/\S+/);
    expect(media).toBeInTheDocument();
    expect(media.querySelector("img")).toBeNull();
    fireEvent.click(action);
    expect(adapter.events).toEqual([
      {
        name: "experiment_viewed",
        version: 1,
        projectId: "k-culture",
        experimentId: "landing-phase-1",
        variantId: "k-culture-v1",
        locale: "en-US",
        pageId: "home",
        countryHint: "KR",
      },
    ]);
    expect(screen.getByTestId("landing:k-culture")).toBeInTheDocument();
    expect(screen.getByTestId("shared-feature:k-culture-music")).toHaveClass(
      "shared-feature--white",
    );
    expect(screen.getByTestId("shared-feature:k-culture-taste")).toHaveClass(
      "shared-feature--soft",
    );
    expect(screen.getByTestId("shared-feature:k-culture-style")).toHaveClass(
      "shared-feature--white",
    );
    const featureAction = screen.getByTestId("shared-feature:k-culture-music:early-access-cta");
    expect(featureAction).toHaveAttribute("href", "/k-culture/early-access");
    expect(featureAction).toHaveClass("button--text", "shared-feature__early-access-cta");
    expect(featureAction).not.toHaveClass("button--secondary");
    featureAction.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(featureAction);
    await waitFor(() => expect(adapter.events).toHaveLength(2));
    expect(adapter.events[adapter.events.length - 1]).toEqual(
      expect.objectContaining({ name: "feature_cta_clicked", featureId: "music" }),
    );
  });
});
