import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { landingTestIds } from "@landing/contracts";

const apps = [
  { id: "k-drama", origin: "http://127.0.0.1:4173" },
  { id: "ai-communication", origin: "http://127.0.0.1:4174" },
  { id: "k-culture", origin: "http://127.0.0.1:4175" },
] as const;

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
    return {
      clientWidth: root.clientWidth,
      scrollWidth: root.scrollWidth,
      offenders: [...root.querySelectorAll<HTMLElement>("*")]
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
    expect(boxes[index]?.y ?? 0).toBeGreaterThanOrEqual(
      (boxes[index - 1]?.y ?? 0) + (boxes[index - 1]?.height ?? 0),
    );
  }
}

for (const app of apps) {
  test.describe(app.id, () => {
    test(`${app.id} composes its display-only Hero and media`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium",
        "Hero integration runs once per app in a deterministic desktop browser",
      );
      await page.goto(`${app.origin}/en-US/`);

      const hero = page.getByTestId(landingTestIds.hero);
      const heading = hero.getByRole("heading", { level: 1 });
      const description = hero.locator("p").first();
      const cta = hero.getByTestId(landingTestIds.heroCta);
      const media = hero.getByTestId(landingTestIds.heroMedia);

      for (const element of [hero, heading, description, cta, media]) {
        await expect(element).toBeVisible();
      }
      await expect(cta).toHaveRole("button");
      await expect(cta).toHaveText(/\S+/);
      await expect(cta).not.toHaveAttribute("href");
      await expect(cta).toHaveAttribute("aria-disabled", "true");
      await expect(media.getByRole("group", { name: /\S+/ })).toBeVisible();
      await expect(page.getByRole("heading", { level: 1 })).toHaveCount(1);
      expect(await hero.getAttribute("aria-labelledby")).toBe(await heading.getAttribute("id"));
      await expect(media.locator("img")).toHaveCount(0);
      for (const element of [heading, description, cta]) await expectCentered(element);
      await expectOrderedWithoutOverlap([heading, description, cta, media]);
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
      const description = hero.locator("p").first();
      const cta = hero.getByTestId(landingTestIds.heroCta);
      const media = hero.getByTestId(landingTestIds.heroMedia);

      for (const element of [heading, description, cta]) await expectCentered(element);
      await expectOrderedWithoutOverlap([heading, description, cta, media]);
      await expectNoHorizontalOverflow(page);
    });
  });
}

test("RTL and long pseudo content preserve Hero order without overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Direction and long-copy coverage runs once");

  for (const target of [
    `${apps[0].origin}/ar/`,
    `http://127.0.0.1:4273/pseudo.html?app=${apps[0].id}`,
  ]) {
    for (const viewport of [
      { width: 1440, height: 900 },
      { width: 320, height: 800 },
    ]) {
      await page.setViewportSize(viewport);
      await page.goto(target);
      const hero = page.getByTestId(landingTestIds.hero);
      const heading = hero.getByRole("heading", { level: 1 });
      const description = hero.locator("p").first();
      const cta = hero.getByTestId(landingTestIds.heroCta);
      const media = hero.getByTestId(landingTestIds.heroMedia);

      for (const element of [heading, description, cta]) await expectCentered(element);
      await expectOrderedWithoutOverlap([heading, description, cta, media]);
      await expectNoHorizontalOverflowWithin(hero);
    }
  }
});
