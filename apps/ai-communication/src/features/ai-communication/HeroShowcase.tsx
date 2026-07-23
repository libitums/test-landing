/**
 * Decorative hero media for the ai-communication landing page.
 *
 * Reproduces the "Talkie Landing Hero" media from `ai-community.pen`
 * (role-play conversation + on-the-spot correction): two photo scenario
 * cards, mic/plus capture tiles, and the focal AI correction card. The
 * cards are purely visual — the wrapper exposes a single localized
 * `role="group"` label while every card is `aria-hidden`, so assistive
 * tech announces one preview label instead of decorative micro-copy.
 *
 * Photos are applied as CSS `background-image` (see styles.css), never as
 * `<img>` elements, so the shared Hero's image-free contract holds.
 */
import type { ReactNode } from "react";

export interface HeroShowcaseProps {
  /** Localized accessible name for the media group. */
  label: string;
}

type GlyphProps = { path: string };

function StrokeGlyph({ path }: GlyphProps) {
  return (
    <svg
      viewBox="0 0 24 24"
      className="hero-showcase__glyph"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d={path} />
    </svg>
  );
}

function MicGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="hero-showcase__glyph"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <rect x="9" y="2" width="6" height="12" rx="3" />
      <path d="M5 10a7 7 0 0 0 14 0" />
      <path d="M12 21v-3" />
    </svg>
  );
}

function TranslateGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="hero-showcase__glyph"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="9" />
      <path d="M3 12h18M12 3c2.6 2.7 2.6 15.3 0 18M12 3c-2.6 2.7-2.6 15.3 0 18" />
    </svg>
  );
}

function ScenarioCard({
  variant,
  title,
  tile,
  children,
}: {
  variant: "cosmetic" | "idol";
  title: string;
  tile: "mic" | "plus";
  children?: ReactNode;
}) {
  return (
    <div
      className={`hero-showcase__scene hero-showcase__scene--${variant}`}
      aria-hidden="true"
    >
      <div className="hero-showcase__scene-scrim" />
      <CaptureTile kind={tile} />
      <div className="hero-showcase__scene-body">
        <p className="hero-showcase__scene-title">{title}</p>
        {children}
      </div>
    </div>
  );
}

function CaptureTile({ kind }: { kind: "mic" | "plus" }) {
  return (
    <div className="hero-showcase__tile" aria-hidden="true">
      {kind === "mic" ? <MicGlyph /> : <StrokeGlyph path="M12 5v14M5 12h14" />}
    </div>
  );
}

function CorrectionCard() {
  return (
    <div className="hero-showcase__correction" aria-hidden="true">
      <div className="hero-showcase__bubble hero-showcase__bubble--incoming">지금 어디야?</div>
      <div className="hero-showcase__bubble hero-showcase__bubble--outgoing">나지금 오고 있어</div>
      <div className="hero-showcase__feedback">
        <div className="hero-showcase__feedback-head">
          <span className="hero-showcase__feedback-label">Better phrasing</span>
          <span className="hero-showcase__feedback-rail">
            <StrokeGlyph path="M6 3h12a1 1 0 0 1 1 1v17l-7-4.2L5 21V4a1 1 0 0 1 1-1z" />
            <TranslateGlyph />
          </span>
        </div>
        <p className="hero-showcase__phrase-old">나지금 오고 있어</p>
        <p className="hero-showcase__phrase-new">
          <span className="hero-showcase__phrase-arrow">
            <StrokeGlyph path="M5 12h14M13 6l6 6-6 6" />
          </span>
          나 지금 가고 있어(요)
        </p>
        <p className="hero-showcase__explain">
          Add spacing after 나 and use 가고 있어(요) for natural polite roleplay speech.
        </p>
      </div>
    </div>
  );
}

export function HeroShowcase({ label }: HeroShowcaseProps) {
  return (
    <div className="hero-showcase" role="group" aria-label={label}>
      <div className="hero-showcase__col">
        <ScenarioCard variant="cosmetic" title="Buy cosmetic" tile="mic" />
      </div>
      <div className="hero-showcase__col hero-showcase__col--center">
        <CorrectionCard />
      </div>
      <div className="hero-showcase__col">
        <ScenarioCard variant="idol" title="Off the Record Lesson" tile="plus">
          <p className="hero-showcase__scene-quote">
            &ldquo;I never smile for the cameras, but I can&apos;t stop smiling when I hear you
            practicing Korean. Ready for tonight&apos;s lesson, love?&rdquo;
          </p>
          <p className="hero-showcase__scene-tags">#SecretLesson #SweetToYou</p>
        </ScenarioCard>
      </div>
    </div>
  );
}
