import type { ProofMetric } from "@landing/contracts";

interface KDramaProofStripProps {
  /** Each entry pairs a one-word step (`label`) with its explanation (`value`). */
  metrics: readonly ProofMetric[];
  title: string;
}

export function KDramaProofStrip({ metrics, title }: KDramaProofStripProps) {
  return (
    <section
      className="section proof-strip"
      data-testid="k-drama-proof-strip"
      aria-labelledby="k-drama-proof-title"
    >
      <div className="container stack">
        <h2 id="k-drama-proof-title">{title}</h2>
        <dl className="proof-grid">
          {metrics.map((metric) => (
            <div key={metric.id} data-testid={`k-drama-proof:${metric.id}`}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
