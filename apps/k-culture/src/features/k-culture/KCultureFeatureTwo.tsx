import { useEffect, useRef, useState } from "react";

const situations = [
  { className: "food", src: "/images/feature-02/food.png", cardSrc: "/images/feature-02/how-to-order.png", label: "Food", title: "How to order?", prompt: "How do you order in Korea?", action: "Start the lesson" },
  { className: "phone", src: "/images/feature-02/phone.png", cardSrc: "/images/feature-02/idol-fansign-practice.png", label: "Phone", title: "Practice a fansign", prompt: "What will you say to your bias?", action: "Start practicing" },
  { className: "school", src: "/images/feature-02/school.png", cardSrc: "/images/feature-02/school-life-lesson.png", label: "School", title: "School life basics", prompt: "Ready for your first day?", action: "Start the lesson" },
] as const;

export function KCultureFeatureTwo() {
  const stageRef = useRef<HTMLDivElement>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const active = activeIndex === null ? null : situations[activeIndex] ?? situations[2]!;

  useEffect(() => {
    const stage = stageRef.current;
    const timers: number[] = [];
    if (stage === null) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      setActiveIndex(2);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsVisible(true);
      const cardChangeTimes = [1400, 3200, 5000];
      [2, 1, 0].forEach((index, order) => {
        timers.push(window.setTimeout(() => setActiveIndex(index), cardChangeTimes[order]));
      });
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(stage);
    return () => {
      observer.disconnect();
      timers.forEach(window.clearTimeout);
    };
  }, []);

  return (
    <div ref={stageRef} className={`k-feature-two__stage${isVisible ? " k-feature-two__stage--visible" : ""}`} aria-hidden="true">
      <div className="k-feature-two__lesson-phone">
        <div className="k-feature-two__notch"><i /><b /></div>
        <div className="k-feature-two__lesson-card">
          {active === null ? (
            <div className="k-feature-two__skeleton" aria-label="Loading lesson">
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
              <img key={active.cardSrc} src={active.cardSrc} alt="" />
              <div className="k-feature-two__lesson-button">{active.action} <span>→</span></div>
            </>
          )}
        </div>
      </div>
      {situations.map((situation) => (
        <div key={situation.className} className={`k-feature-two__situation k-feature-two__situation--${situation.className}`}>
          <img src={situation.src} alt={situation.label} />
        </div>
      ))}
    </div>
  );
}
