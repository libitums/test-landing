import { render, screen } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { CtaSection } from "./cta-section";
import { FeatureGrid } from "./feature-grid";
import { Hero } from "./hero";
import { LandingShell } from "./landing-shell";

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

  it("preserves hero link navigation and reports the action", () => {
    const onAction = vi.fn();
    render(
      <Hero
        content={{
          title: "Title",
          description: "Description",
          actions: [
            { id: "primary", label: "Continue", href: "#next", variant: "primary" },
            { id: "secondary", label: "Learn", href: "#learn", variant: "secondary" },
          ],
        }}
        onAction={onAction}
      />,
    );
    const link = screen.getByRole("link", { name: "Continue" });
    expect(link).toHaveAttribute("href", "#next");
    link.click();
    expect(onAction).toHaveBeenCalledWith(expect.objectContaining({ id: "primary" }));
    expect(screen.getByTestId("hero-action:secondary")).toHaveClass("button--secondary");
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
            title: "Join",
            description: "Now",
            actions: [{ id: "text", label: "Details", href: "#details", variant: "text" }],
          }}
        />
      </>,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Features" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 3, name: "One" })).toBeInTheDocument();
    expect(screen.getByRole("heading", { level: 2, name: "Join" })).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:one")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:two")).toBeInTheDocument();
    expect(screen.getByTestId("cta-action:text")).toHaveClass("button--text");
  });
});
