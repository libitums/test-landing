import { sharedFeatureTestIds } from "@landing/contracts/shared-feature";
import type { I18nRuntime } from "@landing/contracts/i18n";
import { ButtonLink, SharedFeatureTemplate } from "@landing/ui";

/**
 * ai-communication Feature 03 — "Chat with your bias - in Korean."
 * Bespoke two-column feature section reproducing the "Baetter Feature 03"
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
  t: I18nRuntime["translate"];
  earlyAccessHref?: string;
}

const PERSONA_IDS = ["midnight", "offrecord", "order", "closer"] as const;

function PersonaCard({ id, t }: { id: (typeof PERSONA_IDS)[number]; t: I18nRuntime["translate"] }) {
  return (
    <div className={`feature-bias__persona feature-bias__persona--${id}`}>
      <span className="feature-bias__streak">💬 {t(`feature.bias.persona.${id}.streak`)}</span>
      <div className="feature-bias__persona-body">
        <p className="feature-bias__persona-name">{t(`feature.bias.persona.${id}.name`)}</p>
        <p className="feature-bias__persona-quote">{t(`feature.bias.persona.${id}.quote`)}</p>
        <p className="feature-bias__persona-tags">{t(`feature.bias.persona.${id}.tags`)}</p>
      </div>
    </div>
  );
}

export function FeatureBias({
  t,
  earlyAccessHref = "#early-access",
  onEarlyAccess,
}: FeatureBiasProps) {
  const featureId = "ai-communication-personas";
  const benefits = [
    t("feature.bias.benefit.one"),
    t("feature.bias.benefit.two"),
    t("feature.bias.benefit.three"),
  ];
  return (
    <SharedFeatureTemplate
      appearance="white"
      numberLabel={t("feature.bias.number")}
      headerText={t("feature.bias.title")}
      subheaderText={t("feature.bias.description")}
      testId={sharedFeatureTestIds.root(featureId)}
    >
      <div className="feature-bias">
        <div className="feature-bias__details">
          <ButtonLink
            className="shared-feature__early-access-cta feature-bias__cta"
            variant="text"
            href={earlyAccessHref}
            data-testid={sharedFeatureTestIds.earlyAccessCta(featureId)}
            onClick={onEarlyAccess}
          >
            {t("feature.cta")}
          </ButtonLink>
          <ul className="feature-bias__benefits">
            {benefits.map((benefit) => (
              <li key={benefit} className="feature-bias__benefit">
                {benefit}
              </li>
            ))}
          </ul>
        </div>
        <div className="feature-bias__media">
          <div className="feature-bias__visual" aria-hidden="true">
            <div className="feature-bias__chatlist">
              <div className="feature-bias__chatrow">
                <span className="feature-bias__avatar feature-bias__avatar--midnight" />
                <span className="feature-bias__chatrow-body">
                  <span className="feature-bias__chatrow-name">
                    {t("feature.bias.persona.midnight.name")}
                  </span>
                  <span className="feature-bias__chatrow-preview">
                    <span className="feature-bias__chatrow-preview-text">
                      {t("feature.bias.chat.midnight")}
                    </span>
                  </span>
                </span>
              </div>
              <div className="feature-bias__chatrow">
                <span className="feature-bias__avatar feature-bias__avatar--offrecord" />
                <span className="feature-bias__chatrow-body">
                  <span className="feature-bias__chatrow-name">
                    {t("feature.bias.persona.offrecord.name")}
                  </span>
                  <span className="feature-bias__chatrow-preview">
                    <span className="feature-bias__chatrow-preview-text">
                      {t("feature.bias.chat.offrecord")}
                    </span>
                  </span>
                </span>
              </div>
            </div>
            <div className="feature-bias__grid">
              {PERSONA_IDS.map((id) => (
                <PersonaCard key={id} id={id} t={t} />
              ))}
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
        </div>
      </div>
    </SharedFeatureTemplate>
  );
}
