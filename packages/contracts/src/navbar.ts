/** Frozen, project-configurable contracts for the shared responsive navbar. */

/** A destination value only; routing and navigation side effects stay app-owned. */
export interface NavbarDestination {
  href: string;
}

export interface NavbarTextLogo extends NavbarDestination {
  kind: "text";
  label: string;
  accessibleLabel?: string;
}

export interface NavbarImageLogo extends NavbarDestination {
  kind: "image";
  src: string;
  alt: string;
}

/** Explicit variants avoid display flags and impossible logo prop combinations. */
export type NavbarLogo = NavbarTextLogo | NavbarImageLogo;

export interface NavbarLink extends NavbarDestination {
  label: string;
  accessibleLabel?: string;
}

export interface NavbarLanguageOption extends NavbarLink {
  locale: string;
  current: boolean;
}

export interface NavbarLanguageMenu {
  label: string;
  accessibleLabel?: string;
  options: readonly NavbarLanguageOption[];
}

export interface NavbarContent {
  logo: NavbarLogo;
  howItWorks: NavbarLink;
  pricing: NavbarLink;
  language: NavbarLanguageMenu;
  tryAction: NavbarLink;
}

export interface NavbarAccessibleLabels {
  primaryNavigation: string;
  mobileMenuOpen: string;
  mobileMenuClose: string;
  mobileMenu: string;
}

/** Explicit visual variants let each app extend the shared structure without display flags. */
export type NavbarAppearance = "warm-editorial" | "violet-editorial" | "neutral";

export interface NavbarProps {
  appearance: NavbarAppearance;
  content: NavbarContent;
  accessibleLabels: NavbarAccessibleLabels;
  testId?: "navbar";
}

export const navbarTestIds = {
  root: "navbar",
  logo: "navbar-logo",
  desktopNavigation: "navbar-desktop-navigation",
  howItWorks: "navbar-how-it-works",
  pricing: "navbar-pricing",
  language: "navbar-language",
  languageMenuContent: "navbar-language-menu-content",
  tryAction: "navbar-try",
  mobileMenuTrigger: "navbar-mobile-menu-trigger",
  mobileMenuContent: "navbar-mobile-menu-content",
} as const;
