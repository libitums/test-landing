import { expect, test, type Page, type Route } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const endpoint = "**/functions/v1/register-early-access";
const standalonePath = "/en-US/ai-communication/early-access";

type CapturedRequest = {
  projectId: string;
  email: string;
  marketingConsent: boolean;
};

async function fillValidRegistration(page: Page, email = "learner@example.com") {
  await page.getByTestId("early-access-email").fill(email);
  await page.getByTestId("early-access-marketing-consent").check();
}

async function fulfillSuccess(route: Route, id = "fc67d924-80d0-4c63-9414-3d77dc51d523") {
  await route.fulfill({
    status: 201,
    contentType: "application/json",
    body: JSON.stringify({
      status: "success",
      registration: { id, createdAt: "2026-07-24T00:00:00.000Z" },
    }),
  });
}

test.describe("ai-communication early-access boundary", () => {
  test("standalone submits the fixed project payload, resets on success, and keeps stable ids", async ({
    page,
  }) => {
    const requests: CapturedRequest[] = [];
    await page.route(endpoint, async (route) => {
      requests.push(route.request().postDataJSON() as CapturedRequest);
      await fulfillSuccess(route);
    });
    await page.goto(standalonePath);

    for (const testId of [
      "early-access-page",
      "early-access-form",
      "early-access-email",
      "early-access-marketing-consent",
      "early-access-status",
      "early-access-submit",
    ]) {
      await expect(page.getByTestId(testId)).toHaveCount(1);
    }

    await fillValidRegistration(page, "  Learner@example.com  ");
    await page.getByTestId("early-access-submit").click();

    await expect(page.getByTestId("early-access-status")).toContainText("You are on the list");
    expect(requests).toEqual([
      {
        projectId: "ai-communication",
        email: "Learner@example.com",
        marketingConsent: true,
      },
    ]);
    await expect(page.getByTestId("early-access-email")).toHaveValue("");
    await expect(page.getByTestId("early-access-marketing-consent")).not.toBeChecked();
    expect((await new AxeBuilder({ page }).analyze()).violations).toEqual([]);
  });

  test("invalid email and missing consent are rejected locally without a request", async ({
    page,
  }) => {
    let requestCount = 0;
    await page.route(endpoint, async (route) => {
      requestCount += 1;
      await fulfillSuccess(route);
    });
    await page.goto(standalonePath);

    await page.getByTestId("early-access-email").fill("not-an-email");
    await page.getByTestId("early-access-submit").click();
    await expect(page.getByTestId("early-access-email")).toHaveAttribute("aria-invalid", "true");
    await expect(page.getByTestId("early-access-email")).toBeFocused();
    await expect(page.getByTestId("early-access-status")).toHaveRole("alert");
    expect(requestCount).toBe(0);

    await page.getByTestId("early-access-email").fill("learner@example.com");
    await page.getByTestId("early-access-submit").click();
    await expect(page.getByTestId("early-access-marketing-consent")).toHaveAttribute(
      "aria-invalid",
      "true",
    );
    await expect(page.getByTestId("early-access-marketing-consent")).toBeFocused();
    expect(requestCount).toBe(0);
  });

  test("pending disables all controls and guards duplicate submission", async ({ page }) => {
    let requestCount = 0;
    let releaseRequest: (() => void) | undefined;
    const released = new Promise<void>((resolve) => {
      releaseRequest = resolve;
    });
    await page.route(endpoint, async (route) => {
      requestCount += 1;
      await released;
      await fulfillSuccess(route);
    });
    await page.goto(standalonePath);
    await fillValidRegistration(page);

    await page.getByTestId("early-access-submit").click();
    await expect(page.getByTestId("early-access-status")).toContainText("Saving your registration");
    await expect(page.getByTestId("early-access-email")).toBeDisabled();
    await expect(page.getByTestId("early-access-marketing-consent")).toBeDisabled();
    await expect(page.getByTestId("early-access-submit")).toBeDisabled();
    await page
      .getByTestId("early-access-form")
      .evaluate((form: HTMLFormElement) =>
        form.dispatchEvent(new SubmitEvent("submit", { bubbles: true, cancelable: true })),
      );
    await expect.poll(() => requestCount).toBe(1);
    releaseRequest?.();
    await expect(page.getByTestId("early-access-status")).toContainText("You are on the list");
  });

  test("rate limit preserves values and a later explicit retry succeeds", async ({ page }) => {
    let requestCount = 0;
    await page.route(endpoint, async (route) => {
      requestCount += 1;
      if (requestCount === 1) {
        await route.fulfill({
          status: 429,
          headers: { "Retry-After": "60" },
          contentType: "application/json",
          body: JSON.stringify({ status: "rate_limited", retryAfterSeconds: 60 }),
        });
        return;
      }
      await fulfillSuccess(route);
    });
    await page.goto(standalonePath);
    await fillValidRegistration(page);
    await page.getByTestId("early-access-submit").click();

    await expect(page.getByTestId("early-access-status")).toContainText(
      "Too many registration attempts",
    );
    await expect(page.getByTestId("early-access-status")).toHaveRole("alert");
    await expect(page.getByTestId("early-access-submit")).toBeFocused();
    await expect(page.getByTestId("early-access-email")).toHaveValue("learner@example.com");
    await expect(page.getByTestId("early-access-marketing-consent")).toBeChecked();

    await page.getByTestId("early-access-submit").click();
    await expect(page.getByTestId("early-access-status")).toContainText("You are on the list");
    expect(requestCount).toBe(2);
  });

  for (const failure of ["network", "server"] as const) {
    test(`${failure} failure preserves values and uses retry copy`, async ({ page }) => {
      await page.route(endpoint, async (route) => {
        if (failure === "network") await route.abort("connectionfailed");
        else
          await route.fulfill({
            status: 500,
            contentType: "application/json",
            body: JSON.stringify({ status: "server_error" }),
          });
      });
      await page.goto(standalonePath);
      await fillValidRegistration(page);
      await page.getByTestId("early-access-submit").click();

      await expect(page.getByTestId("early-access-status")).toContainText(
        "We could not save your registration",
      );
      await expect(page.getByTestId("early-access-status")).toHaveRole("alert");
      await expect(page.getByTestId("early-access-submit")).toBeFocused();
      await expect(page.getByTestId("early-access-email")).toHaveValue("learner@example.com");
      await expect(page.getByTestId("early-access-marketing-consent")).toBeChecked();
      await expect(page.getByTestId("early-access-submit")).toBeEnabled();
    });
  }

  test("overlay uses the same connected submission flow and remains open after success", async ({
    page,
  }) => {
    await page.route(endpoint, (route) => fulfillSuccess(route));
    await page.goto("/en-US/");
    const opener = page.getByTestId("shared-feature:ai-communication-roleplay:early-access-cta");
    await opener.click();
    const dialog = page.getByRole("dialog", { name: "Reserve your spot" });
    await expect(dialog).toBeVisible();
    await expect(page.getByRole("button", { name: "Close early-access form" })).toBeFocused();
    await page.keyboard.press("Shift+Tab");
    await expect(page.getByTestId("early-access-submit")).toBeFocused();
    await page.keyboard.press("Tab");
    await expect(page.getByRole("button", { name: "Close early-access form" })).toBeFocused();
    await fillValidRegistration(page, "overlay@example.com");
    await page.getByTestId("early-access-submit").click();
    await expect(page.getByTestId("early-access-status")).toContainText("You are on the list");
    await expect(dialog).toBeVisible();
    expect((await new AxeBuilder({ page }).include("[role=dialog]").analyze()).violations).toEqual(
      [],
    );

    await page.getByRole("button", { name: "Close early-access form" }).click();
    await expect(dialog).toBeHidden();
    await expect(opener).toBeFocused();
  });

  test("RTL mobile layout wraps without horizontal overflow and honors reduced motion", async ({
    page,
  }) => {
    await page.setViewportSize({ width: 320, height: 720 });
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.goto("/ar/ai-communication/early-access");

    await expect(page.locator("html")).toHaveAttribute("dir", "rtl");
    const widths = await page.evaluate(() => ({
      viewport: document.documentElement.clientWidth,
      content: document.documentElement.scrollWidth,
    }));
    expect(widths.content).toBeLessThanOrEqual(widths.viewport);
    await expect(page.getByTestId("early-access-status")).toHaveCSS("transition-duration", "0s");
  });
});
