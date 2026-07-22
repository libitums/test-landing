import { Fragment, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { HeroProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";

const renderSlot = (slot: unknown) => slot as ReactNode;

/** Render author-controlled `\n` breaks in copy as explicit line breaks. */
function withLineBreaks(text: string): ReactNode {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

export function Hero({ content, children, testId = "hero" }: HeroProps) {
  const media = renderSlot(children);
  const highlights = content.highlights ?? [];

  return (
    <section className="section hero" data-testid={testId} aria-labelledby={`${testId}-title`}>
      <div className="container hero__layout">
        <div className="hero__copy">
          <h1 id={`${testId}-title`}>{content.title}</h1>
          <p className="hero__description">{withLineBreaks(content.description)}</p>
          {content.cta ? (
            <button
              className="button hero__cta"
              type="button"
              aria-disabled="true"
              data-testid={landingTestIds.heroCta}
            >
              <span className="hero__cta-fill" aria-hidden="true" />
              <span className="hero__cta-label">{content.cta.label}</span>
              <span className="hero__cta-arrow" aria-hidden="true">
                <ArrowRight className="hero__cta-arrow-icon" strokeWidth={2} />
              </span>
            </button>
          ) : null}
          {highlights.length > 0 ? (
            <ul className="hero__highlights" data-testid={landingTestIds.heroHighlights}>
              {highlights.map((highlight) => (
                <li
                  key={highlight.id}
                  className="hero__highlight"
                  data-testid={landingTestIds.heroHighlight(highlight.id)}
                >
                  <Check className="hero__highlight-icon" aria-hidden="true" strokeWidth={2.5} />
                  <span className="hero__highlight-label">{highlight.label}</span>
                </li>
              ))}
            </ul>
          ) : null}
        </div>
        {media ? (
          <div className="hero__media" data-testid={landingTestIds.heroMedia}>
            {media}
          </div>
        ) : null}
      </div>
    </section>
  );
}
