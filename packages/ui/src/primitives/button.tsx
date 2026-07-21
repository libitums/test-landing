import type { AnchorHTMLAttributes, ReactNode } from "react";
import type { LandingActionVariant } from "@landing/contracts";

export interface ButtonLinkProps extends AnchorHTMLAttributes<HTMLAnchorElement> {
  children: ReactNode;
  variant?: LandingActionVariant | "destructive";
}

export function ButtonLink({
  children,
  className = "",
  variant = "primary",
  ...props
}: ButtonLinkProps) {
  return (
    <a className={`button button--${variant} ${className}`.trim()} {...props}>
      {children}
    </a>
  );
}
