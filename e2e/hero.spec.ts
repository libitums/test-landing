import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landingTestIds } from "@landing/contracts";

const apps = [
  {
    id: "k-drama",
    origin: `http://127.0.0.1:${process.env.K_DRAMA_E2E_PORT ?? 4173}`,
    displayOnly: true,
    hasMedia: true,
    heroLabel: true,
    // Painted white by the app; the others inherit the page surface.
    heroBackground: "rgb(255, 255, 255)",
    // Built from CSS alone; the other two compose real artwork.
    cssOnlyMedia: true,
  },
  {
    id: "ai-communication",
    origin: `http://127.0.0.1:${process.env.AI_COMMUNICATION_E2E_PORT ?? 4174}`,
    displayOnly: false,
    hasMedia: true,
    heroLabel: false,
    heroBackground: null,
    cssOnlyMedia: false,
  },
  {
    id: "k-culture",
    origin: `http://127.0.0.1:${process.env.K_CULTURE_E2E_PORT ?? 4175}`,
    // Media-rich like k-drama, but with no eyebrow label above the heading.
    displayOnly: true,
    hasMedia: true,
    heroLabel: false,
    heroBackground: null,
    cssOnlyMedia: false,
  },
] as const;
const pseudoOrigin = `http://127.0.0.1:${process.env.PSEUDO_E2E_PORT ?? 4273}`;

async function expectNoHorizontalOverflow(page: Page) {
  const result = await page.evaluate(() => {
    const viewportWidth = document.documentElement.clientWidth;
    return {
      clientWidth: viewportWidth,
      scrollWidth: document.documentElement.scrollWidth,
      offenders: [...document.querySelectorAll<HTMLElement>("body *")]
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            testId: element.dataset.testid ?? null,
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(box.left),
            right: Math.round(box.right),
          };
        })
        .filter(({ left, right }) => left < 0 || right > viewportWidth)
        .slice(0, 10),
    };
  });
  expect(result.scrollWidth, JSON.stringify(result)).toBe(result.clientWidth);
}

async function expectCentered(locator: Locator) {
  await expect
    .poll(() =>
      locator.evaluate((element) => {
        const style = getComputedStyle(element);
        return style.textAlign;
      }),
    )
    .toBe("center");
}

async function expectNoHorizontalOverflowWithin(locator: Locator) {
  const result = await locator.evaluate((root) => {
    const rootBox = root.getBoundingClientRect();
    // Content parked outside its own scroll container is reachable by swiping, not lost
    // off the page, so it is not what this check is looking for.
    const insideScroller = (element: Element) => {
      for (let node = element.parentElement; node && node !== root; node = node.parentElement) {
        const overflow = getComputedStyle(node).overflowX;
        if (overflow === "auto" || overflow === "scroll") return true;
      }
      return false;
    };
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      offenders: [...root.querySelectorAll<HTMLElement>("*")]
        .filter((element) => !insideScroller(element))
        .map((element) => {
          const box = element.getBoundingClientRect();
          return {
            tag: element.tagName.toLowerCase(),
            testId: element.dataset.testid ?? null,
            className: typeof element.className === "string" ? element.className : "",
            left: Math.round(box.left),
            right: Math.round(box.right),
          };
        })
        .filter(({ left, right }) => left < rootBox.left || right > rootBox.right)
        .slice(0, 10),
    };
  });
  expect(result.scrollWidth, JSON.stringify(result)).toBe(result.clientWidth);
}

async function expectOrderedWithoutOverlap(locators: readonly Locator[]) {
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
  expect(boxes.every(Boolean)).toBe(true);
  for (let index = 1; index < boxes.length; index += 1) {
    expect(boxes[index]?.y ?? 0, JSON.stringify(boxes)).toBeGreaterThanOrEqual(
      (boxes[index - 1]?.y ?? 0) + (boxes[index - 1]?.height ?? 0),
    );
  }
}

/**
 * Same contract as above, one axis over. The hero media is a swipe rail on phones, so its
 * cards run along the inline axis instead of stacking; what has to hold is still that they
 * keep their order and do not sit on top of each other.
 */
async function expectInlineOrderedWithoutOverlap(locators: readonly Locator[], rtl = false) {
  const boxes = await Promise.all(locators.map((locator) => locator.boundingBox()));
  expect(boxes.every(Boolean)).toBe(true);
  for (let index = 1; index < boxes.length; index += 1) {
    const previous = boxes[index - 1];
    const current = boxes[index];
    if (rtl) {
      // Right to left: the next card ends where the previous one starts.
      expect((current?.x ?? 0) + (current?.width ?? 0), JSON.stringify(boxes)).toBeLessThanOrEqual(
        previous?.x ?? 0,
      );
    } else {
      expect(current?.x ?? 0, JSON.stringify(boxes)).toBeGreaterThanOrEqual(
        (previous?.x ?? 0) + (previous?.width ?? 0),
      );
    }
  }
}

for (const app of apps) {
  test.describe(app.id, () => {
    test(`${app.id} composes its Hero content and media`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium",
        "Hero integration runs once per app in a deterministic desktop browser",
      );
      await page.goto(`${app.origin}/en-US/`);

      const hero = page.getByTestId(landingTestIds.hero);
      const heading = hero.getByRole("heading", { level: 1 });
      const description = hero.locator(".hero__description");
      const cta = hero.getByTestId(landingTestIds.heroCta);
      const highlights = hero.getByTestId(landingTestIds.heroHighlights);
      const media = hero.getByTestId(landingTestIds.heroMedia);

      for (const element of [hero, heading, description]) {
        await expect(element).toBeVisible();
      }
      await expect(media).toHaveCount(app.hasMedia ? 1 : 0);
      if (app.displayOnly) {
        const label = hero.getByTestId(landingTestIds.heroLabel);
        const visuals = media.getByRole("img", { name: /\S+/ });
        if (app.heroLabel) {
          await expect(label).toBeVisible();
          await expect(label).toHaveText(/\S+/);
        } else {
          await expect(label).toHaveCount(0);
        }
        await expect(cta).toBeVisible();
        await expect(cta).toHaveRole("button");
        await expect(cta).toHaveText(/\S+/);
        await expect(cta).not.toHaveAttribute("href");
        // k-drama's hero CTA now opens the early-access modal, so it is an
        // active button rather than an inert display-only control.
        await expect(cta).not.toHaveAttribute("aria-disabled", "true");
        await expect(highlights).toBeVisible();
        await expect(highlights.getByRole("listitem")).toHaveCount(3);
        await expect(visuals).toHaveCount(3);
        await expect(media.getByRole("button")).toHaveCount(0);
        await expect(media.getByRole("link")).toHaveCount(0);
        if (app.heroLabel) await expectCentered(label);
        await expectCentered(cta);
        await expectOrderedWithoutOverlap([
          ...(app.heroLabel ? [label] : []),
          heading,
          description,
          cta,
          highlights,
          visuals.first(),
        ]);
        if (app.heroBackground) {
          await expect
            .poll(() => hero.evaluate((element) => getComputedStyle(element).backgroundColor))
            .toBe(app.heroBackground);
        }
      } else if (app.hasMedia) {
        await expect(hero.getByTestId(landingTestIds.heroLabel)).toHaveCount(0);
        await expect(cta).toBeVisible();
        await expect(cta).toHaveRole("button");
        await expect(cta).toHaveText(/\S+/);
        await expect(cta).not.toHaveAttribute("href");
        await expect(cta).toHaveAttribute("aria-disabled", "true");
        await expect(highlights).toBeVisible();
        await expect(media.getByRole("group", { name: /\S+/ })).toBeVisible();
        await expectCentered(cta);
        await expectOrderedWithoutOverlap([heading, description, cta, highlights, media]);
      } else {
        await expect(hero.getByTestId(landingTestIds.heroLabel)).toHaveCount(0);
        await expect(cta).toBeVisible();
        await expect(cta).toHaveRole("button");
        await expect(cta).toHaveText(/\S+/);
        await expect(cta).not.toHaveAttribute("href");
        await expect(cta).toHaveAttribute("aria-disabled", "true");
        await expect(highlights).toBeVisible();
        await expectCentered(cta);
        await expectOrderedWithoutOverlap([heading, description, cta, highlights]);
      }
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await hero.getAttribute("aria-labelledby")).toBe(await heading.getAttribute("id"));
      if (app.cssOnlyMedia) await expect(media.locator("img")).toHaveCount(0);
      for (const element of [heading, description]) await expectCentered(element);
      await expectNoHorizontalOverflowWithin(hero);
      const { violations } = await new AxeBuilder({ page })
        .include(`[data-testid="${landingTestIds.hero}"]`)
        .analyze();
      expect(
        violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
      ).toEqual([]);
    });

    test(`${app.id} keeps its Hero ordered on mobile`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chromium",
        "Hero mobile layout runs once per app in a deterministic mobile browser",
      );
      await page.goto(`${app.origin}/en-US/`);
      const hero = page.getByTestId(landingTestIds.hero);
      const heading = hero.getByRole("heading", { level: 1 });
      const description = hero.locator(".hero__description");
      const cta = hero.getByTestId(landingTestIds.heroCta);
      const highlights = hero.getByTestId(landingTestIds.heroHighlights);
      const media = hero.getByTestId(landingTestIds.heroMedia);

      for (const element of [heading, description]) await expectCentered(element);
      if (app.displayOnly) {
        const label = hero.getByTestId(landingTestIds.heroLabel);
        const visuals = media.getByRole("img", { name: /\S+/ });
        if (app.heroLabel) await expectCentered(label);
        await expectCentered(cta);
        await expect(highlights.getByRole("listitem")).toHaveCount(3);
        await expect(visuals).toHaveCount(3);
        await expectOrderedWithoutOverlap([
          ...(app.heroLabel ? [label] : []),
          heading,
          description,
          cta,
          highlights,
          media,
        ]);
        await expectInlineOrderedWithoutOverlap(await visuals.all());
        if (app.heroBackground) {
          await expect
            .poll(() => hero.evaluate((element) => getComputedStyle(element).backgroundColor))
            .toBe(app.heroBackground);
        }
      } else if (app.hasMedia) {
        await expectCentered(cta);
        await expectOrderedWithoutOverlap([
          heading,
          description,
          cta,
          hero.getByTestId(landingTestIds.heroHighlights),
          media,
        ]);
      } else {
        await expect(media).toHaveCount(0);
        await expectCentered(cta);
        await expectOrderedWithoutOverlap([heading, description, cta, highlights]);
      }
      await expectNoHorizontalOverflow(page);
    });
  });
}

test("RTL and long pseudo content preserve Hero order without overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Direction and long-copy coverage runs once");

  for (const target of [`${apps[0].origin}/ar/`, `${pseudoOrigin}/pseudo.html?app=${apps[0].id}`]) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 320, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(target);
      const hero = page.getByTestId(landingTestIds.hero);
      const label = hero.getByTestId(landingTestIds.heroLabel);
      const heading = hero.getByRole("heading", { level: 1 });
      const description = hero.locator(".hero__description");
      const cta = hero.getByTestId(landingTestIds.heroCta);
      const highlights = hero.getByTestId(landingTestIds.heroHighlights);
      const media = hero.getByTestId(landingTestIds.heroMedia);
      const visuals = media.getByRole("img", { name: /\S+/ });

      for (const element of [label, heading, description]) await expectCentered(element);
      await expect(cta).toBeVisible();
      await expect(highlights.getByRole("listitem")).toHaveCount(3);
      await expect(visuals).toHaveCount(3);
      await expectOrderedWithoutOverlap([label, heading, description, cta, highlights, media]);
      if (viewport.width <= 768) {
        const rtl = await hero.evaluate((element) => getComputedStyle(element).direction === "rtl");
        await expectInlineOrderedWithoutOverlap(await visuals.all(), rtl);
      }
      await expect
        .poll(() => hero.evaluate((element) => getComputedStyle(element).backgroundColor))
        .toBe("rgb(255, 255, 255)");
      await expectNoHorizontalOverflowWithin(hero);
    }
  }
});
