import { expect, test, type Locator, type Page } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { footerTestIds } from "@landing/contracts/footer";

const apps = [
  { id: "k-drama", origin: "http://127.0.0.1:4173" },
  { id: "ai-communication", origin: "http://127.0.0.1:4174" },
  { id: "k-culture", origin: "http://127.0.0.1:4175" },
] as const;

async function expectNoHorizontalOverflow(page: Page) {
  await expect
    .poll(() =>
      page.evaluate(
        () => document.documentElement.scrollWidth - document.documentElement.clientWidth,
      ),
    )
    .toBe(0);
}

async function expectNamed(locator: Locator) {
  await expect(locator).toHaveAccessibleName(/\S+/);
}

async function expectNoSeriousAxeViolations(page: Page) {
  const { violations } = await new AxeBuilder({ page })
    .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa"])
    .analyze();
  expect(violations.filter(({ impact }) => impact === "serious" || impact === "critical")).toEqual(
    [],
  );
}

async function getFooter(page: Page) {
  const footer = page.getByTestId(footerTestIds.root);
  await expect(footer).toBeVisible();
  await expect(footer).toHaveRole("contentinfo");
  await expectNamed(footer);
  return footer;
}

for (const app of apps) {
  test.describe(app.id, () => {
    test(`${app.id} supplies complete localized footer content`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium",
        "Cross-app content integration runs once per app in a deterministic browser",
      );
      await page.goto(`${app.origin}/en-US/`);
      const footer = await getFooter(page);
      const logo = footer.getByTestId(footerTestIds.logo);
      const navigation = footer.getByTestId(footerTestIds.linksNavigation);
      const policies = footer.getByTestId(footerTestIds.policyNavigation);
      const copyright = footer.getByTestId(footerTestIds.copyright);
      const faq = footer.getByTestId(footerTestIds.faq);

      await expect(logo).toHaveRole("link");
      await expect(logo).toHaveAttribute("href", /\S+/);
      await expectNamed(logo);
      for (const group of [navigation, policies]) {
        await expect(group).toHaveRole("navigation");
        await expectNamed(group);
        expect(await group.getByRole("link").count()).toBeGreaterThan(0);
        for (const link of await group.getByRole("link").all()) {
          await expectNamed(link);
          await expect(link).toHaveAttribute("href", /\S+/);
        }
      }
      const localeLinks = navigation.getByRole("link");
      const currentLocaleByAttribute = navigation.locator('a[aria-current="page"]');
      await expect(currentLocaleByAttribute).toHaveCount(1);
      await expect(currentLocaleByAttribute).toHaveAttribute("href", /^\/en-US(?:\/|$)/);
      const nonCurrentLocales = navigation.locator("a:not([aria-current])");
      await expect(nonCurrentLocales).toHaveCount((await localeLinks.count()) - 1);
      for (const link of await nonCurrentLocales.all()) {
        await expect(link).not.toHaveAttribute("aria-current", /.+/);
      }
      await expect(copyright).toContainText(/\S+/);
      await expectNamed(faq);
      expect(await faq.getByRole("button").count()).toBeGreaterThan(0);
      await expect(faq.getByRole("button").first()).toHaveAttribute(
        "aria-expanded",
        app.id === "k-drama" ? "true" : "false",
      );

      const order = await footer
        .locator("[data-testid]")
        .evaluateAll((elements) =>
          elements
            .map((element) => element.getAttribute("data-testid"))
            .filter((id) =>
              [
                "footer-faq",
                "footer-logo",
                "footer-links-navigation",
                "footer-policy-navigation",
                "footer-copyright",
              ].includes(id ?? ""),
            ),
        );
      expect(order).toEqual([
        footerTestIds.faq,
        footerTestIds.logo,
        footerTestIds.linksNavigation,
        footerTestIds.policyNavigation,
        footerTestIds.copyright,
      ]);
      await expectNoHorizontalOverflow(page);
    });

    test(`${app.id} operates multiple FAQ answers by pointer, Enter, and Space`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "chromium",
        "Keyboard and axe state coverage runs once per app",
      );
      await page.goto(`${app.origin}/en-US/`);
      const footer = await getFooter(page);
      const triggers = footer.getByTestId(footerTestIds.faq).getByRole("button");
      expect(await triggers.count()).toBeGreaterThanOrEqual(2);
      const first = triggers.nth(0);
      const second = triggers.nth(1);

      await expectNoSeriousAxeViolations(page);
      if ((await first.getAttribute("aria-expanded")) === "true") {
        await first.click();
        await expect(first).toHaveAttribute("aria-expanded", "false");
      }
      await first.click();
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-controls", /\S+/);
      const controlledId = await first.getAttribute("aria-controls");
      expect(controlledId).toBeTruthy();
      await expect(page.locator(`#${controlledId}`)).toBeVisible();

      await second.focus();
      await page.keyboard.press("Enter");
      await expect(second).toBeFocused();
      await expect(second).toHaveAttribute("aria-expanded", "true");
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await expectNoSeriousAxeViolations(page);

      await page.keyboard.press("Space");
      await expect(second).toBeFocused();
      await expect(second).toHaveAttribute("aria-expanded", "false");
      await expect(first).toHaveAttribute("aria-expanded", "true");
      await first.click();
      await expect(first).toHaveAttribute("aria-expanded", "false");
    });

    test(`${app.id} has no mobile overflow with wrapped footer content`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chromium",
        "Mobile layout needs one deterministic mobile project per app",
      );
      await page.goto(`${app.origin}/en-US/`);
      const footer = await getFooter(page);
      const slots = [
        footer.getByTestId(footerTestIds.faq),
        footer.getByTestId(footerTestIds.logo),
        footer.getByTestId(footerTestIds.linksNavigation),
        footer.getByTestId(footerTestIds.policyNavigation),
        footer.getByTestId(footerTestIds.copyright),
      ];
      for (const slot of slots) await expect(slot).toBeVisible();
      const boxes = await Promise.all(slots.map((slot) => slot.boundingBox()));
      expect(boxes.every(Boolean)).toBe(true);
      expect(boxes.map((box) => box?.y ?? 0)).toEqual(
        [...boxes].map((box) => box?.y ?? 0).sort((a, b) => a - b),
      );
      await expectNoHorizontalOverflow(page);
    });
  });
}

test("each app supplies distinct footer content", async ({ browser }, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Cross-app comparison runs once");
  const configurations: string[] = [];
  for (const app of apps) {
    const page = await browser.newPage();
    await page.goto(`${app.origin}/en-US/`);
    const footer = await getFooter(page);
    configurations.push(
      await footer.evaluate((element) =>
        [
          element.querySelector('[data-testid="footer-logo"]')?.textContent?.trim(),
          element.querySelector('[data-testid="footer-faq"]')?.textContent?.trim(),
          element.querySelector('[data-testid="footer-links-navigation"]')?.textContent?.trim(),
          element.querySelector('[data-testid="footer-policy-navigation"]')?.textContent?.trim(),
          element.querySelector('[data-testid="footer-copyright"]')?.textContent?.trim(),
        ].join("|"),
      ),
    );
    await page.close();
  }
  expect(new Set(configurations).size).toBe(apps.length);
});

test("RTL preserves semantic order and avoids desktop and narrow overflow", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "RTL coverage runs once");
  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 320, height: 800 },
  ]) {
    await page.setViewportSize(viewport);
    await page.goto(`${apps[0].origin}/ar/`);
    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const footer = await getFooter(page);
    const triggers = footer.getByTestId(footerTestIds.faq).getByRole("button");
    const first = triggers.first();
    if ((await first.getAttribute("aria-expanded")) === "true") await first.click();
    await first.focus();
    await page.keyboard.press("Enter");
    await expect(first).toBeFocused();
    await expect(first).toHaveAttribute("aria-expanded", "true");
    await expectNoHorizontalOverflow(page);
  }
});

test("reduced motion keeps accordion state synchronous without transitions", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Reduced-motion coverage runs once");
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto(`${apps[0].origin}/en-US/`);
  const footer = await getFooter(page);
  const trigger = footer.getByTestId(footerTestIds.faq).getByRole("button").first();
  const chevron = trigger.locator(".accordion__chevron");

  await expect(trigger).toHaveCSS("transition-duration", "0s");
  await expect(chevron).toHaveCSS("transition-duration", "0s");
  if ((await trigger.getAttribute("aria-expanded")) === "true") await trigger.click();
  await trigger.focus();
  await page.keyboard.press("Enter");
  await expect(trigger).toBeFocused();
  await expect(trigger).toHaveAttribute("aria-expanded", "true");
  const controlledId = await trigger.getAttribute("aria-controls");
  expect(controlledId).toBeTruthy();
  await expect(page.locator(`#${controlledId}`)).toBeVisible();
  await expectNoSeriousAxeViolations(page);
});
