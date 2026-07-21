import { useEffect } from "react";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { CtaSection, FeatureGrid, Hero, LandingShell } from "@landing/ui";
import { AiCommunicationComparison } from "../features/ai-communication/AiCommunicationComparison";
import { createContent } from "./content";
import { LocaleNavigation } from "./LocaleNavigation";
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
        header={
          <header className="landing-header">
            <div className="container header-inner">
              <a href="#top">{t("brand")}</a>
              <nav className="nav" aria-label={t("nav.label")}>
                <a href="#features">{t("nav.benefits")}</a>
                <a href="#proof">{t("nav.comparison")}</a>
                <a href="#cta">{t("nav.cta")}</a>
              </nav>
              <LocaleNavigation runtime={runtime} location={location} />
            </div>
          </header>
        }
        footer={
          <footer className="landing-footer">
            <div className="container footer-inner">{t("brand")}</div>
          </footer>
        }
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
