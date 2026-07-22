import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import { CtaSection } from "./cta-section";
import { FeatureGrid } from "./feature-grid";
import { Hero } from "./hero";
import { LandingShell } from "./landing-shell";
import { PricingSection } from "./pricing-section";

describe("shared page sections", () => {
  it("renders compound shell slots", () => {
    render(
      <LandingShell
        header={<LandingShell.Header>Header</LandingShell.Header>}
        footer={<LandingShell.Footer>Footer</LandingShell.Footer>}
      >
        <LandingShell.Main>Main</LandingShell.Main>
      </LandingShell>,
    );
    expect(screen.getByRole("banner")).toHaveTextContent("Header");
    expect(screen.getByRole("main")).toHaveTextContent("Main");
    expect(screen.getByRole("contentinfo")).toHaveTextContent("Footer");
  });

  it("renders hero copy, author line breaks, an extensible highlight checklist, and composed media", () => {
    const { container } = render(
      <Hero
        content={{
          title: "Title",
          description: "First line\nSecond line",
          cta: { label: "Continue" },
          highlights: [
            { id: "a", label: "Fast" },
            { id: "b", label: "Coherent" },
            { id: "c", label: "Flexible" },
          ],
        }}
      >
        <div role="group" aria-label="Product preview">
          Preview
        </div>
      </Hero>,
    );
    expect(screen.getByRole("heading", { level: 1, name: "Title" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Continue" })).toHaveAttribute(
      "aria-disabled",
      "true",
    );
    const description = container.querySelector(".hero__description");
    expect(description?.querySelectorAll("br")).toHaveLength(1);
    expect(description).toHaveTextContent("First line");
    expect(description).toHaveTextContent("Second line");
    const highlights = screen.getByTestId("hero-highlights");
    expect(within(highlights).getAllByRole("listitem")).toHaveLength(3);
    expect(screen.getByTestId("hero-highlight:a")).toHaveTextContent("Fast");
    expect(screen.getByTestId("hero-media")).toHaveTextContent("Preview");
    expect(screen.getByRole("group", { name: "Product preview" })).toBeInTheDocument();
  });

  it("does not render empty CTA, highlight, or media surfaces", () => {
    render(<Hero content={{ title: "Title", description: "Description" }}>{null}</Hero>);

    expect(screen.queryByTestId("hero-cta")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-highlights")).not.toBeInTheDocument();
    expect(screen.queryByTestId("hero-media")).not.toBeInTheDocument();
  });

  it("renders each feature and CTA variant", () => {
    render(
      <>
        <FeatureGrid
          title="Features"
          items={[
            { id: "one", title: "One", description: "First" },
            { id: "two", title: "Two", description: "Second" },
          ]}
        />
        <CtaSection
          content={{
            badge: "Beta",
            title: "Join",
            description: "Now\nToday",
            actions: [{ id: "text", label: "Details", href: "#details", variant: "text" }],
            notes: [{ id: "card", label: "No card required" }],
            ghostWords: ["JOIN", "NOW"],
          }}
        />
      </>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "One" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Join" })).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:one")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:two")).toBeInTheDocument();
    const primary = screen.getByTestId("cta-action:text");
    expect(primary).toHaveClass("button--text", "cta__pill");
    expect(primary).toHaveTextContent("Details");
    expect(screen.getByText("Beta")).toBeInTheDocument();
    expect(screen.getByTestId("cta-note:card")).toHaveTextContent("No card required");
    expect(screen.getByText("JOIN")).toBeInTheDocument();
  });

  it("renders pricing plans and switches prices with the billing toggle", () => {
    render(
      <PricingSection
        content={{
          title: "Plans",
          subtitle: "Pick one",
          billing: { monthlyLabel: "Monthly", annualLabel: "Annual", annualBadge: "Save 20%" },
          plans: [
            {
              id: "free",
              name: "Free",
              description: "Basic",
              price: { monthly: "$0", annual: "$0", unit: "/mo" },
              cta: "Start free",
              features: [{ id: "a", label: "One clip" }],
            },
            {
              id: "plus",
              name: "Plus",
              badge: "Popular",
              featured: true,
              description: "More",
              price: { monthly: "$4.99", annual: "$3.99", unit: "/mo" },
              cta: "Get Plus",
              features: [{ id: "b", label: "Unlimited clips" }],
            },
          ],
          footerNote: "Cancel anytime.",
        }}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Plans" })).toBeInTheDocument();
    const plus = screen.getByTestId("pricing-plan:plus");
    expect(within(plus).getByText("Popular")).toBeInTheDocument();
    expect(within(plus).getByText("$4.99")).toBeInTheDocument();
    expect(within(plus).getByText("Get Plus")).toBeInTheDocument();
    fireEvent.click(screen.getByTestId("pricing-billing:annual"));
    expect(within(plus).getByText("$3.99")).toBeInTheDocument();
    expect(within(plus).queryByText("$4.99")).not.toBeInTheDocument();
  });
});
