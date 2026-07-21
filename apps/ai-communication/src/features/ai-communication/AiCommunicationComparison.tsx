import type { ComparisonRow } from "@landing/contracts";

interface AiCommunicationComparisonProps {
  rows: readonly ComparisonRow[];
  title: string;
  regionLabel: string;
  tableLabel: string;
  criterionLabel: string;
  productLabel: string;
  alternativeLabel: string;
}

export function AiCommunicationComparison({
  rows,
  title,
  regionLabel,
  tableLabel,
  criterionLabel,
  productLabel,
  alternativeLabel,
}: AiCommunicationComparisonProps) {
  return (
    <section
      className="section"
      data-testid="ai-communication-comparison"
      aria-labelledby="comparison-title"
    >
      <div className="container stack stack--large">
        <h2 id="comparison-title">{title}</h2>
        <div className="comparison" role="region" aria-label={regionLabel} tabIndex={0}>
          <table aria-label={tableLabel}>
            <thead>
              <tr>
                <th scope="col">{criterionLabel}</th>
                <th scope="col">{productLabel}</th>
                <th scope="col">{alternativeLabel}</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((row) => (
                <tr key={row.id} data-testid={`ai-communication-comparison-row:${row.id}`}>
                  <th scope="row">{row.criterion}</th>
                  <td>{row.productValue}</td>
                  <td>{row.alternativeValue}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
