import { defineConfig, devices } from "@playwright/test";

const appServers = [
  ["@landing/k-drama", 4173],
  ["@landing/ai-communication", 4174],
  ["@landing/k-culture", 4175],
] as const;

export default defineConfig({
  testDir: ".",
  fullyParallel: true,
  forbidOnly: true,
  retries: 0,
  reporter: "line",
  use: {
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
  ],
  webServer: [
    ...appServers.map(([workspace, port]) => ({
      command: `pnpm --filter ${workspace} dev --host 127.0.0.1 --port ${port}`,
      url: `http://127.0.0.1:${port}`,
      reuseExistingServer: false,
      timeout: 120_000,
    })),
    {
      command: "pnpm exec vite --config vite.config.ts --host 127.0.0.1 --port 4273",
      url: "http://127.0.0.1:4273/pseudo.html",
      reuseExistingServer: false,
      timeout: 120_000,
    },
  ],
});
