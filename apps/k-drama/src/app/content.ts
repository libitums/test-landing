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
      label: t("hero.eyebrow"),
      title: t("hero.title"),
      description: t("hero.description"),
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
      badge: t("cta.badge"),
      title: t("cta.title"),
      description: t("cta.description"),
      actions: [{ id: "create", label: t("cta.action"), href: "#top", variant: "primary" }],
      notes: [
        { id: "card", label: t("cta.note.card") },
        { id: "access", label: t("cta.note.access") },
      ],
      ghostWords: ["SPEAK", "FREELY"],
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
