import { expect, test, type Locator, type Page } from "@playwright/test";

const apps = [
  {
    id: "k-drama",
    origin: "http://127.0.0.1:4173",
    earlyAccessPath: "/k-drama/early-access",
  },
  {
    id: "ai-communication",
    origin: "http://127.0.0.1:4174",
    earlyAccessPath: "/ai-communication/early-access",
  },
  {
    id: "k-culture",
    origin: "http://127.0.0.1:4175",
    earlyAccessPath: "/k-culture/early-access",
  },
] as const;

const slotSuffixes = [":number-label", ":header", ":subheader", ":content"] as const;
const rootExclusionSuffixes = [...slotSuffixes, ":early-access-cta"] as const;

async function getFeatureRoots(page: Page) {
  const candidates = page.locator('[data-testid^="shared-feature:"]');
  const roots: Locator[] = [];

  for (const candidate of await candidates.all()) {
    const testId = await candidate.getAttribute("data-testid");
    if (testId && !rootExclusionSuffixes.some((suffix) => testId.endsWith(suffix))) {
      roots.push(candidate);
    }
  }

  expect(
    roots.length,
    "each app must compose at least three shared feature templates",
  ).toBeGreaterThanOrEqual(3);
  const ids = await Promise.all(roots.map((root) => root.getAttribute("data-testid")));
  expect(new Set(ids).size, "shared feature root ids must be distinct and stable").toBe(ids.length);
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

async function expectCompleteFeature(root: Locator, options: { stylesAvailable?: boolean } = {}) {
  const { stylesAvailable = true } = options;
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
  }

  const { numberLabel, header, subheader, content } = slots;
  for (const copy of [numberLabel, header, subheader]) {
    await expect(copy).toBeVisible();
    await expect(copy).toContainText(/\S+/);
  }
  if (stylesAvailable) await expect(content).toBeVisible();
  await expect(header).toHaveRole("heading");
  expect(
    await content.locator(":scope > *").count(),
    "app-owned children must remain composed",
  ).toBeGreaterThan(0);

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

  const appearanceClasses = (await root.getAttribute("class"))
    ?.split(/\s+/)
    .filter(
      (className) => className === "shared-feature--white" || className === "shared-feature--soft",
    );
  expect(
    appearanceClasses,
    "the explicit appearance must be represented by one modifier",
  ).toHaveLength(1);
}

async function expectEarlyAccessCta(root: Locator, expectedPath: string) {
  const rootId = await root.getAttribute("data-testid");
  if (!rootId) throw new Error("shared feature root must expose its stable test id");
  const cta = root.getByTestId(`${rootId}:early-access-cta`);
  await expect(cta).toHaveCount(1);
  await expect(cta).toBeVisible();
  await expect(cta).toHaveRole("link");
  await expect(cta).toHaveAccessibleName("Get early access");
  await expect(cta).toHaveAttribute("href", expectedPath);
  await expect(cta).toHaveClass(/button--secondary/);
  await expect(cta).toHaveClass(/shared-feature__early-access-cta/);
  return cta;
}

async function expectIntentionalLineBreak(copy: Locator) {
  const text = await copy.textContent();
  expect(text, "localized copy must retain its intentional newline").toContain("\n");
  await expect(copy).toHaveCSS("white-space", "pre-line");

  const lineTops = await copy.evaluate((element) => {
    const range = document.createRange();
    range.selectNodeContents(element);
    return Array.from(range.getClientRects())
      .filter((rect) => rect.width > 0 && rect.height > 0)
      .map((rect) => Math.round(rect.top));
  });
  expect(
    new Set(lineTops).size,
    "the embedded newline must produce multiple visual lines",
  ).toBeGreaterThanOrEqual(2);
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

      const roots = await getFeatureRoots(page);
      expect(
        await Promise.all(
          roots.slice(0, 3).map((root) => root.getByTestId(/:number-label$/).textContent()),
        ),
      ).toEqual(["01", "02", "03"]);
      const appearances = await Promise.all(
        roots.map(
          async (root) =>
            (await root.getAttribute("class"))?.match(/shared-feature--(white|soft)/)?.[1],
        ),
      );
      expect(new Set(appearances)).toEqual(new Set(["white", "soft"]));
      for (const root of roots) {
        await expectCompleteFeature(root);
        await expectEarlyAccessCta(root, app.earlyAccessPath);
      }
      await expectNoHorizontalOverflow(page);
    });

    test(`${app.id} preserves feature content and order on mobile`, async ({ page }, testInfo) => {
      test.skip(
        testInfo.project.name !== "mobile-chromium",
        "The repository's deterministic mobile project covers the responsive boundary",
      );
      await page.goto(`${app.origin}/en-US/`);

      for (const root of await getFeatureRoots(page)) {
        await expectCompleteFeature(root);
        await expectEarlyAccessCta(root, app.earlyAccessPath);
      }
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

      const roots = await getFeatureRoots(page);
      for (const root of roots) {
        await expectCompleteFeature(root, { stylesAvailable: false });
        await expectEarlyAccessCta(root, app.earlyAccessPath);
      }
      await expectNoHorizontalOverflow(page);

      const firstRoot = roots[0];
      if (!firstRoot) throw new Error("the first feature CTA is missing");
      await (await expectEarlyAccessCta(firstRoot, app.earlyAccessPath)).click();
      await expect(page).toHaveURL(`${app.origin}${app.earlyAccessPath}`);
    });
  });
}

test("shared feature copy preserves intentional lines, accessible text, and semantic visual tokens", async ({
  page,
}, testInfo) => {
  test.skip(
    testInfo.project.name !== "chromium",
    "Computed presentation is sampled once in Chromium",
  );
  await page.goto(`${apps[0].origin}/en-US/`);

  const firstRoot = (await getFeatureRoots(page))[0];
  if (!firstRoot) throw new Error("the representative shared feature is missing");
  const rootId = await firstRoot.getAttribute("data-testid");
  if (!rootId) throw new Error("the representative shared feature id is missing");
  const numberLabel = firstRoot.getByTestId(`${rootId}:number-label`);
  const header = firstRoot.getByTestId(`${rootId}:header`);
  const subheader = firstRoot.getByTestId(`${rootId}:subheader`);

  await expectIntentionalLineBreak(header);
  await expectIntentionalLineBreak(subheader);
  const naturalHeading = (await header.textContent())?.replace(/\s+/g, " ").trim();
  if (!naturalHeading) throw new Error("the representative heading copy is empty");
  await expect(firstRoot).toHaveAccessibleName(naturalHeading);

  await expect(numberLabel).toHaveClass(/shared-feature__number/);
  await expect(numberLabel).toHaveCSS("background-color", "rgb(109, 93, 251)");
  await expect(subheader).toHaveCSS("color", "rgb(100, 116, 139)");
  await expect(subheader).toHaveCSS("font-weight", "300");
});

test("feature early access CTA uses the large low-emphasis secondary treatment", async ({
  page,
}, testInfo) => {
  test.skip(testInfo.project.name !== "chromium", "Computed CTA presentation is sampled once");
  await page.goto(`${apps[0].origin}/en-US/`);

  const firstRoot = (await getFeatureRoots(page))[0];
  if (!firstRoot) throw new Error("the representative feature CTA is missing");
  const cta = await expectEarlyAccessCta(firstRoot, apps[0].earlyAccessPath);
  await expect(cta).toHaveCSS("min-height", "44px");
  await expect(cta).toHaveCSS("padding-block-start", "16px");
  await expect(cta).toHaveCSS("padding-inline-start", "32px");
  await expect(cta).toHaveCSS("font-size", "18px");
  await expect(cta).toHaveCSS("font-weight", "500");
  await expect(cta).toHaveCSS("background-color", "rgb(255, 255, 255)");
  await expect(cta).toHaveCSS("color", "rgb(15, 23, 42)");
  await expect(cta).toHaveCSS("border-color", "rgb(203, 213, 225)");

  const target = await cta.boundingBox();
  expect(target?.height).toBeGreaterThanOrEqual(44);
  expect(target?.width).toBeGreaterThanOrEqual(44);

  await cta.focus();
  await expect(cta).toBeFocused();
  await expect(cta).not.toHaveCSS("outline-style", "none");

  await cta.hover();
  await page.mouse.down();
  await expect(cta).toHaveCSS("background-color", "rgb(226, 232, 240)");
  await page.mouse.up();
});

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
