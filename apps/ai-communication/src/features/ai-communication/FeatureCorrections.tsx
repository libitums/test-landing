/**
 * ai-communication Feature 02 — "Build your own sentences, Get instant
 * corrections." Bespoke two-column feature section reproducing the "Talkie
 * Feature 02" screen in ai-community.pen: copy on the left, and a decorative
 * collage on the right (voice-waveform card, chat-bubble card, and the AI
 * correction card).
 *
 * The visual is decorative (`aria-hidden`); icons are inline SVG.
 */
function ArrowGlyph() {
  return (
    <svg
      viewBox="0 0 24 24"
      className="feature-corrections__glyph"
      aria-hidden="true"
      focusable="false"
      fill="none"
      stroke="currentColor"
      strokeWidth={2}
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <path d="M5 12h14M13 6l6 6-6 6" />
    </svg>
  );
}

function VoiceCard() {
  return (
    <div className="feature-corrections__card feature-corrections__voice">
      <div className="feature-corrections__wave">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p className="feature-corrections__voice-text">&ldquo;지금 어디야?&rdquo;</p>
    </div>
  );
}

function ChatCard() {
  return (
    <div className="feature-corrections__card feature-corrections__chat">
      <span className="feature-corrections__bubble feature-corrections__bubble--outline">
        어디야?
      </span>
      <span className="feature-corrections__reply">
        <span className="feature-corrections__typing" aria-hidden="true">
          <span className="feature-corrections__dot" />
          <span className="feature-corrections__dot" />
          <span className="feature-corrections__dot" />
        </span>
        <span className="feature-corrections__bubble feature-corrections__bubble--fill">
          나지금 오고 있어
        </span>
      </span>
    </div>
  );
}

function CorrectionCard() {
  return (
    <div className="feature-corrections__chatroom">
      <div className="feature-corrections__cr-thread">
        <span className="feature-corrections__cr-msg feature-corrections__cr-msg--in">
          어디야?
        </span>
        <span className="feature-corrections__cr-msg feature-corrections__cr-msg--out">
          나지금 오고 있어
        </span>
      </div>
      <div className="feature-corrections__feedback">
        <span className="feature-corrections__feedback-label">Better phrasing</span>
        <p className="feature-corrections__phrase-old">나지금 오고 있어</p>
        <p className="feature-corrections__phrase-new">
          <span className="feature-corrections__phrase-arrow">
            <ArrowGlyph />
          </span>
          나 지금 가고 있어(요)
        </p>
        <p className="feature-corrections__explain">
          Add spacing after 나 and use 가고 있어(요) for natural polite roleplay speech.
        </p>
      </div>
    </div>
  );
}

export function FeatureCorrections() {
  return (
    <section className="feature-corrections" aria-labelledby="feature-corrections-title">
      <div className="feature-corrections__inner">
        <div className="feature-corrections__copy">
          <span className="feature-corrections__badge">2</span>
          <h2 className="feature-corrections__headline" id="feature-corrections-title">
            Build your own sentences,
            <br />
            Get instant corrections.
          </h2>
          <p className="feature-corrections__description">
            Not another flashcard drill.
            <br />
            Say what you mean, then see how Koreans would naturally say it.
          </p>
        </div>
        <div className="feature-corrections__visual" aria-hidden="true">
          <VoiceCard />
          <ChatCard />
          <CorrectionCard />
        </div>
      </div>
    </section>
  );
}
