import { useId, type ReactNode } from "react";
import type { SharedFeatureTemplateProps } from "@landing/contracts/shared-feature";

const renderSlot = (slot: unknown) => slot as ReactNode;

function testIdSuffix(testId: SharedFeatureTemplateProps["testId"], suffix: string) {
  return testId ? `${testId}:${suffix}` : undefined;
}

export function SharedFeatureTemplate({
  appearance,
  numberLabel,
  headerText,
  subheaderText,
  children,
  testId,
}: SharedFeatureTemplateProps) {
  const generatedHeadingId = useId();
  const headingId = testId ? `${testId}:heading` : generatedHeadingId;

  return (
    <section
      className={`shared-feature shared-feature--${appearance}`}
      data-testid={testId}
      aria-labelledby={headingId}
    >
      <div className="shared-feature__inner">
        <div className="shared-feature__number" data-testid={testIdSuffix(testId, "number-label")}>
          {numberLabel}
        </div>
        <h2
          className="shared-feature__header"
          id={headingId}
          data-testid={testIdSuffix(testId, "header")}
        >
          {headerText}
        </h2>
        <p className="shared-feature__subheader" data-testid={testIdSuffix(testId, "subheader")}>
          {subheaderText}
        </p>
        <div className="shared-feature__content" data-testid={testIdSuffix(testId, "content")}>
          {renderSlot(children)}
        </div>
      </div>
    </section>
  );
}
