import type { AlphaProofStripProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";

export function AlphaProofStrip({ metrics, testId = "alpha-proof-strip" }: AlphaProofStripProps) {
  return (
    <section
      className="section proof-strip"
      data-testid={testId}
      aria-labelledby="alpha-proof-title"
    >
      <div className="container stack">
        <h2 id="alpha-proof-title">Trusted outcomes, clearly measured</h2>
        <dl className="proof-grid">
          {metrics.map((metric) => (
            <div key={metric.id} data-testid={landingTestIds.alphaProof(metric.id)}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
