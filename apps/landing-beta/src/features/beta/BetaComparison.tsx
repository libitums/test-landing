import type { BetaComparisonProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";

export function BetaComparison({ rows, productLabel, alternativeLabel, testId = "beta-comparison" }: BetaComparisonProps) {
  return <section className="section" data-testid={testId} aria-labelledby="comparison-title"><div className="container stack stack--large"><h2 id="comparison-title">Choose the clearer path</h2><div className="comparison" role="region" aria-label="Scrollable approach comparison" tabIndex={0}><table aria-label="Approach comparison"><thead><tr><th scope="col">Criterion</th><th scope="col">{productLabel}</th><th scope="col">{alternativeLabel}</th></tr></thead><tbody>{rows.map((row) => <tr key={row.id} data-testid={landingTestIds.betaComparisonRow(row.id)}><th scope="row">{row.criterion}</th><td>{row.productValue}</td><td>{row.alternativeValue}</td></tr>)}</tbody></table></div></div></section>;
}
