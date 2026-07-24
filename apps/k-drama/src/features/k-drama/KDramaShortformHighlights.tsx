import type { HeroHighlight } from "@landing/contracts";

export interface KDramaShortformHighlightsProps {
  items: readonly HeroHighlight[];
}

/**
 * Feature 03 (short-form) sub-copy boxes. Real content, so unlike the
 * decorative phone mockups rendered alongside it this stays out of
 * `aria-hidden` containers.
 */
export function KDramaShortformHighlights({ items }: KDramaShortformHighlightsProps) {
  return (
    <ul className="k-drama-feature__shortform-highlights" data-testid="k-drama-shortform-highlights">
      {items.map((item) => (
        <li
          key={item.id}
          className="k-drama-feature__shortform-highlight"
          data-testid={`k-drama-shortform-highlight:${item.id}`}
        >
          {item.label}
        </li>
      ))}
    </ul>
  );
}
