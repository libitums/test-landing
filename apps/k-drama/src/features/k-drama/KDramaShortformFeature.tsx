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

interface ShortformPhoneContentProps {
  autoStart: boolean;
}

function ShortformPhoneContent({ autoStart }: ShortformPhoneContentProps) {
  const [countdown, setCountdown] = useState(autoStart ? 3 : 0);
  const [isRecording, setIsRecording] = useState(false);

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
        <span>
          <X aria-hidden="true" />
        </span>
        <strong>
          <Trophy aria-hidden="true" /> Speaking Challenge
        </strong>
        <span>
          <Camera aria-hidden="true" />
        </span>
      </div>
      <div className="k-drama-feature__challenge-guide">
        <span>Repeat after the scene</span>
        <strong>아저씨 사랑해요</strong>
        <small>Ajeossi, saranghaeyo · Mister, I love you</small>
        <button type="button">
          <Volume2 aria-hidden="true" /> Hear original
        </button>
      </div>
      {isRecording ? (
        <div className="k-drama-feature__challenge-capture">
          <div className="k-drama-feature__challenge-wave" aria-hidden="true">
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
            <i />
          </div>
          <small>
            <i /> REC&nbsp;&nbsp;00:08
          </small>
          <div>
            <button type="button" aria-label="Record again" onClick={() => setIsRecording(false)}>
              <RotateCcw aria-hidden="true" />
            </button>
            <button className="is-recording" type="button" aria-label="Stop recording">
              <i />
            </button>
            <button type="button" aria-label="Share challenge">
              <Send aria-hidden="true" />
            </button>
          </div>
          <strong>Finish your take and share the challenge</strong>
        </div>
      ) : (
        <div className="k-drama-feature__challenge-start">
          <button
            type="button"
            aria-label="Start speaking challenge"
            onClick={() => setCountdown(3)}
            disabled={countdown > 0}
          >
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
      <div
        className={`k-drama-feature__shorts-slides${sequenceStep > 0 ? " is-current" : " is-resetting"}`}
      >
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
        <span className="is-challenge">
          <Trophy aria-hidden="true" />
          <small>Challenge</small>
        </span>
        <span>
          <Heart aria-hidden="true" />
          <small>12K</small>
        </span>
        <span>
          <ThumbsDown aria-hidden="true" />
          <small>Dislike</small>
        </span>
        <span>
          <MessageCircle aria-hidden="true" />
          <small>342</small>
        </span>
        <span>
          <Share2 aria-hidden="true" />
          <small>Share</small>
        </span>
        <span>
          <Repeat2 aria-hidden="true" />
          <small>Remix</small>
        </span>
      </div>
      <div className={`k-drama-feature__shorts-caption${sequenceStep > 0 ? " is-visible" : ""}`}>
        <div>
          <strong>@talkie.korean</strong>
          <span>Learn</span>
        </div>
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
    <div className="k-drama-feature k-drama-feature--shortform" aria-hidden="true">
      <div className="k-drama-feature__shortform-devices">
        <div className="k-drama-feature__phone k-drama-feature__phone--shortform-secondary">
          <ShortformPhoneContent
            key={`${sequenceCycle}-${challengeRun}`}
            autoStart={challengeRun > 0 && sequenceStep === 2}
          />
        </div>
        <div className="k-drama-feature__phone k-drama-feature__phone--shortform">
          <YoutubeShortsPhoneContent sequenceStep={sequenceStep} />
        </div>
      </div>
    </div>
  );
}
