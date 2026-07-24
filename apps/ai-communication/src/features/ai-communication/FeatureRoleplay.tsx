/**
 * ai-communication Feature 01 — "Role-play the situations you'll actually
 * be in". Bespoke two-column feature section reproducing the "Baetter
 * Feature 01" screen in ai-community.pen: copy + lavender pill list on the
 * left, and a decorative visual (iPhone role-play mockup, action rail,
 * scenario cards, tags) on the right.
 *
 * The visual is decorative (`aria-hidden`); photos load via CSS
 * background-image, never `<img>`. Icons are inline SVG.
 */
import type { I18nRuntime } from "@landing/contracts/i18n";
import { sharedFeatureTestIds } from "@landing/contracts/shared-feature";
import { ButtonLink, SharedFeatureTemplate } from "@landing/ui";

type IconName = "mic" | "ear" | "replay" | "close" | "settings";

const GLYPH_PROPS = {
  viewBox: "0 0 24 24",
  className: "feature-roleplay__glyph",
  "aria-hidden": true,
  focusable: "false" as const,
  fill: "none",
  stroke: "currentColor",
  strokeWidth: 2,
  strokeLinecap: "round" as const,
  strokeLinejoin: "round" as const,
} as const;

function Icon({ name }: { name: IconName }) {
  const common = GLYPH_PROPS;
  switch (name) {
    case "mic":
      return (
        <svg {...common}>
          <rect x="9" y="2" width="6" height="12" rx="3" />
          <path d="M5 10a7 7 0 0 0 14 0" />
          <path d="M12 21v-3" />
        </svg>
      );
    case "ear":
      return (
        <svg {...common}>
          <path d="M6 8.5a6 6 0 0 1 12 0c0 3-2.5 3.5-3.5 5-.7 1-.5 3-2.5 3a2.5 2.5 0 0 1-2.5-2.5" />
          <path d="M9 8.5a3 3 0 0 1 6 0" />
        </svg>
      );
    case "replay":
      return (
        <svg {...common}>
          <path d="M3 12a9 9 0 1 0 3-6.7L3 8" />
          <path d="M3 3v5h5" />
        </svg>
      );
    case "close":
      return (
        <svg {...common}>
          <path d="M6 6l12 12M18 6L6 18" />
        </svg>
      );
    case "settings":
      return (
        <svg {...common}>
          <circle cx="12" cy="12" r="3" />
          <path d="M19.4 15a1.6 1.6 0 0 0 .3 1.8l.1.1a2 2 0 1 1-2.8 2.8l-.1-.1a1.6 1.6 0 0 0-2.7 1.1V21a2 2 0 1 1-4 0v-.2a1.6 1.6 0 0 0-2.7-1.1l-.1.1a2 2 0 1 1-2.8-2.8l.1-.1a1.6 1.6 0 0 0-1.1-2.7H3a2 2 0 1 1 0-4h.2A1.6 1.6 0 0 0 4.3 8L4.2 8a2 2 0 1 1 2.8-2.8l.1.1a1.6 1.6 0 0 0 1.8.3H9a1.6 1.6 0 0 0 1-1.5V3a2 2 0 1 1 4 0v.2a1.6 1.6 0 0 0 2.7 1.1l.1-.1a2 2 0 1 1 2.8 2.8l-.1.1a1.6 1.6 0 0 0-.3 1.8V9a1.6 1.6 0 0 0 1.5 1H21a2 2 0 1 1 0 4h-.2a1.6 1.6 0 0 0-1.4 1z" />
        </svg>
      );
  }
}

function PhoneMockup({ t }: { t: I18nRuntime["translate"] }) {
  return (
    <div className="feature-roleplay__phone">
      <div className="feature-roleplay__phone-scrim" />
      <div className="feature-roleplay__notch">
        <span className="feature-roleplay__notch-speaker" />
        <span className="feature-roleplay__notch-camera" />
      </div>
      <div className="feature-roleplay__phone-top">
        <span className="feature-roleplay__phone-btn">
          <Icon name="close" />
        </span>
        <span className="feature-roleplay__phone-btn">
          <Icon name="settings" />
        </span>
      </div>
      <p className="feature-roleplay__phone-title">{t("feature.roleplay.phone.title")}</p>
      <span className="feature-roleplay__phone-badge">{t("feature.roleplay.phone.badge")}</span>
      <div className="feature-roleplay__chat">
        <p className="feature-roleplay__chat-lead">{t("feature.roleplay.phone.prompt")}</p>
        <p className="feature-roleplay__chat-detail">{t("feature.roleplay.phone.translation")}</p>
      </div>
      <span className="feature-roleplay__phone-mic">
        <Icon name="mic" />
      </span>
      <span className="feature-roleplay__home-indicator" />
    </div>
  );
}

function ActionRail() {
  return (
    <div className="feature-roleplay__rail">
      <span className="feature-roleplay__rail-btn feature-roleplay__rail-btn--active">
        <Icon name="mic" />
      </span>
      <span className="feature-roleplay__rail-btn feature-roleplay__rail-btn--soft">
        <Icon name="ear" />
      </span>
      <span className="feature-roleplay__rail-btn">
        <Icon name="replay" />
      </span>
    </div>
  );
}

function ScenarioCard({ variant, title }: { variant: "taxi" | "cosmetic"; title: string }) {
  return (
    <div className={`feature-roleplay__scene feature-roleplay__scene--${variant}`}>
      <div className="feature-roleplay__scene-scrim" />
      <p className="feature-roleplay__scene-title">{title}</p>
    </div>
  );
}

export interface FeatureRoleplayProps {
  t: I18nRuntime["translate"];
  earlyAccessHref?: string;
  onEarlyAccess: () => void;
}

export function FeatureRoleplay({
  t,
  earlyAccessHref = "#early-access",
  onEarlyAccess,
}: FeatureRoleplayProps) {
  const featureId = "ai-communication-roleplay";
  const pills = [
    t("feature.roleplay.pill.one"),
    t("feature.roleplay.pill.two"),
    t("feature.roleplay.pill.three"),
  ];
  return (
    <SharedFeatureTemplate
      appearance="white"
      numberLabel={t("feature.roleplay.number")}
      headerText={t("feature.roleplay.title")}
      subheaderText={t("feature.roleplay.description")}
      testId={sharedFeatureTestIds.root(featureId)}
    >
      <div className="feature-roleplay">
        <div className="feature-roleplay__details">
          <ul className="feature-roleplay__pills">
            {pills.map((pill) => (
              <li key={pill} className="feature-roleplay__pill">
                {pill}
              </li>
            ))}
          </ul>
        </div>
        <div className="feature-roleplay__visual" aria-hidden="true">
          <div className="feature-roleplay__tags">
            <span className="feature-roleplay__tag">{t("feature.roleplay.tag.roleplay")}</span>
            <span className="feature-roleplay__tag feature-roleplay__tag--selected">
              {t("feature.roleplay.tag.travel")}
            </span>
            <span className="feature-roleplay__tag">{t("feature.roleplay.tag.cafe")}</span>
          </div>
          <ActionRail />
          <PhoneMockup t={t} />
          <div className="feature-roleplay__cards">
            <ScenarioCard variant="cosmetic" title={t("feature.roleplay.scene.cosmetic")} />
            <ScenarioCard variant="taxi" title={t("feature.roleplay.scene.taxi")} />
          </div>
        </div>
        <ButtonLink
          className="shared-feature__early-access-cta feature-roleplay__cta"
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
