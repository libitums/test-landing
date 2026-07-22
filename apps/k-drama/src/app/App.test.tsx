import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAnalyticsEventValidator, createInMemoryAnalyticsAdapter } from "@landing/analytics";
import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "../analytics";
import { App } from "./App";
import { getRuntime } from "../i18n";

describe("K-drama landing", () => {
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
