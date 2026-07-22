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
  title: string;
  /**
   * Sub-header copy. A newline (`\n`) is rendered as an explicit line break,
   * so content authors control where the text wraps per locale.
   */
  description: string;
  cta?: HeroCtaContent;
  /** Optional, extensible checklist of one-line feature summaries shown under the CTA. */
  highlights?: readonly HeroHighlight[];
}

export interface HeroCtaContent {
  label: string;
}

export interface HeroHighlight {
  id: string;
  label: string;
}

export interface FeatureItem {
  id: string;
  title: string;
  description: string;
}

export interface CtaContent {
  /** Optional promise badge shown above the headline. */
  badge?: string;
  title: string;
  /** A newline (`\n`) is rendered as an explicit line break, per locale. */
  description: string;
  actions: readonly [LandingAction, ...LandingAction[]];
  /** Optional, extensible reassurance notes shown under the actions. */
  notes?: readonly CtaNote[];
  /** Two decorative background words [start, end]; always rendered. */
  ghostWords: readonly [string, string];
}

export interface CtaNote {
  id: string;
  label: string;
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
  children: ContentSlot;
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

export type BillingPeriod = "monthly" | "annual";

export interface PricingBilling {
  monthlyLabel: string;
  annualLabel: string;
  /** Optional savings badge shown next to the annual option, e.g. "Save 20%". */
  annualBadge?: string;
}

export interface PricingPrice {
  monthly: string;
  annual: string;
  /** Cadence unit shown next to the amount, e.g. "/mo". */
  unit: string;
}

export interface PricingFeature {
  id: string;
  label: string;
}

export interface PricingPlan {
  id: string;
  name: string;
  /** Optional emphasis badge, e.g. "Popular". */
  badge?: string;
  /** Visually highlight this plan as the recommended tier. */
  featured?: boolean;
  description: string;
  price: PricingPrice;
  /** Display-only CTA label (no link or tracking). */
  cta: string;
  features: readonly PricingFeature[];
}

export interface PricingContent {
  kicker?: string;
  title: string;
  /** A newline (`\n`) is rendered as an explicit line break, per locale. */
  subtitle?: string;
  billing: PricingBilling;
  plans: readonly PricingPlan[];
  footerNote?: string;
}

export interface PricingSectionProps {
  content: PricingContent;
  testId?: "pricing-section";
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
  heroCta: "hero-cta",
  heroHighlights: "hero-highlights",
  heroMedia: "hero-media",
  featureGrid: "feature-grid",
  ctaSection: "cta-section",
  pricingSection: "pricing-section",
  pricingBilling: "pricing-billing",
  alphaProofStrip: "alpha-proof-strip",
  betaComparison: "beta-comparison",
  heroHighlight: (id: string) => `hero-highlight:${id}` as const,
  featureCard: (id: string) => `feature-card:${id}` as const,
  ctaAction: (id: string) => `cta-action:${id}` as const,
  ctaNote: (id: string) => `cta-note:${id}` as const,
  ctaGhost: "cta-ghost",
  pricingPlan: (id: string) => `pricing-plan:${id}` as const,
  pricingBillingOption: (period: string) => `pricing-billing:${period}` as const,
  alphaProof: (id: string) => `alpha-proof:${id}` as const,
  betaComparisonRow: (id: string) => `beta-comparison-row:${id}` as const,
} as const;
