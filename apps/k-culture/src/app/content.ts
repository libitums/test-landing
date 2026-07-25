import type {
  CtaContent,
  FeatureItem,
  HeroContent,
  PricingContent,
  ProofMetric,
} from "@landing/contracts";
import type { I18nRuntime } from "@landing/contracts/i18n";
import type { FooterProps } from "@landing/contracts/footer";
import type { NavbarProps } from "@landing/contracts/navbar";
import { localizePath } from "@landing/i18n";
import { registry } from "../i18n";
export function createNavbarProps(runtime: I18nRuntime, location: string): NavbarProps {
  const t = runtime.translate;
  return {
    appearance: "violet-editorial",
    content: {
      logo: {
        kind: "text",
        label: t("brand"),
        accessibleLabel: t("brand"),
        href: "#top",
      },
      howItWorks: { label: t("nav.proof"), href: "#proof" },
      pricing: { label: t("nav.pricing"), href: "#pricing" },
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
            id: "clips",
            question: t("footer.faq.clips.question"),
            answer: t("footer.faq.clips.answer"),
          },
          {
            id: "real-life",
            question: t("footer.faq.real-life.question"),
            answer: t("footer.faq.real-life.answer"),
          },
          {
            id: "register",
            question: t("footer.faq.register.question"),
            answer: t("footer.faq.register.answer"),
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
      cta: { label: t("hero.cta") },
      highlights: [
        { id: "clips", label: t("hero.highlight.clips") },
        { id: "real-life", label: t("hero.highlight.real-life") },
        { id: "register", label: t("hero.highlight.register") },
      ],
    } satisfies HeroContent,
    features: [
      {
        id: "clips",
        title: t("features.clips.title"),
        description: t("features.clips.description"),
      },
      {
        id: "real-life",
        title: t("features.real-life.title"),
        description: t("features.real-life.description"),
      },
      {
        id: "register",
        title: t("features.register.title"),
        description: t("features.register.description"),
      },
    ] satisfies readonly FeatureItem[],
    metrics: [
      { id: "clips", value: t("proof.clips.value"), label: t("proof.clips.label") },
      { id: "situations", value: t("proof.situations.value"), label: t("proof.situations.label") },
      {
        id: "relationships",
        value: t("proof.relationships.value"),
        label: t("proof.relationships.label"),
      },
    ] satisfies readonly ProofMetric[],
    cta: {
      badge: t("cta.badge"),
      title: t("cta.title"),
      description: t("cta.description"),
      actions: [
        {
          id: "early-access",
          label: t("cta.action"),
          href: "/k-culture/early-access",
          variant: "primary",
        },
      ],
      notes: [
        { id: "clips", label: t("cta.note.clips") },
        { id: "practice", label: t("cta.note.practice") },
      ],
      ghostWords: ["WATCH", "SPEAK"],
    } satisfies CtaContent,
    pricing: {
      kicker: t("pricing.kicker"),
      title: t("pricing.title"),
      subtitle: t("pricing.subtitle"),
      billing: {
        monthlyLabel: t("pricing.billing.monthly"),
        annualLabel: t("pricing.billing.annual"),
        annualBadge: t("pricing.billing.save"),
      },
      plans: [
        {
          id: "free",
          name: t("pricing.free.name"),
          description: t("pricing.free.description"),
          price: { monthly: "$0", annual: "$0", unit: t("pricing.unit") },
          cta: t("pricing.free.cta"),
          features: [
            { id: "clips", label: t("pricing.free.feature.clips") },
            { id: "phrases", label: t("pricing.free.feature.phrases") },
            { id: "register", label: t("pricing.free.feature.register") },
          ],
        },
        {
          id: "plus",
          name: t("pricing.plus.name"),
          badge: t("pricing.badge.popular"),
          featured: true,
          description: t("pricing.plus.description"),
          price: { monthly: "$4.99", annual: "$3.99", unit: t("pricing.unit") },
          cta: t("pricing.plus.cta"),
          features: [
            { id: "unlimited", label: t("pricing.plus.feature.unlimited") },
            { id: "situations", label: t("pricing.plus.feature.situations") },
            { id: "drills", label: t("pricing.plus.feature.drills") },
            { id: "review", label: t("pricing.plus.feature.review") },
          ],
        },
        {
          id: "premium",
          name: t("pricing.premium.name"),
          description: t("pricing.premium.description"),
          price: { monthly: "$9.99", annual: "$7.99", unit: t("pricing.unit") },
          cta: t("pricing.premium.cta"),
          features: [
            { id: "everything", label: t("pricing.premium.feature.everything") },
            { id: "pronunciation", label: t("pricing.premium.feature.pronunciation") },
            { id: "practice", label: t("pricing.premium.feature.practice") },
            { id: "early-access", label: t("pricing.premium.feature.early-access") },
          ],
        },
      ],
      footerNote: t("pricing.footer"),
    } satisfies PricingContent,
  };
}
