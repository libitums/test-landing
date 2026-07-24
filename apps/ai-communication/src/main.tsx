import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { locale, localizePath } from "@landing/i18n";
import { createEarlyAccessSubmissionAdapter } from "@landing/early-access";
import "@landing/ui/styles.css";
import "./styles.css";
import { App } from "./app/App";
import { EarlyAccessPage } from "./app/EarlyAccessPage";
import { createAppAnalytics } from "./analytics";
import { applyLocaleMetadata, createTestRegistry, getEntryRuntime } from "./i18n";
const pseudoEnabled = import.meta.env.DEV || import.meta.env.MODE === "test";
const runtime = getEntryRuntime(window.location.pathname, window.location.search, pseudoEnabled);
const analytics = createAppAnalytics(window.location.search, {}, runtime.locale);
const submitEarlyAccessRegistration = createEarlyAccessSubmissionAdapter({
  projectId: "ai-communication",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
});
const pseudoRegistry = runtime.locale === "en-XA" ? createTestRegistry() : undefined;
const metadataPath = pseudoRegistry
  ? localizePath(pseudoRegistry, window.location.pathname, locale("en-XA"))
  : window.location.pathname;
applyLocaleMetadata(metadataPath, pseudoRegistry);
const location = `${window.location.pathname}${window.location.search}${window.location.hash}`;
const isEarlyAccessPage = /(?:^|\/)ai-communication\/early-access\/?$/.test(
  window.location.pathname,
);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    {isEarlyAccessPage ? (
      <EarlyAccessPage
        runtime={runtime}
        location={location}
        submitRegistration={submitEarlyAccessRegistration}
      />
    ) : (
      <App
        analytics={analytics}
        runtime={runtime}
        location={location}
        submitEarlyAccessRegistration={submitEarlyAccessRegistration}
      />
    )}
  </StrictMode>,
);
