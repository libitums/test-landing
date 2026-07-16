import type { FeatureCardProps, FeatureGridProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";
import { Card } from "../primitives/card";

export function FeatureCard({ feature, testId = landingTestIds.featureCard(feature.id) }: FeatureCardProps) {
  return <Card data-testid={testId}><h3>{feature.title}</h3><p>{feature.description}</p></Card>;
}
export function FeatureGrid({ title, items, testId = "feature-grid" }: FeatureGridProps) {
  return <section className="section" data-testid={testId} aria-labelledby={`${testId}-title`}><div className="container stack stack--large"><h2 id={`${testId}-title`}>{title}</h2><div className="feature-grid">{items.map((feature) => <FeatureCard key={feature.id} feature={feature} />)}</div></div></section>;
}
