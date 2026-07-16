import type { ReactNode } from "react";
import type { LandingShellProps, LandingShellSlotProps } from "@landing/contracts";

const renderSlot = (slot: unknown) => slot as ReactNode;

export function LandingShell({ header, children, footer, testId = "landing-shell" }: LandingShellProps) {
  return <div className="landing-shell" data-testid={testId}>{renderSlot(header)}{renderSlot(children)}{renderSlot(footer)}</div>;
}

LandingShell.Header = function LandingHeader({ children, testId = "landing-header" }: LandingShellSlotProps) {
  return <header className="landing-header" data-testid={testId}>{renderSlot(children)}</header>;
};
LandingShell.Main = function LandingMain({ children, testId = "landing-main" }: LandingShellSlotProps) {
  return <main data-testid={testId}>{renderSlot(children)}</main>;
};
LandingShell.Footer = function LandingFooter({ children, testId = "landing-footer" }: LandingShellSlotProps) {
  return <footer className="landing-footer" data-testid={testId}>{renderSlot(children)}</footer>;
};
