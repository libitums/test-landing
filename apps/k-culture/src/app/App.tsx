import { useEffect } from "react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { CtaSection, Footer, Hero, LandingShell, Navbar, SharedFeatureTemplate } from "@landing/ui";
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
            {content.features.map((feature, index) => (
              <SharedFeatureTemplate
                key={feature.id}
                appearance={index === 1 ? "soft" : "white"}
                numberLabel={`0${index + 1}`}
                headerText={feature.title}
                subheaderText={feature.description}
                testId={`shared-feature:k-culture-${feature.id}`}
              >
                <div
                  className="shared-feature__showcase"
                  data-testid={`k-culture-feature-content:${feature.id}`}
                  aria-hidden="true"
                />
              </SharedFeatureTemplate>
            ))}
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={trackCta} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
