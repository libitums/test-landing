import type { ComponentProps } from "react";
import * as AccordionPrimitive from "@radix-ui/react-accordion";

export const Accordion = AccordionPrimitive.Root;

export function AccordionItem({
  className = "",
  ...props
}: ComponentProps<typeof AccordionPrimitive.Item>) {
  return <AccordionPrimitive.Item className={`accordion__item ${className}`.trim()} {...props} />;
}

export function AccordionTrigger({
  className = "",
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Trigger>) {
  return (
    <AccordionPrimitive.Header className="accordion__header">
      <AccordionPrimitive.Trigger className={`accordion__trigger ${className}`.trim()} {...props}>
        {children}
      </AccordionPrimitive.Trigger>
    </AccordionPrimitive.Header>
  );
}

export function AccordionContent({
  className = "",
  children,
  ...props
}: ComponentProps<typeof AccordionPrimitive.Content>) {
  return (
    <AccordionPrimitive.Content className={`accordion__content ${className}`.trim()} {...props}>
      <div className="accordion__content-inner">{children}</div>
    </AccordionPrimitive.Content>
  );
}
