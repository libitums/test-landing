import { fireEvent, render, screen, within } from "@testing-library/react";
import "@testing-library/jest-dom/vitest";
import type { FooterProps } from "@landing/contracts/footer";
import { footerTestIds } from "@landing/contracts/footer";
import { describe, expect, it } from "vitest";
import { Footer } from "./footer";

const props: FooterProps = {
  appearance: "warm-editorial",
  content: {
    logo: { kind: "text", label: "Example", accessibleLabel: "Example home", href: "/" },
    links: [
      { id: "en-US", label: "English", href: "/en-US/", current: true },
      {
        id: "ko-KR",
        label: "한국어",
        accessibleLabel: "한국어로 보기",
        href: "/ko-KR/",
        current: false,
      },
    ],
    policyLinks: [{ id: "privacy", label: "Privacy", href: "/privacy" }],
    copyright: "© 2026 Example",
    faq: {
      locale: "en-US",
      heading: "Frequently asked questions",
      items: [
        { id: "first", question: "What is Example?", answer: "A shared experience." },
        { id: "second", question: "Can I compare answers?", answer: "Yes, open both." },
      ],
    },
  },
  accessibleLabels: {
    footer: "Example footer",
    linksNavigation: "Footer links",
    policyNavigation: "Legal links",
    faqRegion: "Example questions",
  },
};

describe("Footer", () => {
  it("renders every frozen content slot with its accessible name and destination", () => {
    render(<Footer {...props} />);

    const footer = screen.getByTestId(footerTestIds.root);
    expect(footer).toHaveRole("contentinfo");
    expect(footer).toHaveAccessibleName("Example footer");
    expect(footer).toHaveAttribute("data-appearance", "warm-editorial");
    expect(within(footer).getByTestId(footerTestIds.faq)).toHaveAccessibleName("Example questions");
    expect(screen.getByRole("heading", { name: "Frequently asked questions" })).toBeVisible();
    expect(screen.getByRole("button", { name: "What is Example?" })).toHaveAttribute(
      "aria-expanded",
      "true",
    );
    expect(screen.getByTestId(footerTestIds.logo)).toHaveRole("link");
    expect(screen.getByTestId(footerTestIds.logo)).toHaveAccessibleName("Example home");
    expect(screen.getByTestId(footerTestIds.logo)).toHaveAttribute("href", "/");

    const links = screen.getByTestId(footerTestIds.linksNavigation);
    expect(links).toHaveRole("navigation");
    expect(links).toHaveAccessibleName("Footer links");
    const currentLocale = within(links).getByRole("link", { name: "English" });
    expect(currentLocale).toHaveAttribute("href", "/en-US/");
    expect(currentLocale).toHaveAttribute("aria-current", "page");
    const otherLocale = within(links).getByRole("link", { name: "한국어로 보기" });
    expect(otherLocale).toHaveAttribute("href", "/ko-KR/");
    expect(otherLocale).not.toHaveAttribute("aria-current");
    const policies = screen.getByTestId(footerTestIds.policyNavigation);
    expect(policies).toHaveRole("navigation");
    expect(policies).toHaveAccessibleName("Legal links");
    expect(within(policies).getByRole("link", { name: "Privacy" })).toHaveAttribute(
      "href",
      "/privacy",
    );
    expect(screen.getByTestId(footerTestIds.copyright)).toHaveTextContent("© 2026 Example");
  });

  it("opens multiple FAQ items by pointer, Enter, and Space while retaining trigger focus", () => {
    render(<Footer {...props} appearance="neutral" />);
    const firstItem = screen.getByTestId(footerTestIds.faqItem("first"));
    const secondItem = screen.getByTestId(footerTestIds.faqItem("second"));
    const first = within(firstItem).getByRole("button", { name: "What is Example?" });
    const second = within(secondItem).getByRole("button", { name: "Can I compare answers?" });

    expect(first).toHaveAttribute("aria-expanded", "false");
    expect(second).toHaveAttribute("aria-expanded", "false");
    fireEvent.click(first);
    expect(first).toHaveAttribute("aria-expanded", "true");
    expect(within(firstItem).getByText("A shared experience.")).toBeVisible();
    expect(first).toHaveAttribute("aria-controls", expect.stringMatching(/\S+/));
    const firstContent = document.getElementById(first.getAttribute("aria-controls") ?? "");
    expect(firstContent).toHaveTextContent("A shared experience.");
    expect(first).toHaveAttribute("id", expect.stringMatching(/\S+/));
    expect(firstContent).toHaveAttribute("aria-labelledby", first.getAttribute("id"));

    second.focus();
    fireEvent.keyDown(second, { key: "Enter" });
    fireEvent.click(second);
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-expanded", "true");
    expect(first).toHaveAttribute("aria-expanded", "true");

    fireEvent.keyDown(second, { key: " " });
    fireEvent.click(second);
    expect(second).toHaveFocus();
    expect(second).toHaveAttribute("aria-expanded", "false");
    expect(first).toHaveAttribute("aria-expanded", "true");
  });

  it("omits the FAQ region for an empty item collection and preserves footer information", () => {
    render(
      <Footer
        {...props}
        content={{ ...props.content, faq: { ...props.content.faq, items: [] } }}
      />,
    );

    expect(screen.queryByTestId(footerTestIds.faq)).not.toBeInTheDocument();
    expect(
      screen.queryByRole("heading", { name: "Frequently asked questions" }),
    ).not.toBeInTheDocument();
    expect(screen.getByTestId(footerTestIds.logo)).toBeVisible();
    expect(screen.getByTestId(footerTestIds.linksNavigation)).toBeVisible();
    expect(screen.getByTestId(footerTestIds.policyNavigation)).toBeVisible();
    expect(screen.getByTestId(footerTestIds.copyright)).toBeVisible();
  });
});
