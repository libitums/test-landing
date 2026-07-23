import { sharedFeatureTestIds } from "@landing/contracts/shared-feature";
import { ButtonLink } from "@landing/ui";

/**
 * ai-communication Feature 03 — "Chat with your bias - in Korean."
 * Bespoke two-column feature section reproducing the "Talkie Feature 03"
 * screen in ai-community.pen: copy on the left, and a decorative grid of
 * idol/character persona cards (photo + name + quote + hashtags + learning
 * streak) plus an "add persona" tile on the right.
 *
 * The grid is decorative (`aria-hidden`); photos load via CSS
 * background-image, never `<img>`.
 */
export interface FeatureBiasProps {
  /** Fired when the early-access link is activated. */
  onEarlyAccess: () => void;
}

const PERSONAS = [
  {
    id: "midnight",
    name: "Midnight Whisper",
    quote:
      "On the runway I'm the cold, silent muse. But at midnight I only want to hear you speak Korean.",
    tags: "#SecretLesson #SweetToYou",
    streak: "1000+ Learning",
  },
  {
    id: "offrecord",
    name: "Off the Record Lesson",
    quote:
      "I never smile for the cameras, but I can't stop smiling when I hear you practicing Korean.",
    tags: "#SecretLesson #SweetToYou",
    streak: "500+ Learning",
  },
  {
    id: "order",
    name: "This is an order",
    quote: "Speak Korean with me today. Stay close, follow my lead, and say it in Korean.",
    tags: "#Army #Mission",
    streak: "1000+ Learning",
  },
  {
    id: "closer",
    name: "Come Closer",
    quote:
      "Take your time, my lady. Whatever rests upon your heart, speak it in Korean. I shall remain by your side.",
    tags: "#JoseonDynasty #SweetToYou",
    streak: "500+ Learning",
  },
] as const;

function PersonaCard({ persona }: { persona: (typeof PERSONAS)[number] }) {
  return (
    <div className={`feature-bias__persona feature-bias__persona--${persona.id}`}>
      <span className="feature-bias__streak">💬 {persona.streak}</span>
      <div className="feature-bias__persona-body">
        <p className="feature-bias__persona-name">{persona.name}</p>
        <p className="feature-bias__persona-quote">{persona.quote}</p>
        <p className="feature-bias__persona-tags">{persona.tags}</p>
      </div>
    </div>
  );
}

export function FeatureBias({ onEarlyAccess }: FeatureBiasProps) {
  return (
    <section className="feature-bias" aria-labelledby="feature-bias-title">
      <div className="feature-bias__inner">
        <div className="feature-bias__copy">
          <span className="feature-bias__badge">3</span>
          <h2 className="feature-bias__headline" id="feature-bias-title">
            Chat with your bias
            <br />- in Korean.
          </h2>
          <p className="feature-bias__description">
            Turn fandom into daily practice. Have immersive conversations with idol- and
            character-style personas, and keep coming back because it&apos;s actually fun.
          </p>
          <ButtonLink
            className="shared-feature__early-access-cta feature-bias__cta"
            variant="text"
            href="/ai-communication/early-access"
            data-testid={sharedFeatureTestIds.earlyAccessCta("ai-communication-personas")}
            onClick={onEarlyAccess}
          >
            Get early access
          </ButtonLink>
        </div>
        <div className="feature-bias__visual" aria-hidden="true">
          <div className="feature-bias__chatlist">
            <div className="feature-bias__chatrow">
              <span className="feature-bias__avatar feature-bias__avatar--midnight" />
              <span className="feature-bias__chatrow-body">
                <span className="feature-bias__chatrow-name">Midnight Whisper</span>
                <span className="feature-bias__chatrow-preview">
                  <span className="feature-bias__chatrow-preview-text">오늘은 뭐 배울래?</span>
                </span>
              </span>
            </div>
            <div className="feature-bias__chatrow">
              <span className="feature-bias__avatar feature-bias__avatar--offrecord" />
              <span className="feature-bias__chatrow-body">
                <span className="feature-bias__chatrow-name">Off the Record Lesson</span>
                <span className="feature-bias__chatrow-preview">
                  <span className="feature-bias__chatrow-preview-text">지금 뭐해?</span>
                </span>
              </span>
            </div>
          </div>
          <div className="feature-bias__grid">
            {PERSONAS.map((persona) => (
              <PersonaCard key={persona.id} persona={persona} />
            ))}
          </div>
          <div className="feature-bias__add">
            <svg
              viewBox="0 0 24 24"
              className="feature-bias__add-glyph"
              aria-hidden="true"
              focusable="false"
              fill="none"
              stroke="currentColor"
              strokeWidth={2}
              strokeLinecap="round"
            >
              <path d="M12 5v14M5 12h14" />
            </svg>
          </div>
        </div>
      </div>
    </section>
  );
}
