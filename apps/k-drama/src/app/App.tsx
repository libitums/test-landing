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
  PricingSection,
} from "@landing/ui";
import { KDramaProofStrip } from "../features/k-drama/KDramaProofStrip";
import { KDramaShortformHighlights } from "../features/k-drama/KDramaShortformHighlights";
import {
  KDramaDualSubtitleFeature,
  KDramaShortformFeature,
  KDramaYoutubeLessonFeature,
} from "../features/k-drama/KDramaFeatureVisuals";
import { createContent, createFooterProps, createNavbarProps } from "./content";

const featureVisuals = {
  subtitles: <KDramaDualSubtitleFeature />,
  youtube: <KDramaYoutubeLessonFeature />,
  shortform: <KDramaShortformFeature />,
};

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
          <div className="k-drama-hero">
            <Hero content={content.hero}>
              <div className="k-drama-hero__visuals">
                <div
                  className="k-drama-hero-card k-drama-hero-card--video"
                  role="img"
                  aria-label={t("hero.visual.video")}
                >
                  <div className="k-drama-hero-card__content" aria-hidden="true">
                    <strong>Don't pause real clips</strong>
                    <span>Study a real Korean moment frame by frame.</span>
                    <div className="k-drama-hero-card__captions">
                      <span>순식간에 배워보세요</span>
                      <span>Apprenez en un instant</span>
                      <span>Aprende en minutos</span>
                    </div>
                    <div className="k-drama-hero-card__timeline">
                      <span>0:14</span>
                      <span>0:42</span>
                    </div>
                    <div className="k-drama-hero-card__progress" />
                  </div>
                </div>
                <div
                  className="k-drama-hero-card k-drama-hero-card--lesson"
                  role="img"
                  aria-label={t("hero.visual.lesson")}
                >
                  <div className="k-drama-hero-card__content" aria-hidden="true">
                    <strong>Make your own lesson</strong>
                    <div className="k-drama-hero-card__url">
                      <span className="k-drama-hero-card__youtube-icon" aria-hidden="true">
                        ▶
                      </span>
                      <span className="k-drama-hero-card__url-text">youtube.com/shorts/...</span>
                    </div>
                    <div className="k-drama-hero-card__download-tile" aria-hidden="true">
                      <div className="k-drama-hero-card__download-progress">
                        <div className="k-drama-hero-card__youtube-box">
                          <span className="k-drama-hero-card__youtube-logo">
                            <span className="k-drama-hero-card__youtube-play" />
                          </span>
                        </div>
                      </div>
                    </div>
                    <b>
                      Paste a link.
                      <br />
                      Get a lesson.
                    </b>
                    <span>Turn clips into captions, saved lines, and review cards.</span>
                  </div>
                </div>
                <div
                  className="k-drama-hero-card k-drama-hero-card--feed"
                  role="img"
                  aria-label={t("hero.visual.feed")}
                >
                  <div className="k-drama-hero-card__content" aria-hidden="true">
                    <div className="k-drama-hero-card__feed-stream">
                      <div className="k-drama-hero-card__feed-slides">
                        <div className="k-drama-hero-card__feed-slide">
                          <strong className="k-drama-hero-card__feed-heading">Too busy?</strong>
                          <div className="k-drama-hero-card__feed-chips">
                            <span className="k-drama-hero-card__feed-chip k-drama-hero-card__feed-chip--topic">
                              K-pop
                            </span>
                            <span className="k-drama-hero-card__feed-chip k-drama-hero-card__feed-chip--time">
                              0:03
                            </span>
                          </div>
                          <span>오늘도 좋은 하루 보내세요</span>
                        </div>
                        <div className="k-drama-hero-card__feed-slide">
                          <strong className="k-drama-hero-card__feed-heading">
                            One more scene
                          </strong>
                          <div className="k-drama-hero-card__feed-chips">
                            <span className="k-drama-hero-card__feed-chip k-drama-hero-card__feed-chip--topic">
                              K-drama
                            </span>
                            <span className="k-drama-hero-card__feed-chip k-drama-hero-card__feed-chip--time">
                              0:08
                            </span>
                          </div>
                          <span>괜찮아, 천천히 해도 돼</span>
                        </div>
                      </div>
                    </div>
                    <div className="k-drama-hero-card__feed-actions">
                      <span>
                        <i className="k-drama-hero-card__feed-action-icon">♡</i>
                        <small>12K</small>
                      </span>
                      <span>
                        <i className="k-drama-hero-card__feed-action-icon">◯</i>
                        <small>342</small>
                      </span>
                      <span>
                        <i className="k-drama-hero-card__feed-action-icon">
                          <svg viewBox="0 0 24 24" aria-hidden="true">
                            <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" />
                          </svg>
                        </i>
                        <small>Save</small>
                      </span>
                    </div>
                    <div className="k-drama-hero-card__progress" />
                  </div>
                </div>
              </div>
            </Hero>
          </div>
          <div id="proof">
            <KDramaProofStrip items={content.proofChecks} title={t("proof.title")} />
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
                  <div className="k-drama-feature-composition">
                    {featureVisuals[feature.id as keyof typeof featureVisuals]}
                    {feature.id === "shortform" ? (
                      <KDramaShortformHighlights items={content.shortformHighlights} />
                    ) : null}
                    <ButtonLink
                      className="shared-feature__early-access-cta"
                      variant="text"
                      href="/k-drama/early-access"
                      data-testid={sharedFeatureTestIds.earlyAccessCta(featureTestId)}
                      onClick={() => trackFeatureCta(feature.id)}
                    >
                      Get early access
                    </ButtonLink>
                  </div>
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
