import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type MouseEvent } from "react";
import {
  createEngagementReporter,
  createFormFunnelReporter,
  discoverSections,
  featureSectionId,
  startEngagementTracking,
} from "@landing/analytics";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { SubmitEarlyAccessRegistration } from "@landing/contracts/early-access";
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
import { KCultureFeatureOne } from "../features/k-culture/KCultureFeatureOne";
import { KCultureFeatureTwo } from "../features/k-culture/KCultureFeatureTwo";
import { KCultureFeatureThree } from "../features/k-culture/KCultureFeatureThree";
import { createContent, createFooterProps, createNavbarProps } from "./content";
import { KCultureEarlyAccessModal } from "./KCultureEarlyAccessModal";
import { unavailableEarlyAccessRegistration } from "../early-access";
const featurePrefix = "k-culture-";
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
    if (earlyAccessFunnel === null) return;
    earlyAccessFunnel.opened();
    return () => earlyAccessFunnel.closed();
  }, [earlyAccessFunnel]);
  const earlyAccessHref = "#early-access";
  const content = createContent(runtime, earlyAccessHref);
  const openEarlyAccess = (sourceId: string) => {
    setEarlyAccessSource(sourceId);
    void analytics.track({ name: "cta_clicked" });
  };
  const interceptEarlyAccessLink = (event: MouseEvent<HTMLDivElement>) => {
    const link = (event.target as Element).closest<HTMLAnchorElement>(`a[href="${earlyAccessHref}"]`);
    if (!link) return;
    event.preventDefault();
    const testId = link.closest("[data-testid]")?.getAttribute("data-testid") ?? "";
    setEarlyAccessSource(featureSectionId(testId, featurePrefix) ?? "link");
  };
  const interceptEarlyAccessKey = (event: KeyboardEvent<HTMLDivElement>) => {
    if (event.key !== "Enter") return;
    const link = (event.target as Element).closest<HTMLAnchorElement>(`a[href="${earlyAccessHref}"]`);
    if (!link) return;
    event.preventDefault();
    const testId = link.closest("[data-testid]")?.getAttribute("data-testid") ?? "";
    setEarlyAccessSource(featureSectionId(testId, featurePrefix) ?? "link");
  };
  const trackFeatureCta = (featureId: string) => {
    void analytics.track({ name: "feature_cta_clicked", featureId });
    openEarlyAccess(`feature:${featureId}`);
  };
  return (
    <div ref={rootRef} id="top" data-testid="landing:k-culture" onClickCapture={interceptEarlyAccessLink} onKeyDownCapture={interceptEarlyAccessKey}>
      <LandingShell
        header={<Navbar {...createNavbarProps(runtime, location)} />}
        footer={<Footer {...createFooterProps(runtime, location)} />}
      >
        <LandingShell.Main>
          <Hero content={content.hero} onAction={() => openEarlyAccess("hero")} />
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
                  {index === 0 ? <KCultureFeatureOne /> : null}
                  {index === 1 ? <KCultureFeatureTwo /> : null}
                  {index === 2 ? <KCultureFeatureThree /> : null}
                  <ButtonLink
                    className="shared-feature__early-access-cta"
                    variant="text"
                    href={earlyAccessHref}
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
            <CtaSection content={content.cta} onAction={() => openEarlyAccess("final-cta")} />
          </div>
          <div id="pricing">
            <PricingSection content={content.pricing} />
          </div>
        </LandingShell.Main>
      </LandingShell>
      {earlyAccessFunnel !== null ? (
        <KCultureEarlyAccessModal
          submitRegistration={submitEarlyAccessRegistration}
          onClose={() => setEarlyAccessSource(null)}
          funnel={earlyAccessFunnel}
        />
      ) : null}
    </div>
  );
}
