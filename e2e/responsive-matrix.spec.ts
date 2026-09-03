import { expect, test } from "@playwright/test";

/**
 * The guaranteed width range, decided after measurement showed 99%+ of traffic on phones.
 * 320 is an iPhone SE, 430 an iPhone 15 Pro Max, 820 an iPad in portrait — the two ends
 * where the desktop-first layout was still breaking.
 */
const viewports = [
  { width: 320, height: 568, label: "iPhone SE" },
  { width: 360, height: 640, label: "small Android" },
  { width: 390, height: 844, label: "iPhone 12" },
  { width: 412, height: 915, label: "Pixel 7" },
  { width: 430, height: 932, label: "iPhone 15 Pro Max" },
  { width: 820, height: 1180, label: "iPad portrait" },
] as const;

const apps = [
  { id: "k-drama", origin: "http://127.0.0.1:4173" },
  { id: "ai-communication", origin: "http://127.0.0.1:4174" },
  { id: "k-culture", origin: "http://127.0.0.1:4175" },
] as const;

/** The sections the engagement reporter tracks, named exactly as it names them. */
const namedSections = [
  ["hero", '[data-testid="hero"]'],
  ["proof", "#proof"],
  ["cta", "#cta"],
  ["pricing", "#pricing"],
] as const;

test.describe("responsive matrix", () => {
  for (const app of apps) {
    for (const { width, height, label } of viewports) {
      test(`${app.id} fits and stays measurable at ${width}x${height} (${label})`, async ({
        page,
      }, testInfo) => {
        test.skip(
          testInfo.project.name !== "chromium",
          "The matrix drives its own viewports; one engine is enough",
        );
        await page.setViewportSize({ width, height });
        await page.goto(`${app.origin}/en-US/`, { waitUntil: "networkidle" });

        // 1. Nothing sticks out sideways. Horizontal scroll on a phone hides content that
        //    the visitor never learns is there.
        const overflow = await page.evaluate(() => {
          const root = document.documentElement;
          return root.scrollWidth - root.clientWidth;
        });
        expect(overflow, `${app.id} overflows by ${overflow}px at ${width}px`).toBeLessThanOrEqual(
          0,
        );

        // 2. Every tracked section can satisfy the visibility rule the reporter uses:
        //    half the section visible, or half the viewport covered. A section that can
        //    never satisfy it is invisible to measurement no matter how long it is read.
        const unmeasurable = await page.evaluate(
          ({ selectors }) => {
            const viewportHeight = window.innerHeight;
            const failures: string[] = [];
            const check = (id: string, element: Element | null) => {
              if (element === null) return;
              const height = element.getBoundingClientRect().height;
              if (height <= 0) {
                failures.push(`${id}: zero height`);
                return;
              }
              const visible = Math.min(height, viewportHeight);
              if (visible / height < 0.5 && visible / viewportHeight < 0.5) {
                failures.push(`${id}: ${Math.round(height)}px in ${viewportHeight}px viewport`);
              }
            };
            for (const [id, selector] of selectors) {
              check(id, document.querySelector(selector));
            }
            for (const element of document.querySelectorAll("[data-testid^='shared-feature:']")) {
              const testId = element.getAttribute("data-testid") ?? "";
              if (/^shared-feature:[^:]+$/.test(testId)) check(testId, element);
            }
            return failures;
          },
          { selectors: namedSections },
        );
        expect(unmeasurable, `${app.id} at ${width}px`).toEqual([]);

        // 3. The primary call to action stays inside the viewport and stays tappable —
        //    on both axes. Height is the one that was wrong: the hero kept the same
        //    vertical spend on a 568px screen as on a 932px one, so the action fell
        //    below the fold exactly on the shortest phones.
        const cta = page
          .locator('[data-testid="hero"] button, [data-testid="hero"] a[href]')
          .first();
        await expect(cta).toBeVisible();
        const box = await cta.boundingBox();
        expect(box).not.toBeNull();
        expect(box!.x + box!.width).toBeLessThanOrEqual(width + 1);
        expect(box!.height).toBeGreaterThanOrEqual(44);
        expect(
          Math.round(box!.y + box!.height),
          `${app.id} hero CTA falls below the first screen at ${width}x${height}`,
        ).toBeLessThanOrEqual(height);

        // 4. The hero answers to the height of the device it is on. Two screens of hero
        //    means the visitor scrolls past the whole pitch before reaching anything else,
        //    and the shorter the phone the worse it got.
        const heroScreens = await page.evaluate(() => {
          const hero = document.querySelector('[data-testid="hero"]');
          return hero ? hero.getBoundingClientRect().height / window.innerHeight : 0;
        });
        expect(
          Number(heroScreens.toFixed(2)),
          `${app.id} hero spends ${heroScreens.toFixed(2)} screens at ${width}x${height}`,
        ).toBeLessThanOrEqual(2);
      });
    }
  }
});
