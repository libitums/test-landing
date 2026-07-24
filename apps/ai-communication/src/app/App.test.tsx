import { fireEvent, render, screen, waitFor } from "@testing-library/react";
import { createAnalyticsEventValidator, createInMemoryAnalyticsAdapter } from "@landing/analytics";
import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "../analytics";
import { App } from "./App";
import { getRuntime } from "../i18n";

describe("AI communication landing", () => {
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
    expect(action).not.toHaveAttribute("aria-disabled");
    expect(action).toHaveTextContent(/\S+/);
    expect(media).toBeInTheDocument();
    expect(media.querySelector("img")).toBeNull();
    fireEvent.click(action);
    expect(adapter.events.map((event) => event.name)).toEqual(["experiment_viewed", "cta_clicked"]);
    expect(screen.getByRole("dialog", { name: "Reserve your spot" })).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("early-access-backdrop"));
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument();
    expect(screen.getByTestId("landing:ai-communication")).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Role-play the situations/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Get instant corrections/i })).toBeInTheDocument();
    expect(screen.getByRole("heading", { name: /Chat with your bias/i })).toBeInTheDocument();
    const features = [
      ["ai-communication-roleplay", "roleplay", "shared-feature--white"],
      ["ai-communication-corrections", "corrections", "shared-feature--soft"],
      ["ai-communication-personas", "personas", "shared-feature--white"],
    ] as const;
    for (const [testId, featureId, appearance] of features) {
      const root = screen.getByTestId(`shared-feature:${testId}`);
      expect(root).toHaveClass(appearance);
      expect(root).toContainElement(screen.getByTestId(`shared-feature:${testId}:number-label`));
      expect(root).toContainElement(screen.getByTestId(`shared-feature:${testId}:header`));
      expect(root).toContainElement(screen.getByTestId(`shared-feature:${testId}:subheader`));
      expect(root).toContainElement(screen.getByTestId(`shared-feature:${testId}:content`));
      const featureAction = screen.getByTestId(`shared-feature:${testId}:early-access-cta`);
      expect(featureAction).toHaveAccessibleName("Get early access");
      expect(featureAction).toHaveAttribute("href", "#early-access");
      expect(featureAction).toHaveClass("button--text", "shared-feature__early-access-cta");
      expect(featureAction).not.toHaveClass("button--secondary");
      featureAction.addEventListener("click", (event) => event.preventDefault(), { once: true });
      fireEvent.click(featureAction);
      await waitFor(() =>
        expect(adapter.events.filter((event) => event.name === "feature_cta_clicked")).toHaveLength(
          features.indexOf(features.find((item) => item[1] === featureId)!) + 1,
        ),
      );
    }
    expect(
      adapter.events
        .filter((event) => event.name === "feature_cta_clicked")
        .map((event) => ("featureId" in event ? event.featureId : undefined)),
    ).toEqual(["roleplay", "corrections", "personas"]);
  });
});
