/** Frozen, project-configurable contracts for the shared FAQ footer. */

/**
 * An app-owned destination value rendered as an href. Routing, navigation side
 * effects, and destination page implementation (including policy pages) are out
 * of scope for the shared Footer.
 */
export interface FooterDestination {
  href: string;
}

export interface FooterTextLogo extends FooterDestination {
  kind: "text";
  label: string;
  accessibleLabel?: string;
}

export interface FooterImageLogo extends FooterDestination {
  kind: "image";
  src: string;
  alt: string;
}

/** Explicit variants prevent impossible text/image logo combinations. */
export type FooterLogo = FooterTextLogo | FooterImageLogo;

export interface FooterLink extends FooterDestination {
  id: string;
  label: string;
  accessibleLabel?: string;
  /** When true, the UI exposes aria-current="page" without inferring locale or route state. */
  current?: boolean;
}

export interface FooterFaqItem {
  id: string;
  question: string;
  answer: string;
}

/**
 * One locale's complete, app-owned static FAQ resource. An empty items array
 * means the entire FAQ region, including its heading, is not rendered.
 */
export interface LocalizedFooterFaq {
  locale: string;
  heading: string;
  items: readonly FooterFaqItem[];
}

export interface FooterContent {
  logo: FooterLogo;
  links: readonly FooterLink[];
  policyLinks: readonly FooterLink[];
  copyright: string;
  faq: LocalizedFooterFaq;
}

export interface FooterAccessibleLabels {
  footer: string;
  linksNavigation: string;
  policyNavigation: string;
  faqRegion: string;
}

/** Explicit visual variants preserve one shared structure without display flags. */
export type FooterAppearance = "warm-editorial" | "violet-editorial" | "neutral";

export interface FooterProps {
  appearance: FooterAppearance;
  content: FooterContent;
  accessibleLabels: FooterAccessibleLabels;
  testId?: "footer";
}

export const footerTestIds = {
  root: "footer",
  logo: "footer-logo",
  faq: "footer-faq",
  faqItem: (id: string) => `footer-faq-item:${id}`,
  linksNavigation: "footer-links-navigation",
  policyNavigation: "footer-policy-navigation",
  copyright: "footer-copyright",
} as const;
