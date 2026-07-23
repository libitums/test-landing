import { useEffect } from "react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import {
  CtaSection,
  Footer,
  Hero,
  LandingShell,
  Navbar,
  PricingSection,
} from "@landing/ui";
import { AiCommunicationProofStrip } from "../features/ai-communication/AiCommunicationProofStrip";
import { HeroShowcase } from "../features/ai-communication/HeroShowcase";
import { FeatureRoleplay } from "../features/ai-communication/FeatureRoleplay";
import { FeatureCorrections } from "../features/ai-communication/FeatureCorrections";
import { FeatureBias } from "../features/ai-communication/FeatureBias";
import { createContent, createFooterProps, createNavbarProps } from "./content";
export interface AppProps {
  analytics: AnalyticsTracker;
  runtime: I18nRuntime;
  location?: string;
}
export function App({ analytics, runtime, location = `/${runtime.locale}/` }: AppProps) {
  useEffect(() => {
    void analytics.track({ name: "experiment_viewed" });
  }, [analytics]);
  const content = createContent(runtime);
  const t = runtime.translate;
  const trackCta = () => {
    void analytics.track({ name: "cta_clicked" });
  };
  const trackFeatureCta = (featureId: string) => {
    void analytics.track({ name: "feature_cta_clicked", featureId });
  };
  return (
    <div id="top" data-testid="landing:ai-communication">
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero}>
            <HeroShowcase label={t("hero.preview")} />
          </Hero>
          <div id="proof">
            <AiCommunicationProofStrip metrics={content.metrics} title={t("proof.title")} />
          </div>
          <div id="features">
            <FeatureRoleplay />
            <FeatureCorrections />
            <FeatureBias onEarlyAccess={() => trackFeatureCta("personas")} />
          </div>
          <div id="pricing">
            <PricingSection content={content.pricing} />
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={trackCta} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
