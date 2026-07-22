/** Frozen presentation contract for the feature section shared by all three apps. */

import type { ContentSlot } from "./landing";

/** Explicit surface variants; consumers must not replace these with display flags. */
export type SharedFeatureAppearance = "white" | "soft";

/** Destinations for the app-owned CTA composed inside each feature's children. */
export type FeatureEarlyAccessDestination =
  "/k-drama/early-access" | "/ai-communication/early-access" | "/k-culture/early-access";

export interface FeatureEarlyAccessAction {
  featureId: string;
  label: "Get early access";
  href: FeatureEarlyAccessDestination;
  size: "large";
  emphasis: "low";
}

/**
 * Common copy and the app-owned feature content composed beneath it.
 *
 * `numberLabel` is text, rather than a number, so apps can localize it or retain
 * intentional formatting such as `01`. Actions and business behavior belong in
 * `children`; the shared template does not interpret them. Newline characters in
 * the localized heading strings are intentional visual breaks, while the complete
 * string remains the accessible text.
 */
export interface SharedFeatureTemplateProps {
  appearance: SharedFeatureAppearance;
  numberLabel: string;
  headerText: string;
  subheaderText: string;
  children: ContentSlot;
  testId?: `shared-feature:${string}`;
}

export const sharedFeatureTestIds = {
  root: (id: string) => `shared-feature:${id}` as const,
  numberLabel: (id: string) => `shared-feature:${id}:number-label` as const,
  header: (id: string) => `shared-feature:${id}:header` as const,
  subheader: (id: string) => `shared-feature:${id}:subheader` as const,
  content: (id: string) => `shared-feature:${id}:content` as const,
  earlyAccessCta: (id: string) => `shared-feature:${id}:early-access-cta` as const,
} as const;
