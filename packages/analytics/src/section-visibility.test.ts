import { describe, expect, it } from "vitest";
import { isSectionSeen } from "./section-visibility";

/**
 * The rule this file pins down: a section counts as seen when half of *it* is visible,
 * or when it covers half the *viewport*. Without the second rule a section taller than
 * twice the viewport can never be seen, because IntersectionObserver's ratio is
 * intersection area over target area — its ceiling is viewportHeight / sectionHeight.
 */
describe("isSectionSeen", () => {
  it("sees a short section once half of it is visible", () => {
    expect(
      isSectionSeen({ intersectionHeight: 300, sectionHeight: 600, viewportHeight: 900 }),
    ).toBe(true);
  });

  it("does not see a short section that is only a third visible", () => {
    expect(
      isSectionSeen({ intersectionHeight: 200, sectionHeight: 600, viewportHeight: 900 }),
    ).toBe(false);
  });

  it("sees a section taller than the viewport once it covers half the screen", () => {
    // The real case: k-drama pricing at 2006px in an iPhone 12's 844px viewport.
    // Section ratio peaks at 0.42 and never reaches 0.5, so only the viewport rule fires.
    expect(
      isSectionSeen({ intersectionHeight: 500, sectionHeight: 2006, viewportHeight: 844 }),
    ).toBe(true);
  });

  it("does not see a tall section that only peeks into the viewport", () => {
    expect(
      isSectionSeen({ intersectionHeight: 200, sectionHeight: 2006, viewportHeight: 844 }),
    ).toBe(false);
  });

  it("is true exactly at the viewport boundary", () => {
    expect(
      isSectionSeen({ intersectionHeight: 422, sectionHeight: 2006, viewportHeight: 844 }),
    ).toBe(true);
  });

  it("is false just below the viewport boundary", () => {
    expect(
      isSectionSeen({ intersectionHeight: 421, sectionHeight: 2006, viewportHeight: 844 }),
    ).toBe(false);
  });

  it("is true exactly at the section boundary", () => {
    expect(
      isSectionSeen({ intersectionHeight: 300, sectionHeight: 600, viewportHeight: 5000 }),
    ).toBe(true);
  });

  it("honours a custom ratio on both rules", () => {
    expect(
      isSectionSeen({
        intersectionHeight: 254,
        sectionHeight: 2006,
        viewportHeight: 844,
        ratio: 0.3,
      }),
    ).toBe(true);
    expect(
      isSectionSeen({
        intersectionHeight: 252,
        sectionHeight: 2006,
        viewportHeight: 844,
        ratio: 0.3,
      }),
    ).toBe(false);
  });

  it("clamps an intersection reported larger than the section or the viewport", () => {
    // Sub-pixel rounding can report a taller intersection than the box it came from;
    // clamping keeps the two rules from disagreeing with each other.
    expect(
      isSectionSeen({ intersectionHeight: 9000, sectionHeight: 600, viewportHeight: 900 }),
    ).toBe(true);
  });

  it("refuses to call an unmeasurable section seen", () => {
    expect(isSectionSeen({ intersectionHeight: 0, sectionHeight: 600, viewportHeight: 900 })).toBe(
      false,
    );
    expect(isSectionSeen({ intersectionHeight: 100, sectionHeight: 0, viewportHeight: 900 })).toBe(
      false,
    );
    expect(isSectionSeen({ intersectionHeight: 100, sectionHeight: 600, viewportHeight: 0 })).toBe(
      false,
    );
    expect(
      isSectionSeen({ intersectionHeight: -5, sectionHeight: 600, viewportHeight: 900 }),
    ).toBe(false);
  });
});
