import { StrictMode, type ComponentType } from "react";
import { createRoot } from "react-dom/client";
import type { AnalyticsTracker } from "@landing/contracts/analytics";
import type { I18nRuntime } from "@landing/contracts/i18n";
import "@landing/ui/styles.css";
import "../apps/k-drama/src/styles.css";
import "../apps/ai-communication/src/styles.css";
import "../apps/k-culture/src/styles.css";

interface HarnessAppProps {
  analytics: AnalyticsTracker;
  runtime: I18nRuntime;
  location?: string;
}

const analytics: AnalyticsTracker = {
  track: async () => ({ status: "sent" }),
};

const appName = new URLSearchParams(window.location.search).get("app") ?? "k-drama";

async function loadApp(): Promise<{
  App: ComponentType<HarnessAppProps>;
  runtime: I18nRuntime;
}> {
  if (appName === "ai-communication") {
    const [{ App }, { createTestRegistry, getRuntime }] = await Promise.all([
      import("../apps/ai-communication/src/app/App"),
      import("../apps/ai-communication/src/i18n"),
    ]);
    return { App, runtime: getRuntime("/en-XA/", createTestRegistry()) };
  }
  if (appName === "k-culture") {
    const [{ App }, { createTestRegistry, getRuntime }] = await Promise.all([
      import("../apps/k-culture/src/app/App"),
      import("../apps/k-culture/src/i18n"),
    ]);
    return { App, runtime: getRuntime("/en-XA/", createTestRegistry()) };
  }
  const [{ App }, { createTestRegistry, getRuntime }] = await Promise.all([
    import("../apps/k-drama/src/app/App"),
    import("../apps/k-drama/src/i18n"),
  ]);
  return { App, runtime: getRuntime("/en-XA/", createTestRegistry()) };
}

const { App, runtime } = await loadApp();
document.documentElement.lang = runtime.locale;
document.documentElement.dir = runtime.direction;
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App analytics={analytics} runtime={runtime} location="/en-XA/" />
  </StrictMode>,
);
