import { useEffect, useRef, useState, type FormEvent } from "react";

const roleplayScenes = [
  { id: "senior", src: "/images/feature-03/senior.png", label: "Senior", tone: "Warm and respectful" },
  { id: "elder", src: "/images/feature-03/elder-professor.png", label: "Elder professor", tone: "Formal honorific Korean" },
  { id: "boss", src: "/images/feature-03/workplace-boss.png", label: "Workplace boss", tone: "Polite and professional" },
] as const;

function expressionFor(role: (typeof roleplayScenes)[number]["id"], message: string) {
  const isSorry = /sorry|apolog/i.test(message);
  const isGreeting = /hello|nice to meet|meet you/i.test(message);
  if (isSorry) {
    if (role === "senior") return "선배님, 정말 미안해요.";
    if (role === "elder") return "정말 죄송합니다.";
    return "죄송합니다. 바로 수정하겠습니다.";
  }
  if (isGreeting) {
    if (role === "senior") return "선배님, 만나서 반가워요!";
    if (role === "elder") return "처음 뵙겠습니다. 만나 뵙게 되어 반갑습니다.";
    return "안녕하세요. 만나 뵙게 되어 반갑습니다.";
  }
  if (role === "senior") return "선배님, 오늘 정말 감사해요!";
  if (role === "elder") return "오늘 정말 감사드립니다.";
  return "오늘 도와주셔서 감사합니다.";
}

export function KCultureFeatureThree() {
  const demoText = "Thank you so much for today";
  const stageRef = useRef<HTMLDivElement>(null);
  const typingTimerRef = useRef<number | null>(null);
  const revealTimerRef = useRef<number | null>(null);
  const [isVisible, setIsVisible] = useState(false);
  const [draft, setDraft] = useState("");
  const [submitted, setSubmitted] = useState("");
  const [revision, setRevision] = useState(0);

  useEffect(() => {
    const stage = stageRef.current;
    if (stage === null) return;
    if (typeof IntersectionObserver === "undefined") {
      setIsVisible(true);
      return;
    }
    const observer = new IntersectionObserver(([entry]) => {
      if (!entry?.isIntersecting) return;
      setIsVisible(true);
      observer.disconnect();
    }, { threshold: 0.25 });
    observer.observe(stage);
    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    if (!isVisible) return;
    let index = 0;
    typingTimerRef.current = window.setInterval(() => {
      index += 1;
      setDraft(demoText.slice(0, index));
      if (index < demoText.length) return;
      if (typingTimerRef.current !== null) window.clearInterval(typingTimerRef.current);
      revealTimerRef.current = window.setTimeout(() => {
        setSubmitted(demoText);
        setRevision((value) => value + 1);
      }, 420);
    }, 65);
    return () => {
      if (typingTimerRef.current !== null) window.clearInterval(typingTimerRef.current);
      if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
    };
  }, [isVisible]);

  const submit = (event: FormEvent) => {
    event.preventDefault();
    const message = draft.trim();
    if (message === "") return;
    setSubmitted(message);
    setRevision((value) => value + 1);
  };

  const editDraft = (value: string) => {
    if (typingTimerRef.current !== null) window.clearInterval(typingTimerRef.current);
    if (revealTimerRef.current !== null) window.clearTimeout(revealTimerRef.current);
    setDraft(value);
  };

  return (
    <div ref={stageRef} className={`k-feature-three__stage${isVisible ? " k-feature-three__stage--visible" : ""}`}>
      <form className="k-feature-three__composer" onSubmit={submit}>
        <label className="k-feature-three__input">
          <span>◯</span>
          <input value={draft} onChange={(event) => editDraft(event.target.value)} aria-label="English meaning to practice" placeholder="Type what you want to say in English" />
        </label>
        <button className="k-feature-three__play" type="submit" aria-label="Show Korean expressions by relationship">▶</button>
      </form>
      <div className="k-feature-three__scenes">
        {roleplayScenes.map((scene) => (
          <div key={scene.id} className={`k-feature-three__scene k-feature-three__scene--${scene.id}`}>
            <img src={scene.src} alt="" />
            <div key={`${scene.id}-${revision}`} className="k-feature-three__scene-panel">
              <span>{scene.label}</span>
              <strong>{submitted === "" ? "…" : expressionFor(scene.id, submitted)}</strong>
              <small>{scene.tone}</small>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
