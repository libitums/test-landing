import { describe, expect, it } from "vitest";
import { discoverSections } from "./section-discovery";

function render(html: string): HTMLElement {
  const root = document.createElement("div");
  root.innerHTML = html;
  return root;
}

describe("section discovery", () => {
  it("keeps the declared order and skips sections that are not rendered", () => {
    const root = render(`<section data-testid="hero"></section><div id="pricing"></div>`);

    const sections = discoverSections({
      root,
      named: [
        ["hero", '[data-testid="hero"]'],
        ["proof", "#proof"],
        ["pricing", "#pricing"],
      ],
    });

    expect(sections.map((section) => section.id)).toEqual(["hero", "pricing"]);
  });

  it("derives feature sections from shared feature roots, ignoring their inner test ids", () => {
    const root = render(`
      <div data-testid="shared-feature:ai-communication-roleplay">
        <h2 data-testid="shared-feature:ai-communication-roleplay:header"></h2>
        <a data-testid="shared-feature:ai-communication-roleplay:early-access-cta"></a>
      </div>
      <div data-testid="shared-feature:ai-communication-corrections"></div>
    `);

    const sections = discoverSections({
      root,
      named: [],
      featurePrefix: "ai-communication-",
    });

    expect(sections.map((section) => section.id)).toEqual([
      "feature:roleplay",
      "feature:corrections",
    ]);
  });

  it("leaves the test id intact when it does not carry the project prefix", () => {
    const root = render(`<div data-testid="shared-feature:shortform"></div>`);

    const sections = discoverSections({ root, named: [], featurePrefix: "k-drama-" });

    expect(sections[0]?.id).toBe("feature:shortform");
  });
});
