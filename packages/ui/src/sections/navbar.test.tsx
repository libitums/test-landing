import { fireEvent, render, screen, waitFor, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import { describe, expect, it } from "vitest";
import type { NavbarProps } from "@landing/contracts/navbar";
import { navbarTestIds } from "@landing/contracts/navbar";
import { Navbar } from "./navbar";

const props: NavbarProps = {
  appearance: "warm-editorial",
  content: {
    logo: { kind: "text", label: "Example", accessibleLabel: "Example home", href: "#top" },
    howItWorks: { label: "How it works", accessibleLabel: "Learn how Example works", href: "#how" },
    pricing: { label: "Pricing", href: "#pricing" },
    language: {
      label: "한국어",
      accessibleLabel: "Choose language",
      options: [
        { locale: "ko-KR", label: "한국어", href: "/ko-KR/", current: true },
        { locale: "en-US", label: "English", href: "/en-US/", current: false },
      ],
    },
    tryAction: { label: "Try", accessibleLabel: "Try Example", href: "#try" },
  },
  accessibleLabels: {
    primaryNavigation: "Primary navigation",
    mobileMenuOpen: "Open menu",
    mobileMenuClose: "Close menu",
    mobileMenu: "Mobile navigation",
  },
};

describe("Navbar", () => {
  it("renders the desktop groups from the frozen contract", async () => {
    render(<Navbar {...props} />);
    expect(screen.getByTestId(navbarTestIds.root)).toHaveRole("banner");
    expect(screen.getByTestId(navbarTestIds.root)).toHaveAttribute(
      "data-appearance",
      "warm-editorial",
    );
    expect(screen.getByRole("link", { name: "Example home" })).toHaveAttribute("href", "#top");
    const navigation = screen.getByRole("navigation", { name: "Primary navigation" });
    expect(
      within(navigation).getByRole("link", { name: "Learn how Example works" }),
    ).toHaveAttribute("href", "#how");
    expect(within(navigation).getByRole("link", { name: "Pricing" })).toHaveAttribute(
      "href",
      "#pricing",
    );
    const languageTrigger = screen.getByRole("button", { name: "Choose language" });
    languageTrigger.focus();
    fireEvent.keyDown(languageTrigger, { key: "ArrowDown" });
    const languageMenu = await screen.findByRole("menu", { name: "Choose language" });
    expect(within(languageMenu).getByRole("menuitem", { name: "한국어" })).toHaveAttribute(
      "href",
      "/ko-KR/",
    );
    expect(within(languageMenu).getByRole("menuitem", { name: "한국어" })).toHaveAttribute(
      "aria-current",
      "page",
    );
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("menu")).not.toBeInTheDocument());
    expect(screen.getByRole("link", { name: "Try Example" })).toHaveAttribute("href", "#try");
  });

  it("opens with a keyboard, closes with Escape, and restores focus", async () => {
    render(<Navbar {...props} />);
    const trigger = screen.getByRole("button", { name: "Open menu" });
    trigger.focus();
    fireEvent.click(trigger);
    const dialog = screen.getByRole("dialog", { name: "Mobile navigation" });
    const close = within(dialog).getByRole("button", { name: "Close menu" });
    await waitFor(() => expect(close).toHaveFocus());
    expect(trigger).toHaveAccessibleName("Close menu");
    fireEvent.keyDown(document, { key: "Escape" });
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    await waitFor(() => expect(trigger).toHaveFocus());
    expect(trigger).toHaveAccessibleName("Open menu");
  });
});
