import type { HeroProps, LandingAction } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";
import { ButtonLink } from "../primitives/button";

function ActionLink({
  action,
  onAction,
}: {
  action: LandingAction;
  onAction: HeroProps["onAction"];
}) {
  return (
    <ButtonLink
      href={action.href}
      variant={action.variant}
      aria-label={action.accessibleLabel}
      data-testid={landingTestIds.heroAction(action.id)}
      onClick={() => onAction?.(action)}
    >
      {action.label}
    </ButtonLink>
  );
}

export function Hero({ content, onAction, testId = "hero" }: HeroProps) {
  return (
    <section className="section hero" data-testid={testId} aria-labelledby={`${testId}-title`}>
      <div className="container hero__layout">
        <div className="stack stack--large">
          {content.eyebrow ? <p className="eyebrow">{content.eyebrow}</p> : null}
          <h1 id={`${testId}-title`}>{content.title}</h1>
          <p className="hero__description">{content.description}</p>
          <div className="action-group">
            {content.actions.map((action) => (
              <ActionLink key={action.id} action={action} onAction={onAction} />
            ))}
          </div>
        </div>
        <div className="hero__preview" aria-hidden="true">
          <span>{content.eyebrow ?? content.title}</span>
        </div>
      </div>
    </section>
  );
}
