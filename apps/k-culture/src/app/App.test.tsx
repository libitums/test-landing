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
    const heroMedia = within(hero).getByTestId("hero-media");
    expect(
      within(heroMedia)
        .getAllByRole("img")
        .map((card) => card.getAttribute("aria-label")),
    ).toEqual([
      "A short-form feed replaying a Korean meme clip with its pronunciation.",
      "A lesson card cycling through everyday Korean situations.",
      "A list of characters whose lines shift from casual to formal Korean.",
    ]);
    expect(screen.getByTestId("hero-highlight:clips")).toHaveTextContent(
      "Replay real clips with dual subtitles",
    );

    const features = [
      ["clips", '"lucky vicky"...? What does that even mean?', "shared-feature--white"],
      ["real-life", "What you actually need — in a pack", "shared-feature--soft"],
      ["register", "\"Let's eat\" isn't one sentence in Korean", "shared-feature--white"],
    ] as const;
    for (const [id, title, appearance] of features) {
      const section = screen.getByTestId(`shared-feature:k-culture-${id}`);
      expect(section).toHaveClass(appearance);
      expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent(title);
      const action = within(section).getByRole("link", { name: "Get early access" });
      expect(action).toHaveAttribute("href", "#early-access");
      expect(within(section).queryByRole("img")).not.toBeInTheDocument();
    }

    const memeFeature = screen.getByTestId("shared-feature:k-culture-clips");
    expect(memeFeature).toHaveTextContent(
      "From your bias's catchphrases to iconic K-drama lines — what it means, where it came from, when to use it, all on one card. Found one you love? Play the clip, nail the delivery, and drop it with your friends like a local.",
    );
    expect(memeFeature).toHaveTextContent("Korea's freshest memes, shipped to your front door.");
    expect(screen.getByTestId("shared-feature:k-culture-real-life")).toHaveTextContent(
      "No textbook chapters. Only the stuff your hobby actually calls for, hand-picked.",
    );
    expect(screen.getByTestId("shared-feature:k-culture-register")).toHaveTextContent(
      "Your friend, your sunbae, your bias, someone older — who you're talking to, what the situation is, how close you are: in Korean, all of it changes what you say. Chat with personas in a KakaoTalk-style sim: nail the tone and the conversation flows, miss it and watch them react. Make all your mistakes here — so when it counts, you sound natural.",
    );

    expect(screen.getByTestId("k-culture-proof:clips")).toHaveTextContent("2 languages");
    expect(screen.getByTestId("pricing-plan:plus")).toHaveTextContent("Most popular");
    expect(screen.getByTestId("cta-action:early-access")).toHaveAttribute("href", "#early-access");
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
    fireEvent.click(featureAction);
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Get early access" })).toBeInTheDocument(),
    );
    expect(adapter.events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ name: "feature_cta_clicked", featureId: "clips" }),
        expect.objectContaining({ name: "form_opened", sourceId: "feature:clips" }),
      ]),
    );
    fireEvent.click(screen.getByTestId("early-access-backdrop"));

    const finalAction = screen.getByTestId("cta-action:early-access");
    fireEvent.click(finalAction);
    await waitFor(() =>
      expect(screen.getByRole("dialog", { name: "Get early access" })).toBeInTheDocument(),
    );
    expect(adapter.events).toEqual(
      expect.arrayContaining([expect.objectContaining({ name: "cta_clicked" })]),
    );
  });

  it("submits an early-access registration and tracks the form funnel", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const analytics = createAppAnalytics("", {
      consent: { getState: () => "granted" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    let submission: { email: string; marketingConsent: boolean } | undefined;
    render(
      <App
        analytics={analytics}
        runtime={getRuntime("/en-US/")}
        submitEarlyAccessRegistration={async (value) => {
          submission = value;
        }}
      />,
    );
    fireEvent.click(screen.getByTestId("hero-cta"));
    fireEvent.change(screen.getByTestId("early-access-email"), {
      target: { value: "learner@example.com" },
    });
    fireEvent.click(screen.getByTestId("early-access-marketing-consent"));
    fireEvent.click(screen.getByTestId("early-access-submit"));
    await waitFor(() =>
      expect(submission).toEqual({ email: "learner@example.com", marketingConsent: true }),
    );
    expect(adapter.events.map((event) => event.name)).toEqual(
      expect.arrayContaining([
        "form_opened",
        "form_started",
        "form_submitted",
        "conversion_completed",
      ]),
    );
    expect(screen.getByTestId("early-access-status")).toHaveTextContent("You're on the list");
  });

  it("connects every feature CTA to its GA event and early-access modal", async () => {
    const adapter = createInMemoryAnalyticsAdapter();
    const analytics = createAppAnalytics("", {
      consent: { getState: () => "granted" },
      adapter,
      validator: createAnalyticsEventValidator(),
    });
    render(<App analytics={analytics} runtime={getRuntime("/en-US/")} />);

    for (const featureId of ["clips", "real-life", "register"]) {
      fireEvent.click(screen.getByTestId(`shared-feature:k-culture-${featureId}:early-access-cta`));
      await waitFor(() =>
        expect(screen.getByRole("dialog", { name: "Get early access" })).toBeInTheDocument(),
      );
      fireEvent.click(screen.getByTestId("early-access-backdrop"));
      await waitFor(() =>
        expect(screen.queryByRole("dialog", { name: "Get early access" })).not.toBeInTheDocument(),
      );
    }

    expect(
      adapter.events
        .filter((event) => event.name === "feature_cta_clicked")
        .map((event) => ("featureId" in event ? event.featureId : undefined)),
    ).toEqual(["clips", "real-life", "register"]);
    expect(
      adapter.events
        .filter((event) => event.name === "form_opened")
        .map((event) => ("sourceId" in event ? event.sourceId : undefined)),
    ).toEqual(["feature:clips", "feature:real-life", "feature:register"]);
    expect(adapter.events.filter((event) => event.name === "cta_clicked")).toHaveLength(3);
  });
});
