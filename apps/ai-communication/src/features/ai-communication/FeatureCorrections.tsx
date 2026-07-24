import type { I18nRuntime } from "@landing/contracts/i18n";
import { sharedFeatureTestIds } from "@landing/contracts/shared-feature";
import { ButtonLink, SharedFeatureTemplate } from "@landing/ui";

/**
 * ai-communication Feature 02 — "Build your own sentences, Get instant
 * corrections." Bespoke two-column feature section reproducing the "Baetter
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

function VoiceCard({ t }: { t: I18nRuntime["translate"] }) {
  return (
    <div className="feature-corrections__card feature-corrections__voice">
      <div className="feature-corrections__wave">
        <span />
        <span />
        <span />
        <span />
      </div>
      <p className="feature-corrections__voice-text">{t("feature.corrections.voice")}</p>
    </div>
  );
}

function ChatCard({ t }: { t: I18nRuntime["translate"] }) {
  return (
    <div className="feature-corrections__card feature-corrections__chat">
      <span className="feature-corrections__bubble feature-corrections__bubble--outline">
        {t("feature.corrections.question")}
      </span>
      <span className="feature-corrections__reply">
        <span className="feature-corrections__typing" aria-hidden="true">
          <span className="feature-corrections__dot" />
          <span className="feature-corrections__dot" />
          <span className="feature-corrections__dot" />
        </span>
        <span className="feature-corrections__bubble feature-corrections__bubble--fill">
          {t("feature.corrections.answer")}
        </span>
      </span>
    </div>
  );
}

function CorrectionCard({ t }: { t: I18nRuntime["translate"] }) {
  return (
    <div className="feature-corrections__chatroom">
      <div className="feature-corrections__cr-thread">
        <span className="feature-corrections__cr-msg feature-corrections__cr-msg--in">
          {t("feature.corrections.question")}
        </span>
        <span className="feature-corrections__cr-msg feature-corrections__cr-msg--out">
          {t("feature.corrections.answer")}
        </span>
      </div>
      <div className="feature-corrections__feedback">
        <span className="feature-corrections__feedback-label">
          {t("feature.corrections.feedback")}
        </span>
        <p className="feature-corrections__phrase-old">{t("feature.corrections.answer")}</p>
        <p className="feature-corrections__phrase-new">
          <span className="feature-corrections__phrase-arrow">
            <ArrowGlyph />
          </span>
          {t("feature.corrections.improved")}
        </p>
        <p className="feature-corrections__explain">{t("feature.corrections.explanation")}</p>
      </div>
    </div>
  );
}

export interface FeatureCorrectionsProps {
  t: I18nRuntime["translate"];
  earlyAccessHref?: string;
  onEarlyAccess: () => void;
}

export function FeatureCorrections({
  t,
  earlyAccessHref = "/ai-communication/early-access",
  onEarlyAccess,
}: FeatureCorrectionsProps) {
  const featureId = "ai-communication-corrections";
  return (
    <SharedFeatureTemplate
      appearance="soft"
      numberLabel={t("feature.corrections.number")}
      headerText={t("feature.corrections.title")}
      subheaderText={t("feature.corrections.description")}
      testId={sharedFeatureTestIds.root(featureId)}
    >
      <div className="feature-corrections">
        <div className="feature-corrections__visual" aria-hidden="true">
          <VoiceCard t={t} />
          <ChatCard t={t} />
          <CorrectionCard t={t} />
        </div>
        <ButtonLink
          className="shared-feature__early-access-cta"
          variant="text"
          href={earlyAccessHref}
          data-testid={sharedFeatureTestIds.earlyAccessCta(featureId)}
          onClick={onEarlyAccess}
        >
          {t("feature.cta")}
        </ButtonLink>
      </div>
    </SharedFeatureTemplate>
  );
}
