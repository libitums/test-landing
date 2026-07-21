import type { CtaSectionProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";
import { ButtonLink } from "../primitives/button";

export function CtaSection({ content, onAction, testId = "cta-section" }: CtaSectionProps) {
  return (
    <section className="section" data-testid={testId} aria-labelledby={`${testId}-title`}>
      <div className="container cta stack">
        <h2 id={`${testId}-title`}>{content.title}</h2>
        <p>{content.description}</p>
        <div className="action-group">
          {content.actions.map((action) => (
            <ButtonLink
              key={action.id}
              href={action.href}
              variant={action.variant}
              aria-label={action.accessibleLabel}
              data-testid={landingTestIds.ctaAction(action.id)}
              onClick={() => onAction?.(action)}
            >
              {action.label}
            </ButtonLink>
          ))}
        </div>
      </div>
    </section>
  );
}
