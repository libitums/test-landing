/** Stable content and component contracts for all landing experiments. */

export type ContentSlot = unknown;

export type LandingActionVariant = "primary" | "secondary" | "text";

export interface LandingAction {
  id: string;
  label: string;
  href: string;
  variant: LandingActionVariant;
  accessibleLabel?: string;
}

export interface HeroContent {
  eyebrow?: string;
  title: string;
  description: string;
  actions: readonly [LandingAction, ...LandingAction[]];
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
}

export interface CtaContent {
  title: string;
  description: string;
  actions: readonly [LandingAction, ...LandingAction[]];
}

export interface ProofMetric {
  id: string;
  value: string;
  label: string;
}

export interface ComparisonRow {
  id: string;
  criterion: string;
  productValue: string;
  alternativeValue: string;
}

export type LandingActionHandler = (action: LandingAction) => void;

export interface LandingShellProps {
  header: ContentSlot;
  children: ContentSlot;
  footer: ContentSlot;
  testId?: "landing-shell";
}

export interface LandingShellSlotProps {
  children: ContentSlot;
  testId?: "landing-header" | "landing-main" | "landing-footer";
}

export interface HeroProps {
  content: HeroContent;
  onAction?: LandingActionHandler;
  testId?: "hero";
}

export interface FeatureGridProps {
  title: string;
  items: readonly FeatureItem[];
  testId?: "feature-grid";
}

export interface FeatureCardProps {
  feature: FeatureItem;
  testId?: `feature-card:${string}`;
}

export interface CtaSectionProps {
  content: CtaContent;
  onAction?: LandingActionHandler;
  testId?: "cta-section";
}

export interface AlphaProofStripProps {
  metrics: readonly ProofMetric[];
  testId?: "alpha-proof-strip";
}

export interface BetaComparisonProps {
  rows: readonly ComparisonRow[];
  productLabel: string;
  alternativeLabel: string;
  testId?: "beta-comparison";
}

export const landingTestIds = {
  alphaRoot: "landing:alpha",
  betaRoot: "landing:beta",
  shell: "landing-shell",
  header: "landing-header",
  main: "landing-main",
  footer: "landing-footer",
  hero: "hero",
  featureGrid: "feature-grid",
  ctaSection: "cta-section",
  alphaProofStrip: "alpha-proof-strip",
  betaComparison: "beta-comparison",
  heroAction: (id: string) => `hero-action:${id}` as const,
  featureCard: (id: string) => `feature-card:${id}` as const,
  ctaAction: (id: string) => `cta-action:${id}` as const,
  alphaProof: (id: string) => `alpha-proof:${id}` as const,
  betaComparisonRow: (id: string) => `beta-comparison-row:${id}` as const,
} as const;
