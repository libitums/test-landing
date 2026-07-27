import { useEffect, useRef, useState } from "react";
import type { I18nRuntime } from "@landing/contracts/i18n";

type Translate = I18nRuntime["translate"];

function SpeakerIcon() {
  return <span className="k-feature-one__speaker">◖))</span>;
}

function GuidePhone({ t }: { t: Translate }) {
  return (
    <div className="k-feature-one__device k-feature-one__device--guide">
      <div className="k-feature-one__guide-handle" />
      <div className="k-feature-one__guide-nav"><b>GUIDE</b><SpeakerIcon /></div>
      <h3>Lucky Vicky</h3>
      <p className="k-feature-one__pronunciation">럭키비키&nbsp; · &nbsp;leok-ki-bi-ki</p>
      <div className="k-feature-one__word-row">
        <div><strong>Lucky</strong><span>{t("visual.one.goodFortune")}</span></div>
        <i>＋</i>
        <div><strong>Vicky</strong><span>{t("visual.one.englishName")}</span></div>
      </div>
      <div className="k-feature-one__guide-dialog">
        <span className="k-feature-one__dog">🐶</span>
        <div>
          <b>{t("visual.one.definition")}</b>
          <p>{t("visual.one.example")}</p>
        </div>
      </div>
      <div className="k-feature-one__guide-button">{t("visual.one.confirm")} <span>✓</span></div>
    </div>
  );
}

function MemePhone({ t }: { t: Translate }) {
  return (
    <div className="k-feature-one__device k-feature-one__device--meme">
      <div className="k-feature-one__notch"><i /><b /></div>
      <div className="k-feature-one__promo-grid">
        {Array.from({ length: 7 }, (_, index) => <i key={`v-${index}`} />)}
        <i className="horizontal-one" /><i className="horizontal-two" />
        <div className="k-feature-one__promo-copy">
          <span>Meme Shorts</span>
          <strong>{t("visual.one.bannerTitle")}</strong>
          <p>{t("visual.one.bannerDescription")}</p>
        </div>
        <img src="/images/study-dog-character-v6.png" alt="" />
      </div>
      <strong className="k-feature-one__content-title">Shorts Meme</strong>
      <div className="k-feature-one__streak">♨ <span>{t("visual.one.likes")}</span></div>
      <div className="k-feature-one__caption">
        <strong>Meme title</strong>
        <div><span>Dead</span><span>0:42</span></div>
        <p>{t("visual.one.instruction")}</p>
      </div>
      <div className="k-feature-one__shadow-button"><span>♩</span> {t("visual.one.shadow")}</div>
      <small>be hind the meme</small>
      <div className="k-feature-one__progress"><i /></div>
      <div className="k-feature-one__home" />
    </div>
  );
}

export function KCultureFeatureOne({ t }: { t: Translate }) {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null || isVisible) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { threshold: 0.25 },
    );

    observer.observe(stage);
    return () => observer.disconnect();
  }, [isVisible]);

  return (
    <div
      ref={stageRef}
      className={`k-feature-one__stage${isVisible ? " k-feature-one__stage--visible" : ""}`}
      aria-hidden="true"
    >
      <GuidePhone t={t} />
      <MemePhone t={t} />
    </div>
  );
}
