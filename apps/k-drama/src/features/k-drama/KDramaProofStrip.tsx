import { Check } from "lucide-react";

/** A single qualitative proof checklist item (no numeric metric). */
export interface ProofCheckItem {
  id: string;
  label: string;
}

interface KDramaProofStripProps {
  items: readonly ProofCheckItem[];
  title: string;
}

export function KDramaProofStrip({ items, title }: KDramaProofStripProps) {
  return (
    <section
      className="section proof-strip"
      data-testid="k-drama-proof-strip"
      aria-labelledby="k-drama-proof-title"
    >
      <div className="container stack">
        <h2 id="k-drama-proof-title">{title}</h2>
        <ul className="proof-checklist">
          {items.map((item) => (
            <li key={item.id} className="proof-check" data-testid={`k-drama-proof:${item.id}`}>
              <Check className="proof-check__icon" aria-hidden="true" strokeWidth={2.5} />
              <span className="proof-check__label">{item.label}</span>
            </li>
          ))}
        </ul>
      </div>
    </section>
  );
}
