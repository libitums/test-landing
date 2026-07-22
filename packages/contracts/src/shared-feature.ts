/** Frozen presentation contract for the feature section shared by all three apps. */

import type { ContentSlot } from "./landing";

/**
 * Common copy and the app-owned feature content composed beneath it.
 *
 * `numberLabel` is text, rather than a number, so apps can localize it or retain
 * intentional formatting such as `01`. Actions and business behavior belong in
 * `children`; the shared template does not interpret them.
 */
export interface SharedFeatureTemplateProps {
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
} as const;
