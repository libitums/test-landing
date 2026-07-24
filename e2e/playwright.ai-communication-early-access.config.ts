import { defineConfig, devices } from "@playwright/test";

const port = Number(process.env.AI_COMMUNICATION_EARLY_ACCESS_E2E_PORT ?? 4375);
const origin = `http://127.0.0.1:${port}`;

export default defineConfig({
  testDir: ".",
  testMatch: "ai-communication-early-access.spec.ts",
  fullyParallel: false,
  forbidOnly: true,
  retries: 0,
  reporter: "line",
  use: {
    baseURL: origin,
    trace: "retain-on-failure",
    screenshot: "only-on-failure",
  },
  projects: [{ name: "chromium", use: { ...devices["Desktop Chrome"] } }],
  webServer: {
    command: `VITE_SUPABASE_URL=https://early-access.test VITE_SUPABASE_PUBLISHABLE_KEY=test-publishable-key pnpm --filter @landing/ai-communication dev --host 127.0.0.1 --port ${port}`,
    url: origin,
    reuseExistingServer: false,
    timeout: 120_000,
  },
});
