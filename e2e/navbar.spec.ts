import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const apps = [
  { id: "k-drama", origin: "http://127.0.0.1:4173", localeCount: 8 },
  { id: "ai-communication", origin: "http://127.0.0.1:4174", localeCount: 8 },
  { id: "k-culture", origin: "http://127.0.0.1:4175", localeCount: 3 },
] as const;

const ids = {
  root: "navbar",
  logo: "navbar-logo",
  desktopNavigation: "navbar-desktop-navigation",
  howItWorks: "navbar-how-it-works",
  pricing: "navbar-pricing",
  language: "navbar-language",
  tryAction: "navbar-try",
  mobileMenuTrigger: "navbar-mobile-menu-trigger",
  mobileMenuContent: "navbar-mobile-menu-content",
} as const;

async function expectNamed(locator: Locator) {
  const name = await locator.getAttribute("aria-label");
  const visibleText = (await locator.textContent())?.trim();
  // An image logo carries its accessible name on the nested <img alt>, not on
  // the link's own aria-label or text. Only read it when an image is actually
  // present — a bare getAttribute would block for the full timeout otherwise.
  const image = locator.locator("img[alt]").first();
  const imageAlt = (await image.count()) > 0 ? (await image.getAttribute("alt"))?.trim() : "";
  expect(name?.trim() || visibleText || imageAlt).toBeTruthy();
}

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    )
    .toBe(0);
}

for (const app of apps) {
  test.describe(app.id, () => {
    test(`${app.id} exposes project navbar content and desktop grouping`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium",
        "Desktop layout needs one deterministic browser assertion per app",
      );
      await page.goto(`${app.origin}/en-US/`);

      const navbar = page.getByTestId(ids.root);
      const logo = navbar.getByTestId(ids.logo);
      const desktopNavigation = navbar.getByTestId(ids.desktopNavigation);
      const howItWorks = desktopNavigation.getByTestId(ids.howItWorks);
      const pricing = desktopNavigation.getByTestId(ids.pricing);
      const language = navbar.getByTestId(ids.language);
      const tryAction = navbar.getByTestId(ids.tryAction);

      await expect(navbar).toBeVisible();
      await expect(desktopNavigation).toBeVisible();
      await expect(navbar.getByTestId(ids.mobileMenuTrigger)).toBeHidden();

      for (const element of [logo, howItWorks, pricing, language, tryAction]) {
        await expect(element).toBeVisible();
        await expectNamed(element);
      }
      for (const link of [logo, howItWorks, pricing, tryAction]) {
        await expect(link).toHaveAttribute("href", /\S+/);
      }
      await expect(language).toHaveRole("button");
      await language.click();
      const languageMenu = page.getByTestId("navbar-language-menu-content");
      await expect(languageMenu).toBeVisible();
      await expect(languageMenu.getByRole("menuitem")).toHaveCount(app.localeCount);
      for (const option of await languageMenu.getByRole("menuitem").all()) {
        await expect(option).toHaveAttribute("href", /\S+/);
      }
      await page.keyboard.press("Escape");
      await expect(language).toBeFocused();
      await expectNamed(desktopNavigation);

      const boxes = await Promise.all(
        [logo, howItWorks, pricing, language, tryAction].map((element) => element.boundingBox()),
      );
      expect(boxes.every(Boolean)).toBe(true);
      const centers = boxes.map((box) => (box?.x ?? 0) + (box?.width ?? 0) / 2);
      expect(centers).toEqual([...centers].sort((a, b) => a - b));
      expect(Math.max(...boxes.map((box) => box?.y ?? 0))).toBeLessThan(
        Math.min(...boxes.map((box) => (box?.y ?? 0) + (box?.height ?? 0))),
      );

      await expectNoHorizontalOverflow(page);
    });

    test(`${app.id} hides Try and operates its mobile menu by keyboard`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chromium",
        "Mobile interaction needs one deterministic mobile project per app",
      );
      await page.goto(`${app.origin}/en-US/`);

      const navbar = page.getByTestId(ids.root);
      const trigger = navbar.getByTestId(ids.mobileMenuTrigger);
      for (const element of [
        navbar.getByTestId(ids.logo),
        navbar.getByTestId(ids.language),
        trigger,
      ]) {
        await expect(element).toBeVisible();
        await expectNamed(element);
      }
      await expect(navbar.getByTestId(ids.tryAction)).toBeHidden();
      await expect(navbar.getByTestId(ids.desktopNavigation)).toBeHidden();
      await expect(trigger).toHaveAttribute("aria-expanded", "false");
      await expect(trigger).toHaveAccessibleName("Open menu");
      await expect(page.getByTestId(ids.mobileMenuContent)).toBeHidden();
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);

      await trigger.focus();
      await page.keyboard.press("Enter");
      const menu = page.getByTestId(ids.mobileMenuContent);
      await expect(menu).toBeVisible();
      await expect(trigger).toHaveAttribute("aria-expanded", "true");
      await expect(menu).toHaveRole("dialog");
      await expect(menu).toHaveAccessibleName(/\S+/);
      await expect(menu.getByRole("button", { name: "Close menu" })).toBeVisible();
      // The sheet animates opacity 0 -> 1 on open; running axe before it settles
      // measures a translucent composite and reports a false contrast failure.
      // Wait for the animation to finish so contrast is checked on the final frame.
      await menu.evaluate((node) =>
        Promise.all(node.getAnimations({ subtree: true }).map((animation) => animation.finished)),
      );
      expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
      const mobileHowItWorks = menu.getByTestId(ids.howItWorks);
      const mobilePricing = menu.getByTestId(ids.pricing);
      for (const link of [mobileHowItWorks, mobilePricing]) {
        await expect(link).toBeVisible();
        await expect(link).toHaveAttribute("href", /\S+/);
        await expectNamed(link);
      }

      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();

      await page.keyboard.press("Space");
      await expect(menu).toBeVisible();
      await page.keyboard.press("Escape");
      await expect(menu).toBeHidden();
      await expect(trigger).toBeFocused();
      await expectNoHorizontalOverflow(page);
    });
  });
}

test("each app supplies its own navbar props", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Cross-app content comparison runs once");
  const configurations: Array<Record<string, string | null>> = [];

  for (const app of apps) {
    const page = await browser.newPage();
    await page.goto(`${app.origin}/en-US/`);
    const navbar = page.getByTestId(ids.root);
    const configuration: Record<string, string | null> = {};
    for (const [slot, testId] of Object.entries({
      logo: ids.logo,
      howItWorks: ids.howItWorks,
      pricing: ids.pricing,
      language: ids.language,
      tryAction: ids.tryAction,
    })) {
      const element = navbar.getByTestId(testId).filter({ visible: true }).first();
      configuration[`${slot}Text`] = (await element.textContent())?.trim() ?? null;
      configuration[`${slot}Name`] = await element.getAttribute("aria-label");
      configuration[`${slot}Href`] = await element.getAttribute("href");
    }
    configurations.push(configuration);
    await page.close();
  }

  expect(new Set(configurations.map((configuration) => JSON.stringify(configuration))).size).toBe(
    apps.length,
  );
});
