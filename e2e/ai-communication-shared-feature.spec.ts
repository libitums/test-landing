import AxeBuilder from "@axe-core/playwright";
import { expect, test, type Locator, type Page } from "@playwright/test";

const features = [
  { id: "ai-communication-roleplay", appearance: "white" },
  { id: "ai-communication-corrections", appearance: "soft" },
  { id: "ai-communication-personas", appearance: "white" },
] as const;

const desktopProjects = new Set(["chromium", "firefox", "webkit"]);
const mobileProjects = new Set(["mobile-chromium", "mobile-webkit", "mobile-320-chromium"]);
const earlyAccessPath = "/en-US/ai-communication/early-access";
const localizedCtaNames = {
  "en-US": "Get early access",
  "ko-KR": "얼리 액세스 신청",
  ar: "اطلب الوصول المبكر",
} as const;

const rootTestId = (id: string) => `shared-feature:${id}`;
const slotTestId = (id: string, slot: string) => `${rootTestId(id)}:${slot}`;

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    )
    .toBeLessThanOrEqual(0);
}

async function expectSemanticOrder(root: Locator, id: string) {
  const expectedIds = [
    slotTestId(id, "number-label"),
    slotTestId(id, "header"),
    slotTestId(id, "subheader"),
    slotTestId(id, "content"),
  ];

  const actualIds = await root
    .locator(":scope [data-testid]")
    .evaluateAll(
      (nodes, expected) =>
        nodes
          .map((node) => node.getAttribute("data-testid"))
          .filter(
            (candidate): candidate is string =>
              candidate !== null && (expected as string[]).includes(candidate),
          ),
      expectedIds,
    );
  expect(actualIds).toEqual(expectedIds);
}

async function expectVisibleFeature(page: Page, id: string) {
  const root = page.getByTestId(rootTestId(id));
  const number = root.getByTestId(slotTestId(id, "number-label"));
  const header = root.getByTestId(slotTestId(id, "header"));
  const subheader = root.getByTestId(slotTestId(id, "subheader"));
  const content = root.getByTestId(slotTestId(id, "content"));

  await expect(root).toBeVisible();
  await expect(root).toHaveRole("region");
  await expect(header).toHaveRole("heading");
  await expect(header).toHaveJSProperty("tagName", "H2");
  for (const slot of [number, header, subheader, content]) {
    await expect(slot).toBeVisible();
  }
  for (const copy of [number, header, subheader]) {
    await expect(copy).toContainText(/\S/);
  }
  expect(await content.locator(":scope > *").count()).toBeGreaterThan(0);
  await expectSemanticOrder(root, id);

  return { root, number, header, subheader, content };
}

async function expectNoMobileOverlap(slots: Locator[]) {
  const boxes = await Promise.all(slots.map((slot) => slot.boundingBox()));
  for (let index = 0; index < boxes.length - 1; index += 1) {
    const current = boxes[index];
    const next = boxes[index + 1];
    expect(current, `slot ${index} must have a layout box`).not.toBeNull();
    expect(next, `slot ${index + 1} must have a layout box`).not.toBeNull();
    expect((current?.y ?? 0) + (current?.height ?? 0)).toBeLessThanOrEqual((next?.y ?? 0) + 1);
  }
}

test.describe("ai-communication shared features", () => {
  test("feature landmarks, names, and decorative boundaries are exposed correctly", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Accessibility tree contract runs once");
    await page.goto("/en-US/");

    await expect(page.getByRole("main")).toHaveCount(1);
    for (const feature of features) {
      const { root, header } = await expectVisibleFeature(page, feature.id);
      const headingId = await header.getAttribute("id");
      expect(headingId).toBeTruthy();
      await expect(root).toHaveAttribute("aria-labelledby", headingId ?? "");
      await expect(root).toHaveAccessibleName(await header.innerText());

      // Each feature owns one visual boundary. Its localized mock content must
      // remain absent from the accessibility tree rather than being announced
      // as a second, non-interactive experience.
      const visual = root.locator('[class$="__visual"][aria-hidden="true"]');
      await expect(visual).toHaveCount(1);
      await expect(visual).toHaveAttribute("aria-hidden", "true");
      expect(
        await visual
          .locator('a, button, input, select, textarea, [tabindex]:not([tabindex="-1"])')
          .count(),
      ).toBe(0);
    }
  });

  test("keyboard reaches the three feature CTAs once and in document order", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Keyboard flow runs once");
    await page.goto("/en-US/");

    const visitedFeatureCtas: string[] = [];
    for (let press = 0; press < 40 && visitedFeatureCtas.length < features.length; press += 1) {
      await page.keyboard.press("Tab");
      const testId = await page.evaluate(() => document.activeElement?.getAttribute("data-testid"));
      if (testId?.endsWith(":early-access-cta")) visitedFeatureCtas.push(testId);
    }

    expect(visitedFeatureCtas).toEqual(
      features.map(({ id }) => slotTestId(id, "early-access-cta")),
    );
  });

  test("reduced motion leaves feature visuals and controls static", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Reduced-motion contract runs once");
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en-US/");

    const movingParts = page.locator(
      "#features .feature-bias__chatrow-preview-text, #features .feature-corrections__wave span, #features .feature-corrections__typing, #features .feature-corrections__reply .feature-corrections__bubble--fill, #features .feature-corrections__cr-msg, #features .feature-corrections__feedback, #features .feature-roleplay__chat-lead, #features .feature-roleplay__scene",
    );
    expect(await movingParts.count()).toBeGreaterThan(0);
    for (const part of await movingParts.all()) {
      await expect(part).toHaveCSS("animation-name", "none");
    }
    for (const feature of features) {
      await expect(page.getByTestId(slotTestId(feature.id, "early-access-cta"))).toHaveCSS(
        "transition-duration",
        "0s",
      );
    }
  });

  test("desktop renders roleplay/corrections/personas with their explicit appearances", async ({
    page,
  }, testInfo) => {
    test.skip(!desktopProjects.has(testInfo.project.name), "Desktop browser contract");
    await page.goto("/en-US/");

    await expect(
      page.locator(
        '[data-testid^="shared-feature:"][data-testid$="roleplay"], [data-testid^="shared-feature:"][data-testid$="corrections"], [data-testid^="shared-feature:"][data-testid$="personas"]',
      ),
    ).toHaveCount(3);
    for (const feature of features) {
      const { root } = await expectVisibleFeature(page, feature.id);
      await expect(root).toHaveClass(
        new RegExp(`(?:^|\\s)shared-feature--${feature.appearance}(?:\\s|$)`),
      );
      const appearanceClasses = await root.evaluate((node) =>
        [...node.classList].filter((className) => className.startsWith("shared-feature--")),
      );
      expect(appearanceClasses).toEqual([`shared-feature--${feature.appearance}`]);

      const cta = root.getByTestId(slotTestId(feature.id, "early-access-cta"));
      await expect(cta).toHaveRole("link");
      await expect(cta).toHaveAccessibleName(localizedCtaNames["en-US"]);
      await expect(cta).toHaveAttribute("href", earlyAccessPath);
      await expect(cta).toHaveClass(/button--text/);
      await cta.focus();
      await expect(cta).toBeFocused();
      const focus = await cta.evaluate((node) => {
        const style = getComputedStyle(node);
        return { outline: style.outlineStyle, width: Number.parseFloat(style.outlineWidth) };
      });
      expect(focus.outline).not.toBe("none");
      expect(focus.width).toBeGreaterThan(0);
    }
    await expectNoHorizontalOverflow(page);
  });

  test("every native feature CTA opens the early-access modal without navigation", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Modal activation is engine-independent");

    for (const feature of features) {
      await page.goto("/en-US/");
      const cta = page.getByTestId(slotTestId(feature.id, "early-access-cta"));
      await expect(cta).toHaveJSProperty("tagName", "A");
      await cta.click();
      await expect(page).toHaveURL(/\/en-US\/$/);
      await expect(page.getByRole("dialog", { name: "Reserve your spot" })).toBeVisible();
      await page.getByRole("button", { name: "Close early-access form" }).click();
      await expect(page.getByRole("dialog")).toHaveCount(0);
    }
  });

  test("mobile keeps semantic order visible without overlap or horizontal overflow", async ({
    page,
  }, testInfo) => {
    test.skip(!mobileProjects.has(testInfo.project.name), "Mobile responsive contract");
    await page.goto("/en-US/");

    for (const feature of features) {
      const { number, header, subheader, content } = await expectVisibleFeature(page, feature.id);
      await expectNoMobileOverlap([number, header, subheader, content]);
      const cta = content.getByTestId(slotTestId(feature.id, "early-access-cta"));
      await expect(cta).toBeVisible();
      const viewportWidth = page.viewportSize()?.width ?? 0;
      const box = await cta.boundingBox();
      expect(box).not.toBeNull();
      expect(box?.x ?? -1).toBeGreaterThanOrEqual(0);
      expect((box?.x ?? 0) + (box?.width ?? 0)).toBeLessThanOrEqual(viewportWidth + 1);
    }
    await expectNoHorizontalOverflow(page);
  });

  test("en-US, Arabic, and pseudo copy preserve roots and fit the viewport", async ({
    page,
  }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Locale matrix runs once");
    const locales = [
      { path: "/en-US/", lang: "en-US", dir: "ltr" },
      { path: "/ar/", lang: "ar", dir: "rtl" },
      { path: "/en-US/?pseudo=1", lang: "en-XA", dir: "ltr" },
    ] as const;

    for (const locale of locales) {
      await page.goto(locale.path);
      await expect(page.locator("html")).toHaveAttribute("lang", locale.lang);
      await expect(page.locator("html")).toHaveAttribute("dir", locale.dir);
      for (const feature of features) {
        const { root, header, subheader } = await expectVisibleFeature(page, feature.id);
        await expect(root).toHaveAccessibleName(/\S/);
        await expect(header).not.toContainText(/feature\.[a-z.-]+/);
        await expect(subheader).not.toContainText(/feature\.[a-z.-]+/);
      }
      await expectNoHorizontalOverflow(page);
    }
  });

  test("real locales expose localized feature CTA names", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Locale accessibility contract runs once");
    for (const locale of ["en-US", "ko-KR", "ar"] as const) {
      await page.goto(`/${locale}/`);
      for (const feature of features) {
        await expect(
          page.getByTestId(slotTestId(feature.id, "early-access-cta")),
        ).toHaveAccessibleName(localizedCtaNames[locale]);
      }
    }
  });

  test("default motion keeps repeated axe samples AA-safe", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Animated axe sampling runs once");
    await page.goto("/en-US/");

    for (let sample = 0; sample < 3; sample += 1) {
      await page.evaluate(
        (timelineTime) => {
          for (const animation of document.getAnimations()) animation.currentTime = timelineTime;
        },
        (sample + 1) * 500,
      );
      const results = await new AxeBuilder({ page }).include("#features").analyze();
      expect(
        results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
        `default-motion axe sample ${sample + 1}`,
      ).toEqual([]);
    }
  });

  test("feature region has no serious or critical axe violations", async ({ page }, testInfo) => {
    test.skip(
      !["chromium", "mobile-webkit"].includes(testInfo.project.name),
      "Axe covers desktop Chromium and mobile WebKit",
    );
    // Freeze staged decorative fades so axe samples the authored foreground
    // and background colors instead of a transient composited opacity frame.
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en-US/");

    const results = await new AxeBuilder({ page }).include("#features").analyze();
    expect(
      results.violations.filter(({ impact }) => impact === "serious" || impact === "critical"),
    ).toEqual([]);
  });

  test("200% desktop-equivalent reflow has no horizontal overflow", async ({ page }, testInfo) => {
    test.skip(testInfo.project.name !== "chromium", "Reflow contract runs once");
    // A 640 CSS-pixel viewport is the reflow equivalent of 200% zoom on the
    // 1280px desktop baseline and avoids browser-specific page-zoom APIs.
    await page.setViewportSize({ width: 640, height: 720 });
    await page.goto("/en-US/");
    for (const feature of features) await expectVisibleFeature(page, feature.id);
    await expectNoHorizontalOverflow(page);
  });

  test("en-US shared features match deterministic visual baselines", async ({ page }, testInfo) => {
    test.skip(
      !["chromium", "mobile-320-chromium"].includes(testInfo.project.name),
      "One desktop and one narrow mobile baseline",
    );
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/en-US/");

    const featureRegion = page.locator("#features");
    await expect(featureRegion).toBeVisible();
    for (const feature of features) {
      await expect(page.getByTestId(rootTestId(feature.id))).toBeVisible();
    }
    await expectNoHorizontalOverflow(page);
    await expect(featureRegion).toHaveScreenshot(
      `ai-communication-shared-features-en-US-${testInfo.project.name}.png`,
    );
  });
});
