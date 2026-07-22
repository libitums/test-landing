import { Fragment, useEffect, useRef, useState, type ReactNode } from "react";
import { ArrowRight, Check } from "lucide-react";
import type { CtaSectionProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";
import { ButtonLink } from "../primitives/button";

/** Render author-controlled `\n` breaks in copy as explicit line breaks. */
function withLineBreaks(text: string): ReactNode {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

/** True once the node has scrolled into view — used to play the pill animation a single time. */
function useSeenOnce<T extends Element>() {
  const ref = useRef<T>(null);
  const [seen, setSeen] = useState(false);
  useEffect(() => {
    const node = ref.current;
    if (!node || seen) return;
    if (typeof IntersectionObserver === "undefined") {
      setSeen(true);
      return;
    }
    const observer = new IntersectionObserver(
      (entries) => {
        if (entries.some((entry) => entry.isIntersecting)) {
          setSeen(true);
          observer.disconnect();
        }
      },
      { threshold: 0.4 },
    );
    observer.observe(node);
    return () => observer.disconnect();
  }, [seen]);
  return { ref, seen };
}

export function CtaSection({ content, onAction, testId = "cta-section" }: CtaSectionProps) {
  const [primary, ...rest] = content.actions;
  const notes = content.notes ?? [];
  const [ghostStart, ghostEnd] = content.ghostWords;
  const { ref, seen } = useSeenOnce<HTMLElement>();

  return (
    <section
      ref={ref}
      className="cta"
      data-seen={seen ? "true" : undefined}
      data-testid={testId}
      aria-labelledby={`${testId}-title`}
    >
      <span
        className="cta__ghost cta__ghost--start"
        aria-hidden="true"
        data-testid={landingTestIds.ctaGhost}
      >
        {ghostStart}
      </span>
      <span className="cta__ghost cta__ghost--end" aria-hidden="true">
        {ghostEnd}
      </span>
      <div className="cta__inner">
        {content.badge ? <span className="cta__badge">{content.badge}</span> : null}
        <h2 id={`${testId}-title`} className="cta__title">
          {content.title}
        </h2>
        <p className="cta__description">{withLineBreaks(content.description)}</p>
        <div className="cta__actions">
          <ButtonLink
            className="cta__pill"
            href={primary.href}
            variant={primary.variant}
            aria-label={primary.accessibleLabel}
            data-testid={landingTestIds.ctaAction(primary.id)}
            onClick={() => onAction?.(primary)}
          >
            <span className="cta__pill-fill" aria-hidden="true" />
            <span className="cta__pill-knob" aria-hidden="true">
              <ArrowRight className="cta__pill-icon" strokeWidth={2} />
            </span>
            <span className="cta__pill-label">{primary.label}</span>
          </ButtonLink>
          {rest.map((action) => (
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
        {notes.length > 0 ? (
          <ul className="cta__notes">
            {notes.map((note) => (
              <li key={note.id} className="cta__note" data-testid={landingTestIds.ctaNote(note.id)}>
                <Check className="cta__note-icon" aria-hidden="true" strokeWidth={2.5} />
                <span className="cta__note-label">{note.label}</span>
              </li>
            ))}
          </ul>
        ) : null}
      </div>
    </section>
  );
}
