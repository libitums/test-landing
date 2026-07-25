import { useEffect, useRef } from "react";
import {
  createEngagementReporter,
  discoverSections,
  startEngagementTracking,
} from "@landing/analytics";
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
  PricingSection,
} from "@landing/ui";
import { KCultureProofStrip } from "../features/k-culture/KCultureProofStrip";
import { createContent, createFooterProps, createNavbarProps } from "./content";
const featurePrefix = "k-culture-";
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
}
export function App({ analytics, runtime, location = `/${runtime.locale}/` }: AppProps) {
  const rootRef = useRef<HTMLDivElement>(null);
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
  const content = createContent(runtime);
  const trackCta = () => {
    void analytics.track({ name: "cta_clicked" });
  };
  const trackFeatureCta = (featureId: string) => {
    void analytics.track({ name: "feature_cta_clicked", featureId });
  };
  return (
    <div ref={rootRef} id="top" data-testid="landing:k-culture">
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero} />
          <div id="proof">
            <KCultureProofStrip
              metrics={content.metrics}
              title={runtime.translate("proof.title")}
            />
          </div>
          <div id="features">
            {content.features.map((feature, index) => {
              const featureTestId = `k-culture-${feature.id}`;
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
                    href="/k-culture/early-access"
                    data-testid={sharedFeatureTestIds.earlyAccessCta(featureTestId)}
                    onClick={() => trackFeatureCta(feature.id)}
                  >
                    {runtime.translate("features.earlyAccess")}
                  </ButtonLink>
                </SharedFeatureTemplate>
              );
            })}
          </div>
          <div id="cta">
            <CtaSection content={content.cta} onAction={trackCta} />
          </div>
          <div id="pricing">
            <PricingSection content={content.pricing} />
          </div>
        </LandingShell.Main>
      </LandingShell>
    </div>
  );
}
