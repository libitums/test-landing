import type { I18nRuntime } from "@landing/contracts/i18n";

type Translate = I18nRuntime["translate"];

/**
 * Hero media slot.
 *
 * The card is the k-drama hero's feed card carried over so the two landings
 * read as one family; only the copy differs. Its inner text is `aria-hidden`
 * decoration — the Korean lines are the subject matter being taught rather than
 * interface text, so they stay untranslated and the card exposes a single
 * localized label instead.
 */
export function KCultureHeroVisuals({ t }: { t: Translate }) {
  return (
    <div className="k-hero__visuals">
      <FeedCard t={t} />
    </div>
  );
}

function FeedCard({ t }: { t: Translate }) {
  return (
    <div className="k-hero-card k-hero-card--feed" role="img" aria-label={t("hero.visual.feed")}>
      <div className="k-hero-card__content" aria-hidden="true">
        <div className="k-hero-card__feed-stream">
          <div className="k-hero-card__feed-slides">
            <div className="k-hero-card__feed-slide">
              <strong className="k-hero-card__feed-heading">That meme again?</strong>
              <div className="k-hero-card__feed-chips">
                <span className="k-hero-card__feed-chip k-hero-card__feed-chip--topic">Meme</span>
                <span className="k-hero-card__feed-chip k-hero-card__feed-chip--time">0:03</span>
              </div>
              <span>럭키비키 · leok-ki-bi-ki</span>
            </div>
            <div className="k-hero-card__feed-slide">
              <strong className="k-hero-card__feed-heading">Now say it back</strong>
              <div className="k-hero-card__feed-chips">
                <span className="k-hero-card__feed-chip k-hero-card__feed-chip--topic">K-drama</span>
                <span className="k-hero-card__feed-chip k-hero-card__feed-chip--time">0:08</span>
              </div>
              <span>아 진짜 대박이다</span>
            </div>
          </div>
        </div>
        <div className="k-hero-card__feed-actions">
          <span>
            <i className="k-hero-card__feed-action-icon">♡</i>
            <small>12K</small>
          </span>
          <span>
            <i className="k-hero-card__feed-action-icon">◯</i>
            <small>342</small>
          </span>
          <span>
            <i className="k-hero-card__feed-action-icon">
              <svg viewBox="0 0 24 24" aria-hidden="true">
                <path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" />
              </svg>
            </i>
            <small>Save</small>
          </span>
        </div>
        <div className="k-hero-card__progress" />
      </div>
    </div>
  );
}
