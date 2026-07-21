import { fileURLToPath, URL } from "node:url";
import react from "@vitejs/plugin-react";
import { defineConfig } from "vite";

const fromRepositoryRoot = (path: string) => fileURLToPath(new URL(`../${path}`, import.meta.url));

/** Module boundary for the pseudo-locale-only E2E entry served from the repo root. */
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      react: fromRepositoryRoot("apps/k-drama/node_modules/react"),
      "react-dom": fromRepositoryRoot("apps/k-drama/node_modules/react-dom"),
      "@landing/analytics": fromRepositoryRoot("packages/analytics/src/index.ts"),
      "@landing/contracts/analytics": fromRepositoryRoot("packages/contracts/src/analytics.ts"),
      "@landing/contracts/i18n": fromRepositoryRoot("packages/contracts/src/i18n.ts"),
      "@landing/i18n": fromRepositoryRoot("packages/i18n/src/index.ts"),
      "@landing/ui/styles.css": fromRepositoryRoot("packages/ui/src/styles/ui.css"),
      "@landing/ui": fromRepositoryRoot("packages/ui/src/index.ts"),
    },
  },
});
