import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createAnalyticsEventValidator, createInMemoryAnalyticsAdapter } from "@landing/analytics";
import { landingTestIds } from "@landing/contracts";
import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "../analytics";
import { App } from "./App";
import { getRuntime, resources } from "../i18n";

describe("K-drama landing", () => {
  it("renders the shared Hero CTA and highlights while only tracking exposure", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const analytics = createAppAnalytics("?utm_country=kr", {
      consent: { getState: () => "granted" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    await waitFor(() => expect(adapter.events).toHaveLength(1));
    const hero = screen.getByTestId("hero");
    const label = screen.getByTestId(landingTestIds.heroLabel);
    const action = screen.getByTestId(landingTestIds.heroCta);
    const highlights = screen.getByTestId(landingTestIds.heroHighlights);
    const media = screen.getByTestId(landingTestIds.heroMedia);
    expect(hero).toContainElement(screen.getByRole("heading", { level: 1 }));
    expect(hero).toContainElement(label);
    expect(hero).toContainElement(media);
    expect(label).toHaveTextContent(resources["en-US"]["hero.eyebrow"]);
    expect(action).toBeVisible();
    expect(action).toHaveRole("button");
    expect(action).not.toHaveAttribute("href");
    expect(action).toHaveAttribute("aria-disabled", "true");
    expect(action).toHaveTextContent(/\S+/);
    expect(within(highlights).getAllByRole("listitem")).toHaveLength(3);
    expect(media).toBeInTheDocument();
    expect(media.querySelector("img")).toBeNull();
    expect(within(media).getAllByRole("img", { name: /\S+/ })).toHaveLength(3);
    expect(within(media).queryByRole("button")).not.toBeInTheDocument();
    expect(within(media).queryByRole("link")).not.toBeInTheDocument();
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
    await waitFor(() => expect(adapter.events).toHaveLength(2));
    expect(adapter.events[adapter.events.length - 1]).toEqual(
      expect.objectContaining({ name: "feature_cta_clicked", featureId: "speed" }),
    );
  });
});
