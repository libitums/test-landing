import type { ProofMetric } from "@landing/contracts";

interface AiCommunicationProofStripProps {
  metrics: readonly ProofMetric[];
  title: string;
}

export function AiCommunicationProofStrip({ metrics, title }: AiCommunicationProofStripProps) {
  return (
    <section
      className="section proof-strip"
      data-testid="ai-communication-proof-strip"
      aria-labelledby="ai-communication-proof-title"
    >
      <div className="container stack">
        <h2 id="ai-communication-proof-title">{title}</h2>
        <dl className="proof-grid">
          {metrics.map((metric) => (
            <div key={metric.id} data-testid={`ai-communication-proof:${metric.id}`}>
              <dt>{metric.label}</dt>
              <dd>{metric.value}</dd>
            </div>
          ))}
        </dl>
      </div>
    </section>
  );
}
