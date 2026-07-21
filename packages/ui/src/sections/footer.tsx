import { ChevronDown } from "lucide-react";
import type { FooterLink, FooterLogo, FooterProps } from "@landing/contracts/footer";
import { footerTestIds } from "@landing/contracts/footer";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../primitives/accordion";

function FooterLogoLink({ logo }: { logo: FooterLogo }) {
  return (
    <a
      className="footer__logo"
      data-testid={footerTestIds.logo}
      href={logo.href}
      aria-label={logo.kind === "text" ? logo.accessibleLabel : undefined}
    >
      {logo.kind === "text" ? (
        logo.label
      ) : (
        <img className="footer__logo-image" src={logo.src} alt={logo.alt} />
      )}
    </a>
  );
}

function FooterNavigation({ links }: { links: readonly FooterLink[] }) {
  return (
    <ul className="footer__link-list">
      {links.map((link) => (
        <li key={link.id}>
          <a
            href={link.href}
            aria-label={link.accessibleLabel}
            aria-current={link.current ? "page" : undefined}
          >
            {link.label}
          </a>
        </li>
      ))}
    </ul>
  );
}

export function Footer({
  appearance,
  content,
  accessibleLabels,
  testId = footerTestIds.root,
}: FooterProps) {
  const hasFaq = content.faq.items.length > 0;
  const defaultFaqValue =
    appearance === "warm-editorial" && content.faq.items[0] ? [content.faq.items[0].id] : [];

  return (
    <footer
      className={`footer footer--${appearance}`}
      data-appearance={appearance}
      data-testid={testId}
      aria-label={accessibleLabels.footer}
    >
      <div className="container footer__inner">
        {hasFaq ? (
          <section
            className="footer__faq"
            data-testid={footerTestIds.faq}
            aria-label={accessibleLabels.faqRegion}
          >
            <h2 className="footer__heading">{content.faq.heading}</h2>
            <Accordion className="footer__accordion" type="multiple" defaultValue={defaultFaqValue}>
              {content.faq.items.map((item) => (
                <AccordionItem
                  key={item.id}
                  value={item.id}
                  data-testid={footerTestIds.faqItem(item.id)}
                >
                  <AccordionTrigger>
                    <span>{item.question}</span>
                    <ChevronDown className="accordion__chevron" aria-hidden="true" />
                  </AccordionTrigger>
                  <AccordionContent>
                    <p>{item.answer}</p>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </section>
        ) : null}

        <div className="footer__bottom">
          <FooterLogoLink logo={content.logo} />
          <nav
            className="footer__navigation"
            aria-label={accessibleLabels.linksNavigation}
            data-testid={footerTestIds.linksNavigation}
          >
            <FooterNavigation links={content.links} />
          </nav>
          <nav
            className="footer__navigation footer__policy-navigation"
            aria-label={accessibleLabels.policyNavigation}
            data-testid={footerTestIds.policyNavigation}
          >
            <FooterNavigation links={content.policyLinks} />
          </nav>
          <p className="footer__copyright" data-testid={footerTestIds.copyright}>
            {content.copyright}
          </p>
        </div>
      </div>
    </footer>
  );
}
