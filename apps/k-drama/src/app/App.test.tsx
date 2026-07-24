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
    expect(screen.getByTestId("shared-feature:k-drama-subtitles")).toHaveClass(
      "shared-feature--white",
    );
    expect(screen.getByTestId("shared-feature:k-drama-youtube")).toHaveClass(
      "shared-feature--soft",
    );
    expect(screen.getByTestId("shared-feature:k-drama-shortform")).toHaveClass(
      "shared-feature--white",
    );
    expect(document.querySelector(".k-drama-feature--subtitles")).toBeInTheDocument();
    expect(document.querySelector(".k-drama-feature--youtube")).toBeInTheDocument();
    expect(document.querySelector(".k-drama-feature--shortform")).toBeInTheDocument();
    const featureAction = screen.getByTestId(
      "shared-feature:k-drama-subtitles:early-access-cta",
    );
    expect(featureAction).toHaveAttribute("href", "/k-drama/early-access");
    expect(featureAction).toHaveClass("button--text", "shared-feature__early-access-cta");
    expect(featureAction).not.toHaveClass("button--secondary");
    featureAction.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(featureAction);
    await waitFor(() => expect(adapter.events).toHaveLength(2));
    expect(adapter.events[adapter.events.length - 1]).toEqual(
      expect.objectContaining({ name: "feature_cta_clicked", featureId: "subtitles" }),
    );
  });

  it("renders sections in features -> cta -> pricing -> footer order", () => {
    const analytics = createAppAnalytics("", {
      consent: { getState: () => "granted" },
      adapter: createInMemoryAnalyticsAdapter(),
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    const root = screen.getByTestId("landing:k-drama");
    const sectionIds = ["features", "cta", "pricing"];
    const positions = sectionIds.map((id) => {
      const element = root.querySelector(`#${id}`);
      expect(element).not.toBeNull();
      return Array.from(root.querySelectorAll("*")).indexOf(element as Element);
    });
    expect(positions).toEqual([...positions].sort((a, b) => a - b));
    const footer = screen.getByTestId("footer");
    const pricing = root.querySelector("#pricing");
    expect(
      Array.from(root.querySelectorAll("*")).indexOf(pricing as Element),
    ).toBeLessThan(Array.from(root.querySelectorAll("*")).indexOf(footer));
  });

  it("renders the four 'Before you start' footer notices", () => {
    const analytics = createAppAnalytics("", {
      consent: { getState: () => "granted" },
      adapter: createInMemoryAnalyticsAdapter(),
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    expect(screen.getByRole("heading", { name: "Before you start" })).toBeInTheDocument();
    const faq = screen.getByTestId("footer-faq");
    expect(within(faq).getAllByRole("button")).toHaveLength(4);
    expect(within(faq).getByText("What is this app?")).toBeInTheDocument();
    expect(within(faq).getByText("Clips")).toBeInTheDocument();
    expect(within(faq).getByText("Practice")).toBeInTheDocument();
    expect(within(faq).getByText("For learners")).toBeInTheDocument();
  });

  it("renders the four short-form sub-copy boxes with accessible text", () => {
    const analytics = createAppAnalytics("", {
      consent: { getState: () => "granted" },
      adapter: createInMemoryAnalyticsAdapter(),
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    const highlights = screen.getByTestId("k-drama-shortform-highlights");
    expect(highlights).not.toHaveAttribute("aria-hidden");
    const items = within(highlights).getAllByRole("listitem");
    expect(items).toHaveLength(4);
    expect(items.map((item) => item.textContent)).toEqual([
      "Start with 1-minute clips",
      "Skip straight to key moments",
      "YouTube, K-pop, and more made simple",
      "Save clips and pick up instantly",
    ]);
  });
});
