import { useEffect, useState } from "react";
import { Check, Languages, Menu, X } from "lucide-react";
import type {
  NavbarAppearance,
  NavbarLanguageMenu,
  NavbarLogo,
  NavbarProps,
} from "@landing/contracts/navbar";
import { navbarTestIds } from "@landing/contracts/navbar";
import { ButtonLink } from "../primitives/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "../primitives/dropdown-menu";
import { Sheet, SheetClose, SheetContent, SheetTitle, SheetTrigger } from "../primitives/sheet";

function accessibleName(link: { label: string; accessibleLabel?: string }) {
  return link.accessibleLabel ?? link.label;
}

function NavbarLogoLink({ logo }: { logo: NavbarLogo }) {
  return (
    <a
      className="navbar__logo"
      data-testid={navbarTestIds.logo}
      href={logo.href}
      aria-label={logo.kind === "text" ? logo.accessibleLabel : undefined}
    >
      {logo.kind === "text" ? (
        logo.label
      ) : (
        <img className="navbar__logo-image" src={logo.src} alt={logo.alt} />
      )}
    </a>
  );
}

function NavigationLinks({ content }: Pick<NavbarProps, "content">) {
  return (
    <>
      <a
        data-testid={navbarTestIds.howItWorks}
        href={content.howItWorks.href}
        aria-label={content.howItWorks.accessibleLabel}
      >
        {content.howItWorks.label}
      </a>
      <a
        data-testid={navbarTestIds.pricing}
        href={content.pricing.href}
        aria-label={content.pricing.accessibleLabel}
      >
        {content.pricing.label}
      </a>
    </>
  );
}

function LanguageAction({
  appearance,
  language,
}: {
  appearance: NavbarAppearance;
  language: NavbarLanguageMenu;
}) {
  const label = accessibleName(language);
  const triggerClassName =
    appearance === "neutral"
      ? "button button--ghost navbar__language"
      : "button button--ghost navbar__language navbar__language--icon";

  return (
    <DropdownMenu>
      <DropdownMenuTrigger asChild>
        <button
          className={triggerClassName}
          type="button"
          data-testid={navbarTestIds.language}
          aria-label={label}
        >
          {appearance === "neutral" ? (
            language.label
          ) : (
            <>
              <Languages className="navbar__icon" aria-hidden="true" strokeWidth={2} />
              <span className="visually-hidden">{language.label}</span>
            </>
          )}
        </button>
      </DropdownMenuTrigger>
      <DropdownMenuContent aria-label={label} data-testid={navbarTestIds.languageMenuContent}>
        {language.options.map((option) => (
          <DropdownMenuItem key={option.locale} asChild>
            <a
              className="navbar__language-option"
              href={option.href}
              hrefLang={option.locale}
              aria-current={option.current ? "page" : undefined}
              aria-label={option.accessibleLabel}
            >
              <span>{option.label}</span>
              {option.current ? (
                <Check className="navbar__icon" aria-hidden="true" strokeWidth={2} />
              ) : null}
            </a>
          </DropdownMenuItem>
        ))}
      </DropdownMenuContent>
    </DropdownMenu>
  );
}

function MobileNavigation({
  content,
  accessibleLabels,
}: Pick<NavbarProps, "content" | "accessibleLabels">) {
  const [open, setOpen] = useState(false);

  useEffect(() => {
    if (typeof window.matchMedia !== "function") return;
    const mobileQuery = window.matchMedia("(max-width: 48rem)");
    const closeAtDesktop = (event: MediaQueryListEvent) => {
      if (!event.matches) setOpen(false);
    };
    mobileQuery.addEventListener("change", closeAtDesktop);
    return () => mobileQuery.removeEventListener("change", closeAtDesktop);
  }, []);

  return (
    <div className="navbar__mobile-navigation">
      <Sheet open={open} onOpenChange={setOpen}>
        <SheetTrigger asChild>
          <button
            className="button button--ghost navbar__menu-trigger"
            type="button"
            data-testid={navbarTestIds.mobileMenuTrigger}
            aria-label={open ? accessibleLabels.mobileMenuClose : accessibleLabels.mobileMenuOpen}
          >
            <Menu className="navbar__icon" aria-hidden="true" strokeWidth={2} />
          </button>
        </SheetTrigger>
        <SheetContent data-testid={navbarTestIds.mobileMenuContent}>
          <div className="navbar__sheet-heading">
            <SheetTitle className="visually-hidden">{accessibleLabels.mobileMenu}</SheetTitle>
            <SheetClose asChild>
              <button
                className="button button--ghost navbar__sheet-close"
                type="button"
                aria-label={accessibleLabels.mobileMenuClose}
              >
                <X className="navbar__icon" aria-hidden="true" strokeWidth={2} />
              </button>
            </SheetClose>
          </div>
          <nav className="navbar__sheet-links" aria-label={accessibleLabels.mobileMenu}>
            <NavigationLinks content={content} />
          </nav>
        </SheetContent>
      </Sheet>
    </div>
  );
}

export function Navbar({
  appearance,
  content,
  accessibleLabels,
  testId = navbarTestIds.root,
}: NavbarProps) {
  return (
    <header
      className={`navbar navbar--${appearance}`}
      data-appearance={appearance}
      data-testid={testId}
    >
      <div className="container navbar__inner">
        <NavbarLogoLink logo={content.logo} />
        <nav
          className="navbar__desktop-navigation"
          aria-label={accessibleLabels.primaryNavigation}
          data-testid={navbarTestIds.desktopNavigation}
        >
          <NavigationLinks content={content} />
        </nav>
        <div className="navbar__actions">
          <LanguageAction appearance={appearance} language={content.language} />
          <ButtonLink
            className="navbar__try-action"
            data-testid={navbarTestIds.tryAction}
            href={content.tryAction.href}
            aria-label={accessibleName(content.tryAction)}
          >
            {content.tryAction.label}
          </ButtonLink>
          <MobileNavigation content={content} accessibleLabels={accessibleLabels} />
        </div>
      </div>
    </header>
  );
}
