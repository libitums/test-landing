import { useEffect, useRef, useState } from "react";
import type { I18nRuntime } from "@landing/contracts/i18n";

export function KCultureFeatureTwo({ t }: { t: I18nRuntime["translate"] }) {
  const situations = [
    {
      className: "food",
      src: "/images/feature-02/food.png",
      cardSrc: "/images/feature-02/how-to-order.png",
      label: "Food",
      title: t("visual.two.food.title"),
      prompt: t("visual.two.food.prompt"),
      action: t("visual.two.food.action"),
    },
    {
      className: "phone",
      src: "/images/feature-02/phone.png",
      cardSrc: "/images/feature-02/idol-fansign-practice.png",
      label: "Phone",
      title: t("visual.two.fansign.title"),
      prompt: t("visual.two.fansign.prompt"),
      action: t("visual.two.fansign.action"),
    },
    {
      className: "school",
      src: "/images/feature-02/school.png",
      cardSrc: "/images/feature-02/school-life-lesson.png",
      label: "School",
      title: t("visual.two.school.title"),
      prompt: t("visual.two.school.prompt"),
      action: t("visual.two.school.action"),
    },
  ] as const;
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : (situations[activeIndex] ?? situations[2]!);

  useEffect(() => {
    const stage = stageRef.current;
    const timers: number[] = [];
    if (stage === null) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      setActiveIndex(2);
      return;
    }
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        const cardChangeTimes = [1400, 3200, 5000];
        [2, 1, 0].forEach((index, order) => {
          timers.push(window.setTimeout(() => setActiveIndex(index), cardChangeTimes[order]));
        });
        observer.disconnect();
      },
      { threshold: 0.25 },
    );
    observer.observe(stage);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <div
      ref={stageRef}
      className={`k-feature-two__stage${isVisible ? " k-feature-two__stage--visible" : ""}`}
      aria-hidden="true"
    >
      <div className="k-feature-two__lesson-phone">
        <div className="k-feature-two__notch">
          <i />
          <b />
        </div>
        <div className="k-feature-two__lesson-card">
          {active === null ? (
            <div className="k-feature-two__skeleton" aria-label={t("visual.two.loading")}>
              <i className="k-feature-two__skeleton-title" />
              <i className="k-feature-two__skeleton-subtitle" />
              <i className="k-feature-two__skeleton-image" />
              <i className="k-feature-two__skeleton-button" />
            </div>
          ) : (
            <>
              <div className="k-feature-two__lesson-copy">
                <h3 key={active.title}>{active.title}</h3>
                <p key={active.prompt}>{active.prompt}</p>
              </div>
              <img key={active.cardSrc} src={active.cardSrc} alt="" width={177} height={138} />
              <div className="k-feature-two__lesson-button">
                {active.action} <span>→</span>
              </div>
            </>
          )}
        </div>
      </div>
      {situations.map((situation) => (
        <div
          key={situation.className}
          className={`k-feature-two__situation k-feature-two__situation--${situation.className}`}
        >
          <img src={situation.src} alt={situation.label} width={68} height={68} />
        </div>
      ))}
    </div>
  );
}
