import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import { createAnalyticsEventValidator, createInMemoryAnalyticsAdapter } from "@landing/analytics";
import { describe, expect, it } from "vitest";
import { createAppAnalytics } from "../analytics";
import { getRuntime } from "../i18n";
import { App } from "./App";

describe("K-culture temporary landing", () => {
  it("renders the frozen shared-template copy and composition", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const analytics = createAppAnalytics("?utm_country=kr", {
      consent: { getState: () => "granted" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);
    await waitFor(() => expect(adapter.events).toHaveLength(1));

    const navbar = screen.getByTestId("navbar");
    expect(navbar).toHaveClass("navbar--violet-editorial");
    expect(screen.getByTestId("navbar-logo")).toHaveAttribute("href", "#top");
    expect(screen.getByTestId("navbar-logo")).toHaveAccessibleName("K-zip");
    expect(screen.getByTestId("navbar-logo")).toHaveTextContent("K-zip");
    expect(within(screen.getByTestId("navbar-logo")).queryByRole("img")).not.toBeInTheDocument();
    expect(screen.getByRole("contentinfo", { name: "K-zip footer" })).toHaveTextContent("K-zip");
    expect(screen.getByTestId("navbar-how-it-works")).toHaveAttribute("href", "#proof");
    expect(screen.getByTestId("navbar-pricing")).toHaveAttribute("href", "#pricing");
    expect(screen.getByTestId("navbar-try")).toHaveAttribute("href", "#cta");

    const hero = screen.getByTestId("hero");
    expect(within(hero).getByRole("heading", { level: 1 })).toHaveTextContent(
      "Learn the Korean behind the culture.",
    );
    expect(screen.queryByTestId("hero-media")).not.toBeInTheDocument();
    expect(screen.getByTestId("hero-highlight:clips")).toHaveTextContent(
      "Replay real clips with dual subtitles",
    );

    const features = [
      ["clips", "Get the meme, then say it.", "shared-feature--white"],
      ["real-life", "Not textbook Korean — the real thing", "shared-feature--soft"],
      ["register", "One Meaning, Everyone Different", "shared-feature--white"],
    ] as const;
    for (const [id, title, appearance] of features) {
      const section = screen.getByTestId(`shared-feature:k-culture-${id}`);
      expect(section).toHaveClass(appearance);
      expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent(title);
      const action = within(section).getByRole("link", { name: "Get early access" });
      expect(action).toHaveAttribute("href", "/k-culture/early-access");
      expect(within(section).queryByRole("img")).not.toBeInTheDocument();
    }

    expect(screen.getByTestId("k-culture-proof:clips")).toHaveTextContent("2 languages");
    expect(screen.getByTestId("pricing-plan:plus")).toHaveTextContent("Most popular");
    expect(screen.getByTestId("cta-action:early-access")).toHaveAttribute(
      "href",
      "/k-culture/early-access",
    );
    expect(
      screen
        .getByTestId("cta-section")
        .compareDocumentPosition(screen.getByTestId("pricing-section")) &
        Node.DOCUMENT_POSITION_FOLLOWING,
    ).toBeTruthy();
    expect(screen.getByTestId("footer-faq-item:register")).toHaveTextContent(
      "Will it help me speak differently to different people?",
    );

    const featureAction = screen.getByTestId("shared-feature:k-culture-clips:early-access-cta");
    featureAction.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(featureAction);
    await waitFor(() => expect(adapter.events).toHaveLength(2));
    expect(adapter.events[adapter.events.length - 1]).toEqual(
      expect.objectContaining({ name: "feature_cta_clicked", featureId: "clips" }),
    );

    const finalAction = screen.getByTestId("cta-action:early-access");
    finalAction.addEventListener("click", (event) => event.preventDefault(), { once: true });
    fireEvent.click(finalAction);
    await waitFor(() => expect(adapter.events).toHaveLength(3));
    expect(adapter.events[adapter.events.length - 1]).toEqual(
      expect.objectContaining({ name: "cta_clicked" }),
    );
  });
});
