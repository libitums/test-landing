import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const origin = `http://127.0.0.1:${process.env.K_CULTURE_E2E_PORT ?? 4175}`;
const earlyAccessPath = "/k-culture/early-access";
const locales = ["ko-KR", "en-US", "ja-JP", "vi-VN", "th-TH", "zh-CN", "zh-TW", "ar"] as const;

const features = [
  {
    id: "clips",
    number: "01",
    appearance: "white",
    title: '"lucky vicky"…? What does that even mean?',
    subtitle:
      "Your bias's catchphrases, iconic drama lines, viral variety-show moments — meaning, origin, and real examples, all on one card. Play the clip, copy the delivery, then drop it in the group chat.",
  },
  {
    id: "real-life",
    number: "02",
    appearance: "soft",
    title: "No textbook — just what you actually need, in a pack",
    subtitle:
      "K-Pop Stan Pack — the exact lines for video call fansigns, plus fansign & photocard culture.\nKorea Trip Pack — the few phrases you'll really use, plus insider tips only locals know.",
  },
  {
    id: "register",
    number: "03",
    appearance: "white",
    title: "\"Let's eat\" isn't just one phrase in Korean",
    subtitle:
      "Friend, sunbae, your boss, someone older — chat with each of them, switching as you go. Their reactions and your affinity score tell you how you're doing. Make your mistakes here — and only here.",
  },
] as const;

const featureTestId = (id: string) => `shared-feature:k-culture-${id}`;

async function expectNoHorizontalOverflow(page: Page) {
  const dimensions = await page.evaluate(() => ({
    clientWidth: document.documentElement.clientWidth,
    scrollWidth: document.documentElement.scrollWidth,
  }));
  expect(dimensions.scrollWidth, JSON.stringify(dimensions)).toBe(dimensions.clientWidth);
}

async function expectBefore(first: Locator, second: Locator) {
  await expect(first).toHaveCount(1);
  await expect(second).toHaveCount(1);
  expect(
    await first.evaluate(
      (node, following) =>
        Boolean(node.compareDocumentPosition(following as Node) & Node.DOCUMENT_POSITION_FOLLOWING),
      await second.elementHandle(),
    ),
  ).toBe(true);
}

test.describe("K-culture temporary shared template", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto(`${origin}/en-US/`);
    await expect(page.getByTestId("landing:k-culture")).toBeVisible();
  });

  test("renders the frozen copy and complete shared-template section order", async ({ page }) => {
    const navbar = page.getByRole("banner");
    const logo = navbar.getByTestId("navbar-logo");
    const localeControl = navbar.getByTestId("navbar-language");
    const hero = page.getByTestId("hero");
    const proofAnchor = page.locator("#proof");
    const proof = proofAnchor.getByTestId("k-culture-proof-strip");
    const pricingAnchor = page.locator("#pricing");
    const pricing = pricingAnchor.getByTestId("pricing-section");
    const finalCtaAnchor = page.locator("#cta");
    const finalCta = finalCtaAnchor.getByTestId("cta-section");
    const footer = page.getByRole("contentinfo", { name: "K-zip footer" });
    const footerBrand = footer.getByTestId("footer-logo");
    const faq = page.getByTestId("footer-faq");
    const featureRoots = features.map(({ id }) => page.getByTestId(featureTestId(id)));

    await expect(page).toHaveTitle("K-zip");
    await expect(logo).toHaveRole("link");
    await expect(logo).toHaveAccessibleName("K-zip");
    await expect(logo).toHaveAttribute("href", "#top");
    await expect(logo).toHaveText("K-zip");
    await expect(logo.getByRole("img")).toHaveCount(0);
    await expect(footer).toBeVisible();
    await expect(footerBrand).toBeVisible();
    await expect(footerBrand).toHaveAccessibleName("K-zip");
    await expect(footerBrand).toHaveText("K-zip");
    await expect(localeControl).toBeVisible();
    await expect(localeControl).toHaveRole("button");
    await expect(hero.getByRole("heading", { level: 1 })).toHaveText(
      "The real Korean you actually wanted to learn",
    );
    await expect(proof.getByRole("heading")).toHaveText("Everything the textbook left out.");
    for (const [index, feature] of features.entries()) {
      const root = featureRoots[index];
      if (!root) throw new Error(`missing feature locator for ${feature.id}`);
      await expect(root).toHaveClass(new RegExp(`shared-feature--${feature.appearance}`));
      await expect(root.getByTestId(`${featureTestId(feature.id)}:number-label`)).toHaveText(
        feature.number,
      );
      await expect(root.getByTestId(`${featureTestId(feature.id)}:header`)).toHaveText(
        feature.title,
      );
      await expect(root.getByTestId(`${featureTestId(feature.id)}:subheader`)).toHaveText(
        feature.subtitle,
      );
    }

    for (const section of [
      hero,
      proofAnchor,
      proof,
      ...featureRoots,
      finalCtaAnchor,
      finalCta,
      pricingAnchor,
      pricing,
      faq,
    ]) {
      await expect(section).toBeVisible();
    }
    const orderedSections = [
      hero,
      proofAnchor,
      ...featureRoots,
      finalCtaAnchor,
      pricingAnchor,
      faq,
    ];
    for (let index = 0; index < orderedSections.length - 1; index += 1) {
      const current = orderedSections[index];
      const next = orderedSections[index + 1];
      if (!current || !next) throw new Error("section order fixture is incomplete");
      await expectBefore(current, next);
    }
  });

  test("omits unapproved media children and keeps only the existing feature CTA links", async ({
    page,
  }) => {
    await expect(page.getByTestId("hero-media")).toHaveCount(1);

    for (const feature of features) {
      const rootId = featureTestId(feature.id);
      const content = page.getByTestId(`${rootId}:content`);
      const cta = content.getByTestId(`${rootId}:early-access-cta`);

      await expect(content.locator(":scope > *")).toHaveCount(1);
      await expect(
        content.locator("img, picture, video, canvas, svg, [role='img'], [role='group']"),
      ).toHaveCount(0);
      await expect(cta).toHaveRole("link");
      await expect(cta).toHaveAccessibleName("Get early access");
      await expect(cta).toHaveAttribute("href", earlyAccessPath);
    }
  });

  test("offers the ordered locale set with current state and route-preserving links", async ({
    page,
  }) => {
    await page.goto(`${origin}/en-US/campaign/launch?experiment=phase2#features`);
    await page.getByTestId("navbar-language").click();
    const menu = page.getByTestId("navbar-language-menu-content");
    const options = menu.getByRole("menuitem");

    await expect(options).toHaveCount(locales.length);
    expect(
      await options.evaluateAll((links) => links.map((link) => link.getAttribute("hreflang"))),
    ).toEqual(locales);
    for (const locale of locales) {
      const option = menu.locator(`a[role="menuitem"][hreflang="${locale}"]`);
      await expect(option).toHaveAttribute(
        "href",
        `/${locale}/campaign/launch?experiment=phase2#features`,
      );
      if (locale === "en-US") await expect(option).toHaveAttribute("aria-current", "page");
      else await expect(option).not.toHaveAttribute("aria-current");
    }
  });

  test("each added locale renders translated copy without exposing resource keys", async ({
    page,
  }) => {
    for (const locale of ["ja-JP", "vi-VN", "th-TH", "zh-CN", "zh-TW"] as const) {
      await page.goto(`${origin}/${locale}/`);
      await expect(page.locator("html")).toHaveAttribute("lang", locale);
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
      await expect(page).toHaveTitle("K-zip");
      const heading = page.getByRole("heading", { level: 1 });
      await expect(heading).toBeVisible();
      await expect(heading).not.toHaveText("The real Korean you actually wanted to learn");
      await expect(heading).not.toHaveText(/^(?:hero|features|cta|nav|footer|proof|pricing)\./);
      await expect(page.locator("body")).not.toContainText(
        /(?:hero|features|cta|nav|footer|proof|pricing)\.[a-z.-]+/,
      );
    }

    await page.goto(`${origin}/ar/`);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    for (const locale of locales.filter((candidate) => candidate !== "ar")) {
      await page.goto(`${origin}/${locale}/`);
      await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    }
  });

  test("has no horizontal overflow at desktop or mobile widths", async ({ page }) => {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 390, height: 844 },
      { width: 320, height: 720 },
    ]) {
      await page.setViewportSize(viewport);
      await expect(page.getByTestId("landing:k-culture")).toBeVisible();
      await expectNoHorizontalOverflow(page);
    }
  });

  test("has zero serious or critical axe violations", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Run the deterministic axe scan once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
    ).toEqual([]);
  });
});
