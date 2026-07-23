import {
  Camera,
  Heart,
  MessageCircle,
  RotateCcw,
  Repeat2,
  Send,
  Share2,
  ThumbsDown,
  Trophy,
  Volume2,
  X,
} from "lucide-react";
import { useEffect, useState } from "react";

interface ShadowingPhoneContentProps {
  imageSrc: string;
  captionWords: readonly string[];
  romanizationWords: readonly string[];
}

function ShadowingPhoneContent({
  imageSrc,
  captionWords,
  romanizationWords,
}: ShadowingPhoneContentProps) {
  return (
    <div className="k-drama-feature__phone-content">
      <div className="k-drama-feature__phone-header">
        <strong>오징어 게임1: Squid Game 2</strong>
        <span>🔥 연속 챌린지 2회 달성</span>
      </div>
      <div className="k-drama-feature__scene k-drama-feature__scene--night">
        <img src={imageSrc} alt="" />
        <div className="k-drama-feature__scene-caption">
          <strong>
            {captionWords.map((word) => (
              <span key={word}>{word} </span>
            ))}
          </strong>
          <span className="k-drama-feature__romanization">
            {romanizationWords.map((word) => (
              <i key={word}>{word} </i>
            ))}
          </span>
          <div className="k-drama-feature__scene-words">
            {captionWords.map((word) => (
              <i key={word}>{word}</i>
            ))}
          </div>
        </div>
        <div className="k-drama-feature__player-controls">
          <div className="k-drama-feature__player-time">
            <span>0:14</span>
            <span>0:42</span>
          </div>
          <div className="k-drama-feature__player-progress" />
          <div className="k-drama-feature__player-actions">
            <span className="is-active" title="다시 재생">↻</span>
            <span title="뒤로 가기">
              <i className="k-drama-feature__rewind-icon" />
            </span>
            <span title="중지">■</span>
            <span title="재생">▶</span>
            <span className="is-active" title="챌린지">
              <svg className="k-drama-feature__challenge-icon" viewBox="0 0 24 24">
                <path d="M8 4h8v4a4 4 0 0 1-8 0V4Z" />
                <path d="M8 6H5v1a4 4 0 0 0 4 4M16 6h3v1a4 4 0 0 1-4 4M12 12v4M9 20h6M10 16h4" />
              </svg>
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}

export function KDramaDualSubtitleFeature() {
  return (
    <div className="k-drama-feature k-drama-feature--subtitles" aria-hidden="true">
      <div className="k-drama-feature__phone k-drama-feature__phone--secondary">
        <ShadowingPhoneContent
          imageSrc="/images/image-3.png"
          captionWords={["Smooth", "like", "butter"]}
          romanizationWords={["스무스", "라이크", "버터"]}
        />
      </div>
      <div className="k-drama-feature__side-actions">
        <span><svg viewBox="0 0 24 24"><rect x="9" y="3" width="6" height="11" rx="3" /><path d="M5 11a7 7 0 0 0 14 0M12 18v3M9 21h6" /></svg></span>
        <span><svg viewBox="0 0 24 24"><path d="M6 9a6 6 0 1 1 12 0c0 5-5 4-5 9a3 3 0 0 1-6 0M10 9a2 2 0 0 1 4 0c0 2-2 2-2 4" /></svg></span>
        <span><svg viewBox="0 0 24 24"><path d="M6 4a2 2 0 0 1 2-2h8a2 2 0 0 1 2 2v18l-6-4-6 4Z" /></svg></span>
        <span><svg viewBox="0 0 24 24"><path d="M7 10v11H3V10h4ZM7 19h10a2 2 0 0 0 2-1.7l1-6A2 2 0 0 0 18 9h-4l1-4-2-2-6 7" /></svg></span>
        <span><svg viewBox="0 0 24 24"><path d="M7 14V3H3v11h4ZM7 5h10a2 2 0 0 1 2 1.7l1 6A2 2 0 0 1 18 15h-4l1 4-2 2-6-7" /></svg></span>
        <span><svg viewBox="0 0 24 24"><path d="M4 12a8 8 0 1 0 2.3-5.7L4 8M4 3v5h5" /></svg></span>
      </div>
      <div className="k-drama-feature__phone k-drama-feature__phone--primary">
        <ShadowingPhoneContent
          imageSrc="/images/image-2.png"
          captionWords={["무궁화", "꽃이", "피었습니다"]}
          romanizationWords={["Mugunghwa", "kkochi", "pieotseumnida"]}
        />
      </div>
    </div>
  );
}

export function KDramaYoutubeLessonFeature() {
  return (
    <div className="k-drama-feature k-drama-feature--youtube" aria-hidden="true">
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--url">
        <small className="k-drama-feature__url-heading">URL EMBED</small>
        <strong className="k-drama-feature__url-description">
          Paste the YouTube link you want to study.
        </strong>
        <div className="k-drama-feature__url-input">
          <span className="k-drama-feature__youtube-mark">▶</span>
          <span className="k-drama-feature__url-value">youtube.com/shorts/k-drama</span>
        </div>
        <span className="k-drama-feature__url-submit">Create lesson</span>
      </div>
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--progress">
        <img className="k-drama-feature__download-image" src="/images/image-2.png" alt="" />
        <div className="k-drama-feature__download-overlay">
          <div className="k-drama-feature__lesson-progress">
            <div className="k-drama-feature__download-core">
              <span className="k-drama-feature__youtube-mark">▶</span>
            </div>
          </div>
        </div>
      </div>
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--lesson">
        <div className="k-drama-feature__lesson-skeleton">
          <span />
          <span />
          <span />
          <span />
        </div>
        <span className="k-drama-feature__lesson-chip">K-drama</span>
        <div className="k-drama-feature__lesson-scene" />
        <strong>무궁화 꽃이 피었습니다</strong>
        <small className="k-drama-feature__lesson-romanization">
          Mugunghwa kkochi pieotseumnida
        </small>
        <div className="k-drama-feature__lesson-lines">
          <span />
          <span />
          <span />
        </div>
      </div>
      <div className="k-drama-feature__youtube-box k-drama-feature__youtube-box--library">
        <div className="k-drama-feature__library-header">
          <strong>Save lessons</strong>
          <span>전체보기 &gt;</span>
        </div>
        <div className="k-drama-feature__saved-cards">
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-2.png" alt="" />
            <div className="k-drama-feature__saved-skeleton">
              <span />
              <span />
              <span />
            </div>
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>Squid Game</strong><span>🔥 4회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>무궁화 꽃이 피었습니다</strong>
                <small>Mugunghwa kkochi pieotseumnida</small>
                <div><i>무궁화</i><i>꽃이</i><i>피었습니다</i></div>
              </div>
            </div>
          </div>
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-3.png" alt="" />
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>BTS · Butter</strong><span>🔥 7회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>오늘 무대 최고였어</strong>
                <small>Oneul mudae choegoyeosseo</small>
                <div><i>오늘</i><i>무대</i><i>최고였어</i></div>
              </div>
            </div>
          </div>
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-7.png" alt="" />
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>Weak Hero</strong><span>🔥 3회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>끝까지 포기하지 마</strong>
                <small>Kkeutkkaji pogihaji ma</small>
                <div><i>끝까지</i><i>포기하지</i><i>마</i></div>
              </div>
            </div>
          </div>
          <div className="k-drama-feature__saved-card">
            <img src="/images/image-8.png" alt="" />
            <div className="k-drama-feature__saved-overlay">
              <div className="k-drama-feature__saved-heading">
                <strong>Daily Korean</strong><span>🔥 5회 들음</span>
              </div>
              <div className="k-drama-feature__saved-caption">
                <strong>오늘도 좋은 하루 보내세요</strong>
                <small>Oneuldo joeun haru bonaeseyo</small>
                <div><i>오늘도</i><i>좋은 하루</i><i>보내세요</i></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

interface ShortformPhoneContentProps {
  challengeRun: number;
  sequenceStep: number;
}

function ShortformPhoneContent({ challengeRun, sequenceStep }: ShortformPhoneContentProps) {
  const [countdown, setCountdown] = useState(0);
  const [isRecording, setIsRecording] = useState(false);

  useEffect(() => {
    if (challengeRun === 0) return;
    setIsRecording(false);
    setCountdown(3);
  }, [challengeRun]);

  useEffect(() => {
    if (sequenceStep !== 0) return;
    setIsRecording(false);
    setCountdown(0);
  }, [sequenceStep]);

  useEffect(() => {
    if (countdown === 0) return;

    const timer = window.setTimeout(() => {
      if (countdown === 1) {
        setCountdown(0);
        setIsRecording(true);
        return;
      }
      setCountdown((current) => current - 1);
    }, 700);

    return () => window.clearTimeout(timer);
  }, [countdown]);

  return (
    <div className="k-drama-feature__shortform-content">
        <img className="k-drama-feature__challenge-camera" src="/images/image-8.png" alt="" />
        <div className="k-drama-feature__challenge-shade" />
        <div className="k-drama-feature__challenge-toolbar">
          <span><X aria-hidden="true" /></span>
          <strong><Trophy aria-hidden="true" /> Speaking Challenge</strong>
          <span><Camera aria-hidden="true" /></span>
        </div>
        <div className="k-drama-feature__challenge-guide">
          <span>Repeat after the scene</span>
          <strong>아저씨 사랑해요</strong>
          <small>Ajeossi, saranghaeyo · Mister, I love you</small>
          <button type="button"><Volume2 aria-hidden="true" /> Hear original</button>
        </div>
        {isRecording ? (
          <div className="k-drama-feature__challenge-capture">
            <div className="k-drama-feature__challenge-wave" aria-hidden="true">
              <i /><i /><i /><i /><i /><i /><i />
            </div>
            <small><i /> REC&nbsp;&nbsp;00:08</small>
            <div>
              <button type="button" aria-label="Record again" onClick={() => setIsRecording(false)}><RotateCcw aria-hidden="true" /></button>
              <button className="is-recording" type="button" aria-label="Stop recording"><i /></button>
              <button type="button" aria-label="Share challenge"><Send aria-hidden="true" /></button>
            </div>
            <strong>Finish your take and share the challenge</strong>
          </div>
        ) : (
          <div className="k-drama-feature__challenge-start">
            <button type="button" onClick={() => setCountdown(3)} disabled={countdown > 0}>
              <i />
            </button>
            <strong>Tap to start your challenge</strong>
          </div>
        )}
        {countdown > 0 ? (
          <div className="k-drama-feature__challenge-countdown" aria-live="polite">
            <span key={countdown}>{countdown}</span>
            <small>Get ready</small>
          </div>
        ) : null}
    </div>
  );
}

interface YoutubeShortsPhoneContentProps {
  sequenceStep: number;
}

function YoutubeShortsPhoneContent({ sequenceStep }: YoutubeShortsPhoneContentProps) {
  return (
    <div className="k-drama-feature__shorts-screen">
      <div className={`k-drama-feature__shorts-slides${sequenceStep > 0 ? " is-current" : " is-resetting"}`}>
        <div className="k-drama-feature__shorts-slide">
          <img src="/images/image-9.png" alt="" />
          <div className="k-drama-feature__shorts-preview-caption">
            <strong>Pick up Korean from every scene</strong>
            <small>Swipe for your next phrase</small>
          </div>
        </div>
        <div className="k-drama-feature__shorts-slide">
          <img src="/images/image-8.png" alt="" />
        </div>
      </div>
      <div className="k-drama-feature__shorts-header">
        <div>
          <strong>Short Feed</strong>
          <span>🔥 5-day learning streak</span>
        </div>
        <span>⌕ · ▣</span>
      </div>
      <div className={`k-drama-feature__shorts-actions${sequenceStep > 1 ? " is-clicking" : ""}`}>
        <span className="is-challenge"><Trophy aria-hidden="true" /><small>Challenge</small></span>
        <span><Heart aria-hidden="true" /><small>12K</small></span>
        <span><ThumbsDown aria-hidden="true" /><small>Dislike</small></span>
        <span><MessageCircle aria-hidden="true" /><small>342</small></span>
        <span><Share2 aria-hidden="true" /><small>Share</small></span>
        <span><Repeat2 aria-hidden="true" /><small>Remix</small></span>
      </div>
      <div className={`k-drama-feature__shorts-caption${sequenceStep > 0 ? " is-visible" : ""}`}>
        <div><strong>@talkie.korean</strong><span>Learn</span></div>
        <strong>Learn today&apos;s phrase from this scene: 아저씨 사랑해요</strong>
        <small>Ajeossi, saranghaeyo · Mister, I love you</small>
        <p>#LearnKorean #SceneLearning #Kdrama</p>
      </div>
      <div className="k-drama-feature__shorts-progress" />
    </div>
  );
}

export function KDramaShortformFeature() {
  const [sequenceStep, setSequenceStep] = useState(0);
  const [challengeRun, setChallengeRun] = useState(0);
  const [sequenceCycle, setSequenceCycle] = useState(0);

  useEffect(() => {
    const swipeTimer = window.setTimeout(() => setSequenceStep(1), 1600);
    const challengeTimer = window.setTimeout(() => setSequenceStep(2), 3000);
    const recordTimer = window.setTimeout(() => setChallengeRun((run) => run + 1), 3500);
    const restartTimer = window.setTimeout(() => {
      setSequenceStep(0);
      setSequenceCycle((cycle) => cycle + 1);
    }, 9800);

    return () => {
      window.clearTimeout(swipeTimer);
      window.clearTimeout(challengeTimer);
      window.clearTimeout(recordTimer);
      window.clearTimeout(restartTimer);
    };
  }, [sequenceCycle]);

  return (
    <div className="k-drama-feature k-drama-feature--shortform">
      <div className="k-drama-feature__shortform-devices">
        <div className="k-drama-feature__phone k-drama-feature__phone--shortform-secondary">
          <ShortformPhoneContent challengeRun={challengeRun} sequenceStep={sequenceStep} />
        </div>
        <div className="k-drama-feature__phone k-drama-feature__phone--shortform">
          <YoutubeShortsPhoneContent sequenceStep={sequenceStep} />
        </div>
      </div>
    </div>
  );
}
