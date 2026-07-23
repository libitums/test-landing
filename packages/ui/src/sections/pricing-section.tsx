import { Fragment, useState, type ReactNode } from "react";
import { Check } from "lucide-react";
import type { BillingPeriod, PricingSectionProps } from "@landing/contracts";
import { landingTestIds } from "@landing/contracts";

/** Render author-controlled `\n` breaks in copy as explicit line breaks. */
function withLineBreaks(text: string): ReactNode {
  return text.split("\n").map((line, index) => (
    <Fragment key={index}>
      {index > 0 ? <br /> : null}
      {line}
    </Fragment>
  ));
}

const PERIODS: readonly BillingPeriod[] = ["monthly", "annual"];

export function PricingSection({ content, testId = "pricing-section" }: PricingSectionProps) {
  const [period, setPeriod] = useState<BillingPeriod>("monthly");
  const { billing, plans } = content;

  return (
    <section className="section pricing" data-testid={testId} aria-labelledby={`${testId}-title`}>
      <div className="container pricing__container">
        <div className="pricing__header">
          {content.kicker ? <span className="pricing__kicker">{content.kicker}</span> : null}
          <h2 id={`${testId}-title`} className="pricing__title">
            {content.title}
          </h2>
          {content.subtitle ? (
            <p className="pricing__subtitle">{withLineBreaks(content.subtitle)}</p>
          ) : null}
          <div
            className="pricing__billing"
            role="group"
            aria-label={`${billing.monthlyLabel} / ${billing.annualLabel}`}
            data-testid={landingTestIds.pricingBilling}
          >
            {PERIODS.map((value) => (
              <button
                key={value}
                type="button"
                className={`pricing__billing-option${period === value ? " is-active" : ""}`}
                aria-pressed={period === value}
                onClick={() => setPeriod(value)}
                data-testid={landingTestIds.pricingBillingOption(value)}
              >
                <span>{value === "monthly" ? billing.monthlyLabel : billing.annualLabel}</span>
                {value === "annual" && billing.annualBadge ? (
                  <span className="pricing__billing-badge">{billing.annualBadge}</span>
                ) : null}
              </button>
            ))}
          </div>
        </div>

        <ul className="pricing__plans">
          {plans.map((plan) => (
            <li
              key={plan.id}
              className={`pricing__plan${plan.featured ? " pricing__plan--featured" : ""}`}
              data-testid={landingTestIds.pricingPlan(plan.id)}
            >
              <div className="pricing__plan-head">
                <span className="pricing__plan-name">{plan.name}</span>
                {plan.badge ? <span className="pricing__plan-badge">{plan.badge}</span> : null}
              </div>
              <p className="pricing__price">
                <span className="pricing__price-value">
                  {period === "monthly" ? plan.price.monthly : plan.price.annual}
                </span>
                <span className="pricing__price-unit">{plan.price.unit}</span>
              </p>
              <p className="pricing__plan-description">{plan.description}</p>
              <button className="button pricing__plan-cta" type="button" aria-disabled="true">
                {plan.cta}
              </button>
              <ul className="pricing__features">
                {plan.features.map((feature) => (
                  <li key={feature.id} className="pricing__feature">
                    <Check className="pricing__feature-icon" aria-hidden="true" strokeWidth={2.5} />
                    <span className="pricing__feature-label">{feature.label}</span>
                  </li>
                ))}
              </ul>
            </li>
          ))}
        </ul>

        {content.footerNote ? (
          <p className="pricing__note">{withLineBreaks(content.footerNote)}</p>
        ) : null}
      </div>
    </section>
  );
}
