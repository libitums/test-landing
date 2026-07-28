import { StrictMode } from "react";
import { createRoot } from "react-dom/client";
import { locale, localizeInitialPath, localizePath } from "@landing/i18n";
import { createEarlyAccessSubmissionAdapter } from "@landing/early-access";
import "@landing/ui/styles.css";
import "./styles.css";
import { App } from "./app/App";
import { createAppAnalytics } from "./analytics";
import { applyLocaleMetadata, createTestRegistry, getEntryRuntime, registry } from "./i18n";

const pseudoEnabled = import.meta.env.DEV || import.meta.env.MODE === "test";
const requestedLocation = `${window.location.pathname}${window.location.search}${window.location.hash}`;
const browserLanguages = navigator.languages.length > 0 ? navigator.languages : [navigator.language];
const initialLocation = localizeInitialPath(registry, requestedLocation, browserLanguages);
if (initialLocation !== requestedLocation) window.location.replace(initialLocation);
const initialUrl = new URL(initialLocation, window.location.origin);
const runtime = getEntryRuntime(initialUrl.pathname, initialUrl.search, pseudoEnabled);
const analytics = createAppAnalytics(window.location.search, {}, runtime.locale);
const submitEarlyAccessRegistration = createEarlyAccessSubmissionAdapter({
  projectId: "k-culture",
  supabaseUrl: import.meta.env.VITE_SUPABASE_URL ?? "",
  publishableKey: import.meta.env.VITE_SUPABASE_PUBLISHABLE_KEY ?? "",
});
const pseudoRegistry = runtime.locale === "en-XA" ? createTestRegistry() : undefined;
const metadataPath = pseudoRegistry
  ? localizePath(pseudoRegistry, initialUrl.pathname, locale("en-XA"))
  : initialUrl.pathname;
applyLocaleMetadata(metadataPath, pseudoRegistry);
createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App
      analytics={analytics}
      runtime={runtime}
      location={initialLocation}
      submitEarlyAccessRegistration={submitEarlyAccessRegistration}
    />
  </StrictMode>,
);
