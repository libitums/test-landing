import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it, vi } from "vitest";
import { SharedFeatureTemplate } from "./shared-feature-template";

describe("SharedFeatureTemplate", () => {
  it("renders the shared copy and app content in semantic document order", () => {
    render(
      <SharedFeatureTemplate
        appearance="white"
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
        appearance="soft"
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

  it("names the section from its heading without test instrumentation", () => {
    render(
      <SharedFeatureTemplate
        appearance="white"
        numberLabel="03"
        headerText="Feature without a test id"
        subheaderText="The accessible name does not depend on test instrumentation"
      >
        App content
      </SharedFeatureTemplate>,
    );

    const section = screen.getByRole("region", { name: "Feature without a test id" });
    expect(section).not.toHaveAttribute("data-testid");
    expect(within(section).getByRole("heading", { level: 2 })).toHaveAttribute("id");
  });

  it("supports repeated instances with stable app-provided ids", () => {
    render(
      <>
        <SharedFeatureTemplate
          appearance="white"
          numberLabel="01"
          headerText="First"
          subheaderText="First description"
          testId="shared-feature:alpha"
        >
          Alpha
        </SharedFeatureTemplate>
        <SharedFeatureTemplate
          appearance="soft"
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

  it("renders explicit surfaces and preserves localized visual line breaks", () => {
    render(
      <SharedFeatureTemplate
        appearance="soft"
        numberLabel="04"
        headerText={"A localized\nheading"}
        subheaderText={"A localized\nsubheader"}
        testId="shared-feature:line-breaks"
      >
        Content
      </SharedFeatureTemplate>,
    );

    const section = screen.getByRole("region", { name: /A localized\s+heading/ });
    expect(section).toHaveClass("shared-feature--soft");
    expect(screen.getByTestId("shared-feature:line-breaks:header")).toHaveTextContent(
      "A localized heading",
    );
    expect(screen.getByTestId("shared-feature:line-breaks:subheader")).toHaveTextContent(
      "A localized subheader",
    );
  });
});
