import type { ProofMetric } from "@landing/contracts";

export function KCultureProofStrip({
  metrics,
  title,
}: {
  metrics: readonly ProofMetric[];
  title: string;
}) {
  return (
    <section
      className="section proof-strip"
      data-testid="k-culture-proof-strip"
      aria-labelledby="k-culture-proof-title"
    >
      <div className="container stack">
        <h2 id="k-culture-proof-title">{title}</h2>
        <dl className="proof-grid">
          {metrics.map((metric) => (
            <div key={metric.id} data-testid={`k-culture-proof:${metric.id}`}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
