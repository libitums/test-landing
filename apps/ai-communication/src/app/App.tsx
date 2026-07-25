import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  createEngagementReporter,
  createFormFunnelReporter,
  discoverSections,
  featureSectionId,
  startEngagementTracking,
} from "@landing/analytics";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import type { SubmitEarlyAccessRegistration } from "@landing/contracts/early-access";
import { CtaSection, Footer, Hero, LandingShell, Navbar, PricingSection } from "@landing/ui";
import { AiCommunicationProofStrip } from "../features/ai-communication/AiCommunicationProofStrip";
import { HeroShowcase } from "../features/ai-communication/HeroShowcase";
import { FeatureRoleplay } from "../features/ai-communication/FeatureRoleplay";
import { FeatureCorrections } from "../features/ai-communication/FeatureCorrections";
import { FeatureBias } from "../features/ai-communication/FeatureBias";
import { createContent, createFooterProps, createNavbarProps } from "./content";
import { EarlyAccessModal } from "./EarlyAccessModal";
import { useConversationBreakpoints } from "./useConversationBreakpoints";
import { unavailableEarlyAccessRegistration } from "../early-access";

const featurePrefix = "ai-communication-";
const earlyAccessFormId = "early-access";
const landingSections = [
  ["hero", '[data-testid="hero"]'],
  ["proof", "#proof"],
  ["cta", "#cta"],
  ["pricing", "#pricing"],
] as const;

export interface AppProps {
  analytics: AnalyticsTracker;
  runtime: I18nRuntime;
  location?: string;
  submitEarlyAccessRegistration?: SubmitEarlyAccessRegistration;
}
export function App({
  analytics,
  runtime,
  location = `/${runtime.locale}/`,
  submitEarlyAccessRegistration = unavailableEarlyAccessRegistration,
}: AppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
  const [earlyAccessSource, setEarlyAccessSource] = useState<string | null>(null);
  useConversationBreakpoints(rootRef);
  useEffect(() => {
    void analytics.track({ name: "experiment_viewed" });
  }, [analytics]);
  useEffect(() => {
    const root = rootRef.current;
    if (root === null) {
      return;
    }

    return startEngagementTracking({
      reporter: createEngagementReporter({ tracker: analytics }),
      sections: discoverSections({ root, named: landingSections, featurePrefix }),
    });
  }, [analytics]);
  const earlyAccessFunnel = useMemo(
    () =>
      earlyAccessSource === null
        ? null
        : createFormFunnelReporter({
            tracker: analytics,
            formId: earlyAccessFormId,
            sourceId: earlyAccessSource,
          }),
    [analytics, earlyAccessSource],
  );
  useEffect(() => {
    if (earlyAccessFunnel === null) {
      return;
    }

    earlyAccessFunnel.opened();
    return () => earlyAccessFunnel.closed();
  }, [earlyAccessFunnel]);
  const earlyAccessHref = "#early-access";
  const content = createContent(runtime, earlyAccessHref);
  const t = runtime.translate;
  const openEarlyAccess = (sourceId: string) => {
    setEarlyAccessSource(sourceId);
    void analytics.track({ name: "cta_clicked" });
  };
  const openFromLink = (link: HTMLAnchorElement) => {
    const testId = link.closest("[data-testid]")?.getAttribute("data-testid") ?? "";
    setEarlyAccessSource(featureSectionId(testId, featurePrefix) ?? "link");
  };
  const interceptEarlyAccessLink = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      `a[href="${earlyAccessHref}"]`,
    );
    if (!link) return;
    event.preventDefault();
    openFromLink(link);
  };
  const interceptEarlyAccessKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    const link = (event.target as Element).closest<HTMLAnchorElement>(
      `a[href="${earlyAccessHref}"]`,
    );
    if (!link) return;
    event.preventDefault();
    openFromLink(link);
  };
  const trackFeatureCta = (featureId: string) => {
    void analytics.track({ name: "feature_cta_clicked", featureId });
  };
  return (
    <div
      ref={rootRef}
      id="top"
      data-testid="landing:ai-communication"
      onClickCapture={interceptEarlyAccessLink}
      onKeyDownCapture={interceptEarlyAccessKey}
    >
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero} onAction={() => openEarlyAccess("hero")}>
            <HeroShowcase label={t("hero.preview")} />
          </Hero>
          <div id="proof">
            <AiCommunicationProofStrip metrics={content.metrics} title={t("proof.title")} />
          </div>
          <div id="features">
            <FeatureRoleplay
              t={t}
              earlyAccessHref={earlyAccessHref}
              onEarlyAccess={() => trackFeatureCta("roleplay")}
            />
            <FeatureCorrections
              t={t}
              earlyAccessHref={earlyAccessHref}
              onEarlyAccess={() => trackFeatureCta("corrections")}
            />
            <FeatureBias
              t={t}
              earlyAccessHref={earlyAccessHref}
              onEarlyAccess={() => trackFeatureCta("personas")}
            />
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={() => openEarlyAccess("final-cta")} />
          </div>
          <div id="pricing">
            <PricingSection content={content.pricing} />
          </div>
        </LandingShell.Main>
      </LandingShell>
      {earlyAccessFunnel !== null ? (
        <EarlyAccessModal
          runtime={runtime}
          onClose={() => setEarlyAccessSource(null)}
          submitRegistration={submitEarlyAccessRegistration}
          funnel={earlyAccessFunnel}
        />
      ) : null}
    </div>
  );
}
