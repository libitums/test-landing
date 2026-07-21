import type { CtaContent, FeatureItem, HeroContent, ProofMetric } from "@landing/contracts";
import type { I18nRuntime } from "@landing/contracts/i18n";
import type { FooterProps } from "@landing/contracts/footer";
import type { NavbarProps } from "@landing/contracts/navbar";
import { localizePath } from "@landing/i18n";
import { registry } from "../i18n";

export function createNavbarProps(runtime: I18nRuntime, location: string): NavbarProps {
  const t = runtime.translate;
  return {
    appearance: "warm-editorial",
    content: {
      logo: { kind: "text", label: t("brand"), accessibleLabel: t("brand"), href: "#top" },
      howItWorks: { label: t("nav.product"), href: "#features" },
      pricing: { label: t("nav.proof"), href: "#proof" },
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
    appearance: "warm-editorial",
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
            id: "availability",
            question: t("footer.faq.availability.question"),
            answer: t("footer.faq.availability.answer"),
          },
          {
            id: "workflow",
            question: t("footer.faq.workflow.question"),
            answer: t("footer.faq.workflow.answer"),
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
      eyebrow: t("hero.eyebrow"),
      title: t("hero.title"),
      description: t("hero.description"),
      actions: [
        { id: "start", label: t("hero.start"), href: "#features", variant: "primary" },
        { id: "method", label: t("hero.method"), href: "#proof", variant: "secondary" },
      ],
    } satisfies HeroContent,
    features: [
      {
        id: "speed",
        title: t("features.speed.title"),
        description: t("features.speed.description"),
      },
      {
        id: "consistency",
        title: t("features.consistency.title"),
        description: t("features.consistency.description"),
      },
      {
        id: "freedom",
        title: t("features.freedom.title"),
        description: t("features.freedom.description"),
      },
    ] satisfies readonly FeatureItem[],
    metrics: [
      { id: "markets", value: t("proof.markets.value"), label: t("proof.markets.label") },
      { id: "reuse", value: t("proof.reuse.value"), label: t("proof.reuse.label") },
      { id: "launch", value: t("proof.launch.value"), label: t("proof.launch.label") },
    ] satisfies readonly ProofMetric[],
    cta: {
      title: t("cta.title"),
      description: t("cta.description"),
      actions: [{ id: "create", label: t("cta.action"), href: "#top", variant: "primary" }],
    } satisfies CtaContent,
  };
}
