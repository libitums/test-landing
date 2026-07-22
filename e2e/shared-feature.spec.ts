import { expect, test, type Locator, type Page } from "@playwright/test";

const apps = [
  { id: "k-drama", origin: "http://127.0.0.1:4173" },
  { id: "ai-communication", origin: "http://127.0.0.1:4174" },
  { id: "k-culture", origin: "http://127.0.0.1:4175" },
] as const;

const slotSuffixes = [":number-label", ":header", ":subheader", ":content"] as const;

async function getFeatureRoots(page: Page) {
  const candidates = page.locator('[data-testid^="shared-feature:"]');
  const roots: Locator[] = [];

  for (const candidate of await candidates.all()) {
    const testId = await candidate.getAttribute("data-testid");
    if (testId && !slotSuffixes.some((suffix) => testId.endsWith(suffix))) roots.push(candidate);
  }

  expect(roots.length, "the app must compose at least one shared feature template").toBeGreaterThan(
    0,
  );
  return roots;
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

async function expectCompleteFeature(root: Locator) {
  const rootId = await root.getAttribute("data-testid");
  expect(rootId).toMatch(/^shared-feature:.+$/);
  if (!rootId) throw new Error("shared feature root must expose its stable test id");

  const slots = {
    numberLabel: root.getByTestId(`${rootId}:number-label`),
    header: root.getByTestId(`${rootId}:header`),
    subheader: root.getByTestId(`${rootId}:subheader`),
    content: root.getByTestId(`${rootId}:content`),
  };
  for (const slot of Object.values(slots)) {
    await expect(slot).toHaveCount(1);
    await expect(slot).toBeVisible();
  }

  const { numberLabel, header, subheader, content } = slots;
  for (const copy of [numberLabel, header, subheader]) await expect(copy).toContainText(/\S+/);
  await expect(header).toHaveRole("heading");
  await expect(content).not.toBeEmpty();

  const order = await root.locator(":scope [data-testid]").evaluateAll(
    (elements, ids) => {
      const expected = ids as string[];
      return elements
        .map((element) => element.getAttribute("data-testid"))
        .filter((testId): testId is string => testId !== null && expected.includes(testId));
    },
    slotSuffixes.map((suffix) => `${rootId}${suffix}`),
  );
  expect(order).toEqual(slotSuffixes.map((suffix) => `${rootId}${suffix}`));

  const interactive = content
    .locator('a[href], button, input, select, textarea, summary, [tabindex]:not([tabindex="-1"])')
    .first();
  if ((await interactive.count()) > 0) {
    await expect(interactive).toBeVisible();
    await interactive.focus();
    await expect(interactive).toBeFocused();
  }
}

for (const app of apps) {
  test.describe(app.id, () => {
    test(`${app.id} composes complete shared feature sections on desktop`, async ({
      page,
    }, testInfo) => {
      test.skip(
        testInfo.project.name === "mobile-chromium",
        "Desktop integration runs in the current Chromium/Edge engine, Firefox, and WebKit",
      );
      await page.goto(`${app.origin}/en-US/`);

      for (const root of await getFeatureRoots(page)) await expectCompleteFeature(root);
      await expectNoHorizontalOverflow(page);
    });

    test(`${app.id} preserves feature content and order on mobile`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chromium",
        "The repository's deterministic mobile project covers the responsive boundary",
      );
      await page.goto(`${app.origin}/en-US/`);

      for (const root of await getFeatureRoots(page)) await expectCompleteFeature(root);
      await expectNoHorizontalOverflow(page);
    });

    test(`${app.id} keeps semantic feature content when styles are unavailable`, async ({
      page,
    }, testInfo) => {
      test.skip(testInfo.project.name !== "chromium", "Progressive enhancement runs once per app");
      await page.goto(`${app.origin}/en-US/`);

      await page.evaluate(() => {
        for (const sheet of Array.from(document.styleSheets)) sheet.disabled = true;
        for (const style of document.querySelectorAll('style, link[rel="stylesheet"]'))
          style.remove();
      });

      for (const root of await getFeatureRoots(page)) await expectCompleteFeature(root);
    });
  });
}

test("all apps use the same template contract with distinct copy and children", async ({
  browser,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Cross-app comparison runs once");
  const appSignatures: string[] = [];

  for (const app of apps) {
    const page = await browser.newPage();
    await page.goto(`${app.origin}/en-US/`);
    const roots = await getFeatureRoots(page);
    const signatures: string[] = [];

    for (const root of roots) {
      await expectCompleteFeature(root);
      const rootId = await root.getAttribute("data-testid");
      const values = await Promise.all(
        slotSuffixes.map(async (suffix) =>
          (await root.getByTestId(`${rootId}${suffix}`).textContent())?.trim(),
        ),
      );
      signatures.push(values.join("|"));
    }

    appSignatures.push(signatures.join("||"));
    await page.close();
  }

  expect(new Set(appSignatures).size).toBe(apps.length);
});
