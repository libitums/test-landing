import { useEffect } from "react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { sharedFeatureTestIds } from "@landing/contracts/shared-feature";
import {
  ButtonLink,
  CtaSection,
  Footer,
  Hero,
  LandingShell,
  Navbar,
  SharedFeatureTemplate,
} from "@landing/ui";
import { KDramaProofStrip } from "../features/k-drama/KDramaProofStrip";
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
    <div id="top" data-testid="landing:k-drama">
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero} onAction={trackCta} />
          <div id="proof">
            <KDramaProofStrip metrics={content.metrics} title={t("proof.title")} />
          </div>
          <div id="features">
            {content.features.map((feature, index) => {
              const featureTestId = `k-drama-${feature.id}`;
              return (
                <SharedFeatureTemplate
                  key={feature.id}
                  appearance={index === 1 ? "soft" : "white"}
                  numberLabel={`0${index + 1}`}
                  headerText={feature.title}
                  subheaderText={feature.description}
                  testId={sharedFeatureTestIds.root(featureTestId)}
                >
                  <ButtonLink
                    className="shared-feature__early-access-cta"
                    variant="text"
                    href="/k-drama/early-access"
                    data-testid={sharedFeatureTestIds.earlyAccessCta(featureTestId)}
                    onClick={() => trackFeatureCta(feature.id)}
                  >
                    Get early access
                  </ButtonLink>
                </SharedFeatureTemplate>
              );
            })}
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={trackCta} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
