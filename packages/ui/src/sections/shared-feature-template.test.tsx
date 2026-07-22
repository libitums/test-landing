import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { SharedFeatureTemplate } from "./shared-feature-template";

describe("SharedFeatureTemplate", () => {
  it("renders the shared copy and app content in semantic document order", () => {
    render(
      <SharedFeatureTemplate
        numberLabel="01"
        headerText="Shared heading"
        subheaderText="A longer localized description"
        testId="shared-feature:first"
      >
        <button type="button">App action</button>
      </SharedFeatureTemplate>,
    );

    const section = screen.getByRole("region", { name: "Shared heading" });
    expect(within(section).getByTestId("shared-feature:first:number-label")).toHaveTextContent(
      "01",
    );
    expect(within(section).getByRole("heading", { level: 2 })).toHaveTextContent("Shared heading");
    expect(within(section).getByTestId("shared-feature:first:subheader")).toHaveTextContent(
      "A longer localized description",
    );
    expect(within(section).getByRole("button", { name: "App action" })).toBeInTheDocument();

    const orderedTestIds = Array.from(section.querySelectorAll("[data-testid]")).map((node) =>
      node.getAttribute("data-testid"),
    );
    expect(orderedTestIds).toEqual([
      "shared-feature:first:number-label",
      "shared-feature:first:header",
      "shared-feature:first:subheader",
      "shared-feature:first:content",
    ]);
  });

  it("keeps app-owned interactions inside children", () => {
    const onClick = vi.fn();
    render(
      <SharedFeatureTemplate
        numberLabel="02"
        headerText="Another feature"
        subheaderText="App-owned behavior follows"
        testId="shared-feature:second"
      >
        <button type="button" onClick={onClick}>
          Continue
        </button>
      </SharedFeatureTemplate>,
    );

    fireEvent.click(screen.getByRole("button", { name: "Continue" }));
    expect(onClick).toHaveBeenCalledOnce();
  });

  it("supports repeated instances with stable app-provided ids", () => {
    render(
      <>
        <SharedFeatureTemplate
          numberLabel="01"
          headerText="First"
          subheaderText="First description"
          testId="shared-feature:alpha"
        >
          Alpha
        </SharedFeatureTemplate>
        <SharedFeatureTemplate
          numberLabel="02"
          headerText="Second"
          subheaderText="Second description"
          testId="shared-feature:beta"
        >
          Beta
        </SharedFeatureTemplate>
      </>,
    );

    expect(screen.getByTestId("shared-feature:alpha:content")).toHaveTextContent("Alpha");
    expect(screen.getByTestId("shared-feature:beta:content")).toHaveTextContent("Beta");
  });
});
