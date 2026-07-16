import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import "../test/setup";
import { App } from "./App";

describe("Beta landing", () => {
  it("composes the shared landing contract with only Beta-specific UI", () => {
    render(<App />);

    expect(screen.getByTestId("landing:beta")).toBeInTheDocument();
    expect(screen.getByTestId("landing-shell")).toBeInTheDocument();
    expect(screen.getByTestId("landing-header")).toBeInTheDocument();
    expect(screen.getByTestId("landing-main")).toBeInTheDocument();
    expect(screen.getByTestId("landing-footer")).toBeInTheDocument();
    expect(screen.getByTestId("hero")).toBeInTheDocument();
    expect(screen.getByTestId("hero-action:compare")).toHaveAttribute("href", "#comparison");
    expect(screen.getByTestId("beta-comparison")).toBeInTheDocument();
    expect(screen.getByTestId("beta-comparison-row:setup")).toBeInTheDocument();
    expect(screen.getByTestId("beta-comparison-row:brand")).toBeInTheDocument();
    expect(screen.getByTestId("beta-comparison-row:extension")).toBeInTheDocument();
    expect(screen.getByTestId("feature-grid")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:clarity")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:access")).toBeInTheDocument();
    expect(screen.getByTestId("feature-card:global")).toBeInTheDocument();
    expect(screen.getByTestId("cta-section")).toBeInTheDocument();
    expect(screen.getByTestId("cta-action:choose")).toHaveAttribute("href", "#top");
    expect(screen.queryByTestId("landing:alpha")).not.toBeInTheDocument();
    expect(screen.queryByTestId("alpha-proof-strip")).not.toBeInTheDocument();
    expect(screen.getByRole("table", { name: "Approach comparison" })).toBeInTheDocument();
  });
});
