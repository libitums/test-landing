import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../test/setup";
import { App } from "./App";

describe("Alpha landing", () => {
  it("composes the shared landing contract with only Alpha-specific UI", () => {
    render(<App />);

    expect(screen.getByTestId("landing:alpha")).toBeInTheDocument();
    expect(screen.getByTestId("landing-shell")).toBeInTheDocument();
    expect(screen.getByTestId("landing-header")).toBeInTheDocument();
    expect(screen.getByTestId("landing-main")).toBeInTheDocument();
    expect(screen.getByTestId("landing-footer")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("hero-action:start")).toHaveAttribute("href", "#features");
    expect(screen.getByTestId("hero-action:method")).toHaveAttribute("href", "#proof");
    expect(screen.getByTestId("alpha-proof-strip")).toBeInTheDocument();
    expect(screen.getByTestId("alpha-proof:markets")).toBeInTheDocument();
    expect(screen.getByTestId("alpha-proof:reuse")).toBeInTheDocument();
    expect(screen.getByTestId("alpha-proof:launch")).toBeInTheDocument();
    expect(screen.getByTestId("feature-grid")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:speed")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:consistency")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:freedom")).toBeInTheDocument();
    expect(screen.getByTestId("cta-section")).toBeInTheDocument();
    expect(screen.getByTestId("cta-action:create")).toHaveAttribute("href", "#top");
    expect(screen.queryByTestId("landing:beta")).not.toBeInTheDocument();
    expect(screen.queryByTestId("beta-comparison")).not.toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Start exploring" })).toHaveAttribute(
      "href",
      "#features",
    );
  });
});
