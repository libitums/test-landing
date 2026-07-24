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
import { usePrefersReducedMotion } from "./usePrefersReducedMotion";

interface ShortformPhoneContentProps {
  autoStart: boolean;
  /** Skip the count-in and settle straight into the recording end state. */
  settleImmediately: boolean;
}

function ShortformPhoneContent({ autoStart, settleImmediately }: ShortformPhoneContentProps) {
  const [countdown, setCountdown] = useState(autoStart && !settleImmediately ? 3 : 0);
  const [isRecording, setIsRecording] = useState(autoStart && settleImmediately);

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
        <span className="k-drama-feature__challenge-listen">
          <Volume2 aria-hidden="true" /> Hear original
        </span>
      </div>
      {isRecording ? (
        <div className="k-drama-feature__challenge-capture">
          <div className="k-drama-feature__challenge-wave">
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
            <span className="k-drama-feature__challenge-action">
              <RotateCcw aria-hidden="true" />
            </span>
            <span className="k-drama-feature__challenge-action is-recording">
              <i />
            </span>
            <span className="k-drama-feature__challenge-action">
              <Send aria-hidden="true" />
            </span>
          </div>
          <strong>Finish your take and share the challenge</strong>
        </div>
      ) : (
        <div className="k-drama-feature__challenge-start">
          <span className="k-drama-feature__challenge-trigger">
            <i />
          </span>
          <strong>Tap to start your challenge</strong>
        </div>
      )}
      {countdown > 0 ? (
        <div className="k-drama-feature__challenge-countdown">
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
          <strong>@baetter.korean</strong>
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

/**
 * Feature 03 short-form composition.
 *
 * This is a decorative illustration of the product UI, not the product itself,
 * so the root carries `aria-hidden="true"` like the other two feature visuals.
 * Its phone chrome is therefore built from non-interactive elements: `aria-hidden`
 * hides content from assistive technology but does *not* remove it from the tab
 * order, so real `<button>`s here would strand keyboard users on controls their
 * screen reader cannot see (axe `aria-hidden-focus`, WCAG 2.1 AA 4.1.2). None of
 * these mockup controls expose real functionality — the whole sequence is
 * timer-driven — so non-interactive elements are the honest markup.
 */
export function KDramaShortformFeature() {
  const [sequenceStep, setSequenceStep] = useState(0);
  const [challengeRun, setChallengeRun] = useState(0);
  const [sequenceCycle, setSequenceCycle] = useState(0);
  const prefersReducedMotion = usePrefersReducedMotion();

  useEffect(() => {
    if (prefersReducedMotion) {
      // Settle on the fully composed frame instead of looping the sequence.
      setSequenceStep(2);
      setChallengeRun(1);
      return;
    }
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
  }, [sequenceCycle, prefersReducedMotion]);

  return (
    <div className="k-drama-feature k-drama-feature--shortform" aria-hidden="true">
      <div className="k-drama-feature__shortform-devices">
        <div className="k-drama-feature__phone k-drama-feature__phone--shortform-secondary">
          <ShortformPhoneContent
            key={`${sequenceCycle}-${challengeRun}`}
            autoStart={challengeRun > 0 && sequenceStep === 2}
            settleImmediately={prefersReducedMotion}
          />
        </div>
        <div className="k-drama-feature__phone k-drama-feature__phone--shortform">
          <YoutubeShortsPhoneContent sequenceStep={sequenceStep} />
        </div>
      </div>
    </div>
  );
}
