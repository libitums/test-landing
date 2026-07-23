import { expect, test, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landingTestIds } from "@landing/contracts";
import { navbarTestIds } from "@landing/contracts/navbar";

const apps = [
  {
    id: "k-drama",
    origin: `http://127.0.0.1:${process.env.K_DRAMA_E2E_PORT ?? 4173}`,
    displayOnlyHero: true,
  },
  {
    id: "ai-communication",
    origin: `http://127.0.0.1:${process.env.AI_COMMUNICATION_E2E_PORT ?? 4174}`,
    displayOnlyHero: false,
  },
  {
    id: "k-culture",
    origin: `http://127.0.0.1:${process.env.K_CULTURE_E2E_PORT ?? 4175}`,
    displayOnlyHero: false,
  },
] as const;
const pseudoOrigin = `http://127.0.0.1:${process.env.PSEUDO_E2E_PORT ?? 4273}`;
const locales = [
  { name: "ko-KR", dir: "ltr" },
  { name: "en-US", dir: "ltr" },
  { name: "ar", dir: "rtl" },
] as const;
const focusableSelector = 'a[href], button, input, select, textarea, [tabindex="0"]';

async function tabOrder(page: Page) {
  return page.locator(focusableSelector).evaluateAll((elements) => {
    const tabbable = elements.filter((element) => {
      if (!(element instanceof HTMLElement)) return false;
      const style = getComputedStyle(element);
      const rect = element.getBoundingClientRect();
      return (
        style.display !== "none" &&
        style.visibility !== "hidden" &&
        rect.width > 0 &&
        rect.height > 0 &&
        !element.closest('[aria-hidden="true"], [inert]') &&
        !element.hasAttribute("disabled") &&
        element.tabIndex >= 0
      );
    });
    return tabbable.map((element, index) => {
      element.setAttribute("data-e2e-tab-order-index", String(index));
      return {
        tag: element.tagName,
        href: element.getAttribute("href"),
        testId: element.getAttribute("data-testid"),
      };
    });
  });
}

async function expectVisibleFocus(page: Page) {
  const focusedStyle = await page.evaluate(() => {
    const activeElement = document.activeElement;
    if (!(activeElement instanceof HTMLElement)) return null;
    const style = getComputedStyle(activeElement);
    return {
      outlineStyle: style.outlineStyle,
      outlineWidth: style.outlineWidth,
    };
  });
  expect(focusedStyle).not.toBeNull();
  expect(focusedStyle?.outlineStyle).not.toBe("none");
  expect(Number.parseFloat(focusedStyle?.outlineWidth ?? "0")).toBeGreaterThan(0);
}

for (const app of apps) {
  for (const locale of locales) {
    test(`${app.id} renders ${locale.name} metadata and semantic focus order`, async ({ page }) => {
      // The focus-order walk traverses the full landing page. Disable smooth scrolling so
      // Firefox does not spend the test budget animating between distant focus targets.
      await page.emulateMedia({ reducedMotion: "reduce" });
      await page.goto(`${app.origin}/${locale.name}/campaign/launch?experiment=phase2`);

      await expect(page.locator("html")).toHaveAttribute("lang", locale.name);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
      await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
        "href",
        `${app.origin}/${locale.name}/campaign/launch`,
      );

      const alternates = page.locator('link[rel="alternate"]');
      await expect(alternates).toHaveCount(locales.length);
      for (const alternate of locales) {
        const localeAlternate = page.locator(`link[rel="alternate"][hreflang="${alternate.name}"]`);
        await expect(localeAlternate).toHaveCount(1);
        await expect(localeAlternate).toHaveAttribute(
          "href",
          `${app.origin}/${alternate.name}/campaign/launch`,
        );
      }

      const hero = page.getByTestId(landingTestIds.hero);
      const heroCta = hero.getByTestId(landingTestIds.heroCta);
      const heroHighlights = hero.getByTestId(landingTestIds.heroHighlights);
      if (app.displayOnlyHero) {
        await expect(hero.getByTestId(landingTestIds.heroLabel)).toBeVisible();
        await expect(heroCta).toBeVisible();
        await expect(heroCta).toHaveRole("button");
        await expect(heroCta).not.toHaveAttribute("href");
        await expect(heroHighlights.getByRole("listitem")).toHaveCount(3);
        await expect(hero.getByTestId(landingTestIds.heroMedia).getByRole("img")).toHaveCount(3);
      } else {
        await expect(heroCta).toBeVisible();
        await expect(heroCta).toHaveRole("button");
        await expect(heroCta).not.toHaveAttribute("href");
        await expect(heroHighlights).toBeVisible();
      }
      const sourceOrder = await tabOrder(page);
      expect(sourceOrder.length).toBeGreaterThan(5);
      const navbarOrder = sourceOrder
        .map(({ testId }) => testId)
        .filter((testId) => testId?.startsWith("navbar-"));
      expect(navbarOrder).toEqual(
        test.info().project.name === "mobile-chromium"
          ? ["navbar-logo", "navbar-language", "navbar-mobile-menu-trigger"]
          : [
              "navbar-logo",
              "navbar-how-it-works",
              "navbar-pricing",
              "navbar-language",
              "navbar-try",
            ],
      );

      for (let index = 0; index < sourceOrder.length; index += 1) {
        if (test.info().project.name === "webkit") {
          await page.locator(`[data-e2e-tab-order-index="${index}"]`).focus();
        } else {
          await page.keyboard.press("Tab");
        }
        const focused = await page.evaluate(() => ({
          tag: document.activeElement?.tagName,
          href: document.activeElement?.getAttribute("href"),
          testId: document.activeElement?.getAttribute("data-testid"),
        }));
        expect(focused).toEqual(sourceOrder[index]);
        await expectVisibleFocus(page);
      }

      expect(
        await page.evaluate(
          () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
        ),
      ).toBe(0);
      if (test.info().project.name === "chromium") {
        const results = await new AxeBuilder({ page }).analyze();
        expect(
          results.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
        ).toEqual([]);
      }
    });
  }

  test(`${app.id} locale switch preserves route, query, and hash`, async ({ page }) => {
    await page.goto(`${app.origin}/en-US/campaign/launch?experiment=phase2#features`);
    const languageTrigger = page.getByTestId(navbarTestIds.language);
    await expect(languageTrigger).toHaveRole("button");
    await languageTrigger.click();
    const languageMenu = page.getByTestId(navbarTestIds.languageMenuContent);
    await expect(languageMenu).toHaveRole("menu");
    await expect(languageMenu).toHaveAccessibleName(/\S+/);
    const arabicLink = languageMenu.locator('a[role="menuitem"][href^="/ar/"]');

    await expect(arabicLink).toHaveAttribute(
      "href",
      "/ar/campaign/launch?experiment=phase2#features",
    );
    await arabicLink.click();
    await expect(page).toHaveURL(`${app.origin}/ar/campaign/launch?experiment=phase2#features`);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
  });

  test(`${app.id} stable desktop screenshot`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "One deterministic baseline per app");
    await page.goto(`${app.origin}/en-US/`);
    await page.locator("body").evaluate((body) => body.setAttribute("data-e2e-ready", "true"));
    await expect(page).toHaveScreenshot(`${app.id}-en-US-desktop.png`, {
      fullPage: true,
    });
  });

  test(`${app.id} pseudo-locale remains visible, focusable, and accessible`, async ({
    page,
  }, testInfo) => {
    test.skip(
      !["chromium", "mobile-chromium"].includes(testInfo.project.name),
      "Pseudo-locale visual contract runs on Chromium desktop and mobile",
    );
    const pageErrors: string[] = [];
    page.on("pageerror", (error) => pageErrors.push(error.message));
    await page.goto(`${pseudoOrigin}/pseudo.html?app=${app.id}`);
    await page.waitForLoadState("networkidle");
    expect(pageErrors).toEqual([]);
    await expect(page.locator("html")).toHaveAttribute("lang", "en-XA");
    await expect(page.locator("html")).toHaveAttribute("dir", "ltr");
    await expect(page.getByRole("banner")).toBeVisible();
    await expect(page.getByRole("main")).toBeVisible();
    await expect(page.getByRole("contentinfo")).toBeVisible();
    const hero = page.getByTestId(landingTestIds.hero);
    const cta = hero.getByTestId(landingTestIds.heroCta);
    if (app.displayOnlyHero) {
      await expect(hero.getByTestId(landingTestIds.heroLabel)).toBeVisible();
      await expect(cta).toBeVisible();
      await expect(
        hero.getByTestId(landingTestIds.heroHighlights).getByRole("listitem"),
      ).toHaveCount(3);
      await expect(hero.getByTestId(landingTestIds.heroMedia).getByRole("img")).toHaveCount(3);
    } else {
      await expect(cta).toBeVisible();
      await cta.focus();
      await expect(cta).toBeFocused();
      const focusStyle = await cta.evaluate((element) => {
        const style = getComputedStyle(element);
        return {
          outlineStyle: style.outlineStyle,
          outlineWidth: style.outlineWidth,
        };
      });
      expect(focusStyle.outlineStyle).not.toBe("none");
      expect(Number.parseFloat(focusStyle.outlineWidth)).toBeGreaterThan(0);
    }
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    ).toBe(0);
    const rawKey = await page
      .locator("body")
      .evaluate((body) =>
        /(?:hero|features|cta|nav|footer|proof|comparison)\.[a-z.-]+/.test(body.textContent ?? ""),
      );
    expect(rawKey).toBe(false);
    const results = await new AxeBuilder({ page }).analyze();
    expect(
      results.violations.filter(({ impact }) => impact === "critical" || impact === "serious"),
    ).toEqual([]);
    await expect(page).toHaveScreenshot(`${app.id}-pseudo-${testInfo.project.name}.png`, {
      fullPage: true,
    });
  });

  test(`${app.id} honors reduced motion`, async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "One computed-style check per app");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto(`${app.origin}/en-US/`);

    const motion = await page.evaluate(() => {
      const button = document.querySelector<HTMLElement>(".button");
      return {
        scrollBehavior: getComputedStyle(document.documentElement).scrollBehavior,
        transitionDuration: button ? getComputedStyle(button).transitionDuration : null,
      };
    });
    expect(motion).toEqual({
      scrollBehavior: "auto",
      transitionDuration: "0s",
    });
  });
}
