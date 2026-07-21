import { useEffect } from "react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { CtaSection, FeatureGrid, Footer, Hero, LandingShell, Navbar } from "@landing/ui";
import { KCultureProofStrip } from "../features/k-culture/KCultureProofStrip";
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
  return (
    <div id="top" data-testid="landing:k-culture">
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero} onAction={trackCta} />
          <div id="proof">
            <KCultureProofStrip metrics={content.metrics} title={t("proof.title")} />
          </div>
          <div id="features">
            <FeatureGrid title={t("features.title")} items={content.features} />
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={trackCta} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
