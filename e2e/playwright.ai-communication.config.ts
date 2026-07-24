import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.AI_COMMUNICATION_SHARED_FEATURE_E2E_PORT ?? 4374);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: ".",
  testMatch: "ai-communication-shared-feature.spec.ts",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: origin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  expect: {
    toHaveScreenshot: {
      animations: "disabled",
      caret: "hide",
      maxDiffPixelRatio: 0.01,
    },
  },
  projects: [
    { name: "chromium", use: { ...devices["Desktop Chrome"] } },
    { name: "firefox", use: { ...devices["Desktop Firefox"] } },
    { name: "webkit", use: { ...devices["Desktop Safari"] } },
    { name: "mobile-chromium", use: { ...devices["Pixel 7"] } },
    { name: "mobile-webkit", use: { ...devices["iPhone 15"] } },
    {
      name: "mobile-320-chromium",
      use: { ...devices["Pixel 7"], viewport: { width: 320, height: 720 } },
    },
  ],
  webServer: {
    command: `pnpm --filter @landing/ai-communication dev --host 127.0.0.1 --port ${port}`,
    url: origin,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
