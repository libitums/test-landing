import { useEffect } from "react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import {
  CtaSection,
  FeatureCard,
  Footer,
  Hero,
  LandingShell,
  Navbar,
  SharedFeatureTemplate,
} from "@landing/ui";
import { AiCommunicationComparison } from "../features/ai-communication/AiCommunicationComparison";
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
    <div id="top" data-testid="landing:ai-communication">
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero} onAction={trackCta} />
          <div id="comparison">
            <AiCommunicationComparison
              rows={content.rows}
              title={t("comparison.title")}
              regionLabel={t("comparison.region")}
              tableLabel={t("comparison.table")}
              criterionLabel={t("comparison.criterion")}
              productLabel={t("comparison.product")}
              alternativeLabel={t("comparison.alternative")}
            />
          </div>
          <div id="features">
            <SharedFeatureTemplate
              numberLabel="01"
              headerText={t("features.title")}
              subheaderText={content.hero.description}
              testId="shared-feature:ai-communication"
            >
              <div className="feature-grid">
                {content.features.map((feature) => (
                  <FeatureCard key={feature.id} feature={feature} />
                ))}
              </div>
            </SharedFeatureTemplate>
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={trackCta} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
