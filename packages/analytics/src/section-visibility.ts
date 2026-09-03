export interface SectionVisibilityInput {
  /** Height of the part of the section currently inside the viewport, in pixels. */
  intersectionHeight: number;
  sectionHeight: number;
  viewportHeight: number;
  /** Shared fraction for both rules. Half by default. */
  ratio?: number | undefined;
}

function usable(value: number): boolean {
  return Number.isFinite(value) && value > 0;
}

/**
 * Decides whether a section counts as seen.
 *
 * Two rules, either one enough. Half the section being visible is the intuitive one, and
 * it is what IntersectionObserver's own ratio measures. It alone is not enough: that ratio
 * is intersection area over *target* area, so a section taller than twice the viewport has
 * a ceiling below 0.5 and can never satisfy it — however long someone reads it. The second
 * rule asks the same question from the viewport's side, which has no such ceiling.
 */
export function isSectionSeen(input: SectionVisibilityInput): boolean {
  const { sectionHeight, viewportHeight } = input;
  const ratio = input.ratio ?? 0.5;

  if (!usable(sectionHeight) || !usable(viewportHeight) || !usable(ratio)) {
    return false;
  }

  // Sub-pixel rounding can report an intersection taller than the box it came from.
  const visible = Math.min(input.intersectionHeight, sectionHeight, viewportHeight);
  if (!usable(visible)) {
    return false;
  }

  return visible / sectionHeight >= ratio || visible / viewportHeight >= ratio;
}
