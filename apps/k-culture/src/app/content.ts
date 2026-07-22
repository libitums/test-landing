import type { CtaContent, FeatureItem, HeroContent, ProofMetric } from "@landing/contracts";
import type { I18nRuntime } from "@landing/contracts/i18n";
import type { FooterProps } from "@landing/contracts/footer";
import type { NavbarProps } from "@landing/contracts/navbar";
import { localizePath } from "@landing/i18n";
import { registry } from "../i18n";
export function createNavbarProps(runtime: I18nRuntime, location: string): NavbarProps {
  const t = runtime.translate;
  return {
    appearance: "neutral",
    content: {
      logo: { kind: "text", label: t("brand"), accessibleLabel: t("brand"), href: "#top" },
      howItWorks: { label: t("nav.discover"), href: "#features" },
      pricing: { label: t("nav.impact"), href: "#proof" },
      language: {
        label: t("locale.label"),
        accessibleLabel: t("locale.label"),
        options: registry.supportedLocales.map((candidate) => ({
          locale: candidate,
          label: t(`locale.${candidate}`),
          href: localizePath(registry, location, candidate),
          current: candidate === runtime.locale,
        })),
      },
      tryAction: { label: t("nav.cta"), href: "#cta" },
    },
    accessibleLabels: {
      primaryNavigation: t("nav.label"),
      mobileMenuOpen: t("nav.menu.open"),
      mobileMenuClose: t("nav.menu.close"),
      mobileMenu: t("nav.menu.label"),
    },
  };
}
export function createFooterProps(runtime: I18nRuntime, location: string): FooterProps {
  const t = runtime.translate;
  return {
    appearance: "neutral",
    content: {
      logo: { kind: "text", label: t("brand"), accessibleLabel: t("brand"), href: "#top" },
      links: registry.supportedLocales.map((candidate) => ({
        id: candidate,
        label: t(`locale.${candidate}`),
        href: localizePath(registry, location, candidate),
        current: candidate === runtime.locale,
      })),
      policyLinks: [
        { id: "privacy", label: t("footer.privacy"), href: "#privacy" },
        { id: "terms", label: t("footer.terms"), href: "#terms" },
      ],
      copyright: t("footer.copyright"),
      faq: {
        locale: runtime.locale,
        heading: t("footer.faq.heading"),
        items: [
          {
            id: "collection",
            question: t("footer.faq.collection.question"),
            answer: t("footer.faq.collection.answer"),
          },
          {
            id: "updates",
            question: t("footer.faq.updates.question"),
            answer: t("footer.faq.updates.answer"),
          },
        ],
      },
    },
    accessibleLabels: {
      footer: t("footer.label"),
      linksNavigation: t("locale.label"),
      policyNavigation: t("footer.policy.label"),
      faqRegion: t("footer.faq.label"),
    },
  };
}
export function createContent(runtime: I18nRuntime) {
  const t = runtime.translate;
  return {
    hero: {
      title: t("hero.title"),
      description: t("hero.description"),
      cta: { label: t("hero.explore") },
      highlights: [
        { id: "music", label: t("features.music.title") },
        { id: "taste", label: t("features.taste.title") },
        { id: "style", label: t("features.style.title") },
      ],
    } satisfies HeroContent,
    features: [
      {
        id: "music",
        title: t("features.music.title"),
        description: t("features.music.description"),
      },
      {
        id: "taste",
        title: t("features.taste.title"),
        description: t("features.taste.description"),
      },
      {
        id: "style",
        title: t("features.style.title"),
        description: t("features.style.description"),
      },
    ] satisfies readonly FeatureItem[],
    metrics: [
      { id: "stories", value: t("proof.stories.value"), label: t("proof.stories.label") },
      { id: "regions", value: t("proof.regions.value"), label: t("proof.regions.label") },
      { id: "weekly", value: t("proof.weekly.value"), label: t("proof.weekly.label") },
    ] satisfies readonly ProofMetric[],
    cta: {
      badge: t("cta.badge"),
      title: t("cta.title"),
      description: t("cta.description"),
      actions: [{ id: "discover", label: t("cta.action"), href: "#top", variant: "primary" }],
      notes: [
        { id: "card", label: t("cta.note.card") },
        { id: "access", label: t("cta.note.access") },
      ],
      ghostWords: ["EXPLORE", "TOGETHER"],
    } satisfies CtaContent,
  };
}
