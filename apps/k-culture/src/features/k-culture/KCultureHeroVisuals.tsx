import { useEffect, useState } from "react";
import type { I18nRuntime } from "@landing/contracts/i18n";

type Translate = I18nRuntime["translate"];

/**
 * Hero media slot.
 *
 * The first card is the k-drama hero's feed card carried over so the two
 * landings read as one family; only the copy differs. Its inner text is
 * `aria-hidden` decoration — the Korean lines are the subject matter being
 * taught rather than interface text, so they stay untranslated and the card
 * exposes a single localized label instead.
 *
 * The second card is feature 02's situations and lesson card at their original
 * proportions, scaled down as a whole rather than re-laid-out, cycling on their
 * own so the hero shows the switch without asking for a click.
 */
export function KCultureHeroVisuals({ t }: { t: Translate }) {
  return (
    <div className="k-hero__visuals" role="group" aria-label={t("hero.preview")} tabIndex={0}>
      <FeedCard t={t} />
      <LessonCard t={t} />
      <RegisterCard t={t} />
    </div>
  );
}

/** Module scope: nothing here depends on the locale, unlike the labels below. */
const registerRows = [
  { id: "friend", src: "/images/feature-03/friend.png", line: "오늘 진짜 고마워!" },
  { id: "elder", src: "/images/feature-03/elder-professor.png", line: "오늘 정말 감사드립니다." },
  { id: "boss", src: "/images/feature-03/workplace-boss.png", line: "오늘 도와주셔서 감사합니다." },
] as const;

/**
 * Feature 03's roleplay scenes reduced to a list: the characters become square
 * thumbnails stacked vertically and their lines arrive beside them in turn, so
 * one meaning shifting across three relationships reads in a single glance.
 */
function RegisterCard({ t }: { t: Translate }) {
  const labels = {
    friend: t("visual.three.friend.label"),
    elder: t("visual.three.elder.label"),
    boss: t("visual.three.boss.label"),
  } as const;

  return (
    <div
      className="k-hero-card k-hero-card--registers"
      role="img"
      aria-label={t("hero.visual.registers")}
    >
      <div className="k-hero-card__content" aria-hidden="true">
        <span className="k-hero-registers__prompt">{t("visual.three.demo")}</span>
        <ul className="k-hero-registers">
          {registerRows.map((row) => (
            <li key={row.id} className="k-hero-registers__row">
              <span
                className={`k-hero-registers__avatar k-hero-registers__avatar--${row.id}`}
                title={labels[row.id]}
              >
                <img src={row.src} alt="" />
              </span>
              <span className="k-hero-registers__bubble">{row.line}</span>
            </li>
          ))}
        </ul>
      </div>
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
                <span className="k-hero-card__feed-chip k-hero-card__feed-chip--topic">
                  K-drama
                </span>
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

function LessonCard({ t }: { t: Translate }) {
  const situations = [
    {
      id: "food",
      src: "/images/feature-02/food.png",
      cardSrc: "/images/feature-02/how-to-order.png",
      title: t("visual.two.food.title"),
      prompt: t("visual.two.food.prompt"),
      action: t("visual.two.food.action"),
    },
    {
      id: "phone",
      src: "/images/feature-02/phone.png",
      cardSrc: "/images/feature-02/idol-fansign-practice.png",
      title: t("visual.two.fansign.title"),
      prompt: t("visual.two.fansign.prompt"),
      action: t("visual.two.fansign.action"),
    },
    {
      id: "school",
      src: "/images/feature-02/school.png",
      cardSrc: "/images/feature-02/school-life-lesson.png",
      title: t("visual.two.school.title"),
      prompt: t("visual.two.school.prompt"),
      action: t("visual.two.school.action"),
    },
  ] as const;
  const [index, setIndex] = useState(0);
  const active = situations[index % situations.length] ?? situations[0];

  useEffect(() => {
    // Nothing to clean up when the visitor asked for less motion: the card just
    // stays on the situation it started with.
    if (window.matchMedia?.("(prefers-reduced-motion: reduce)").matches) return;
    const timer = window.setInterval(() => setIndex((current) => current + 1), 2600);
    return () => window.clearInterval(timer);
  }, []);

  return (
    <div
      className="k-hero-card k-hero-card--lesson"
      role="img"
      aria-label={t("hero.visual.situations")}
    >
      <div className="k-hero-card__content" aria-hidden="true">
        <div className="k-hero-lesson">
          <div className="k-hero-lesson__inner">
            <div className="k-hero-lesson__situations">
              {situations.map((situation) => (
                <div
                  key={situation.id}
                  className={`k-hero-lesson__situation k-hero-lesson__situation--${situation.id}${
                    situation.id === active.id ? " k-hero-lesson__situation--active" : ""
                  }`}
                >
                  <img src={situation.src} alt="" />
                </div>
              ))}
            </div>
            <div className="k-hero-lesson__card">
              <div className="k-hero-lesson__copy">
                <strong key={active.title}>{active.title}</strong>
                <p key={active.prompt}>{active.prompt}</p>
              </div>
              <img key={active.cardSrc} src={active.cardSrc} alt="" />
              <span className="k-hero-lesson__button">
                {active.action} <i>→</i>
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
