import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

/** esbuild equivalents for the repository's explicit oldest WebKit and Chromium floors. */
export const supportedBrowserBuildTargets = ["safari15", "chrome109"] as const;

interface ViteConfigOptions {
  testSetupFile?: string | null;
}

export function createViteConfig({
  testSetupFile = "./src/test/setup.ts",
}: ViteConfigOptions = {}) {
  return defineConfig({
    plugins: [react()],
    build: { target: [...supportedBrowserBuildTargets] },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: testSetupFile ? [testSetupFile] : [],
    },
  });
}
