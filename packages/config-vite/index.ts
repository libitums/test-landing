import react from "@vitejs/plugin-react";
import { defineConfig } from "vitest/config";

export function createViteConfig() {
  return defineConfig({
    plugins: [react()],
    build: { target: ["es2020", "safari15"] },
    test: {
      environment: "jsdom",
      globals: true,
      setupFiles: ["./src/test/setup.ts"]
    }
  });
}
