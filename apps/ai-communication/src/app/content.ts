import type {
  ComparisonRow,
  CtaContent,
  FeatureItem,
  HeroContent,
  PricingContent,
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
      logo: { kind: "text", label: t("brand"), accessibleLabel: t("brand"), href: "#top" },
      howItWorks: { label: t("nav.comparison"), href: "#comparison" },
      pricing: { label: t("nav.benefits"), href: "#features" },
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
    appearance: "violet-editorial",
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
            id: "teams",
            question: t("footer.faq.teams.question"),
            answer: t("footer.faq.teams.answer"),
          },
          {
            id: "comparison",
            question: t("footer.faq.comparison.question"),
            answer: t("footer.faq.comparison.answer"),
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
      cta: { label: t("hero.action") },
      highlights: [
        { id: "clarity", label: t("features.clarity.title") },
        { id: "access", label: t("features.access.title") },
        { id: "global", label: t("features.global.title") },
      ],
    } satisfies HeroContent,
    rows: [
      {
        id: "setup",
        criterion: t("comparison.setup.criterion"),
        productValue: t("comparison.setup.product"),
        alternativeValue: t("comparison.setup.alternative"),
      },
      {
        id: "brand",
        criterion: t("comparison.brand.criterion"),
        productValue: t("comparison.brand.product"),
        alternativeValue: t("comparison.brand.alternative"),
      },
      {
        id: "extension",
        criterion: t("comparison.extension.criterion"),
        productValue: t("comparison.extension.product"),
        alternativeValue: t("comparison.extension.alternative"),
      },
    ] satisfies readonly ComparisonRow[],
    features: [
      {
        id: "clarity",
        title: t("features.clarity.title"),
        description: t("features.clarity.description"),
      },
      {
        id: "access",
        title: t("features.access.title"),
        description: t("features.access.description"),
      },
      {
        id: "global",
        title: t("features.global.title"),
        description: t("features.global.description"),
      },
    ] satisfies readonly FeatureItem[],
    cta: {
      badge: t("cta.badge"),
      title: t("cta.title"),
      description: t("cta.description"),
      actions: [{ id: "choose", label: t("cta.action"), href: "#top", variant: "primary" }],
      notes: [
        { id: "card", label: t("cta.note.card") },
        { id: "access", label: t("cta.note.access") },
      ],
      ghostWords: ["CLEAR", "GLOBAL"],
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
            { id: "captions", label: t("pricing.free.feature.captions") },
            { id: "saved", label: t("pricing.free.feature.saved") },
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
            { id: "import", label: t("pricing.plus.feature.import") },
            { id: "offline", label: t("pricing.plus.feature.offline") },
            { id: "reminders", label: t("pricing.plus.feature.reminders") },
          ],
        },
        {
          id: "premium",
          name: t("pricing.premium.name"),
          description: t("pricing.premium.description"),
          price: { monthly: "$9.99", annual: "$7.99", unit: t("pricing.unit") },
          cta: t("pricing.premium.cta"),
          features: [
            { id: "pronunciation", label: t("pricing.premium.feature.pronunciation") },
            { id: "subtitles", label: t("pricing.premium.feature.subtitles") },
            { id: "collections", label: t("pricing.premium.feature.collections") },
            { id: "priority", label: t("pricing.premium.feature.priority") },
          ],
        },
      ],
      footerNote: t("pricing.footer"),
    } satisfies PricingContent,
  };
}
